import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertBidSchema, insertAnalyticsEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all artworks
  app.get("/api/artworks", async (req, res) => {
    try {
      const artworks = await storage.getAllArtworks();
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching artworks:", error);
      res.status(500).json({ error: "Failed to fetch artworks" });
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

      // Set hold expiry to 24 hours from now
      const holdExpiresAt = new Date();
      holdExpiresAt.setHours(holdExpiresAt.getHours() + 24);

      // Decrement stock first (atomic operation)
      const stockDecremented = await storage.decrementStock(artwork.id, orderData.size);
      if (!stockDecremented) {
        return res.status(400).json({ error: "Failed to reserve stock" });
      }

      let order;
      try {
        // Create order
        order = await storage.createOrder({
          ...orderData,
          holdExpiresAt,
          status: "pending"
        });

        // Log analytics event
        await storage.createAnalyticsEvent({
          eventType: "order_created",
          artworkId: artwork.id,
          meta: { orderId: order.id, size: orderData.size } as any
        });
      } catch (error) {
        // Rollback stock if order creation or analytics fails
        await storage.incrementStock(artwork.id, orderData.size);
        throw error;
      }

      res.json({ 
        order,
        whatsappUrl: `https://wa.me/201234567890?text=${encodeURIComponent(
          `مرحباً، أود طلب لوحة ${artwork.title} (المقاس: ${orderData.size}) — ${orderData.priceCents / 100} EGP. من فضلك أكد التوفر.`
        )}`
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
    } catch (error) {
      console.error("Error tracking analytics:", error);
      res.status(500).json({ error: "Failed to track event" });
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
        paymentProof: z.string().optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      const order = await storage.updateOrder(req.params.id, validatedData);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
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

  // Admin: Confirm order
  app.post("/api/admin/orders/:id/confirm", async (req, res) => {
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
      
      const order = await storage.updateOrderStatus(req.params.id, "confirmed");
      res.json(order);
    } catch (error) {
      console.error("Error confirming order:", error);
      res.status(500).json({ error: "Failed to confirm order" });
    }
  });

  // Admin: Get all orders
  app.get("/api/admin/orders", async (req, res) => {
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

  // Admin: Get analytics dashboard data
  app.get("/api/admin/analytics", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
