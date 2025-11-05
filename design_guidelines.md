# Artinyxus Luxury Art Marketplace - Design Guidelines

## Design Approach

**Reference-Based Luxury E-commerce** — Drawing inspiration from high-end art galleries (Saatchi Art, Artsy) and luxury retail (NET-A-PORTER, Mr Porter) with emphasis on emotional engagement, visual storytelling, and conversion optimization through scarcity.

**Core Principle**: Every design element must increase conversion rate, enhance perceived luxury, or improve operational efficiency.

---

## Color Palette

- **Primary Black**: #0E0E0E (backgrounds, text)
- **Luxury Gold**: #C8A951 (CTAs, accents, highlights)
- **Warm Beige**: #F8F5F2 (cards, secondary backgrounds)
- **Supporting**: Pure white #FFFFFF for contrast, subtle grays for borders

---

## Typography

**Headings**: Playfair Display (serif, luxury aesthetic)
- H1: 48px desktop / 28px mobile (hero statements)
- H2: 32px (artwork titles, section headers)
- H3: 24px (subsections)

**Body**: Inter (English) / Cairo (Arabic)
- Regular: 16px (body text)
- Large: 18px (poetic descriptions)
- Small: 14px (metadata, labels)

**Weights**: 400 (regular), 600 (semi-bold), 700 (bold for CTAs)

---

## Layout System

**Spacing Scale**: 8px grid system
- Common units: 8px, 16px, 24px, 32px, 48px, 64px
- Section padding: py-20 desktop, py-12 mobile
- Component gaps: 24px (grid items), 16px (internal spacing)

**Containers**:
- Full-width sections with inner max-w-7xl
- Content max-w-6xl for text-heavy areas
- Artwork detail: 60% image / 40% details split (desktop)

---

## Component Library

### Navigation (72px height)
- Logo.png left-aligned, clickable to home
- Sticky with backdrop-filter blur (16px) on scroll
- Links: Home | Gallery | Auctions | About | Contact
- Language toggle (🇪🇬/🇺🇸 flags) with RTL flip
- Gold "Explore Artworks" CTA button (persistent)

### Hero Section
- Full viewport (100vh)
- Background: Artwork image with dark overlay (40% opacity)
- Centered poetic quote in both Arabic/English
- Gold CTA button with backdrop-blur background
- Smooth scroll to Available Now section

### Artwork Cards (Grid)
- 1:1 aspect ratio images
- Soft drop-shadow: 0 4px 20px rgba(0,0,0,0.1)
- Hover: scale(1.03) transform, 250ms ease
- Grid: 2 columns mobile / 3 columns desktop, 24px gap
- Overlay: Title + size range + "from [price] EGP"

### Artwork Detail Page
**Layout**: Two-column desktop, stacked mobile

**Image Section (60%)**:
- Carousel with lazy-load + blur placeholders
- Navigation dots gold-accent
- Zoom on click (optional lightbox)

**Details Section (40%)**:
- Title (Playfair Display, 32px)
- Poetic short description (18px, line-height 1.6)
- Size dropdown (S/M/L) with instant price update
- Price display: Large gold number + crossed reference price
- Scarcity badge: Appears after 3s (fade-in 300ms)
  - Format: "X of Y left" in gold border
  - Color-coded: Green (5+), Orange (2-4), Red (1)
- Status badges: Gold border for Unique/Limited, Red for Sold Out
- **WhatsApp CTA**: Large gold button (#C8A951)
  - Text: "طلب عبر واتساب" with WhatsApp icon
  - Rounded-2xl (16px border-radius)
  - Hover: brightness increase, no scale
- Guarantee badge above CTA: "💰 ضمان استرجاع 100% — تجربة 7 أيام"
- Shipping note: Small gray text below CTA
- Expandable story section (collapsed by default, ≥100 words)

### Auction Interface
- Live bid counter with gold accent
- Countdown timer (large, prominent)
- Bid input with gold submit button
- Bid history list (scrollable, latest first)
- Anti-sniping notice when <60s remain

### Buttons
- Primary (Gold #C8A951): CTAs, submit actions
- Secondary (Black outline): Cancel, view more
- Border-radius: 16px (rounded-2xl)
- Padding: 12px 32px (comfortable click target)
- Hover: Brightness +10%, no transform
- Focus: 2px gold outline

### Scarcity Elements
- Badge reveal: 3000ms delay + 300ms fade-in
- Pulsing animation for "1 left" state
- Countdown timers: Bold numbers, descriptive labels

### Forms
- Input height: 48px
- Border: 1px solid #E5E5E5, focus: 2px gold
- Placeholder: #999999
- Labels: 14px above inputs

---

## Animations

**Minimal & Purposeful**:
- Card hover: scale(1.03), 250ms ease-out
- Scarcity reveal: opacity 0→1, 300ms ease-in (after 3s delay)
- Page transitions: Fade 200ms
- Countdown: Pulse on last 10 seconds
- No autoplay carousels, no distracting motion

---

## Bilingual & RTL Support

- Arabic (RTL): `<html dir="rtl">`, flip layout horizontally
- English (LTR): Default direction
- Font swap: Cairo (Arabic) / Inter (English)
- Language toggle in navbar, preference saved to localStorage
- All UI strings translated, including validation messages

---

## Images

**Hero Section**: Full-bleed artwork photograph with dark gradient overlay for text legibility

**Artwork Pages**: High-quality lifestyle shots showing scale, texture, and context (e.g., artwork on wall in elegant setting)

**Coming Soon**: Same artwork images but with 20px Gaussian blur + "Coming Soon" overlay

**About Page**: Artist portrait, studio shots creating authenticity

**All images**: WebP format, responsive srcset, lazy-load with blur placeholders

---

## Accessibility

- Keyboard navigation: All interactive elements focusable
- ARIA labels: "Add to order via WhatsApp", "Select size", etc.
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Focus indicators: 2px gold outline, 4px offset
- Screen reader: Arabic text properly announced with lang="ar"

---

## Conversion Optimization Elements

1. **Scarcity indicators**: Delayed reveal creates urgency without feeling pushy
2. **WhatsApp CTA**: Reduces friction, personal luxury service feel
3. **Guarantee badge**: Removes purchase anxiety
4. **Reference pricing**: Shows value (crossed-out higher price)
5. **Size selector**: Interactive engagement before CTA
6. **Social proof**: "Recently acquired by [city]" ticker

---

## Quality Standards

- Lighthouse targets: Performance 85+, Accessibility 90+, SEO 90+
- Image optimization: WebP, srcset, lazy-load
- Typography hierarchy: Clear visual distinction between levels
- Whitespace: Generous padding creates luxury feel (64px between major sections)
- Consistency: 8px grid enforced throughout