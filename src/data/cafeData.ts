import { MenuItem, DeliveryAgent, Order, SosAlert } from '@/types/cafe';

export const WHATSAPP_COMMUNITY_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL ||
  "https://chat.whatsapp.com/invite/zafiroo-community";

export const CAFE_METADATA = {
  name: "Zafiroo",
  brand: "Zafiroo Dairy",
  tagline: "Wholesome Dairy & Farm-Fresh Organic Goods",
  subtitle: "Delivering wholesome organic products from our local farms to your table.",
  phone: "+91 7259635948, +91 9731301135",
  whatsapp: "+91 7259635948, +91 9731301135",
  whatsappCommunity: WHATSAPP_COMMUNITY_URL,
  email: "care@zafiroo-dairy.com",
  address: "Bylanarasapura, Hoskote Taluk, Bangalore - 562122",
  hours: "",
  freeDeliveryThreshold: 0, // FREE DELIVERY FOR ALL PRODUCTS
  deliveryFee: 0,
  taxRate: 0, // GST removed
  bottleBreakageFee: 0,
  termsAndPolicies: [
    "When your order is arrived please check the product carefully are all items available because ones you receive no exchange and return available so please check on the spot.",
    "When your eggs order has arrived please check weather the eggs are in good condition it should not be cracked or broken please check on the spot so you can get exchange.",
    "If the milk it broken you can contact directly to the Zafiroo agents so you can exchange and get fresh milk contact as soon as possible."
  ],
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // --- ORGANIC MILK CATEGORY ---
  {
    id: "org-milk-1l",
    name: "Fresh milk (1L)",
    category: "Organic Milk",
    description: "Pure single-source certified milk in sterilized glass bottles labeled Zafiroo Dairy Milk.",
    detailedDescription: "Unadulterated single-source whole milk bottled in sterilized glass bottles with Zafiroo Dairy Milk label. Non-homogenized with natural cream top and pure farm freshness.",
    price: "₹72",
    priceNumber: 72,
    image: "/images/zafiroo-organic-milk.png",
    calories: 148,
    dietary: "veg",
    tasteNotes: ["Glass Bottle Fresh", "Rich Cream Layer", "Free Delivery"],
    featured: true,
    signature: true,
    prepTime: "Farm Dispatched",
    isAvailable: true,
    displayOrder: 1,
    customizationOptions: {
      portion: ["1L Glass Bottle (₹72)", "Half Litre Glass Bottle (₹38)"]
    }
  },
  {
    id: "org-milk-half",
    name: "Fresh milk (Half)",
    category: "Organic Milk",
    description: "Pure fresh milk in convenient half-litre glass bottle with Zafiroo Dairy Milk label.",
    detailedDescription: "Fresh daily milk in a half-litre sterilized glass bottle with Zafiroo Dairy Milk label, perfect for daily tea and coffee rituals.",
    price: "₹38",
    priceNumber: 38,
    image: "/images/zafiroo-organic-milk.png",
    calories: 74,
    dietary: "veg",
    tasteNotes: ["Glass Bottle 500ml", "Naturally Sweet", "Free Delivery"],
    featured: false,
    signature: false,
    prepTime: "Farm Dispatched",
    isAvailable: true,
    displayOrder: 2,
    customizationOptions: {
      portion: ["Half Litre Glass Bottle (₹38)", "1L Glass Bottle (₹72)"]
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

  // --- NORMAL WHITE EGGS CATEGORY (Out of stock) ---
  {
    id: "org-norm-12",
    name: "Normal White Eggs (Pack of 12)",
    category: "Normal Eggs",
    description: "Daily fresh farm table white eggs, sanitized and packed in protective 12-egg cartons. (Currently Out of Stock)",
    detailedDescription: "Fresh daily farm table white eggs with clean, smooth white shells from healthy hens. Packed in protective 12-egg cartons. Currently out of stock.",
    price: "₹72",
    priceNumber: 72,
    image: "/images/eggs-12-white.jpg",
    calories: 70,
    dietary: "non-veg",
    tasteNotes: ["Pure White Shells", "12-Egg Pack Carton", "Free Delivery"],
    featured: false,
    signature: false,
    prepTime: "Out of Stock",
    isAvailable: false,
    displayOrder: 4,
    customizationOptions: {
      portion: ["12 White Eggs Pack (₹72)", "30 White Eggs Tray (₹170)"]
    }
  },
  {
    id: "org-norm-30",
    name: "Normal White Eggs (Tray of 30)",
    category: "Normal Eggs",
    description: "Value farm crate of 30 fresh white table eggs in molded pulp tray for everyday cooking. (Currently Out of Stock)",
    detailedDescription: "Household monthly tray of 30 fresh farm white table eggs arranged in commercial protective molded pulp crates. Currently out of stock.",
    price: "₹170",
    priceNumber: 170,
    image: "/images/eggs-30-white.jpg",
    calories: 70,
    dietary: "non-veg",
    tasteNotes: ["Value 30-Egg Tray", "Pure White Shells", "Free Delivery"],
    featured: true,
    signature: false,
    prepTime: "Out of Stock",
    isAvailable: false,
    displayOrder: 5,
    customizationOptions: {
      portion: ["30 White Eggs Tray (₹170)", "12 White Eggs Pack (₹72)"]
    }
  },

  // --- NATI EGGS CATEGORY (Out of stock) ---
  {
    id: "org-nati-12",
    name: "Nati Eggs (Pack of 12)",
    category: "Nati Eggs",
    description: "Authentic free-range country (Nati) eggs with deep golden yolks. (Currently Out of Stock)",
    detailedDescription: "Genuine free-range country (Nati) eggs laid by healthy heritage hens foraging freely on sunlit pastures. Rich in natural Omega-3. Currently out of stock.",
    price: "₹299",
    priceNumber: 299,
    image: "/images/zafiroo-organic-eggs-12.png",
    calories: 72,
    dietary: "non-veg",
    tasteNotes: ["100% Free-Range Nati", "Deep Golden Yolk", "Free Delivery"],
    featured: true,
    signature: true,
    prepTime: "Out of Stock",
    isAvailable: false,
    displayOrder: 6,
    customizationOptions: {
      portion: ["12 Eggs Pack (₹299)", "30 Eggs Tray (₹720)"]
    }
  },
  {
    id: "org-nati-30",
    name: "Nati Eggs (Tray of 30)",
    category: "Nati Eggs",
    description: "Value monthly tray of 30 authentic free-range country (Nati) eggs. (Currently Out of Stock)",
    detailedDescription: "Direct-from-farm monthly crate of 30 authentic free-range country (Nati) eggs carefully cradled in protective molded pulp trays. Currently out of stock.",
    price: "₹720",
    priceNumber: 720,
    image: "/images/zafiroo-organic-eggs-30.png",
    calories: 72,
    dietary: "non-veg",
    tasteNotes: ["Family Value Pack", "100% Free-Range Nati", "Free Delivery"],
    featured: false,
    signature: true,
    prepTime: "Out of Stock",
    isAvailable: false,
    displayOrder: 7,
    customizationOptions: {
      portion: ["30 Eggs Tray (₹720)", "12 Eggs Pack (₹299)"]
    }
  },

  // --- FRESH CHICKEN CATEGORY ---
  {
    id: "chick-skin-out-1kg",
    name: "Skin out chicken whole (1kg)",
    category: "Fresh Chicken",
    description: "Fresh tender whole chicken with skin removed, cleaned and freshly dressed.",
    detailedDescription: "Hygienically prepped skinless whole farm chicken. Thoroughly cleaned, tender, and succulent, ideal for curries, gravies, and healthy high-protein meals.",
    price: "₹350",
    priceNumber: 350,
    image: "/images/chicken-skinless.jpg",
    calories: 190,
    dietary: "non-veg",
    tasteNotes: ["Skin Out / Skinless", "Farm Fresh Daily", "Free Delivery"],
    featured: true,
    signature: false,
    prepTime: "Farm Fresh",
    isAvailable: true,
    displayOrder: 8,
    customizationOptions: {
      portion: ["1Kg Whole Pack (₹350)"]
    }
  },
  {
    id: "chick-with-skin-1kg",
    name: "With skin chicken whole (1kg)",
    category: "Fresh Chicken",
    description: "Fresh whole chicken with skin intact for rich flavor and natural moisture.",
    detailedDescription: "Traditional whole farm chicken with skin carefully cleaned and dressed. Preserves natural juiciness, perfect for roasting, barbecuing, or authentic country-style curries.",
    price: "₹280",
    priceNumber: 280,
    image: "/images/chicken-with-skin.jpg",
    calories: 215,
    dietary: "non-veg",
    tasteNotes: ["With Skin", "Juicy & Tender", "Free Delivery"],
    featured: false,
    signature: false,
    prepTime: "Farm Fresh",
    isAvailable: true,
    displayOrder: 9,
    customizationOptions: {
      portion: ["1Kg Whole Pack (₹280)"]
    }
  },
  {
    id: "chick-boneless-1kg",
    name: "Chicken boneless (1kg)",
    category: "Fresh Chicken",
    description: "Prime boneless chicken cuts, 100% tender meat trimmed and ready to cook.",
    detailedDescription: "Tender, succulent prime boneless chicken breast and thigh cuts. Hand-trimmed of excess fat, 100% bone-free protein perfect for tikkas, stir-fries, and gourmet curries.",
    price: "₹430",
    priceNumber: 430,
    image: "/images/chicken-boneless.jpg",
    calories: 165,
    dietary: "non-veg",
    tasteNotes: ["100% Boneless", "High Protein", "Free Delivery"],
    featured: true,
    signature: true,
    prepTime: "Farm Fresh",
    isAvailable: true,
    displayOrder: 10,
    customizationOptions: {
      portion: ["1Kg Boneless Pack (₹430)"]
    }
  },
  {
    id: "chick-kheema-1kg",
    name: "Chicken Kheema / mince (1kg)",
    category: "Fresh Chicken",
    description: "Finely minced fresh boneless chicken, ideal for kebabs, patties, and kheema curry.",
    detailedDescription: "Freshly ground chicken mince prepared from clean boneless cuts. Exceptionally tender, juicy, and versatile for delicious kebabs, keema matar, and patties.",
    price: "₹300",
    priceNumber: 300,
    image: "/images/chicken-kheema.jpg",
    calories: 175,
    dietary: "non-veg",
    tasteNotes: ["Freshly Minced", "Extra Juicy", "Free Delivery"],
    featured: false,
    signature: false,
    prepTime: "Farm Fresh",
    isAvailable: true,
    displayOrder: 11,
    customizationOptions: {
      portion: ["1Kg Kheema Pack (₹300)"]
    }
  },
  {
    id: "chick-wings-1kg",
    name: "Chicken wings (1kg)",
    category: "Fresh Chicken",
    description: "Meaty and succulent fresh chicken wings, perfect for frying, baking, or barbecue.",
    detailedDescription: "Plump, tender chicken wingettes and drumettes. Carefully trimmed, prepped fresh, and ready to absorb marinades for crispy wings, BBQ platters, and appetizers.",
    price: "₹310",
    priceNumber: 310,
    image: "/images/chicken-wings.jpg",
    calories: 203,
    dietary: "non-veg",
    tasteNotes: ["Crispy & Meaty", "Party Favorite", "Free Delivery"],
    featured: false,
    signature: false,
    prepTime: "Farm Fresh",
    isAvailable: true,
    displayOrder: 12,
    customizationOptions: {
      portion: ["1Kg Wings Pack (₹310)"]
    }
  },
  {
    id: "chick-liver-1kg",
    name: "Chicken liver (1kg)",
    category: "Fresh Chicken",
    description: "Fresh nutrient-rich chicken liver, high in iron and natural minerals.",
    detailedDescription: "Farm-fresh chicken liver cleaned with precision. Soft texture and robust savory taste, ideal for traditional spicy liver fry, pepper roasts, and hearty gravies.",
    price: "₹150",
    priceNumber: 150,
    image: "/images/chicken-liver.jpg",
    calories: 167,
    dietary: "non-veg",
    tasteNotes: ["Iron & Nutrient Rich", "Tender & Fresh", "Free Delivery"],
    featured: false,
    signature: false,
    prepTime: "Farm Fresh",
    isAvailable: true,
    displayOrder: 13,
    customizationOptions: {
      portion: ["1Kg Liver Pack (₹150)"]
    }
  },

  // --- FRESH MUTTON CATEGORY ---
  {
    id: "fresh-mutton-1kg",
    name: "Fresh Mutton (1kg)",
    category: "Fresh Mutton",
    description: "Farm-fresh pasture-raised tender mutton curry cuts, hygienically cleaned and freshly prepped.",
    detailedDescription: "Premium pasture-raised tender mutton with prime bone-in cuts. Hand-dressed and packed fresh, perfect for slow-cooked authentic biryanis, rich roasts, and flavorful curries.",
    price: "₹1150",
    priceNumber: 1150,
    image: "/images/mutton-meat.jpg",
    calories: 250,
    dietary: "non-veg",
    tasteNotes: ["Pasture Raised", "Tender & Succulent", "Free Delivery"],
    featured: true,
    signature: true,
    prepTime: "Farm Fresh",
    isAvailable: true,
    displayOrder: 14,
    customizationOptions: {
      portion: ["1Kg Mutton Pack (₹1150)"]
    }
  },
  {
    id: "fresh-mutton-liver-1kg",
    name: "Fresh Mutton Liver (1kg)",
    category: "Fresh Mutton",
    description: "Nutrient-dense tender mutton liver, rich in natural iron and essential minerals. (Currently Out of Stock)",
    detailedDescription: "Freshly dressed mutton liver with a tender texture and rich savory flavor. Hygienically handled and cleaned. Currently out of stock.",
    price: "₹650",
    priceNumber: 650,
    image: "/images/mutton-liver.jpg",
    calories: 185,
    dietary: "non-veg",
    tasteNotes: ["Iron & Nutrient Rich", "Tender & Fresh", "Free Delivery"],
    featured: false,
    signature: false,
    prepTime: "Out of Stock",
    isAvailable: false, // KEPT OUT OF STOCK AS REQUESTED
    displayOrder: 15,
    customizationOptions: {
      portion: ["1Kg Liver Pack (₹650)"]
    }
  }
];

export const SYED_DELIVERY_AGENT: DeliveryAgent = {
  id: "AGT-SYED-01",
  name: "Syed",
  phone: process.env.NEXT_PUBLIC_SYED_PHONE || "7259635948",
  status: "active",
  vehicleType: "Electric Eco-Van",
  ordersDeliveredCount: 0,
};

export const INITIAL_DELIVERY_AGENTS: DeliveryAgent[] = [SYED_DELIVERY_AGENT];

export const INITIAL_SOS_ALERTS: SosAlert[] = [];

export const INITIAL_ORDERS: Order[] = [];

