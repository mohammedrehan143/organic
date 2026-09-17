import { MenuItem, DeliveryAgent, Order, SosAlert } from '@/types/cafe';

export const CAFE_METADATA = {
  name: "Zafiroo",
  brand: "Zafiroo Organic Store",
  tagline: "Wholesome Dairy & Farm-Fresh Organic Goods",
  subtitle: "Delivering wholesome organic products from our local farms to your table.",
  phone: "+91 98765 00123",
  whatsapp: "+919876500123",
  email: "care@zafiroo-organic.com",
  address: "Zafiroo Organic Farm Hub, 14 Green Meadow Way, Bengaluru, KA 560038",
  hours: "Daily Harvest: 6:30 AM – 10:00 PM",
  freeDeliveryThreshold: 299,
  deliveryFee: 40,
  taxRate: 0.05, // 5% GST
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // --- ORGANIC MILK CATEGORY ---
  {
    id: "org-milk-1l",
    name: "Organic Milk (1 Litre)",
    category: "Organic Milk",
    description: "Pure, single-source certified organic grass-fed milk, bottled fresh within hours.",
    detailedDescription: "Unadulterated single-source certified organic whole milk from pasture-raised, grass-fed cows. Non-homogenized with natural cream top, chilled at 4°C.",
    price: "₹72",
    priceNumber: 72,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=800&auto=format&fit=crop",
    calories: 148,
    dietary: "veg",
    tasteNotes: ["Farm Bottled Fresh", "Rich Cream Layer", "Zero Preservatives"],
    featured: true,
    signature: true,
    prepTime: "Cold Dispatched",
    isAvailable: true,
    displayOrder: 1,
    customizationOptions: {
      portion: ["1 Litre (₹72)", "Half Litre - 500ml (₹38)"],
      temperature: ["Chilled (4°C)", "Room Temp Bottle"]
    }
  },
  {
    id: "org-milk-half",
    name: "Organic Milk (Half Litre - 500ml)",
    category: "Organic Milk",
    description: "Pure certified organic milk in convenient half-litre (500ml) daily pack.",
    detailedDescription: "Fresh daily organic milk in a convenient 500ml bottle, perfect for small households and daily morning coffee/tea rituals.",
    price: "₹38",
    priceNumber: 38,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=800&auto=format&fit=crop",
    calories: 74,
    dietary: "veg",
    tasteNotes: ["Convenient 500ml", "Naturally Sweet", "High Calcium"],
    featured: false,
    signature: false,
    prepTime: "Cold Dispatched",
    isAvailable: true,
    displayOrder: 2,
    customizationOptions: {
      portion: ["Half Litre - 500ml (₹38)", "1 Litre (₹72)"],
      temperature: ["Chilled (4°C)", "Room Temp Bottle"]
    }
  },

  // --- NATI EGGS CATEGORY ---
  {
    id: "org-nati-12",
    name: "Nati Eggs (Pack of 12)",
    category: "Nati Eggs",
    description: "Authentic free-range country (Nati) eggs with deep golden yolks.",
    detailedDescription: "Genuine free-range country (Nati) eggs laid by healthy heritage hens foraging freely on sunlit, pesticide-free pastures. Rich in natural Omega-3 and authentic country flavor.",
    price: "₹299",
    priceNumber: 299,
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=800&auto=format&fit=crop",
    calories: 72,
    dietary: "non-veg",
    tasteNotes: ["100% Free-Range Nati", "Deep Golden Yolk", "Natural Omega-3"],
    featured: true,
    signature: true,
    prepTime: "Farm Packaged",
    isAvailable: true,
    displayOrder: 3,
    customizationOptions: {
      portion: ["12 Eggs Pack (₹299)", "30 Eggs Tray (₹720)"]
    }
  },
  {
    id: "org-nati-30",
    name: "Nati Eggs (Tray of 30)",
    category: "Nati Eggs",
    description: "Value monthly tray of 30 authentic free-range country (Nati) eggs.",
    detailedDescription: "Direct-from-farm monthly crate of 30 authentic free-range country (Nati) eggs carefully cradled in protective molded pulp trays.",
    price: "₹720",
    priceNumber: 720,
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=800&auto=format&fit=crop",
    calories: 72,
    dietary: "non-veg",
    tasteNotes: ["Family Value Pack", "100% Free-Range Nati", "Deep Golden Yolks"],
    featured: false,
    signature: true,
    prepTime: "Farm Packaged",
    isAvailable: true,
    displayOrder: 4,
    customizationOptions: {
      portion: ["30 Eggs Tray (₹720)", "12 Eggs Pack (₹299)"]
    }
  },

  // --- NORMAL EGGS CATEGORY ---
  {
    id: "org-norm-12",
    name: "Normal Eggs (Pack of 12)",
    category: "Normal Eggs",
    description: "Daily fresh farm table eggs, clean, sanitized and graded.",
    detailedDescription: "Fresh daily farm table eggs from healthy, well-nourished hens. Cleaned, graded, and perfect for daily boiling, omelettes, and cooking.",
    price: "₹72",
    priceNumber: 72,
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=800&auto=format&fit=crop",
    calories: 70,
    dietary: "non-veg",
    tasteNotes: ["Daily Farm Fresh", "Clean & Graded", "Everyday Protein"],
    featured: false,
    signature: false,
    prepTime: "Farm Packaged",
    isAvailable: true,
    displayOrder: 5,
    customizationOptions: {
      portion: ["12 Eggs Pack (₹72)", "30 Eggs Tray (₹170)"]
    }
  },
  {
    id: "org-norm-30",
    name: "Normal Eggs (Tray of 30)",
    category: "Normal Eggs",
    description: "Value farm crate of 30 fresh table eggs for everyday household cooking.",
    detailedDescription: "Household monthly tray of 30 fresh farm table eggs at the direct-from-farm rate.",
    price: "₹170",
    priceNumber: 170,
    image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?q=80&w=800&auto=format&fit=crop",
    calories: 70,
    dietary: "non-veg",
    tasteNotes: ["Value 30-Pack Tray", "Fresh Daily Harvest", "Kitchen Essential"],
    featured: false,
    signature: false,
    prepTime: "Farm Packaged",
    isAvailable: true,
    displayOrder: 6,
    customizationOptions: {
      portion: ["30 Eggs Tray (₹170)", "12 Eggs Pack (₹72)"]
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
