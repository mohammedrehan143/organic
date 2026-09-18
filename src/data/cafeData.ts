import { MenuItem, DeliveryAgent, Order, SosAlert } from '@/types/cafe';

export const CAFE_METADATA = {
  name: "Zafiroo",
  brand: "Zafiroo Organic Store",
  tagline: "Wholesome Dairy & Farm-Fresh Organic Goods",
  subtitle: "Delivering wholesome organic products from our local farms to your table.",
  phone: "+91 7259635948",
  whatsapp: "+917259635948",
  email: "care@zafiroo-organic.com",
  address: "Bylanarasapura, Hoskote Taluk, Bangalore - 562122",
  hours: "Daily Morning & Evening Delivery: 6:00 AM – 9:30 PM",
  freeDeliveryThreshold: 0, // FREE DELIVERY FOR ALL PRODUCTS
  deliveryFee: 0,
  taxRate: 0.05, // 5% GST
  bottleBreakageFee: 200,
  termsAndPolicies: [
    "When glass bottle breaks the customer has to pay rupees 200 per bottle.",
    "When your order is arrived please check the product carefully are all items available because ones you receive no exchange and return available so please check on the spot.",
    "When your eggs order has arrived please check weather the eggs are in good condition it should not be cracked or broken please check on the spot so you can get exchange.",
    "If the milk it broken you can contact directly to the Zafiroo agents so you can exchange and get fresh milk contact as soon as possible."
  ],
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // --- ORGANIC MILK CATEGORY (Glass Bottle with Zafiroo Organic Milk label & Milk Splash) ---
  {
    id: "org-milk-1l",
    name: "Organic Milk in Glass Bottle (1 Litre)",
    category: "Organic Milk",
    description: "Pure single-source certified organic milk in sterilized glass bottles labeled Zafiroo Organic Milk.",
    detailedDescription: "Unadulterated single-source certified organic whole milk bottled in sterilized glass bottles with Zafiroo Organic Milk label. Non-homogenized with natural cream top, chilled at 4°C with dynamic milk splash freshness. (Note: Reusable glass bottle policy applies — ₹200 fee in case of bottle breakage).",
    price: "₹72",
    priceNumber: 72,
    image: "/images/zafiroo-organic-milk.png",
    calories: 148,
    dietary: "veg",
    tasteNotes: ["Glass Bottle Fresh", "Rich Cream Layer", "Free Delivery"],
    featured: true,
    signature: true,
    prepTime: "Cold Dispatched",
    isAvailable: true,
    displayOrder: 1,
    customizationOptions: {
      portion: ["1 Litre Glass Bottle (₹72)", "Half Litre - 500ml Glass Bottle (₹38)"],
      temperature: ["Chilled (4°C)", "Room Temp Bottle"]
    }
  },
  {
    id: "org-milk-half",
    name: "Organic Milk in Glass Bottle (500ml)",
    category: "Organic Milk",
    description: "Pure certified organic milk in convenient half-litre (500ml) glass bottle with Zafiroo Organic Milk label.",
    detailedDescription: "Fresh daily organic milk in a 500ml sterilized glass bottle with Zafiroo Organic Milk label, perfect for daily tea and coffee rituals. (Note: ₹200 glass bottle replacement fee applies if broken).",
    price: "₹38",
    priceNumber: 38,
    image: "/images/zafiroo-organic-milk.png",
    calories: 74,
    dietary: "veg",
    tasteNotes: ["Glass Bottle 500ml", "Naturally Sweet", "Free Delivery"],
    featured: false,
    signature: false,
    prepTime: "Cold Dispatched",
    isAvailable: true,
    displayOrder: 2,
    customizationOptions: {
      portion: ["Half Litre - 500ml Glass Bottle (₹38)", "1 Litre Glass Bottle (₹72)"],
      temperature: ["Chilled (4°C)", "Room Temp Bottle"]
    }
  },

  // --- ORGANIC GHEE CATEGORY (Out of stock for now) ---
  {
    id: "org-ghee-500ml",
    name: "Pure Organic Cow Ghee (500ml)",
    category: "Organic Ghee",
    description: "Traditional Vedic Bilona pure organic cow ghee crafted from cultured curd of grass-fed cows. (Currently Out of Stock)",
    detailedDescription: "Handcrafted using the ancient Vedic Bilona method from cultured curd of grass-fed pasture cows. Golden, granular, and deeply aromatic. High in healthy fatty acids. Currently out of stock.",
    price: "₹650",
    priceNumber: 650,
    image: "/images/organic-cow-ghee.jpg",
    calories: 120,
    dietary: "veg",
    tasteNotes: ["Vedic Bilona Method", "Golden Granular Texture", "Aromatic & Pure"],
    featured: true,
    signature: true,
    prepTime: "Out of Stock",
    isAvailable: false, // OUT OF STOCK FOR NOW
    displayOrder: 3,
    customizationOptions: {
      portion: ["500ml Glass Jar (₹650)"]
    }
  },

  // --- NORMAL WHITE EGGS CATEGORY ---
  {
    id: "org-norm-12",
    name: "Normal White Eggs (Pack of 12)",
    category: "Normal Eggs",
    description: "Daily fresh farm table white eggs, sanitized and packed in protective 12-egg cartons.",
    detailedDescription: "Fresh daily farm table white eggs with clean, smooth white shells from healthy hens. Packed in protective 12-egg cartons. Please check eggs on the spot upon delivery for exchange.",
    price: "₹72",
    priceNumber: 72,
    image: "/images/eggs-12-white.jpg",
    calories: 70,
    dietary: "non-veg",
    tasteNotes: ["Pure White Shells", "12-Egg Pack Carton", "Free Delivery"],
    featured: false,
    signature: false,
    prepTime: "Farm Packaged",
    isAvailable: true,
    displayOrder: 4,
    customizationOptions: {
      portion: ["12 White Eggs Pack (₹72)", "30 White Eggs Tray (₹170)"]
    }
  },
  {
    id: "org-norm-30",
    name: "Normal White Eggs (Tray of 30)",
    category: "Normal Eggs",
    description: "Value farm crate of 30 fresh white table eggs in molded pulp tray for everyday cooking.",
    detailedDescription: "Household monthly tray of 30 fresh farm white table eggs arranged in commercial protective molded pulp crates. Please inspect eggs on the spot upon arrival for immediate exchange.",
    price: "₹170",
    priceNumber: 170,
    image: "/images/eggs-30-white.jpg",
    calories: 70,
    dietary: "non-veg",
    tasteNotes: ["Value 30-Egg Tray", "Pure White Shells", "Free Delivery"],
    featured: true,
    signature: false,
    prepTime: "Farm Packaged",
    isAvailable: true,
    displayOrder: 5,
    customizationOptions: {
      portion: ["30 White Eggs Tray (₹170)", "12 White Eggs Pack (₹72)"]
    }
  },

  // --- NATI EGGS CATEGORY ---
  {
    id: "org-nati-12",
    name: "Nati Eggs (Pack of 12)",
    category: "Nati Eggs",
    description: "Authentic free-range country (Nati) eggs with deep golden yolks.",
    detailedDescription: "Genuine free-range country (Nati) eggs laid by healthy heritage hens foraging freely on sunlit pastures. Rich in natural Omega-3. Please check on the spot upon delivery.",
    price: "₹299",
    priceNumber: 299,
    image: "/images/zafiroo-organic-eggs-12.png",
    calories: 72,
    dietary: "non-veg",
    tasteNotes: ["100% Free-Range Nati", "Deep Golden Yolk", "Free Delivery"],
    featured: true,
    signature: true,
    prepTime: "Farm Packaged",
    isAvailable: true,
    displayOrder: 6,
    customizationOptions: {
      portion: ["12 Eggs Pack (₹299)", "30 Eggs Tray (₹720)"]
    }
  },
  {
    id: "org-nati-30",
    name: "Nati Eggs (Tray of 30)",
    category: "Nati Eggs",
    description: "Value monthly tray of 30 authentic free-range country (Nati) eggs.",
    detailedDescription: "Direct-from-farm monthly crate of 30 authentic free-range country (Nati) eggs carefully cradled in protective molded pulp trays. Please check on the spot upon arrival.",
    price: "₹720",
    priceNumber: 720,
    image: "/images/zafiroo-organic-eggs-30.png",
    calories: 72,
    dietary: "non-veg",
    tasteNotes: ["Family Value Pack", "100% Free-Range Nati", "Free Delivery"],
    featured: false,
    signature: true,
    prepTime: "Farm Packaged",
    isAvailable: true,
    displayOrder: 7,
    customizationOptions: {
      portion: ["30 Eggs Tray (₹720)", "12 Eggs Pack (₹299)"]
    }
  }
];

export const INITIAL_DELIVERY_AGENTS: DeliveryAgent[] = [
  {
    id: "AGT-9876-01",
    name: "Aarav Sharma",
    phone: "9876543201",
    status: "active",
    vehicleType: "Electric Eco-Van",
    ordersDeliveredCount: 142,
  },
  {
    id: "AGT-9876-02",
    name: "Priya Nair",
    phone: "9876543202",
    status: "active",
    vehicleType: "Insulated Farm Cargo Bike",
    ordersDeliveredCount: 98,
  },
  {
    id: "AGT-9876-03",
    name: "Rahul Verma",
    phone: "9876543203",
    status: "active",
    vehicleType: "Electric Eco-Van",
    ordersDeliveredCount: 215,
  },
  {
    id: "AGT-9876-04",
    name: "Deepak Patel",
    phone: "9876543204",
    status: "active",
    vehicleType: "Insulated Farm Cargo Bike",
    ordersDeliveredCount: 64,
  },
];

export const INITIAL_SOS_ALERTS: SosAlert[] = [
  {
    id: "SOS-9421-1718",
    agentId: "AGT-9876-01",
    agentName: "Aarav Sharma",
    agentPhone: "9876543201",
    orderId: "ZF-9421-XK7",
    tokenId: "TOK-9421-XK7",
    reason: "breakdown",
    notes: "Delivery EV battery failure near 100ft road Indiranagar signal. Need immediate vehicle swap.",
    lat: 12.9716,
    lng: 77.6412,
    locationAddress: "100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038",
    status: "resolved",
    resolvedAt: new Date(Date.now() - 3600000).toISOString(),
    resolvedBy: "Farm Admin (PIN 1234)",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ZF-9421-XK7",
    tokenId: "TOK-9421-XK7",
    trackingCode: "TRK-9421",
    customerId: "CUST-9886-A4F",
    deliveryAgentId: "AGT-9876-01",
    deliveryOtp: "4829",
    status: "delivering",
    deliveryMethod: "delivery",
    customer: {
      name: "Ananya Iyer",
      phone: "9876543210",
      email: "ananya@example.com",
      address: "14 Palm Avenue, 3rd Cross, Indiranagar, Bengaluru, 560038",
      unitOrApt: "Penthouse 4B, Green View Towers",
      deliveryInstructions: "Ring bell twice, hand over with OTP.",
      lat: 12.9715,
      lng: 77.6410,
    },
    items: [
      {
        id: "cart-1",
        menuItem: INITIAL_MENU_ITEMS[0],
        quantity: 2,
        selectedOptions: { portion: "1 Litre (₹72)" },
        itemTotal: 144,
      },
      {
        id: "cart-2",
        menuItem: INITIAL_MENU_ITEMS[2],
        quantity: 1,
        selectedOptions: { portion: "12 Eggs Pack (₹299)" },
        itemTotal: 299,
      },
    ],
    subtotal: 443,
    deliveryFee: 0,
    tax: 22.15,
    tip: 20,
    total: 485.15,
    estimatedTime: "15-20 min",
    paymentMethod: "cod",
    paymentStatus: "pending",
    riderName: "Aarav Sharma",
    riderPhone: "9876543201",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "ZF-3829-MR2",
    tokenId: "TOK-3829-MR2",
    trackingCode: "TRK-3829",
    customerId: "CUST-4122-B9X",
    deliveryAgentId: "AGT-9876-02",
    deliveryOtp: "7193",
    status: "preparing",
    deliveryMethod: "delivery",
    customer: {
      name: "Vikram Malhotra",
      phone: "9876512345",
      email: "vikram@example.com",
      address: "42 12th Main, 4th Block, Koramangala, Bengaluru, 560034",
      unitOrApt: "Villa 12",
      deliveryInstructions: "Leave inside insulated porch bag if unattended.",
      lat: 12.9352,
      lng: 77.6245,
    },
    items: [
      {
        id: "cart-3",
        menuItem: INITIAL_MENU_ITEMS[4],
        quantity: 2,
        selectedOptions: { portion: "12 Eggs Pack (₹72)" },
        itemTotal: 144,
      },
      {
        id: "cart-4",
        menuItem: INITIAL_MENU_ITEMS[1],
        quantity: 2,
        selectedOptions: { portion: "Half Litre - 500ml (₹38)" },
        itemTotal: 76,
      },
    ],
    subtotal: 220,
    deliveryFee: 40,
    tax: 11,
    tip: 25,
    total: 296,
    estimatedTime: "25-30 min",
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    riderName: "Priya Nair",
    riderPhone: "9876543202",
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
];
