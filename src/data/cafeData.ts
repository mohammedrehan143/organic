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
  taxRate: 0, // GST removed
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
    detailedDescription: "Unadulterated single-source certified organic whole milk bottled in sterilized glass bottles with Zafiroo Organic Milk label. Non-homogenized with natural cream top and pure farm freshness. (Note: Reusable glass bottle policy applies — ₹200 fee in case of bottle breakage).",
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
      temperature: ["Freshly Chilled", "Room Temp Bottle"]
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
      temperature: ["Freshly Chilled", "Room Temp Bottle"]
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

export const INITIAL_DELIVERY_AGENTS: DeliveryAgent[] = [];

export const INITIAL_SOS_ALERTS: SosAlert[] = [];

export const INITIAL_ORDERS: Order[] = [];

