# Artinyxus - Luxury Art Marketplace

## Overview

Artinyxus is a luxury e-commerce platform for selling original, hand-crafted artworks. The platform specializes in limited edition and unique pieces, featuring a sophisticated bilingual (English/Arabic) interface with auction capabilities, order management, and admin dashboard.

**Core Business Model:**
- Direct sales of unique and limited edition artworks
- Live auction system for exclusive pieces
- WhatsApp-based order confirmation and customer communication
- Payment via Vodafone Cash or InstaPay
- 7-day money-back guarantee

**Tech Stack:**
- Frontend: React + TypeScript + Vite
- Backend: Express.js + Node.js
- Database: PostgreSQL (Neon serverless)
- ORM: Drizzle
- UI Components: Shadcn/ui + Tailwind CSS
- Auth: Replit Auth (OIDC-based)
- State Management: TanStack Query

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component-Based Design:**
- Reusable UI components built with Shadcn/ui primitives
- Page-level components in `client/src/pages/` using Wouter for routing
- Shared components in `client/src/components/` for cross-page functionality
- Design system follows luxury e-commerce patterns (inspired by Saatchi Art, NET-A-PORTER)

**State Management:**
- TanStack Query for server state management and caching
- React hooks for local component state
- Custom hooks (`useAuth`, `useIsMobile`, `useToast`) for reusable logic

**Routing:**
- Client-side routing via Wouter
- Route definitions in `App.tsx`
- Dynamic routes for artwork pages (`/artworks/:slug`)
- Admin routes protected by authentication checks

**Internationalization:**
- Bilingual support (English/Arabic) at component level
- Language toggle in navbar
- RTL support via Tailwind utilities

### Backend Architecture

**API Structure:**
- RESTful API endpoints in `server/routes.ts`
- Express middleware for security (helmet, rate limiting)
- Session-based authentication using PostgreSQL session store
- Separate rate limiters for general API (100 req/15min) and orders (10 req/hour)

**Key API Endpoints:**
- `/api/artworks` - CRUD operations for artworks
- `/api/orders` - Order creation, confirmation, status updates
- `/api/bids` - Auction bidding system
- `/api/admin/*` - Admin-only endpoints for management
- `/api/capacity/*` - Production capacity management
- `/api/wall-of-fame` - Top buyers leaderboard
- `/api/restore-holds` - CRON endpoint for releasing expired order holds

**Business Logic Layer:**
- Storage abstraction in `server/storage.ts` provides clean interface over database
- Service layer for email, SMS, PDF generation, and image uploads
- Price calculation and profit margin validation in storage layer

**Data Flow:**
1. Client makes API request via TanStack Query
2. Express middleware validates and rate-limits
3. Route handler calls storage abstraction
4. Storage layer performs Drizzle ORM operations
5. Response sent back to client with appropriate status codes

### Database Schema

**Core Tables:**

**artworks** - Product catalog
- Stores artwork metadata (title, slug, description, story)
- JSONB fields for images array and sizes configuration
- Supports three types: unique, limited edition, auction
- Tracks inventory per size variant
- Includes cost tracking (materials, packaging, labor) for profit analysis

**orders** - Purchase transactions
- Links to artwork and size variant
- Tracks order lifecycle: pending → confirmed → shipped/cancelled/refunded
- 24-hour hold system with `holdExpiresAt` timestamp
- Payment method and proof storage
- Scheduled fulfillment with ETA tracking
- Invoice number generation

**bids** - Auction system
- Links to auction-type artworks
- Tracks bid amount, bidder info, and timestamps
- Auto-increment validation via `minIncrementCents`

**users** - Authentication (Replit Auth)
- Stores user profile from OIDC claims
- Admin role flag for access control

**sessions** - Authentication state
- PostgreSQL-based session storage (connect-pg-simple)
- 7-day session TTL

**Supporting Tables:**
- `analyticsEvents` - User behavior tracking
- `notifications` - System notifications
- `inventoryAlerts` - Low stock alerts
- `productionSlots` - Daily capacity management (NOT IMPLEMENTED)
- `buyerLimits` - Purchase limits per buyer (NOT IMPLEMENTED)
- `adminSettings` - System configuration

**Indexing Strategy:**
- Primary keys on all tables (UUID default via `gen_random_uuid()`)
- Unique constraints on slugs, emails
- Index on session expiration for cleanup efficiency

### Authentication & Authorization

**Replit Auth Integration:**
- OIDC-based authentication via `openid-client`
- Session management with PostgreSQL store
- User profile syncing from OIDC claims to local users table
- Token refresh handling in `replitAuth.ts`

**Authorization Patterns:**
- `isAuthenticated` middleware for protected routes
- `isAdmin` middleware for admin-only endpoints
- Client-side auth checks via `useAuth()` hook
- Role-based UI rendering based on `user.isAdmin` flag

**Security Measures:**
- Helmet.js for security headers
- Express rate limiting (tiered by endpoint sensitivity)
- Session cookies with httpOnly and secure flags
- CSRF protection via session secret

### File Upload System

**Image Upload Pipeline:**
- Multer for multipart form handling (10MB limit)
- Sharp for image processing (resize to 1920px max, 85% JPEG quality)
- Local storage in `uploads/artworks/` directory
- UUID-based filenames to prevent conflicts
- Whitelist: JPEG, PNG, WebP only

**Served via:**
- Static file serving at `/uploads` route
- Direct file URLs stored in artwork `images` JSONB array

### External Services Integration

**Email Service (Nodemailer):**
- Configurable SMTP (Gmail default, port 587)
- Graceful degradation if credentials not provided
- Order confirmation emails
- Admin notification emails

**SMS Service (Twilio):**
- WhatsApp messaging capability
- SMS notifications for order updates
- Falls back silently if not configured
- Used for customer communication and admin alerts

**PDF Generation (PDFKit):**
- Dynamic invoice generation
- Downloadable via `/api/invoices/:orderId`
- Includes order details, buyer info, artwork metadata
- Branded template with company logo

### Production Capacity System (PARTIAL)

**Intended Design:**
- Daily production limit tracking
- Scheduled fulfillment with ETA calculation
- Auto-assignment to production slots
- Queue position visibility for customers

**Current Status:**
- Database schema exists (`productionSlots` table)
- Admin UI partially implemented (`AdminCapacity.tsx`)
- **CRITICAL GAP:** Enforcement logic NOT implemented
- No capacity checking during order creation
- No scheduled CRON for slot management

### Order Lifecycle Management

**States:** pending → confirmed → shipped/cancelled/refunded

**Hold System:**
- 24-hour automatic hold on order creation
- `holdExpiresAt` timestamp tracked
- `/api/restore-holds` endpoint to release expired holds
- **CRITICAL GAP:** No scheduled CRON job configured to call this endpoint

**Confirmation Flow:**
1. Customer clicks WhatsApp order button
2. System creates pending order, decrements stock, sets 24h hold
3. Customer provides payment proof via WhatsApp
4. Admin confirms order via dashboard
5. Order status → confirmed, invoice generated
6. Admin marks as shipped when sent

### Analytics & Tracking

**Event Types Tracked:**
- `page_view` - Page navigation
- `whatsapp_click` - CTA engagement
- `order_created` - Conversion events
- `bid_placed` - Auction engagement
- `hover_story` - Content interaction

**Stored in:**
- `analyticsEvents` table with JSONB metadata
- Queryable via `/api/admin/analytics` endpoint
- Admin dashboard displays aggregate metrics

### Admin Features

**Dashboard Sections:**
- Overview: Key metrics (orders, revenue, active auctions)
- Artworks: CRUD operations, stock management, image uploads
- Orders: Status updates, payment verification, invoice download
- Bids: Auction monitoring, bid history
- Analytics: Conversion rates, popular artworks
- Capacity: Production scheduling (PARTIAL)

**Permissions:**
- All admin routes require `isAdmin` flag
- Client-side redirects for unauthorized access
- Server-side middleware enforcement

## External Dependencies

### Third-Party Services

**Neon PostgreSQL:**
- Serverless PostgreSQL database
- WebSocket connections via `@neondatabase/serverless`
- Connection pooling configured
- **CRITICAL:** Database must be provisioned via Replit tools

**Replit Auth:**
- OIDC provider for authentication
- No API keys needed (uses Replit environment)
- Session management via `connect-pg-simple`

**Twilio (Optional):**
- SMS and WhatsApp messaging
- Requires: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- Gracefully disabled if not configured

**Email SMTP (Optional):**
- Configurable SMTP server (default Gmail)
- Requires: `EMAIL_USER`, `EMAIL_PASSWORD`
- Optional: `EMAIL_HOST`, `EMAIL_PORT`
- Gracefully disabled if not configured

### NPM Packages

**Core Framework:**
- `express` - Web server
- `react` + `react-dom` - UI framework
- `vite` - Build tool and dev server
- `wouter` - Client-side routing

**Database:**
- `drizzle-orm` - Type-safe ORM
- `drizzle-kit` - Schema migrations
- `@neondatabase/serverless` - PostgreSQL client

**UI Components:**
- `@radix-ui/*` - Headless UI primitives (20+ components)
- `tailwindcss` - Utility-first CSS
- `class-variance-authority` - Component variants
- `lucide-react` - Icon library

**State Management:**
- `@tanstack/react-query` - Server state
- `zustand` - Not used (could be added for global client state)

**Forms & Validation:**
- `react-hook-form` - Form management
- `@hookform/resolvers` - Validation
- `zod` - Schema validation

**Authentication:**
- `openid-client` - OIDC client
- `passport` - Auth middleware
- `express-session` - Session management
- `connect-pg-simple` - PostgreSQL session store

**Utilities:**
- `nodemailer` - Email sending
- `twilio` - SMS/WhatsApp
- `pdfkit` - PDF generation
- `sharp` - Image processing
- `multer` - File uploads
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting

### Environment Variables Required

**Essential:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit environment identifier (auto-provided)
- `ISSUER_URL` - OIDC issuer (default: https://replit.com/oidc)

**Optional:**
- `EMAIL_USER`, `EMAIL_PASSWORD` - SMTP credentials
- `EMAIL_HOST`, `EMAIL_PORT` - SMTP server config
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - SMS/WhatsApp
- `NODE_ENV` - Environment (development/production)

### Build & Deployment

**Development:**
```bash
npm run dev  # Starts Vite dev server + Express API
```

**Production Build:**
```bash
npm run build  # Builds client (Vite) + server (esbuild)
npm start      # Runs production server
```

**Database Setup:**
```bash
npm run db:push  # Sync Drizzle schema to database
node scripts/seed.ts  # Seed initial data
```

**Deployment Target:**
- Designed for Replit deployment
- Uses Replit-specific plugins (dev banner, cartographer)
- Static files served from `dist/public`
- Server bundle in `dist/index.js`