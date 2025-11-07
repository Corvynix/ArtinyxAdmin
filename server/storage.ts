import { 
  type Artwork, 
  type InsertArtwork,
  type Order,
  type InsertOrder,
  type Bid,
  type InsertBid,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  type User,
  type UpsertUser,
  type Notification,
  type InsertNotification,
  type InventoryAlert,
  type InsertInventoryAlert,
  type ProductionSlot,
  type InsertProductionSlot,
  type BuyerLimit,
  type InsertBuyerLimit
} from "@shared/schema";
import { db } from "../db/index";
import { artworks, orders, bids, analyticsEvents, adminSettings, users, notifications, inventoryAlerts, productionSlots, buyerLimits } from "@shared/schema";
import { eq, desc, and, lte, gte, sql as drizzleSql } from "drizzle-orm";

export interface IStorage {
  // Users (Replit Auth integration)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Artworks
  getArtwork(id: string): Promise<Artwork | undefined>;
  getArtworkBySlug(slug: string): Promise<Artwork | undefined>;
  getAllArtworks(): Promise<Artwork[]>;
  getAvailableArtworks(): Promise<Artwork[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  updateArtwork(id: string, artwork: Partial<InsertArtwork>): Promise<Artwork | undefined>;
  decrementStock(artworkId: string, size: string, amount: number): Promise<boolean>;
  incrementStock(artworkId: string, size: string, amount: number): Promise<boolean>;
  
  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByArtwork(artworkId: string): Promise<Order[]>;
  getUserOrders(whatsapp: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: Order["status"]): Promise<Order | undefined>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined>;
  getExpiredHolds(): Promise<Order[]>;
  
  // Bids
  getBid(id: string): Promise<Bid | undefined>;
  getBidsByArtwork(artworkId: string): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  getHighestBid(artworkId: string): Promise<Bid | undefined>;
  
  // Analytics
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsByType(eventType: AnalyticsEvent["eventType"], limit?: number): Promise<AnalyticsEvent[]>;
  
  // Admin Settings
  getSetting(key: string): Promise<any>;
  setSetting(key: string, value: any): Promise<void>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotification(id: string): Promise<Notification | undefined>;
  getPendingNotifications(type?: Notification["type"]): Promise<Notification[]>;
  updateNotificationStatus(id: string, status: Notification["status"], errorMessage?: string): Promise<Notification | undefined>;
  
  // Inventory Alerts
  createInventoryAlert(alert: InsertInventoryAlert): Promise<InventoryAlert>;
  getUnsentInventoryAlerts(): Promise<InventoryAlert[]>;
  markInventoryAlertSent(id: string): Promise<void>;
  
  // Analytics & Reporting
  getOrdersInRange(startDate: Date, endDate: Date): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getRevenueByPeriod(startDate: Date, endDate: Date): Promise<number>;
  getBestSellingArtworks(limit?: number): Promise<Array<{ artworkId: string; title: string; totalSales: number; revenue: number }>>;
  
  // Filtering
  getArtworksByCategory(category: string): Promise<Artwork[]>;
  getArtworksByPriceRange(minPrice: number, maxPrice: number): Promise<Artwork[]>;
  
  // Bidding
  updateBidWinnerStatus(bidId: string, isWinner: boolean): Promise<Bid | undefined>;
  markBidNotificationSent(bidId: string): Promise<void>;
  
  // Wall of Fame
  getTopCanvasBuyers(limit?: number): Promise<Array<{ buyerName: string; whatsapp: string; artworkTitle: string; size: string; priceCents: number; createdAt: Date }>>;
  
  // Production Slots (Capacity Management)
  getProductionSlotByDate(date: Date): Promise<ProductionSlot | undefined>;
  createProductionSlot(slot: InsertProductionSlot): Promise<ProductionSlot>;
  updateProductionSlot(id: string, slot: Partial<ProductionSlot>): Promise<ProductionSlot | undefined>;
  getAvailableCapacity(date: Date): Promise<number>;
  reserveCapacity(date: Date, orderId: string): Promise<boolean>;
  getNextAvailableSlot(daysToCheck?: number): Promise<{ date: Date; position: number } | null>;
  
  // Buyer Limits
  getBuyerLimit(whatsapp: string, weekStart: Date): Promise<BuyerLimit | undefined>;
  incrementBuyerLimit(whatsapp: string): Promise<void>;
  checkBuyerLimit(whatsapp: string, maxPerWeek?: number): Promise<boolean>;
}

export class DbStorage implements IStorage {
  // Users (Replit Auth integration)
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  // Artworks
  async getArtwork(id: string): Promise<Artwork | undefined> {
    const result = await db.select().from(artworks).where(eq(artworks.id, id));
    return result[0];
  }

  async getArtworkBySlug(slug: string): Promise<Artwork | undefined> {
    const result = await db.select().from(artworks).where(eq(artworks.slug, slug));
    return result[0];
  }

  async getAllArtworks(): Promise<Artwork[]> {
    return db.select().from(artworks).orderBy(desc(artworks.createdAt));
  }

  async getAvailableArtworks(): Promise<Artwork[]> {
    return db.select().from(artworks)
      .where(eq(artworks.status, "available"))
      .orderBy(desc(artworks.createdAt));
  }

  async createArtwork(artwork: InsertArtwork): Promise<Artwork> {
    const result = await db.insert(artworks).values([artwork as any]).returning();
    return result[0];
  }

  async updateArtwork(id: string, artwork: Partial<InsertArtwork>): Promise<Artwork | undefined> {
    const result = await db.update(artworks)
      .set(artwork as any)
      .where(eq(artworks.id, id))
      .returning();
    return result[0];
  }

  async decrementStock(artworkId: string, size: string, amount: number = 1): Promise<boolean> {
    const artwork = await this.getArtwork(artworkId);
    if (!artwork) return false;

    const sizes = artwork.sizes as Record<string, { price_cents: number; total_copies: number; remaining: number }>;
    if (!sizes[size] || sizes[size].remaining < amount) return false;

    sizes[size].remaining -= amount;
    
    await db.update(artworks)
      .set({ sizes: sizes as any })
      .where(eq(artworks.id, artworkId));
    
    return true;
  }

  async incrementStock(artworkId: string, size: string, amount: number = 1): Promise<boolean> {
    const artwork = await this.getArtwork(artworkId);
    if (!artwork) return false;

    const sizes = artwork.sizes as Record<string, { price_cents: number; total_copies: number; remaining: number }>;
    if (!sizes[size]) return false;

    sizes[size].remaining += amount;
    
    await db.update(artworks)
      .set({ sizes: sizes as any })
      .where(eq(artworks.id, artworkId));
    
    return true;
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async getOrdersByArtwork(artworkId: string): Promise<Order[]> {
    return db.select().from(orders)
      .where(eq(orders.artworkId, artworkId))
      .orderBy(desc(orders.createdAt));
  }

  async getUserOrders(whatsapp: string): Promise<Order[]> {
    return db.select().from(orders)
      .where(eq(orders.whatsapp, whatsapp))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values([order as any]).returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: Order["status"]): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set(order as any)
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async getExpiredHolds(): Promise<Order[]> {
    return db.select().from(orders)
      .where(
        and(
          eq(orders.status, "pending"),
          lte(orders.holdExpiresAt, new Date())
        )
      );
  }

  // Bids
  async getBid(id: string): Promise<Bid | undefined> {
    const result = await db.select().from(bids).where(eq(bids.id, id));
    return result[0];
  }

  async getBidsByArtwork(artworkId: string): Promise<Bid[]> {
    return db.select().from(bids)
      .where(eq(bids.artworkId, artworkId))
      .orderBy(desc(bids.amountCents));
  }

  async createBid(bid: InsertBid): Promise<Bid> {
    const result = await db.insert(bids).values([bid]).returning();
    return result[0];
  }

  async getHighestBid(artworkId: string): Promise<Bid | undefined> {
    const result = await db.select().from(bids)
      .where(eq(bids.artworkId, artworkId))
      .orderBy(desc(bids.amountCents))
      .limit(1);
    return result[0];
  }

  // Analytics
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const result = await db.insert(analyticsEvents).values([event as any]).returning();
    return result[0];
  }

  async getAnalyticsByType(eventType: AnalyticsEvent["eventType"], limit: number = 100): Promise<AnalyticsEvent[]> {
    return db.select().from(analyticsEvents)
      .where(eq(analyticsEvents.eventType, eventType))
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(limit);
  }

  // Admin Settings
  async getSetting(key: string): Promise<any> {
    const result = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
    return result[0]?.value;
  }

  async setSetting(key: string, value: any): Promise<void> {
    await db.insert(adminSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: adminSettings.key,
        set: { value, updatedAt: new Date() }
      });
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values([notification as any]).returning();
    return result[0];
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    const result = await db.select().from(notifications).where(eq(notifications.id, id));
    return result[0];
  }

  async getPendingNotifications(type?: Notification["type"]): Promise<Notification[]> {
    if (type) {
      return db.select().from(notifications)
        .where(and(eq(notifications.status, "pending"), eq(notifications.type, type)))
        .orderBy(desc(notifications.createdAt));
    }
    return db.select().from(notifications)
      .where(eq(notifications.status, "pending"))
      .orderBy(desc(notifications.createdAt));
  }

  async updateNotificationStatus(id: string, status: Notification["status"], errorMessage?: string): Promise<Notification | undefined> {
    const updateData: any = { status };
    if (status === "sent") {
      updateData.sentAt = new Date();
    }
    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }
    const result = await db.update(notifications)
      .set(updateData)
      .where(eq(notifications.id, id))
      .returning();
    return result[0];
  }

  // Inventory Alerts
  async createInventoryAlert(alert: InsertInventoryAlert): Promise<InventoryAlert> {
    const result = await db.insert(inventoryAlerts).values([alert as any]).returning();
    return result[0];
  }

  async getUnsentInventoryAlerts(): Promise<InventoryAlert[]> {
    return db.select().from(inventoryAlerts)
      .where(eq(inventoryAlerts.alertSent, false))
      .orderBy(desc(inventoryAlerts.createdAt));
  }

  async markInventoryAlertSent(id: string): Promise<void> {
    await db.update(inventoryAlerts)
      .set({ alertSent: true })
      .where(eq(inventoryAlerts.id, id));
  }

  // Analytics & Reporting
  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersInRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return db.select().from(orders)
      .where(and(
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      ))
      .orderBy(desc(orders.createdAt));
  }

  async getRevenueByPeriod(startDate: Date, endDate: Date): Promise<number> {
    const ordersInRange = await this.getOrdersInRange(startDate, endDate);
    return ordersInRange
      .filter(o => o.status === "confirmed" || o.status === "shipped")
      .reduce((sum, order) => sum + (order.priceCents || 0), 0);
  }

  async getBestSellingArtworks(limit: number = 10): Promise<Array<{ artworkId: string; title: string; totalSales: number; revenue: number }>> {
    const allOrders = await this.getAllOrders();
    const confirmedOrders = allOrders.filter(o => o.status === "confirmed" || o.status === "shipped");
    
    const salesByArtwork = new Map<string, { count: number; revenue: number }>();
    
    for (const order of confirmedOrders) {
      const existing = salesByArtwork.get(order.artworkId) || { count: 0, revenue: 0 };
      salesByArtwork.set(order.artworkId, {
        count: existing.count + 1,
        revenue: existing.revenue + (order.priceCents || 0)
      });
    }

    const artworkStats = await Promise.all(
      Array.from(salesByArtwork.entries()).map(async ([artworkId, stats]) => {
        const artwork = await this.getArtwork(artworkId);
        return {
          artworkId,
          title: artwork?.title || "Unknown",
          totalSales: stats.count,
          revenue: stats.revenue
        };
      })
    );

    return artworkStats.sort((a, b) => b.totalSales - a.totalSales).slice(0, limit);
  }

  // Filtering
  async getArtworksByCategory(category: string): Promise<Artwork[]> {
    return db.select().from(artworks)
      .where(eq(artworks.category, category as any))
      .orderBy(desc(artworks.createdAt));
  }

  async getArtworksByPriceRange(minPrice: number, maxPrice: number): Promise<Artwork[]> {
    const allArtworks = await this.getAllArtworks();
    return allArtworks.filter(artwork => {
      const sizes = artwork.sizes as Record<string, { price_cents: number; total_copies: number; remaining: number }>;
      const prices = Object.values(sizes).map(s => s.price_cents);
      const minArtworkPrice = Math.min(...prices);
      const maxArtworkPrice = Math.max(...prices);
      return minArtworkPrice >= minPrice && maxArtworkPrice <= maxPrice;
    });
  }

  // Bidding
  async updateBidWinnerStatus(bidId: string, isWinner: boolean): Promise<Bid | undefined> {
    const result = await db.update(bids)
      .set({ isWinner })
      .where(eq(bids.id, bidId))
      .returning();
    return result[0];
  }

  async markBidNotificationSent(bidId: string): Promise<void> {
    await db.update(bids)
      .set({ notificationSent: true })
      .where(eq(bids.id, bidId));
  }

  // Wall of Fame - Get top canvas buyers (largest sizes)
  async getTopCanvasBuyers(limit: number = 10): Promise<Array<{ buyerName: string; whatsapp: string; artworkTitle: string; size: string; priceCents: number; createdAt: Date }>> {
    // Limit to max 50 for performance
    const safeLimit = Math.min(Math.max(1, limit), 50);
    
    // Efficient query with SQL LIMIT - only fetch what we need
    const topOrders = await db.select({
      buyerName: orders.buyerName,
      whatsapp: orders.whatsapp,
      size: orders.size,
      priceCents: orders.priceCents,
      createdAt: orders.createdAt,
      artworkTitle: artworks.title,
    })
      .from(orders)
      .leftJoin(artworks, eq(orders.artworkId, artworks.id))
      .where(eq(orders.status, "confirmed"))
      .orderBy(desc(orders.priceCents))
      .limit(safeLimit);

    return topOrders.map(order => ({
      buyerName: order.buyerName || "Anonymous Collector",
      whatsapp: order.whatsapp || "",
      artworkTitle: order.artworkTitle || "Unknown Artwork",
      size: order.size,
      priceCents: order.priceCents,
      createdAt: order.createdAt
    }));
  }

  // Production Slots (Capacity Management)
  async getProductionSlotByDate(date: Date): Promise<ProductionSlot | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const result = await db.select().from(productionSlots)
      .where(and(
        gte(productionSlots.date, startOfDay),
        lte(productionSlots.date, endOfDay)
      ))
      .limit(1);
    return result[0];
  }

  async createProductionSlot(slot: InsertProductionSlot): Promise<ProductionSlot> {
    const result = await db.insert(productionSlots).values([slot as any]).returning();
    return result[0];
  }

  async updateProductionSlot(id: string, slot: Partial<ProductionSlot>): Promise<ProductionSlot | undefined> {
    const result = await db.update(productionSlots)
      .set(slot as any)
      .where(eq(productionSlots.id, id))
      .returning();
    return result[0];
  }

  async getAvailableCapacity(date: Date): Promise<number> {
    const dailyCapacity = await this.getSetting("daily_capacity") || 3;
    const slot = await this.getProductionSlotByDate(date);
    
    if (!slot) {
      return dailyCapacity;
    }
    
    return Math.max(0, slot.capacityTotal - slot.capacityReserved);
  }

  async reserveCapacity(date: Date, orderId: string): Promise<boolean> {
    const dailyCapacity = await this.getSetting("daily_capacity") || 3;
    let slot = await this.getProductionSlotByDate(date);
    
    if (!slot) {
      slot = await this.createProductionSlot({
        date,
        capacityTotal: dailyCapacity,
        capacityReserved: 1,
        orderId
      });
      return true;
    }
    
    if (slot.capacityReserved >= slot.capacityTotal) {
      return false;
    }
    
    await this.updateProductionSlot(slot.id, {
      capacityReserved: slot.capacityReserved + 1,
      orderId
    });
    
    return true;
  }

  async getNextAvailableSlot(daysToCheck: number = 30): Promise<{ date: Date; position: number } | null> {
    const dailyCapacity = await this.getSetting("daily_capacity") || 3;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < daysToCheck; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      
      const availableCapacity = await this.getAvailableCapacity(checkDate);
      
      if (availableCapacity > 0) {
        const slot = await this.getProductionSlotByDate(checkDate);
        const position = slot ? slot.capacityReserved + 1 : 1;
        return { date: checkDate, position };
      }
    }
    
    return null;
  }

  // Buyer Limits
  async getBuyerLimit(whatsapp: string, weekStart: Date): Promise<BuyerLimit | undefined> {
    const result = await db.select().from(buyerLimits)
      .where(and(
        eq(buyerLimits.whatsapp, whatsapp),
        eq(buyerLimits.weekStart, weekStart)
      ))
      .limit(1);
    return result[0];
  }

  async incrementBuyerLimit(whatsapp: string): Promise<void> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const existing = await this.getBuyerLimit(whatsapp, weekStart);
    
    if (existing) {
      await db.update(buyerLimits)
        .set({ confirmedOrdersCount: existing.confirmedOrdersCount + 1 })
        .where(eq(buyerLimits.id, existing.id));
    } else {
      await db.insert(buyerLimits).values([{
        whatsapp,
        weekStart,
        confirmedOrdersCount: 1
      } as any]);
    }
  }

  async checkBuyerLimit(whatsapp: string, maxPerWeek: number = 2): Promise<boolean> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const limit = await this.getBuyerLimit(whatsapp, weekStart);
    
    if (!limit) {
      return true;
    }
    
    return limit.confirmedOrdersCount < maxPerWeek;
  }
}

export const storage = new DbStorage();
