import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, bigint, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (Replit Auth integration)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (Replit Auth integration)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Artworks table
export const artworks = pgTable("artworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  shortDescription: text("short_description"),
  story: text("story"),
  images: jsonb("images").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  // sizes JSONB structure: { "S": { price_cents: number, total_copies: number, remaining: number }, ... }
  sizes: jsonb("sizes").$type<Record<string, { price_cents: number; total_copies: number; remaining: number }>>().notNull(),
  type: text("type").notNull().$type<"unique" | "limited" | "auction">(),
  status: text("status").notNull().default("available").$type<"available" | "coming_soon" | "sold" | "auction_closed">(),
  category: text("category").$type<"abstract" | "portrait" | "landscape" | "modern" | "calligraphy" | "mixed_media">(),
  style: text("style"),
  auctionStart: timestamp("auction_start"),
  auctionEnd: timestamp("auction_end"),
  currentBidCents: bigint("current_bid_cents", { mode: "number" }),
  minIncrementCents: bigint("min_increment_cents", { mode: "number" }).default(50000), // 500 EGP default
  lowStockThreshold: integer("low_stock_threshold").default(2),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artworkId: varchar("artwork_id").notNull().references(() => artworks.id),
  buyerName: text("buyer_name"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  size: text("size").notNull(),
  priceCents: bigint("price_cents", { mode: "number" }).notNull(),
  paymentMethod: text("payment_method").$type<"vodafone_cash" | "instapay">(),
  paymentProof: text("payment_proof"),
  invoiceNumber: text("invoice_number").unique(),
  status: text("status").notNull().default("pending").$type<"pending" | "confirmed" | "cancelled" | "refunded" | "shipped">(),
  holdExpiresAt: timestamp("hold_expires_at"),
  shippedAt: timestamp("shipped_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Bids table
export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artworkId: varchar("artwork_id").notNull().references(() => artworks.id),
  bidderName: text("bidder_name"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  isWinner: boolean("is_winner").default(false),
  notificationSent: boolean("notification_sent").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Analytics events table
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull().$type<"page_view" | "whatsapp_click" | "order_created" | "bid_placed" | "hover_story">(),
  artworkId: varchar("artwork_id").references(() => artworks.id),
  meta: jsonb("meta").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin settings table
export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").$type<any>().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Rate limit violations table
export const rateLimitViolations = pgTable("rate_limit_violations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ip: text("ip").notNull(),
  endpoint: text("endpoint").notNull(),
  artworkId: varchar("artwork_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin audit table
export const adminAudit = pgTable("admin_audit", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminEmail: text("admin_email").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type"),
  resourceId: varchar("resource_id"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull().$type<"email" | "sms" | "whatsapp">(),
  recipient: text("recipient").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending").$type<"pending" | "sent" | "failed">(),
  relatedOrderId: varchar("related_order_id").references(() => orders.id),
  relatedBidId: varchar("related_bid_id").references(() => bids.id),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Inventory alerts table
export const inventoryAlerts = pgTable("inventory_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artworkId: varchar("artwork_id").notNull().references(() => artworks.id),
  size: text("size").notNull(),
  remainingStock: integer("remaining_stock").notNull(),
  threshold: integer("threshold").notNull(),
  alertSent: boolean("alert_sent").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertArtworkSchema = createInsertSchema(artworks).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, createdAt: true });
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, sentAt: true });
export const insertInventoryAlertSchema = createInsertSchema(inventoryAlerts).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type Artwork = typeof artworks.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertInventoryAlert = z.infer<typeof insertInventoryAlertSchema>;
export type InventoryAlert = typeof inventoryAlerts.$inferSelect;
