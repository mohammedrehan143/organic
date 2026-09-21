# 🌿 AGENT.md — Zafiroo Organic Store Guide

> **Notice for AI Agents & Developers:**  
> Read this file first. It contains the comprehensive architectural overview, business rules, design invariants, database workflows, and strict instructions required to work safely and effectively on this codebase.

---

## 1. What This Project Actually Is

**Zafiroo Organic Store** (`zafiroo-organic-store`) is a full-stack, hyper-local farm-to-doorstep e-commerce, dispatch, and delivery platform built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**.

The platform is purpose-built for an organic dairy and farm produce business (headquartered for urban direct cold-chain delivery in Bangalore/South India). It connects local organic dairy pastures directly with urban households.

### Core Farm Offerings:
1. **Pure Farm A2 Cow Milk**: Fresh morning/evening harvest bottled in sterilized, reusable glass bottles.
2. **Vedic Bilona Cow Ghee**: Hand-churned traditional curd-bilona clarified golden butter.
3. **Farm-Fresh White Eggs**: Free-range, hormone-free eggs in 12-pack cartons and 30-egg family trays.
4. **Artisan Cultured Farm Butter**: Traditional cultured white/salted butter batches.
5. **Cold-Chain Harvest Delivery**: Zero-preservative, chilled dispatch with live GPS and doorstep OTP validation.

---

## 2. Strict Business Invariants & Rules (DO NOT BREAK)

These rules have been explicitly established and must be preserved across any future refactor or feature addition:

| Rule | Requirement | Location / Context |
| :--- | :--- | :--- |
| **NO MEMBERSHIP** | **All membership concepts are strictly removed.** Do not add membership sections, membership pricing, membership buttons, or membership navigation links anywhere. | `page.tsx`, `ZafirooNavbar.tsx`, `ZafirooHero.tsx`, `ZafirooFooter.tsx` |
| **NO YELLOW / AMBER UI** | **Zero yellow or amber styling on the website.** The brand aesthetic is strictly natural forest green (`#173612`), deep forest (`#0F240B`), soft organic meadow (`#ECF5DE`, `#CBE0A3`), and crisp white. | All components & pages |
| **HOMEPAGE STRUCTURE** | The home page (`src/app/page.tsx`) consists **strictly** of the `ZafirooHero` followed by `FarmShopSection` (product list), transitioning directly into `ZafirooFooter`. No extra blocks, blogs, or cards may be inserted between the shop section and footer. | `src/app/page.tsx` |
| **NO REDIRECT ON CHECKOUT** | When an order is placed, **do NOT navigate away or redirect (`router.push`) and do NOT close the modal**. It renders an in-place **Order Detail Screen** containing the Token ID, Doorstep OTP, 5-stage stepper, items ordered, and 80mm Bill receipt printing. | `src/components/CheckoutModal.tsx` |
| **MULTI-ORDER PHONE TRACKING** | When a customer enters their mobile number in `/track`, the page **must query the database** (`/api/orders?phone=...`) and display **ALL orders associated with that 1 number** (not just one order or small hidden buttons). | `src/app/track/page.tsx`, `src/app/api/orders/route.ts` |
| **GLASS BOTTLE POLICY** | Milk is served in sterilized reusable glass bottles. If a glass bottle breaks or is lost, the customer is charged **₹200 per bottle**. | Displayed in `terms`, `CheckoutModal`, `track`, and `TermsModal` |
| **ON-THE-SPOT INSPECTION** | Customers must inspect milk glass bottles and eggs carefully on the spot upon delivery before giving the OTP to the courier. Once received and OTP is shared, **no exchange or return is available**. | Highlighted in checkout, tracking, and terms |
| **FAVICON CONVENTION** | The official circular cow emblem is served via Next.js App Router at `src/app/icon.png`. **Never create `public/icon.png`**, as it creates an App Router route collision and 500 error. | `src/app/icon.png` |

---

## 3. Technology Stack & Key Dependencies

- **Framework**: Next.js 15.1.7 with React 19 (App Router, Server & Client Components)
- **Language**: TypeScript 5.7 (Strict mode)
- **Styling**: Tailwind CSS 3.4 with custom typography (`font-bebas`, `font-serif`, `font-sans`)
- **Icons**: Lucide React (`lucide-react`)
- **Database**:
  - **Supabase PostgreSQL** via `@supabase/supabase-js` (tables: `orders`, `profiles`, `order_items`)
  - **In-Memory Server Store** (`src/lib/serverStore.ts`) providing seamless zero-config offline fallback when Supabase credentials are not populated in `.env.local`.
- **Payment Gateways**:
  - **Razorpay**: Official checkout SDK + signature verification API (`src/app/api/razorpay/*`)
  - **Cashfree**: Drop-in sandbox/production SDK (`src/app/api/cashfree/*`)
  - **Cash on Delivery (COD)**: Instant order confirmation with doorstep OTP
- **Geocoding & Location**: OpenStreetMap Nominatim reverse geocoding for building-level GPS precision (`src/lib/location.ts`)
- **Receipt & Thermal POS**: Client-side 80mm receipt generation and printing (`src/components/BillModal.tsx`)
- **Audio Synthesis**: Web Audio API polyphonic chimes and SOS disaster sirens (`src/app/admin/page.tsx`)

---

## 4. Repository & Directory Structure

```text
organic/
├── AGENT.md                  # This file: authoritative agent documentation
├── README.md                 # Public repository documentation
├── package.json              # Project dependencies & scripts
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind theme colors and typography
├── supabase_schema.sql       # PostgreSQL schema with tables, triggers & RLS
│
├── public/                   # Static assets
│   ├── hero-video.mp4        # Header video (played without circular mask)
│   ├── favicon.ico           # Legacy fallback favicon
│   ├── favicon.png           # Fallback PNG favicon
│   └── images/               # Product images, ghee, milk splash, cow logo
│
└── src/
    ├── app/                  # Next.js App Router
    │   ├── layout.tsx        # Root layout, providers, global drawers & modals
    │   ├── page.tsx          # Homepage: Hero + FarmShopSection + Footer
    │   ├── icon.png          # Primary Next.js App Router favicon (Cow emblem)
    │   ├── globals.css       # Global Tailwind directives & custom classes
    │   ├── track/            # Multi-order live tracking by mobile or token
    │   │   └── page.tsx
    │   ├── admin/            # Kitchen Display System (KDS), Dispatch & SOS portal
    │   │   └── page.tsx
    │   ├── menu/             # Complete categorized farm catalog
    │   ├── terms/            # Official store policies (₹200 bottle, spot-check)
    │   ├── on-the-farm/      # Farm practices & animal welfare
    │   ├── in-the-kitchen/   # Farm dairy recipes with 1-click cart addition
    │   ├── in-the-schools/   # Dairy education & breed guides
    │   ├── in-the-news/      # Dairy news & sweepstakes
    │   └── api/              # Route Handlers
    │       ├── orders/       # GET (by phone/token), POST (place order)
    │       ├── razorpay/     # Order creation & verification
    │       ├── cashfree/     # Cashfree gateway endpoints
    │       └── delivery/     # Courier OTP verification & SOS alerts
    │
    ├── components/           # Reusable UI components
    │   ├── ZafirooNavbar.tsx # Brand header with GPS detector & cart trigger
    │   ├── ZafirooHero.tsx   # Video background hero without circle overlay
    │   ├── FarmShopSection.tsx# Live farm product grid with add-to-cart
    │   ├── ZafirooFooter.tsx # Store policies, WhatsApp channel & copyright
    │   ├── CheckoutModal.tsx # Geolocation checkout & in-place order detail screen
    │   ├── CartDrawer.tsx    # Slide-over cart with free delivery progress
    │   ├── BillModal.tsx     # 80mm thermal POS receipt modal
    │   ├── OrderTrackingModal.tsx # Quick floating order tracker modal
    │   ├── TermsModal.tsx    # Popup modal with ₹200 bottle & inspection policy
    │   └── LocationModal.tsx # Building-level address & GPS selector
    │
    ├── context/
    │   └── OrderContext.tsx  # Central state: Cart, GPS, Orders, Modals
    ├── data/
    │   └── cafeData.ts       # Products catalog (Milk, Ghee, Eggs, Butter)
    ├── lib/
    │   ├── supabase.ts       # Supabase client + DB row mappers + fallback
    │   ├── serverStore.ts    # In-memory singleton order storage
    │   ├── location.ts       # GPS geolocation & reverse geocoding
    │   └── whatsapp.ts       # WhatsApp OTP & Location pin sharing links
    └── types/
        └── cafe.ts           # TypeScript interfaces (Order, MenuItem, CartItem)
```

---

## 5. Critical Workflows Explained

### A. Order Placement & In-Place Confirmation Flow
1. Customer adds items (Milk, Eggs, Ghee) to cart via [`FarmShopSection`](file:///D:/agy/organic/src/components/FarmShopSection.tsx).
2. Customer opens cart or clicks checkout $\rightarrow$ [`CheckoutModal`](file:///D:/agy/organic/src/components/CheckoutModal.tsx) opens.
3. GPS auto-detects or customer types building address.
4. Customer selects COD, Razorpay, or Cashfree.
5. Customer clicks **"Confirm & Place Farm Order"**:
   - Order is posted to `POST /api/orders` (and synced into Supabase + local store).
   - Generates a **unique Token ID** (`TOK-xxxx-xxx`), **Order ID** (`ZF-xxxx-xxx`), and **4-digit OTP**.
   - **Crucial:** The modal **does NOT navigate away**. It sets `placedOrder` state and immediately displays the in-place **Order Detail Screen**.
   - Customer sees their Doorstep OTP, fulfillment stepper, items ordered, 80mm bill print button, and direct WhatsApp link.

### B. Live Database Tracking by Phone Number
1. Customer navigates to [`/track`](file:///D:/agy/organic/src/app/track/page.tsx) or enters their mobile number.
2. The page calls `GET /api/orders?phone=<10_digits>`.
3. The API normalizes country codes (`+91` or clean 10-digit suffix) and searches both Supabase and the server store.
4. **All orders** for that phone number are returned, sorted newest first.
5. The UI displays:
   - Summary badge: `Found X orders in farm database for <phone>`.
   - Toggle tabs: `All Orders (X)` (default) or individual `Token #` pills.
   - Every order card includes: Token, Order ID, Date/Time, 5-Stage Stepper, Doorstep OTP card, Rider details (if assigned), full itemized list, and "Print 80mm Bill Receipt" button.

### C. Kitchen Display System (KDS) & Rider Dispatch
1. Located at [`/admin`](file:///D:/agy/organic/src/app/admin/page.tsx).
2. Protected by PIN authentication (`1234` by default).
3. Kitchen staff see incoming orders in real-time, can transition orders (`new` $\rightarrow$ `preparing` $\rightarrow$ `ready` $\rightarrow$ `delivering`).
4. Couriers log in via their phone number and must enter the customer's secret 4-digit doorstep OTP to transition an order to `completed`.
5. Includes an Emergency SOS system with audio sirens and live GPS coordinates for road safety.

---

## 6. Development & Verification Guide

### Essential Commands:
```bash
# Run local development server (port 3000)
npm run dev

# Run TypeScript checking and Next.js production build
npm run build

# Start production server
npm start
```

### Verification Checklist before finishing tasks:
1. Run `npm run build` to confirm zero TypeScript compilation errors and clean static page generation.
2. Verify that `public/icon.png` does NOT exist (only `src/app/icon.png`).
3. Ensure no amber/yellow classes (`bg-amber-*`, `text-amber-*`, `bg-yellow-*`) were introduced into user-facing components.
4. Ensure no membership sections or links have reappeared.
5. Verify that cart item rendering defensively checks `it.menuItem?.name || it.name`.

---

*This document must be kept up to date whenever core business rules, database schemas, or routing behaviors are modified.*
