# 🥛 Zafiroo Organic Store

> **Farm-Fresh Pure A2 Milk, Artisan Dairy & Wholesome Goods**  
> Complete full-stack E-Commerce, Kitchen Display System (KDS), and Live Delivery Logistics web platform built with **Next.js 15 App Router**, **TypeScript**, and **Tailwind CSS**.  
> The entire frontend design, typography, and section architecture is natively modeled after **[Florida Dairy Farmers (floridamilk.com)](https://www.floridamilk.com/)** with 100% internal navigation and zero external link fallbacks.

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deploy_Ready-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

---

## 🌟 Key Features

### 1. Florida Milk Visual Architecture & Sections
* **Cinematic Video Hero Header:** Background video (`hero-video.mp4`) with subtle contrast overlay and the iconic Florida Milk sunshine-yellow circular badge (`#FEEF30`), layered typography, centered cow emblem (`icon-cow.png`), and floating circular action bubble (`.ct-btn_circle`).
* **Dedicated Internal Pages (No Dead External Links):**
  * [`/`](./src/app/page.tsx) — Homepage combining all signature Florida Milk sections.
  * [`/on-the-farm`](./src/app/on-the-farm/page.tsx) — Multi-generation farmer profiles, pasture grazing practices, animal welfare, and the 4-step *Farm-to-Fridge* pipeline.
  * [`/in-the-kitchen`](./src/app/in-the-kitchen/page.tsx) — Featured recipes (*Guava Maria Cookie Ice Cream*, *Study Snack Stack Board*) with the authentic milk bottle seal badge, author credits, and 1-click **"Order Farm Ingredients"** directly into the cart.
  * [`/in-the-schools`](./src/app/in-the-schools/page.tsx) — SunnyBell mascot spotlight, elementary classroom educational sheets, cow breeds guide (Gir, Sahiwal, Jersey), and school sports nutrition.
  * [`/in-the-news`](./src/app/in-the-news/page.tsx) — Agricultural news, scientific protein studies, and an annual sweepstakes form to win 1 year of free organic milk.
  * [`/menu`](./src/app/menu/page.tsx) — Complete catalog of certified organic milk, bilona ghee, cultured butter, brown eggs, and artisan breads.
  * [`/track`](./src/app/track/page.tsx) — 5-stage live delivery tracker with large 4-digit doorstep verification OTP.
  * [`/admin`](./src/app/admin/page.tsx) — Kitchen Display System (KDS), Rider mobile mode, and 5-second red SOS disaster emergency takeover.

### 2. Self-Contained Local Storage & In-Memory State
* **Zero Database Configuration Required:** The application runs 100% out-of-the-box using local in-memory singleton stores and browser `localStorage` synchronization.
* **Ready for Supabase:** [`supabase_schema.sql`](./supabase_schema.sql) is fully prepared with tables, triggers, and automated 10-day retention cleanup whenever you decide to connect an external PostgreSQL database.

### 3. Full E-Commerce Cart & Geolocation Checkout
* **Farm Basket (Cart Drawer):** Free delivery progress bar (free above ₹299), tipping chips (₹20, ₹30, ₹50, custom), and item customization breakdowns.
* **High-Accuracy Geolocation:** Reverse geocoding down to building/house precision using OpenStreetMap Nominatim with single-line address concatenation for seamless Google Maps navigation.
* **Multi-Payment Gateways:** Integrated with Cash on Delivery (COD), Razorpay, and Cashfree drop-in SDKs.
* **Database-Persisted 4-Digit Delivery OTP:** Automatically generated on checkout and verified strictly upon delivery.

### 4. Live Order Tracking & Dispatch Logistics
* **5-Stage Stepper:** `Order Received` $\rightarrow$ `Chef Preparing` $\rightarrow$ `Thermal Packaged` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered & Enjoyed`.
* **Doorstep Verification OTP Card:** Large 4-digit code display with 1-tap **"Send to my WhatsApp"** button.
* **Assigned Rider Card:** Direct courier phone dialer link and 1-tap WhatsApp location sharing.
* **Customer Feedback:** 5-star rating selector, compliment tags, and printable 80mm POS thermal receipt modal.

### 5. Kitchen Display System (KDS) & Rider Portal
* **Dual-Authentication:** Admin Kitchen PIN (`1234` default, editable in UI) or Rider Phone Login (`9876543201`).
* **Audio Alerts:** Polyphonic Web Audio API synthesis for new order chimes and dual-tone emergency sirens.
* **🚨 5-Second Full-Screen Red SOS Emergency Takeover:** Automatic takeover upon rider disaster alert, with pulsing hazard strobe, GPS Google Maps coordinates, rider dialer, and persistent Action Center modal.
* **Strict OTP Verification:** Delivery riders must enter the customer's 4-digit OTP to complete orders (invalid OTPs are strictly rejected).

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18.18 or higher recommended)
* `npm` or `yarn`

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/mohammedrehan143/organic.git
cd organic
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## ☁️ Deploy to Vercel

This repository is **pre-configured for zero-config Vercel deployment**:

### Option 1: Deploy via Vercel Dashboard (1-Click)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select and import **`mohammedrehan143/organic`**.
3. Click **Deploy** (no build settings or environment variables required).

### Option 2: Deploy via Vercel CLI
```bash
npx vercel
# To deploy directly to production:
npx vercel --prod
```

---

## 🔐 Default Access Credentials

| Role | Access Field | Default Value |
| :--- | :--- | :--- |
| **Kitchen Admin KDS** | PIN Code | `1234` |
| **Delivery Rider 1** | Registered Phone | `9876543201` |
| **Delivery Rider 2** | Registered Phone | `9876543202` |
| **Sample Order Token** | Order Lookup | `TOK-9421-XK7` |

---

## 📁 Project Structure

```
organic/
├── public/
│   ├── hero-video.mp4           # Looping background video for hero section
│   └── images/                  # Florida Milk native logos, cow icons, recipe seals
├── src/
│   ├── app/
│   │   ├── page.tsx             # Florida Milk style homepage
│   │   ├── on-the-farm/page.tsx # Farmers, grazing practices, animal care
│   │   ├── in-the-kitchen/page.tsx # Recipes, bottle seals, 1-click cart addition
│   │   ├── in-the-schools/page.tsx # SunnyBell kids corner, cow breeds encyclopedia
│   │   ├── in-the-news/page.tsx    # Harvest news, protein science, sweepstakes
│   │   ├── menu/page.tsx        # Organic shop catalog with filters & search
│   │   ├── track/page.tsx       # 5-stage live order tracker & 4-digit OTP card
│   │   ├── admin/page.tsx       # KDS board, 5s red SOS takeover, rider mode
│   │   └── api/                 # 16 Next.js serverless route handlers
│   ├── components/              # Modular UI components matching Florida Milk
│   ├── context/
│   │   └── OrderContext.tsx     # Global order, cart, audio chimes, & local storage
│   ├── data/
│   │   └── cafeData.ts          # Default A2 milk, butter, ghee, and egg products
│   ├── lib/
│   │   ├── location.ts          # Building-level GPS geocoding & address builder
│   │   ├── notifications.ts     # WhatsApp OTP formatting
│   │   └── serverStore.ts       # In-memory local persistence singleton
│   └── types/
│       └── cafe.ts              # Domain TypeScript interfaces
├── supabase_schema.sql          # Optional Supabase database schema
├── tailwind.config.ts           # Florida Milk color tokens & font configurations
└── vercel.json                  # Vercel deployment specification
```

---

## 📄 License
MIT License © 2026 Zafiroo Organic Store. Inspired by Florida Dairy Farmers.
