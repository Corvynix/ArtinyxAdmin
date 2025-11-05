# Artinyxus Luxury Art Marketplace

## Overview

Artinyxus is a luxury e-commerce platform for selling original handcrafted artworks. The application features a sophisticated marketplace with limited edition prints, unique pieces, and auction functionality. Built with a modern React frontend and Express backend, it emphasizes emotional engagement, scarcity-driven purchases, and a seamless WhatsApp-based ordering flow. The platform targets discerning art collectors with a premium, gallery-inspired user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Client-side routing implemented with Wouter for lightweight navigation

**UI Component System**: Radix UI primitives wrapped with custom Shadcn/ui components following the "new-york" style variant. All components are built with accessibility in mind and support dark mode through CSS variables.

**Styling Approach**: 
- Tailwind CSS for utility-first styling
- Custom design system with luxury aesthetic (Playfair Display for headings, Inter/Cairo for body text)
- 8px grid spacing system for consistent layout
- Color palette centered on luxury gold (#C8A951), primary black (#0E0E0E), and warm beige (#F8F5F2)
- Glass morphism effects for navigation ("glass-black")

**State Management**: 
- TanStack Query (React Query) for server state with infinite stale time and disabled refetching
- Local component state with React hooks for UI interactions
- No global state management library required due to query-based architecture

**Key Design Patterns**:
- Scarcity-driven UI with countdown timers and stock indicators
- Progressive disclosure for artwork stories (collapsed by default, expandable)
- WhatsApp-first ordering flow (no traditional checkout)
- Bilingual support (English/Arabic) with RTL considerations

### Backend Architecture

**Runtime**: Node.js with Express.js server

**API Design**: RESTful JSON API with the following endpoint structure:
- `/api/artworks` - Artwork catalog management
- `/api/orders` - Order creation and tracking with 24-hour hold mechanism
- `/api/bids` - Auction bid placement and retrieval
- `/api/analytics` - Event tracking for user behavior

**Business Logic Patterns**:
- Stock hold system: 24-hour reservation when order initiated via WhatsApp
- Automatic hold expiration and stock release for abandoned orders
- Auction anti-sniping: bids in final 60 seconds extend auction by 120 seconds
- Scarcity enforcement through remaining copy tracking per size variant

**Development/Production Split**:
- Development: Vite dev server with HMR middleware
- Production: Static file serving from compiled React build
- Single server process handles both API and static assets

### Data Storage

**Database**: PostgreSQL accessed via Neon serverless driver

**ORM**: Drizzle ORM with type-safe schema definitions

**Schema Design**:
- `artworks` table: Stores artwork details with JSONB columns for flexible size variants and image arrays
- `orders` table: Tracks purchase orders with status flow (pending → confirmed → shipped) and hold expiration timestamps
- `bids` table: Auction bid history with timestamps for anti-sniping logic
- `analyticsEvents` table: User behavior tracking (page views, WhatsApp clicks, story hovers)
- `adminSettings` table: Key-value store for admin configuration

**Key Schema Decisions**:
- JSONB for `sizes` field enables flexible pricing/stock per size without schema migrations
- Separate `remaining` count per size variant for real-time stock tracking
- `holdExpiresAt` timestamp for automatic stock release via cron job
- All monetary values stored as cents (integers) to avoid floating-point precision issues

**Migration Strategy**: Drizzle Kit with schema-first migrations to `./migrations` directory

### Authentication & Authorization

**Current Implementation**: No authentication system implemented

**Planned Approach** (based on design documents):
- Admin access via Supabase Auth or simple session-based authentication
- Public artwork browsing requires no authentication
- Order tracking via WhatsApp number lookup (no user accounts)
- Admin panel for order management, artwork updates, and analytics review

### Payment Integration

**Payment Methods**: Vodafone Cash and InstaPay (Egyptian payment systems)

**Payment Flow**:
1. User initiates order via WhatsApp button
2. Stock held for 24 hours with pending order created
3. Payment instructions sent via WhatsApp
4. User uploads payment proof (screenshot/reference number)
5. Admin manually confirms payment and updates order status
6. Order moves to "confirmed" → "shipped" states

**No automatic payment processing** - entirely manual verification flow to minimize transaction fees and infrastructure complexity

## External Dependencies

### Third-Party Services

**Neon Database**: Serverless PostgreSQL hosting with WebSocket connections for edge compatibility

**WhatsApp Business**: Primary communication channel for:
- Order placement and confirmation
- Payment instructions and proof submission
- Customer support inquiries
- Auction notifications

**Planned Integrations** (from design documents):
- Netlify for static hosting and serverless functions
- Supabase for admin authentication and file storage (artwork images, payment proofs)

### Key NPM Packages

**Frontend**:
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Accessible UI primitives (18+ components)
- `react-hook-form` + `@hookform/resolvers` - Form validation with Zod schemas
- `wouter` - Lightweight routing
- `date-fns` - Date formatting and manipulation
- `embla-carousel-react` - Image carousels for artwork galleries

**Backend**:
- `express` - HTTP server
- `drizzle-orm` + `@neondatabase/serverless` - Database access
- `drizzle-zod` - Schema validation generation
- `connect-pg-simple` - Session store (for future auth)

**Build Tools**:
- `vite` - Frontend bundler with React plugin
- `esbuild` - Backend bundler for production
- `typescript` - Type safety across entire stack
- `tailwindcss` - Utility CSS framework

### Asset Management

**Artwork Images**: Stored in `attached_assets/generated_images/` directory
- Referenced by relative paths in database
- Served as static assets via Vite/Express
- No CDN currently configured (future optimization)

**Logo & Branding**: Static files in `attached_assets/` directory served directly

**Font Loading**: Google Fonts CDN for Playfair Display, Inter, and Cairo typefaces