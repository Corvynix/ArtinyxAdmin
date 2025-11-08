import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertBidSchema, insertAnalyticsEventSchema, insertArtworkSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { adminApiKeyAuth, isAdminBypass } from "./authBypass";
import { emailService } from "./services/email";
import { smsService } from "./services/sms";
import { pdfService } from "./services/pdf";
import { upload, imageUploadService } from "./services/upload";
import { randomUUID } from "crypto";

// Helper to detect database connection errors
function isDatabaseConnectionError(error: any): boolean {
  const message = error?.message || "";
  return (
    message.includes("ENOTFOUND") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ETIMEDOUT") ||
    message.includes("getaddrinfo") ||
    message.includes("password authentication failed") ||
    message.includes("relation") && message.includes("does not exist")
  );
}

function getDatabaseErrorMessage(error: any): string {
  if (isDatabaseConnectionError(error)) {
    if (error?.message?.includes("ENOTFOUND") || error?.message?.includes("getaddrinfo")) {
      return "Database connection failed: Could not reach Supabase. Check if your project is active and DATABASE_URL is correct.";
    }
    if (error?.message?.includes("password authentication failed")) {
      return "Database authentication failed: Check your DATABASE_URL password in .env file.";
    }
    if (error?.message?.includes("relation") && error?.message?.includes("does not exist")) {
      return "Database tables not found: Run supabase/schema.sql in Supabase SQL Editor.";
    }
    return "Database connection error: Check your DATABASE_URL in .env file.";
  }
  return error?.message || "Unknown error";
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (Replit Auth integration)
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Development mode: Allow API key authentication
      const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
      if (isDev) {
        // Try multiple ways to get the API key (Express lowercases headers)
        const apiKey = req.headers["x-admin-api-key"] || 
                      req.get("x-admin-api-key") || 
                      req.query.apiKey;
        const devApiKey = process.env.DEV_ADMIN_API_KEY || "dev-admin-key-12345";
        
        // In dev mode with API key, return mock user immediately (don't try DB first)
        if (apiKey === devApiKey || !apiKey) {
          // Return mock user immediately - no database call needed in dev mode
          return res.json({
            id: "dev-admin-user",
            email: "admin@artinyxus.com",
            firstName: "Admin",
            lastName: "User",
            isAdmin: true,
            profileImageUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      // Production mode: Require authentication
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all artworks
  app.get("/api/artworks", async (req, res) => {
    try {
      const artworks = await storage.getAllArtworks();
      res.json(artworks);
    } catch (error: any) {
      console.error("Error fetching artworks:", error);
      const isDbError = isDatabaseConnectionError(error);
      
      // In development, return empty array if DB is down (better UX)
      if (isDbError && process.env.NODE_ENV === "development") {
        console.warn("[Artworks] Database down, returning empty array for dev");
        return res.json([]);
      }
      
      res.status(500).json({ 
        error: "Failed to fetch artworks",
        message: getDatabaseErrorMessage(error),
        databaseError: isDbError,
        details: process.env.NODE_ENV === "development" ? error?.stack : undefined
      });
    }
  });

  // Get artwork by slug
  app.get("/api/artworks/:slug", async (req, res) => {
    try {
      const artwork = await storage.getArtworkBySlug(req.params.slug);
      if (!artwork) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      res.json(artwork);
    } catch (error) {
      console.error("Error fetching artwork:", error);
      res.status(500).json({ error: "Failed to fetch artwork" });
    }
  });

  // Wall of Fame - Get top canvas buyers
  app.get("/api/wall-of-fame", async (req, res) => {
    try {
      // Validate and cap limit (1-50)
      let limit = parseInt(req.query.limit as string) || 10;
      if (isNaN(limit) || limit < 1) limit = 10;
      if (limit > 50) limit = 50;
      
      const topBuyers = await storage.getTopCanvasBuyers(limit);
      res.json(topBuyers);
    } catch (error) {
      console.error("Error fetching Wall of Fame:", error);
      res.status(500).json({ error: "Failed to fetch Wall of Fame" });
    }
  });

  // Create order (called when WhatsApp button is clicked)
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Get artwork to check stock
      const artwork = await storage.getArtwork(orderData.artworkId);
      if (!artwork) {
        return res.status(404).json({ error: "Artwork not found" });
      }

      const sizeData = artwork.sizes[orderData.size];
      if (!sizeData || sizeData.remaining <= 0) {
        return res.status(400).json({ error: "Size not available" });
      }

      // Calculate profit and validate minimum profit margin (Rule: ≥600 EGP)
      const priceCents = orderData.priceCents || sizeData.price_cents;
      const materialCost = artwork.materialCostCents || 0;
      const packagingCost = artwork.packagingCostCents || 0;
      const laborCost = artwork.laborCostCents || 0;
      const minProfitMargin = artwork.minProfitMarginCents || 60000; // 600 EGP default
      
      const totalCost = materialCost + packagingCost + laborCost;
      const expectedProfit = priceCents - totalCost;
      
      if (expectedProfit < minProfitMargin) {
        return res.status(400).json({ 
          error: "Insufficient profit margin", 
          details: `Expected profit: ${expectedProfit / 100} EGP, Minimum required: ${minProfitMargin / 100} EGP. Please adjust pricing.` 
        });
      }

      // Check buyer limit (Rule E: Max 1-2 confirmed orders per week)
      if (orderData.whatsapp) {
        const maxPerWeek = await storage.getSetting("max_orders_per_buyer_per_week") || 2;
        const canOrder = await storage.checkBuyerLimit(orderData.whatsapp, maxPerWeek);
        if (!canOrder) {
          return res.status(400).json({ 
            error: "Buyer limit exceeded", 
            details: `You have reached the maximum of ${maxPerWeek} confirmed orders per week. Please wait until next week.` 
          });
        }
      }

      // Set hold expiry to 24 hours from now (Rule C)
      const holdExpiresAt = new Date();
      holdExpiresAt.setHours(holdExpiresAt.getHours() + 24);

      // Decrement stock first (atomic operation - hold stock)
      const stockDecremented = await storage.decrementStock(artwork.id, orderData.size);
      if (!stockDecremented) {
        return res.status(400).json({ error: "Failed to reserve stock" });
      }

      let order;
      try {
        // Create order with pending status (Rule A: No production before confirmed)
        order = await storage.createOrder({
          ...orderData,
          holdExpiresAt,
          status: "pending",
          priceCents: priceCents
        });

        // Log analytics event
        await storage.createAnalyticsEvent({
          eventType: "order_created",
          artworkId: artwork.id,
          meta: { orderId: order.id, size: orderData.size, priceCents } as any
        });

        // Send admin notification
        const adminEmail = process.env.ADMIN_EMAIL || "admin@artinyxus.com";
        const adminPhone = process.env.ADMIN_PHONE || "201234567890";
        
        await emailService.sendOrderNotification({
          adminEmail,
          buyerName: orderData.buyerName || "Guest",
          artworkTitle: artwork.title,
          size: orderData.size,
          price: priceCents,
          orderId: order.id,
        }).catch(err => console.error("Failed to send order notification email:", err));

        // Send customer confirmation email (if email provided)
        if (orderData.email) {
          const customerMessage = `
            <h2>شكراً لطلبك!</h2>
            <p><strong>رقم الطلب:</strong> ${order.id}</p>
            <p><strong>العمل الفني:</strong> ${artwork.title}</p>
            <p><strong>المقاس:</strong> ${orderData.size}</p>
            <p><strong>السعر:</strong> ${(priceCents / 100).toFixed(2)} EGP</p>
            <p><strong>الحالة:</strong> في انتظار تأكيد الدفع</p>
            <p>يرجى إرسال إثبات الدفع عبر صفحة حالة الطلب أو عبر واتساب.</p>
            <p>تذكر: ضمان استرجاع 100% — تجربة 7 أيام بلا أسئلة</p>
          `;
          await emailService.sendEmail(
            orderData.email,
            "تأكيد الطلب - Artinyxus",
            customerMessage
          ).catch(err => console.error("Failed to send order confirmation to customer:", err));
        }

        // Check for low stock alert
        try {
          const sizes = artwork.sizes as Record<string, { price_cents: number; total_copies: number; remaining: number }>;
          const remaining = sizes[orderData.size]?.remaining || 0;
          const threshold = artwork.lowStockThreshold || 2;
          
          if (remaining <= threshold && remaining > 0) {
            await storage.createInventoryAlert({
              artworkId: artwork.id,
              size: orderData.size,
              remainingStock: remaining,
              threshold,
              alertSent: false,
            });
            
            await emailService.sendLowStockAlert({
              adminEmail,
              artworkTitle: artwork.title,
              size: orderData.size,
              remainingStock: remaining,
            }).catch(err => console.error("Failed to send low stock alert email:", err));
          }
        } catch (alertError) {
          console.error("Failed to create inventory alert:", alertError);
        }
      } catch (error) {
        // Rollback stock if order creation or analytics fails
        await storage.incrementStock(artwork.id, orderData.size);
        throw error;
      }

      // Generate Arabic WhatsApp message template (as per spec)
      const buyerName = orderData.buyerName || "العميل";
      const whatsappMessage = `مرحباً، أود طلب لوحة *${artwork.title}* — المقاس: *${orderData.size}* — السعر: *${(priceCents / 100).toFixed(2)} EGP*. اسمي: *${buyerName}*. رقم الواتساب: *${orderData.whatsapp || "غير متوفر"}*. من فضلك أكد التوفر ورقم الدفع.`;
      const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(whatsappMessage)}`;

      res.json({ 
        order,
        whatsappUrl
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Place bid
  app.post("/api/bids", async (req, res) => {
    try {
      const bidData = insertBidSchema.parse(req.body);
      
      // Get artwork
      const artwork = await storage.getArtwork(bidData.artworkId);
      if (!artwork || artwork.type !== "auction") {
        return res.status(400).json({ error: "Invalid auction" });
      }

      // Check if auction is live
      const now = new Date();
      if (!artwork.auctionStart || !artwork.auctionEnd || 
          now < artwork.auctionStart || now > artwork.auctionEnd) {
        return res.status(400).json({ error: "Auction not active" });
      }

      // Check bid amount
      const currentBid = artwork.currentBidCents || 0;
      const minIncrement = artwork.minIncrementCents || 50000;
      if (bidData.amountCents <= currentBid + minIncrement) {
        return res.status(400).json({ 
          error: `Bid must be at least ${(currentBid + minIncrement) / 100} EGP` 
        });
      }

      // Create bid
      const bid = await storage.createBid(bidData);

      // Update artwork current bid
      await storage.updateArtwork(artwork.id, {
        currentBidCents: bidData.amountCents
      });

      // Anti-sniping: if bid within last 60 seconds, extend auction by 120 seconds
      const timeRemaining = artwork.auctionEnd.getTime() - now.getTime();
      if (timeRemaining < 60000) {
        const newEnd = new Date(artwork.auctionEnd.getTime() + 120000);
        await storage.updateArtwork(artwork.id, { auctionEnd: newEnd });
      }

      // Log analytics event
      await storage.createAnalyticsEvent({
        eventType: "bid_placed",
        artworkId: artwork.id,
        meta: { bidId: bid.id, amountCents: bidData.amountCents } as any
      });

      const adminEmail = process.env.ADMIN_EMAIL || "admin@artinyxus.com";
      await emailService.sendBidNotification({
        adminEmail,
        bidderName: bidData.bidderName || "Anonymous",
        artworkTitle: artwork.title,
        amount: bidData.amountCents,
        bidId: bid.id,
      }).catch(err => console.error("Failed to send bid notification email:", err));

      res.json(bid);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error placing bid:", error);
      res.status(500).json({ error: "Failed to place bid" });
    }
  });

  // Get bids for artwork
  app.get("/api/artworks/:id/bids", async (req, res) => {
    try {
      const bids = await storage.getBidsByArtwork(req.params.id);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching bids:", error);
      res.status(500).json({ error: "Failed to fetch bids" });
    }
  });

  // Track analytics event
  app.post("/api/analytics", async (req, res) => {
    try {
      const eventData = insertAnalyticsEventSchema.parse(req.body);
      const event = await storage.createAnalyticsEvent(eventData);
      res.json(event);
    } catch (error: any) {
      console.error("Error tracking analytics:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid event data", details: error.errors });
      }
      const isDbError = isDatabaseConnectionError(error);
      
      // In development, silently fail analytics if DB is down (don't break UI)
      if (isDbError && process.env.NODE_ENV === "development") {
        console.warn("[Analytics] Database down, skipping event tracking in dev");
        return res.json({ success: true, skipped: true });
      }
      
      res.status(500).json({ 
        error: "Failed to track event",
        message: getDatabaseErrorMessage(error),
        databaseError: isDbError,
        details: process.env.NODE_ENV === "development" ? error?.stack : undefined
      });
    }
  });

  // Restore expired holds (should be called via cron)
  app.post("/api/restore-holds", async (req, res) => {
    try {
      const expiredOrders = await storage.getExpiredHolds();
      
      for (const order of expiredOrders) {
        // Update order status to cancelled
        await storage.updateOrderStatus(order.id, "cancelled");
        
        // Restore stock (atomic operation)
        await storage.incrementStock(order.artworkId, order.size);
        
        // Log analytics event
        await storage.createAnalyticsEvent({
          eventType: "order_created",
          artworkId: order.artworkId,
          meta: { action: "hold_expired", orderId: order.id } as any
        });
      }
      
      res.json({ restoredCount: expiredOrders.length });
    } catch (error) {
      console.error("Error restoring holds:", error);
      res.status(500).json({ error: "Failed to restore holds" });
    }
  });

  // Get user orders by WhatsApp number
  app.get("/api/orders/user/:whatsapp", async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.params.whatsapp);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Update order (for payment proof upload)
  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        paymentMethod: z.enum(["vodafone_cash", "instapay"]).optional(),
        paymentProof: z.string().optional(),
        paymentReferenceNumber: z.string().optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      const existingOrder = await storage.getOrder(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const order = await storage.updateOrder(req.params.id, validatedData);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Notify admin of payment proof upload (as per spec)
      if (validatedData.paymentProof || validatedData.paymentReferenceNumber) {
        const artwork = await storage.getArtwork(existingOrder.artworkId);
        const adminEmail = process.env.ADMIN_EMAIL || "admin@artinyxus.com";
        
        await emailService.sendPaymentProofNotification({
          adminEmail,
          orderId: order.id,
          buyerName: order.buyerName || "Guest",
          artworkTitle: artwork?.title || "Unknown",
          referenceNumber: validatedData.paymentReferenceNumber || "Not provided"
        }).catch((err: any) => console.error("Failed to send payment proof notification:", err));
      }
      
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // Get capacity availability (for artwork pages)
  app.get("/api/capacity/availability", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const availableCapacity = await storage.getAvailableCapacity(today);
      const nextSlot = await storage.getNextAvailableSlot(30);
      
      const dailyCapacity = await storage.getSetting("daily_capacity") || 3;
      
      res.json({
        today: {
          available: availableCapacity,
          total: dailyCapacity,
          canStartImmediately: availableCapacity > 0
        },
        nextAvailable: nextSlot ? {
          date: nextSlot.date.toISOString(),
          position: nextSlot.position,
          daysFromNow: Math.ceil((nextSlot.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        } : null
      });
    } catch (error) {
      console.error("Error fetching capacity:", error);
      // Return default values in case of error
      res.json({
        today: {
          available: 0,
          total: 3,
          canStartImmediately: false
        },
        nextAvailable: null
      });
    }
  });

  // Admin middleware: Use dev bypass in development, normal auth in production
  const adminAuth = process.env.NODE_ENV === "development" 
    ? [adminApiKeyAuth, isAdminBypass] 
    : [isAuthenticated, isAdmin];
  
  // Admin: Create artwork
  app.post("/api/admin/artworks", ...adminAuth, async (req, res) => {
    try {
      const artworkData = insertArtworkSchema.parse(req.body);
      const artwork = await storage.createArtwork(artworkData);
      res.json(artwork);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating artwork:", error);
      res.status(500).json({ error: "Failed to create artwork" });
    }
  });

  // Admin: Update artwork
  app.patch("/api/admin/artworks/:id", ...adminAuth, async (req, res) => {
    try {
      const artwork = await storage.updateArtwork(req.params.id, req.body);
      if (!artwork) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      res.json(artwork);
    } catch (error) {
      console.error("Error updating artwork:", error);
      res.status(500).json({ error: "Failed to update artwork" });
    }
  });

  // Admin: Get all bids
  app.get("/api/admin/bids", ...adminAuth, async (req, res) => {
    try {
      const artworks = await storage.getAllArtworks();
      const allBids = [];
      
      for (const artwork of artworks) {
        const artworkBids = await storage.getBidsByArtwork(artwork.id);
        allBids.push(...artworkBids.map(bid => ({ ...bid, artworkTitle: artwork.title })));
      }
      
      res.json(allBids.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error("Error fetching bids:", error);
      res.status(500).json({ error: "Failed to fetch bids" });
    }
  });

  // Admin: Confirm order
  app.post("/api/admin/orders/:id/confirm", ...adminAuth, async (req, res) => {
    try {
      // Validate order exists first
      const existingOrder = await storage.getOrder(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Only allow confirmation if pending
      if (existingOrder.status !== "pending") {
        return res.status(400).json({ error: "Order is not in pending status" });
      }
      
      // Get artwork for profit validation
      const artwork = await storage.getArtwork(existingOrder.artworkId);
      if (!artwork) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      
      // Profit margin validation
      const materialCost = artwork.materialCostCents || 0;
      const packagingCost = artwork.packagingCostCents || 0;
      const laborCost = artwork.laborCostCents || 0;
      const totalCost = materialCost + packagingCost + laborCost;
      const profit = existingOrder.priceCents - totalCost;
      const minProfit = artwork.minProfitMarginCents || 60000;
      
      if (profit < minProfit) {
        return res.status(400).json({ 
          error: "Profit margin too low",
          details: {
            price: existingOrder.priceCents / 100,
            costs: totalCost / 100,
            profit: profit / 100,
            minRequired: minProfit / 100
          }
        });
      }
      
      // Check buyer limit
      if (existingOrder.whatsapp) {
        const canOrder = await storage.checkBuyerLimit(existingOrder.whatsapp);
        if (!canOrder) {
          return res.status(400).json({ error: "Buyer has reached weekly order limit (2 per week)" });
        }
      }
      
      // Check capacity for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const availableCapacity = await storage.getAvailableCapacity(today);
      
      let order;
      let invoiceNumber = existingOrder.invoiceNumber;
      if (!invoiceNumber) {
        invoiceNumber = `INV-${Date.now()}-${randomUUID().substring(0, 8).toUpperCase()}`;
      }
      
      if (availableCapacity > 0) {
        // Capacity available - confirm immediately
        const reserved = await storage.reserveCapacity(today, existingOrder.id);
        if (!reserved) {
          return res.status(500).json({ error: "Failed to reserve capacity slot" });
        }
        
        const estimatedCompletion = new Date(today);
        estimatedCompletion.setDate(today.getDate() + 5); // 5 days production time
        
        const slot = await storage.getProductionSlotByDate(today);
        order = await storage.updateOrder(req.params.id, {
          status: "confirmed",
          scheduledStartDate: today,
          estimatedCompletionDate: estimatedCompletion,
          queuePosition: slot?.capacityReserved || 1,
          invoiceNumber
        });
        
        // Increment buyer limit
        if (existingOrder.whatsapp) {
          await storage.incrementBuyerLimit(existingOrder.whatsapp);
        }
      } else {
        // No capacity - schedule for next available slot
        const nextSlot = await storage.getNextAvailableSlot();
        if (!nextSlot) {
          return res.status(400).json({ error: "No capacity available in next 30 days" });
        }
        
        const reserved = await storage.reserveCapacity(nextSlot.date, existingOrder.id);
        if (!reserved) {
          return res.status(500).json({ error: "Failed to reserve capacity slot" });
        }
        
        const estimatedCompletion = new Date(nextSlot.date);
        estimatedCompletion.setDate(nextSlot.date.getDate() + 5);
        
        order = await storage.updateOrder(req.params.id, {
          status: "scheduled",
          scheduledStartDate: nextSlot.date,
          estimatedCompletionDate: estimatedCompletion,
          queuePosition: nextSlot.position,
          invoiceNumber
        });
        
        // Increment buyer limit
        if (existingOrder.whatsapp) {
          await storage.incrementBuyerLimit(existingOrder.whatsapp);
        }
      }
      
      // Send notifications (Arabic templates as per spec)
      const adminPhone = process.env.ADMIN_PHONE || "201234567890";
      
      if (order && artwork) {
        const eta = order.estimatedCompletionDate ? 
          new Date(order.estimatedCompletionDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 
          "سيتم تحديده لاحقاً";
        const startDate = order.scheduledStartDate ? 
          new Date(order.scheduledStartDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 
          "اليوم";
        
        // Send email to customer (if email provided)
        if (existingOrder.email) {
          const customerEmailMessage = order.status === "confirmed" ?
            `
              <h2>شكرًا! تم تأكيد طلبك</h2>
              <p><strong>رقم الطلب:</strong> ${invoiceNumber}</p>
              <p><strong>العمل الفني:</strong> ${artwork.title}</p>
              <p><strong>المقاس:</strong> ${existingOrder.size}</p>
              <p><strong>السعر:</strong> ${(existingOrder.priceCents / 100).toFixed(2)} EGP</p>
              <p><strong>تاريخ بدء التنفيذ:</strong> ${startDate}</p>
              <p><strong>المتوقع الوصول:</strong> ${eta}</p>
              <p><strong>رقم التواصل:</strong> ${adminPhone}</p>
              <p>تذكر: ضمان استرجاع 7 أيام بعد التسليم.</p>
            ` :
            `
              <h2>شكرًا! تم استلام الدفع</h2>
              <p><strong>رقم الطلب:</strong> ${invoiceNumber}</p>
              <p><strong>العمل الفني:</strong> ${artwork.title}</p>
              <p><strong>المقاس:</strong> ${existingOrder.size}</p>
              <p><strong>السعر:</strong> ${(existingOrder.priceCents / 100).toFixed(2)} EGP</p>
              <p><strong>مكانك في قائمة الانتظار:</strong> ${order.queuePosition}</p>
              <p><strong>تاريخ بدء التنفيذ المتوقع:</strong> ${startDate}</p>
              <p><strong>المتوقع الوصول:</strong> ${eta}</p>
              <p><strong>رقم التواصل:</strong> ${adminPhone}</p>
              <p>سيتم إشعارك عند بدء التنفيذ.</p>
            `;
          
          await emailService.sendEmail(
            existingOrder.email,
            order.status === "confirmed" ? `تأكيد الطلب - ${invoiceNumber}` : `استلام الدفع - ${invoiceNumber}`,
            customerEmailMessage
          ).catch(err => console.error("Failed to send order confirmation email:", err));
        }
        
        // Send SMS/WhatsApp notification (if phone provided)
        if (existingOrder.whatsapp) {
          await smsService.sendOrderConfirmationSMS({
            phone: existingOrder.whatsapp,
            name: existingOrder.buyerName || "العميل",
            artworkTitle: artwork.title,
            invoiceNumber,
          }).catch(err => console.error("Failed to send order confirmation SMS:", err));
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error confirming order:", error);
      res.status(500).json({ error: "Failed to confirm order" });
    }
  });

  // Admin: Get all orders
  app.get("/api/admin/orders", ...adminAuth, async (req, res) => {
    try {
      const allArtworks = await storage.getAllArtworks();
      const allOrders = [];
      
      for (const artwork of allArtworks) {
        const orders = await storage.getOrdersByArtwork(artwork.id);
        allOrders.push(...orders);
      }
      
      res.json(allOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Admin: Export orders as CSV
  app.get("/api/admin/orders/export", ...adminAuth, async (req, res) => {
    try {
      const allArtworks = await storage.getAllArtworks();
      const allOrders = [];
      
      for (const artwork of allArtworks) {
        const orders = await storage.getOrdersByArtwork(artwork.id);
        allOrders.push(...orders);
      }
      
      // Sort by creation date
      const sortedOrders = allOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Generate CSV
      const headers = [
        "Order ID",
        "Invoice Number",
        "Artwork Title",
        "Size",
        "Buyer Name",
        "WhatsApp",
        "Email",
        "Price (EGP)",
        "Payment Method",
        "Payment Reference",
        "Status",
        "Queue Position",
        "Scheduled Start",
        "Estimated Completion",
        "Created At"
      ];
      
      const rows = sortedOrders.map(order => {
        const artwork = allArtworks.find(a => a.id === order.artworkId);
        return [
          order.id,
          order.invoiceNumber || "",
          artwork?.title || "Unknown",
          order.size,
          order.buyerName || "",
          order.whatsapp || "",
          order.email || "",
          (order.priceCents / 100).toFixed(2),
          order.paymentMethod || "",
          order.paymentReferenceNumber || "",
          order.status,
          order.queuePosition?.toString() || "",
          order.scheduledStartDate ? new Date(order.scheduledStartDate).toISOString() : "",
          order.estimatedCompletionDate ? new Date(order.estimatedCompletionDate).toISOString() : "",
          new Date(order.createdAt).toISOString()
        ];
      });
      
      const csv = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting orders:", error);
      res.status(500).json({ error: "Failed to export orders" });
    }
  });

  // Admin: Get analytics dashboard data
  app.get("/api/admin/analytics", ...adminAuth, async (req, res) => {
    try {
      const [pageViews, orders, bids] = await Promise.all([
        storage.getAnalyticsByType("page_view"),
        storage.getAnalyticsByType("order_created"),
        storage.getAnalyticsByType("bid_placed")
      ]);

      res.json({
        pageViews: pageViews.length,
        orders: orders.length,
        bids: bids.length,
        conversionRate: pageViews.length > 0 ? (orders.length / pageViews.length) * 100 : 0
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get artworks by category (public)
  app.get("/api/artworks/category/:category", async (req, res) => {
    try {
      const artworks = await storage.getArtworksByCategory(req.params.category);
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching artworks by category:", error);
      res.status(500).json({ error: "Failed to fetch artworks" });
    }
  });

  // Get artworks by price range (public)
  app.get("/api/artworks/filter/price", async (req, res) => {
    try {
      const minPrice = parseInt(req.query.min as string) || 0;
      const maxPrice = parseInt(req.query.max as string) || Number.MAX_SAFE_INTEGER;
      const artworks = await storage.getArtworksByPriceRange(minPrice, maxPrice);
      res.json(artworks);
    } catch (error) {
      console.error("Error filtering artworks by price:", error);
      res.status(500).json({ error: "Failed to filter artworks" });
    }
  });

  // Download invoice PDF (requires authentication)
  app.get("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const pdfBuffer = await pdfService.generateInvoice(req.params.id);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=invoice-${req.params.id}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ error: "Failed to generate invoice" });
    }
  });

  // Admin: Upload artwork images (protected)
  app.post("/api/admin/upload", ...adminAuth, upload.array("images", 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedPaths = await Promise.all(
        req.files.map((file) =>
          imageUploadService.processAndSaveImage(file.buffer, file.originalname)
        )
      );

      res.json({ paths: uploadedPaths });
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).json({ error: "Failed to upload images" });
    }
  });

  // Admin: Generate sales report (protected)
  app.get("/api/admin/reports/sales", ...adminAuth, async (req, res) => {
    try {
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date();

      const [ordersData, totalRevenue, bestSelling] = await Promise.all([
        storage.getOrdersInRange(startDate, endDate),
        storage.getRevenueByPeriod(startDate, endDate),
        storage.getBestSellingArtworks(10),
      ]);

      const pdfBuffer = await pdfService.generateSalesReport(
        startDate,
        endDate,
        ordersData,
        { totalRevenue, bestSelling }
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=sales-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.pdf`
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating sales report:", error);
      res.status(500).json({ error: "Failed to generate sales report" });
    }
  });

  // Admin: Get revenue analytics (protected)
  app.get("/api/admin/analytics/revenue", ...adminAuth, async (req, res) => {
    try {
      const period = req.query.period || "month";
      let startDate: Date;
      const endDate = new Date();

      if (period === "week") {
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === "month") {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      } else if (period === "year") {
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      const totalRevenue = await storage.getRevenueByPeriod(startDate, endDate);
      const orders = await storage.getOrdersInRange(startDate, endDate);
      
      res.json({
        totalRevenue,
        orderCount: orders.length,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      });
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ error: "Failed to fetch revenue analytics" });
    }
  });

  // Admin: Get best selling artworks (protected)
  app.get("/api/admin/analytics/best-selling", ...adminAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const bestSelling = await storage.getBestSellingArtworks(limit);
      res.json(bestSelling);
    } catch (error) {
      console.error("Error fetching best selling artworks:", error);
      res.status(500).json({ error: "Failed to fetch best selling artworks" });
    }
  });

  // Admin: Send email notification (protected)
  app.post("/api/admin/notifications/email", ...adminAuth, async (req, res) => {
    try {
      const { to, subject, html } = req.body;
      const success = await emailService.sendEmail(to, subject, html);
      res.json({ success });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Admin: Check inventory alerts (protected)
  app.get("/api/admin/inventory-alerts", ...adminAuth, async (req, res) => {
    try {
      const artworks = await storage.getAllArtworks();
      const alerts = [];

      for (const artwork of artworks) {
        const sizes = artwork.sizes as Record<string, { price_cents: number; total_copies: number; remaining: number }>;
        const threshold = artwork.lowStockThreshold || 2;

        for (const [size, data] of Object.entries(sizes)) {
          if (data.remaining <= threshold && data.remaining > 0) {
            alerts.push({
              artworkId: artwork.id,
              artworkTitle: artwork.title,
              size,
              remaining: data.remaining,
              threshold,
            });
          }
        }
      }

      res.json(alerts);
    } catch (error) {
      console.error("Error checking inventory alerts:", error);
      res.status(500).json({ error: "Failed to check inventory alerts" });
    }
  });

  // Admin: Close auction and notify winner (protected)
  app.post("/api/admin/auctions/:id/close", ...adminAuth, async (req, res) => {
    try {
      const artwork = await storage.getArtwork(req.params.id);
      if (!artwork || artwork.type !== "auction") {
        return res.status(400).json({ error: "Invalid auction" });
      }

      const highestBid = await storage.getHighestBid(req.params.id);
      if (!highestBid) {
        return res.status(400).json({ error: "No bids found" });
      }

      await storage.updateBidWinnerStatus(highestBid.id, true);
      await storage.updateArtwork(artwork.id, { status: "auction_closed" });

      if (highestBid.email) {
        await emailService.sendAuctionWinnerNotification({
          email: highestBid.email,
          name: highestBid.bidderName || "Bidder",
          artworkTitle: artwork.title,
          winningBid: highestBid.amountCents,
        });
      }

      if (highestBid.whatsapp) {
        await smsService.sendAuctionWinnerWhatsApp({
          phone: highestBid.whatsapp,
          name: highestBid.bidderName || "Bidder",
          artworkTitle: artwork.title,
          winningBid: highestBid.amountCents,
        });
      }

      await storage.markBidNotificationSent(highestBid.id);

      res.json({ success: true, winner: highestBid });
    } catch (error) {
      console.error("Error closing auction:", error);
      res.status(500).json({ error: "Failed to close auction" });
    }
  });

  // Admin: Get capacity for date range
  app.get("/api/admin/capacity", ...adminAuth, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const capacityData = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < days; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const available = await storage.getAvailableCapacity(checkDate);
        const slot = await storage.getProductionSlotByDate(checkDate);
        
        capacityData.push({
          date: checkDate.toISOString().split('T')[0],
          available,
          reserved: slot?.capacityReserved || 0,
          total: slot?.capacityTotal || await storage.getSetting("daily_capacity") || 3
        });
      }
      
      res.json(capacityData);
    } catch (error) {
      console.error("Error fetching capacity:", error);
      res.status(500).json({ error: "Failed to fetch capacity" });
    }
  });

  // Admin: Update daily capacity setting
  app.post("/api/admin/capacity/settings", ...adminAuth, async (req, res) => {
    try {
      const { dailyCapacity } = req.body;
      if (!dailyCapacity || dailyCapacity < 1 || dailyCapacity > 20) {
        return res.status(400).json({ error: "Daily capacity must be between 1 and 20" });
      }
      
      await storage.setSetting("daily_capacity", dailyCapacity);
      res.json({ success: true, dailyCapacity });
    } catch (error) {
      console.error("Error updating capacity settings:", error);
      res.status(500).json({ error: "Failed to update capacity settings" });
    }
  });

  // Get capacity availability for artwork (public)
  app.get("/api/capacity/availability", async (req, res) => {
    try {
      const nextSlot = await storage.getNextAvailableSlot();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (!nextSlot) {
        return res.json({ 
          available: false, 
          message: "No capacity available in next 30 days" 
        });
      }
      
      const daysUntilAvailable = Math.ceil((nextSlot.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      res.json({
        available: true,
        daysUntilStart: daysUntilAvailable,
        startDate: nextSlot.date.toISOString().split('T')[0],
        queuePosition: nextSlot.position,
        estimatedCompletion: daysUntilAvailable + 5 // 5 days production time
      });
    } catch (error) {
      console.error("Error checking capacity availability:", error);
      res.status(500).json({ error: "Failed to check capacity" });
    }
  });

  // Update order payment proof (customer)
  app.patch("/api/orders/:id/payment", async (req, res) => {
    try {
      const updateSchema = z.object({
        paymentMethod: z.enum(["vodafone_cash", "instapay"]).optional(),
        paymentProof: z.string().optional(),
        paymentReferenceNumber: z.string().optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      const order = await storage.updateOrder(req.params.id, validatedData);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Notify admin of payment proof upload
      if (validatedData.paymentProof) {
        const artwork = await storage.getArtwork(order.artworkId);
        const adminEmail = process.env.ADMIN_EMAIL || "admin@artinyxus.com";
        
        await emailService.sendPaymentProofNotification({
          adminEmail,
          orderId: order.id,
          buyerName: order.buyerName || "Customer",
          artworkTitle: artwork?.title || "Unknown",
          referenceNumber: validatedData.paymentReferenceNumber || "N/A"
        }).catch((err: any) => console.error("Failed to send payment proof notification:", err));
      }
      
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating order payment:", error);
      res.status(500).json({ error: "Failed to update order payment" });
    }
  });

  // Generate invoice number when order is confirmed (protected)
  app.post("/api/admin/orders/:id/generate-invoice", ...adminAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.invoiceNumber) {
        return res.json(order);
      }

      const invoiceNumber = `INV-${Date.now()}-${randomUUID().substring(0, 8).toUpperCase()}`;
      const updatedOrder = await storage.updateOrder(req.params.id, { invoiceNumber });

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error generating invoice number:", error);
      res.status(500).json({ error: "Failed to generate invoice number" });
    }
  });

  // Serve uploaded images
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
