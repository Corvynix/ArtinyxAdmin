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

      // Create order
      const order = await storage.createOrder({
        ...orderData,
        holdExpiresAt,
        status: "pending"
      });

      // Decrement stock
      const updatedSizes: Record<string, { price_cents: number; total_copies: number; remaining: number }> = { ...artwork.sizes };
      updatedSizes[orderData.size].remaining -= 1;
      await storage.updateArtwork(artwork.id, { sizes: updatedSizes });

      // Log analytics event
      await storage.createAnalyticsEvent({
        eventType: "order_created",
        artworkId: artwork.id,
        meta: { orderId: order.id, size: orderData.size } as any
      });

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
        
        // Restore stock
        const artwork = await storage.getArtwork(order.artworkId);
        if (artwork) {
          const updatedSizes: Record<string, { price_cents: number; total_copies: number; remaining: number }> = { ...artwork.sizes };
          if (updatedSizes[order.size]) {
            updatedSizes[order.size].remaining += 1;
            await storage.updateArtwork(artwork.id, { sizes: updatedSizes });
          }
        }
      }
      
      res.json({ restoredCount: expiredOrders.length });
    } catch (error) {
      console.error("Error restoring holds:", error);
      res.status(500).json({ error: "Failed to restore holds" });
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
