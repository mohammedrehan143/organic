# Zafiroo Organic Farm Store — Product Requirements Document (PRD)

**Document Version:** 2.0.0  
**Status:** Production-Ready & Feature Complete  
**Last Updated:** September 2026  
**Farm Hub Location:** Bylanarasapura, Hoskote Taluk, Bengaluru Rural, Karnataka 562122  
**Helpline:** +91 7259635948  

---

## 1. Executive Summary & Vision

**Zafiroo Organic Farm** is a hyper-local, farm-to-doorstep dairy and organic groceries fulfillment ecosystem designed for Bangalore households. The platform delivers pure, unadulterated A2 desi cow milk in sanitized, eco-friendly returnable glass bottles, certified organic free-range brown eggs, traditional bilona desi cow ghee, and farm-fresh cold-chain daily essentials directly to the customer's doorstep before sunrise (6:00 AM – 8:30 AM).

### Core Objectives
1. **Uncompromised Quality & Freshness:** Direct morning dispatch from our Bylanarasapura farm directly to Bangalore homes with zero middlemen and zero chemical preservatives.
2. **Transparent, Zero-Friction Customer Experience:** Streamlined cart, building-level GPS geocoding, 0% GST (tax-free farm produce), zero hidden platform fees, and instant printable 80mm thermal receipts.
3. **Dual Membership Program (1L Milk / Day):**
   - **1-Month Organic Pass (Postpaid):** ₹2,160 / 30 days (1L/day @ ₹72) with ₹0 advance payment, settling at month-end.
   - **6-Month VIP Club (Prepaid):** ₹12,600 / 180 days upfront (1L/day @ ₹70, save ₹360), free thermal insulated milk bag, and 10% extra farm discount.
   - Real-time membership profile lookup by 10-digit mobile number.
4. **Kitchen Display System (KDS) & Logistics Dispatch:**
   - 2 streamlined fulfillment statuses: **Order Placed** and **Out for Delivery** (with terminal **Delivered** state).
   - Strict customer order cancellation policy: allowed only before courier dispatch; real-time red warning alert in KDS.
   - Dedicated Admin Memberships section (vertical cards one below the other) beside Analytics.
   - Rider Mobile Mode with GPS navigation, doorstep handover verification, and Disaster SOS Emergency Center.

---

## 2. System Architecture & Tech Stack

```mermaid
flowchart TD
    User([Customer]) -->|Browse & Checkout| Storefront[Next.js 15 Web Client]
    User -->|Check Membership| MembershipPortal[Membership Portal (/membership)]
    User -->|Track & Cancel Order| TrackPortal[Live Order Tracking (/track)]

    Storefront -->|POST /api/orders| OrdersAPI[Orders API Engine]
    Storefront -->|POST /api/membership| MemberAPI[Membership API Engine]
    
    OrdersAPI -->|Read/Write| Supabase[(Supabase PostgreSQL)]
    OrdersAPI -->|Fallback| MemoryStore[(In-Memory Global Store)]
    MemberAPI -->|Read/Write| Supabase
    MemberAPI -->|Fallback| MemoryStore

    Admin([Kitchen Staff / Riders]) -->|Master PIN Auth| AdminPortal[Admin Logistics Portal (/admin)]
    AdminPortal -->|KDS Live Board| OrdersAPI
    AdminPortal -->|Rider Mode & SOS| SosAPI[SOS Alert Engine]
    AdminPortal -->|Vertical Member Cards| MemberAPI

    Storefront -->|Payment Simulation / Gateway| PG[Razorpay / Cashfree / COD]
    Storefront -->|Building GPS| OSM[OpenStreetMap / Nominatim API]
```

### Technology Highlights
- **Framework:** Next.js 15.5+ (App Router architecture)
- **Frontend Engine:** React 19, TypeScript 5, Tailwind CSS
- **Icons & Animation:** Lucide React, Canvas Confetti
- **Database Layer:** Supabase PostgreSQL with real-time replication and automatic failover to Node.js server store
- **Printing & Receipts:** Native browser thermal print CSS for 80mm POS receipt printers
- **Geolocation & Mapping:** Nominatim OpenStreetMap Reverse Geocoding, WGS84 coordinates, Haversine routing
- **Integrations:** Razorpay PG SDK, WhatsApp Click-to-Chat automation

---

## 3. Core Customer Experience & Features

### 3.1 Farm Store & Product Catalog
- **Products Offered:**
  - *Pure Organic Raw Milk (1 Litre Glass Bottle)* — Pure A2 pasteurized milk packed in sterilized glass bottles.
  - *Free-Range Farm Eggs (Pack of 30 & Pack of 6)* — Organic heritage brown eggs harvested fresh daily.
  - *Traditional Bilona Desi Cow Ghee (500ml Glass Jar)* — Hand-churned Vedic curd ghee.
  - *Farm Fresh Malai Paneer (200g)* & *Artisan Set Curd (500g)*.
- **Cart Drawer:**
  - Opens exclusively when clicking the cart badge (does not auto-pop or disrupt navigation when items are added).
  - Free delivery threshold calculator (Free delivery on orders ≥ ₹499; flat ₹40 fee otherwise).
  - **0% GST:** All raw farm produce and dairy items are strictly non-taxable (GST = ₹0).

### 3.2 Geolocation & Address Precision
- **GPS Building Detection:** One-click GPS locator pulls latitude, longitude, building name, road, suburb, and postal code.
- **Address Autocomplete:** Instant search suggestions powered by OpenStreetMap Nominatim.
- **Mandatory Landmark & House Details:** Line 2 (House/Flat No. & Landmark) is strictly compulsory for all delivery orders to eliminate delivery failures.
- **Clean One-Line Formatting:** Automatically formats addresses to `{flat/door/landmark}, {street}, {suburb}, {city}`.

### 3.3 Checkout & Payment Methods
Customers can select between:
1. **Cash on Delivery (COD) / Pay at Counter:** Cash or UPI handover to the courier partner upon doorstep inspection.
2. **Razorpay UPI & Cards:** Live Razorpay Gateway integration supporting Google Pay, PhonePe, Paytm, BHIM, credit/debit cards, and net banking.
3. **Cashfree PG:** Alternate payment gateway route.
4. **Instant Simulator:** Developer & demo testing mode to verify order placement without card charges.

### 3.4 Immediate 80mm POS Thermal Bill Generation
Immediately upon order placement:
- A printable 80mm thermal bill receipt modal auto-generates on screen.
- Displays Cafe metadata, Order ID, 4-digit Token, Customer Details, Delivery Address, Itemized Table, Subtotal, 0% GST, Grand Total, and QR code verification.
- Includes physical thermal printer styling (`window.print()`).

### 3.5 Store Handover & Damage Policy
Displayed prominently at checkout:
- **Glass Bottle Security:** When a glass milk bottle breaks, ₹200 per bottle is chargeable unless enrolled in a membership scheme.
- **Spot Handover Verification:** Customers must inspect milk bottles and egg trays on the spot with the courier before signing off.
- **Immediate Milk Damage Assistance:** Replacement helpline: +91 7259635948.

---

## 4. Order Lifecycle & Strict Cancellation Policy

### 4.1 Streamlined Fulfillment Pipeline
The order fulfillment pipeline operates strictly with **two operational states** plus terminal delivery/cancellation:

```
[ 1. Order Placed ] ──────────────► [ 2. Out for Delivery ] ──────────────► [ 3. Delivered ]
       │                                     │
       ▼                                     ▼
[ Cancel Allowed ]                  [ Cancel STRICTLY BLOCKED ]
```

1. **Order Placed (`new`):** Order confirmed by customer and printed on Kitchen Display System (KDS).
2. **Out for Delivery (`delivering`):** Order dispatched with assigned rider.
3. **Delivered (`completed`):** Order verified and handed over at customer doorstep.
4. **Cancelled (`cancelled`):** Order revoked by customer prior to courier dispatch.

### 4.2 Customer Cancellation Rules
- **Cancellation Window:** Orders may **only** be cancelled by the customer while in the `Order Placed` state.
- **Online Payment Refund SLA:** For orders placed via online payments (UPI, Cards, Net Banking), refunds will be processed and returned to the customer's original payment account within **24 to 48 hours** of cancellation.
- **Dispatch Lock:** Once an order transitions to `Out for Delivery` or `Delivered`, cancellation is **strictly blocked** both in the frontend UI and by the backend server (`/api/orders/[id]` returns HTTP 400).
- **KDS High-Priority Alert:** When an order is cancelled:
  - Admin KDS displays a thick red border and pulsating badge.
  - An emergency alert banner reads: `🚨 ORDER CANCELLED BY CUSTOMER`.
  - Dispatch actions are disabled.
  - The order is categorized under the dedicated `4. Cancelled` tab in KDS.

---

## 5. Farm Membership Programs

Customers can enroll in two schemes designed to eliminate daily delivery fees:

```
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│       1-MONTH ORGANIC PASS (POSTPAID)        │          6-MONTH VIP CLUB (PREPAID)          │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Rate: ₹2,160 / 30 Days (1L/day @ ₹72)        │ Rate: ₹12,600 / 180 Days (Save ₹360 @ ₹70/L) │
│ Upfront Payment: ₹0 (Zero Advance)           │ Upfront Payment: ₹12,600 Upfront             │
│ Billing Type: Postpaid (Settle at month-end) │ Billing Type: Prepaid (Single payment)       │
│ Glass Bottle Deposit: Waived (₹0)            │ Glass Bottle Deposit: Waived (₹0)            │
│ Delivery Fee: 100% Free Daily                │ Delivery Fee: 100% Free Daily (Save ₹1,800+) │
│ Bonus Perk: Pause or cancel anytime          │ Bonus Perk: FREE Thermal Insulated Bag       │
│                                              │ Bonus Perk: 10% Extra Farm Discount          │
│                                              │ Bonus Perk: VIP Monsoon Priority Delivery    │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

### 5.1 6-Month VIP Club Prepaid Payment Page
- Enrolling in the 6-Month VIP Club uses a 2-step checkout:
  - **Step 1:** Customer enters Name, Mobile Number, Delivery Address, and Email.
  - **Step 2 (Prepaid VIP Payment Page):**
    - Itemized breakdown: ₹12,960 standard value, -₹360 VIP discount, Net Payable: **₹12,600.00**.
    - Payment selector: Razorpay UPI/Cards, Pay on First Delivery.
    - One-click `⚡ Pay ₹12,600 & Activate VIP Pass` instant simulator.
    - On completion: Triggers celebratory confetti and stores the record with `billingType: 'prepaid'`, `paymentStatus: 'paid'`, and 180 days validity.

### 5.2 1-Month Postpaid Flow & Skip Button
- Enrolling in 1-Month Postpaid activates immediately with **₹0 charged upfront**.
- In the **Check by Mobile No.** lookup portal:
  - Displays the active member digital card with 30-day countdown.
  - **Developer/Testing Skip Button:**
    - `⏩ Fast-Forward 30 Days (Skip to Month-End Bill)`
    - Simulates the completion of 30 days in one click via `PATCH /api/membership` (`action: 'skip_to_due'`).
  - **Month-End Postpaid Settlement Payment Page:**
    - When due, a pulsing alert banner displays: `🚨 Month-End Bill Due: ₹2,160 for 30 Days of Free Daily Deliveries`.
    - Clicking `Pay Month-End Bill (₹2,160)` opens the settlement modal with invoice details (GST: ₹0, Delivery: ₹0, Total: ₹2,160).
    - Supports Razorpay UPI/Cards or Pay to Courier.
    - Settling marks `paymentStatus: 'paid'`, triggers confetti, and renews the pass for the next 30 days.

---

## 6. Admin Portal & Logistics Operations (`/admin`)

The Admin portal is isolated from customer navigation and secured via a 4-digit master access PIN.

### 6.1 Dedicated Admin Navigation
The header provides quick access to 4 primary modules:
1. **KDS Live:** Real-time kitchen display board with audio chimes.
2. **Rider Portal:** Dispatch and delivery courier management.
3. **Analytics:** Sales, revenue, AOV, and courier performance metrics.
4. **Memberships (Crown 👑 Tab Beside Analytics):** Dedicated membership registry.

### 6.2 Memberships Management Section
Located directly beside Analytics, this section renders customer membership cards **vertically one below the other**:

#### Features:
- **KPI Metrics Row:**
  - Total Registered Members
  - 6-Month Prepaid VIP members
  - 1-Month Postpaid Pass holders
  - Month-End Bills Due (highlighted in red)
- **Search & Filtering:**
  - Search by customer name, 10-digit mobile number, or Member ID.
  - Filter tabs: `All`, `6-Mo VIP`, `1-Mo Postpaid`, `🚨 Bill Due`, `Active`.
- **Vertical Member Card Layout:**
  - **Header:** Scheme badge (Gold VIP or Emerald Postpaid), Member ID, and pulsating status badge (`ACTIVE MEMBER` or `🚨 MONTH-END BILL DUE (₹2,160)`).
  - **Customer Profile:** Name, Phone Number, Delivery Address, Email.
  - **Validity Countdown:** Visual progress bar, days remaining counter, started date, and expiry date.
  - **Billing Status:** Scheme rate, payment mode, and payment status pill.
  - **Action Bar:**
    - `Call Member` (instant `tel:` link).
    - `WhatsApp Reminder` (pre-filled WhatsApp message with renewal link).
    - `View Orders` (opens `/track?phone=...`).
    - `✓ Mark Month-End Bill Paid (₹2,160)` (settles invoice and adds 30 days).
    - `⏩ Simulate Due Bill (Test)` (fast-forwards 30 days for testing).
    - `+ Extend 30 Days` (extends validity).

### 6.3 Rider Mobile Dispatch & Disaster SOS Center
- **Rider Workflow:** Courier logs in via phone number, views claimed orders, clicks for Google Maps GPS turn-by-turn navigation, and performs doorstep handover verification.
- **Disaster SOS Takeover:** If a courier encounters a crisis (Accident, Bike Breakdown, Monsoon Rain, Dispute):
  - Courier taps `EMERGENCY SOS ALERT` with GPS location.
  - Triggers a 5-second full-screen flashing red strobe alert with audible siren on the KDS board.
  - Broadcasts location coordinates to emergency dispatch on WhatsApp.

---

## 7. Database Architecture & Data Models

### 7.1 `memberships` Table
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | PRIMARY KEY | Unique membership identifier (`mem-xxxx`) |
| `phone` | `VARCHAR(20)` | NOT NULL, INDEXED | 10-digit customer mobile number (lookup key) |
| `customer_name` | `VARCHAR(100)` | NOT NULL | Full name of subscriber |
| `customer_email` | `VARCHAR(100)` | NULLABLE | Email for digital receipts |
| `address` | `TEXT` | NULLABLE | Registered doorstep delivery address |
| `plan_type` | `VARCHAR(20)` | NOT NULL | `'1_month'` or `'6_months'` |
| `plan_name` | `VARCHAR(100)` | NOT NULL | Display name of plan |
| `billing_type` | `VARCHAR(20)` | NOT NULL | `'postpaid'` or `'prepaid'` |
| `price` | `NUMERIC(10,2)` | NOT NULL | Plan price (₹2,160.00 or ₹12,600.00) |
| `status` | `VARCHAR(20)` | DEFAULT `'active'` | `'active'`, `'expired'`, `'cancelled'`, `'paused'` |
| `payment_status` | `VARCHAR(20)` | DEFAULT `'due'` | `'paid'`, `'due'`, `'postpaid_cycle'` |
| `start_date` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Start timestamp |
| `end_date` | `TIMESTAMPTZ` | NOT NULL | Expiry timestamp (30 days or 180 days) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Enrollment timestamp |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Last modification timestamp |

### 7.2 `orders` Table
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | PRIMARY KEY | Order ID (`ORD-xxxxxx`) |
| `token_id` | `VARCHAR(10)` | NOT NULL | 4-digit POS kitchen token (`#1001`) |
| `customer_name` | `VARCHAR(100)` | NOT NULL | Customer name |
| `customer_phone` | `VARCHAR(20)` | NOT NULL, INDEXED | Customer phone number |
| `status` | `VARCHAR(20)` | DEFAULT `'new'` | `'new'`, `'delivering'`, `'completed'`, `'cancelled'` |
| `delivery_method` | `VARCHAR(20)` | NOT NULL | `'delivery'` or `'pickup'` |
| `delivery_address`| `TEXT` | NOT NULL | Formatted 1-line delivery destination |
| `subtotal` | `NUMERIC(10,2)` | NOT NULL | Items subtotal |
| `delivery_fee` | `NUMERIC(10,2)` | DEFAULT `0.00` | Delivery fee (0 if free delivery / member) |
| `tax` | `NUMERIC(10,2)` | DEFAULT `0.00` | GST amount (Strictly ₹0.00) |
| `total` | `NUMERIC(10,2)` | NOT NULL | Final payable amount |
| `payment_method` | `VARCHAR(20)` | NOT NULL | `'cod'`, `'razorpay'`, `'cashfree'` |
| `payment_status` | `VARCHAR(20)` | DEFAULT `'pending'` | `'pending'`, `'paid'`, `'cancelled'` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Order placement timestamp |

---

## 8. API Specification

| Method | Endpoint | Description | Request Body / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/membership` | Fetch all memberships (Admin) or single by phone | `?phone=9876543210` |
| `POST` | `/api/membership` | Enroll new 1-month or 6-month member | `{ phone, customerName, planType, address, paymentMethod }` |
| `PATCH`| `/api/membership` | Settle bill (`mark_paid`), simulate due (`skip_to_due`), or extend | `{ phone, id, action: 'skip_to_due' \| 'mark_paid' \| 'extend_30' }` |
| `GET` | `/api/orders` | Fetch orders (supports phone filter for customer tracking) | `?phone=9876543210` |
| `POST` | `/api/orders` | Place new order & assign POS token | Order payload with items, address, payment mode |
| `PATCH`| `/api/orders/[id]`| Update status or cancel order | `{ status: 'cancelled' }` (Validates against dispatch) |
| `POST` | `/api/sos` | Trigger emergency rider disaster alert | `{ agentId, reason, lat, lng, locationAddress }` |
| `PATCH`| `/api/sos` | Mark SOS emergency resolved | `{ id, resolvedBy }` |

---

## 9. Verification & Quality Assurance Checklist

- [x] **0% GST Verified:** `taxRate: 0` in cafeData, CartDrawer, CheckoutModal, OriginalBillReceipt, and track page.
- [x] **No "chilled with 4 degree celsius" text:** Zero matches across codebase.
- [x] **Customer Order Cancellation:** Eligible during `Order Placed`; blocked during `Out for Delivery` and `Delivered`.
- [x] **Admin KDS Cancel Highlight:** Cancelled orders display thick red border, alert banner, blocked dispatch, and appear in `4. Cancelled` tab.
- [x] **6-Month VIP Club Checkout:** 2-step modal with prepaid payment methods (Razorpay, Cashfree, COD/Activation) and instant payment simulator.
- [x] **1-Month Postpaid Skip Button:** `⏩ Fast-Forward 30 Days` button simulates 30-day completion and triggers the Month-End Settlement Payment Modal.
- [x] **Admin Memberships Tab:** Located beside Analytics; renders cards vertically one below the other with customer details, validity, WhatsApp reminders, and payment settlement actions.
- [x] **Bill Auto-Generation:** 80mm thermal receipt modal auto-opens on checkout completion.
- [x] **TypeScript & Production Build:** Zero type errors (`npx tsc --noEmit` exits 0) and successful production build (`next build`).
