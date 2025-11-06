import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertBidSchema, insertAnalyticsEventSchema, insertArtworkSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { emailService } from "./services/email";
import { smsService } from "./services/sms";
import { pdfService } from "./services/pdf";
import { upload, imageUploadService } from "./services/upload";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (Replit Auth integration)
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
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

        const adminEmail = process.env.ADMIN_EMAIL || "admin@artinyxus.com";
        await emailService.sendOrderNotification({
          adminEmail,
          buyerName: orderData.buyerName || "Guest",
          artworkTitle: artwork.title,
          size: orderData.size,
          price: orderData.priceCents || 0,
          orderId: order.id,
        }).catch(err => console.error("Failed to send order notification email:", err));

        if (orderData.email) {
          await emailService.sendEmail(
            orderData.email,
            "Order Confirmation - Artinyxus",
            `<h2>Thank you for your order!</h2><p>Order ID: ${order.id}</p><p>Artwork: ${artwork.title}</p><p>Size: ${orderData.size}</p><p>Price: ${(orderData.priceCents / 100).toFixed(2)} EGP</p>`
          ).catch(err => console.error("Failed to send order confirmation to customer:", err));
        }

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

  // Admin: Create artwork
  app.post("/api/admin/artworks", isAuthenticated, isAdmin, async (req, res) => {
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
  app.patch("/api/admin/artworks/:id", isAuthenticated, isAdmin, async (req, res) => {
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
  app.get("/api/admin/bids", isAuthenticated, isAdmin, async (req, res) => {
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
  app.post("/api/admin/orders/:id/confirm", isAuthenticated, isAdmin, async (req, res) => {
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
      
      if (order && order.whatsapp) {
        const artwork = await storage.getArtwork(order.artworkId);
        if (artwork) {
          let invoiceNumber = order.invoiceNumber;
          if (!invoiceNumber) {
            invoiceNumber = `INV-${Date.now()}-${randomUUID().substring(0, 8).toUpperCase()}`;
            await storage.updateOrder(order.id, { invoiceNumber });
          }
          
          await smsService.sendOrderConfirmationSMS({
            phone: order.whatsapp,
            name: order.buyerName || "Customer",
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
  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req, res) => {
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
  app.get("/api/admin/analytics", isAuthenticated, isAdmin, async (req, res) => {
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
  app.post("/api/admin/upload", isAuthenticated, isAdmin, upload.array("images", 10), async (req, res) => {
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
  app.get("/api/admin/reports/sales", isAuthenticated, isAdmin, async (req, res) => {
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
  app.get("/api/admin/analytics/revenue", isAuthenticated, isAdmin, async (req, res) => {
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
  app.get("/api/admin/analytics/best-selling", isAuthenticated, isAdmin, async (req, res) => {
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
  app.post("/api/admin/notifications/email", isAuthenticated, isAdmin, async (req, res) => {
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
  app.get("/api/admin/inventory-alerts", isAuthenticated, isAdmin, async (req, res) => {
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
  app.post("/api/admin/auctions/:id/close", isAuthenticated, isAdmin, async (req, res) => {
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

  // Generate invoice number when order is confirmed (protected)
  app.post("/api/admin/orders/:id/generate-invoice", isAuthenticated, isAdmin, async (req, res) => {
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
