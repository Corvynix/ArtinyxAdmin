import { 
  type Artwork, 
  type InsertArtwork,
  type Order,
  type InsertOrder,
  type Bid,
  type InsertBid,
  type AnalyticsEvent,
  type InsertAnalyticsEvent
} from "@shared/schema";
import { db } from "../db/index";
import { artworks, orders, bids, analyticsEvents, adminSettings } from "@shared/schema";
import { eq, desc, and, lte } from "drizzle-orm";

export interface IStorage {
  // Artworks
  getArtwork(id: string): Promise<Artwork | undefined>;
  getArtworkBySlug(slug: string): Promise<Artwork | undefined>;
  getAllArtworks(): Promise<Artwork[]>;
  getAvailableArtworks(): Promise<Artwork[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  updateArtwork(id: string, artwork: Partial<InsertArtwork>): Promise<Artwork | undefined>;
  
  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByArtwork(artworkId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: Order["status"]): Promise<Order | undefined>;
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
}

export class DbStorage implements IStorage {
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
    const result = await db.insert(artworks).values([artwork]).returning();
    return result[0];
  }

  async updateArtwork(id: string, artwork: Partial<InsertArtwork>): Promise<Artwork | undefined> {
    const result = await db.update(artworks)
      .set(artwork as any)
      .where(eq(artworks.id, id))
      .returning();
    return result[0];
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

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values([order]).returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: Order["status"]): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ status })
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
    const result = await db.insert(analyticsEvents).values([event]).returning();
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
}

export const storage = new DbStorage();
