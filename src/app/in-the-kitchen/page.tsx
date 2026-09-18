'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';
import { ShoppingBag, Check, Clock, Users, Sparkles, ChefHat } from 'lucide-react';

interface FullRecipe {
  id: string;
  title: string;
  category: string;
  author: string;
  image: string;
  prepTime: string;
  servings: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  storeProductId?: string;
}

const KITCHEN_RECIPES: FullRecipe[] = [
  {
    id: 'k1',
    title: 'Farmhouse Saffron Cardamom Kheer',
    category: 'Desserts',
    author: 'Zafiroo Farm Kitchen',
    image: '/images/recipe-1.png',
    prepTime: '25 mins',
    servings: '4 Servings',
    description: 'A rich and aromatic traditional slow-simmered dessert crafted with pure A2 farm milk in glass bottles, fragrant Kashmiri saffron, and green cardamom.',
    ingredients: [
      '1 Litre Zafiroo Organic Milk in Glass Bottle',
      '1/4 cup Aromatic Basmati Rice',
      '1/3 cup Organic Raw Cane Sugar or Jaggery',
      'Pinch of Pure Kashmiri Saffron Strands',
      '1/2 tsp Green Cardamom Powder',
      'Slivered Almonds & Pistachios',
    ],
    instructions: [
      'Rinse the basmati rice and soak in clean water for 15 minutes.',
      'In a heavy-bottomed pot, bring 1 Litre of Zafiroo Organic Milk to a gentle rolling boil.',
      'Add soaked rice and simmer on low heat for 20 minutes, stirring occasionally until thick and creamy.',
      'Stir in organic raw cane sugar, crushed cardamom, and saffron strands infused in warm milk.',
      'Garnish with slivered almonds and pistachios. Serve warm or chilled.',
    ],
    storeProductId: 'org-milk-1l',
  },
  {
    id: 'k2',
    title: 'Study Snack Stack Board',
    category: 'Appetizers',
    author: 'Annmarie Watts',
    image: '/images/recipe-2.png',
    prepTime: '15 mins',
    servings: '4 Servings',
    description: 'A wholesome grazing board combining cubed aged farm cheeses, organic Greek yogurt honey dip, fresh berries, and heirloom sourdough crackers to fuel body and mind.',
    ingredients: [
      '200g Handcrafted Malai Paneer or Farmhouse Cheddar',
      '1 cup Organic Greek Strained Yogurt',
      '2 tbsp Raw Wildflower Honey',
      '1 Stone-Ground Sourdough Country Loaf (sliced)',
      '1 cup Fresh Strawberries and Blueberries',
      'Handful of Organic Walnuts',
    ],
    instructions: [
      'In a small bowl, whip the organic Greek yogurt with raw wildflower honey until smooth and glossy.',
      'Slice the stone-ground sourdough loaf into thin batons and toast lightly with cultured butter.',
      'Cube the farm cheese and arrange neatly on a large wooden board alongside the honey-yogurt dip.',
      'Garnish with fresh strawberries, blueberries, and walnuts.',
    ],
    storeProductId: 'org-d5',
  },
  {
    id: 'k3',
    title: 'Golden Turmeric Velvet Milk',
    category: 'Beverages',
    author: 'Zafiroo Farm Kitchen',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
    prepTime: '8 mins',
    servings: '2 Mugs',
    description: 'Restorative Ayurvedic night elixir crafted with steamed organic A2 milk, raw Lakadong turmeric, crushed cardamom, and grass-fed ghee.',
    ingredients: [
      '2 cups Fresh A2 Whole Milk',
      '1 tsp Lakadong Organic Turmeric Powder',
      '1/2 tsp Vedic Bilona Cow Ghee',
      'Pinch of Freshly Ground Black Pepper',
      '2 tsp Raw Wild Honey',
    ],
    instructions: [
      'Pour whole A2 milk into a saucepan over medium-low heat.',
      'Whisk in turmeric powder, crushed cardamom, black pepper, and pure cow ghee.',
      'Bring to a gentle simmer for 4 minutes until fragrant and golden.',
      'Remove from heat, stir in raw honey, and pour into warm ceramic mugs.',
    ],
    storeProductId: 'org-d1',
  },
  {
    id: 'k4',
    title: 'Cultured Butter Sourdough Tartine',
    category: 'Breakfast',
    author: 'Zafiroo Bakery Chef',
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=800&auto=format&fit=crop',
    prepTime: '10 mins',
    servings: '2 Servings',
    description: 'Thick slices of 36-hour fermented sourdough toasted in a cast-iron pan, slathered generously with yellow cultured farm butter and drizzled with wildflower comb honey.',
    ingredients: [
      '2 thick slices Artisan Sourdough Loaf',
      '3 tbsp Artisan Cultured Farm Butter',
      '1 tbsp Raw Forest Wildflower Honey',
      'Flaky Sea Salt',
    ],
    instructions: [
      'Melt 1 tbsp butter in a cast-iron skillet over medium heat.',
      'Toast sourdough slices on both sides until deep golden and crackling.',
      'While piping hot, spread generous thick curls of cold cultured butter on top.',
      'Drizzle with raw wildflower honey and finish with a pinch of flaky salt.',
    ],
    storeProductId: 'org-d2',
  },
];

export default function InTheKitchenPage() {
  const { menuItems, addToCart } = useOrder();
  const [selectedCat, setSelectedCat] = useState('All');
  const [activeRecipe, setActiveRecipe] = useState<FullRecipe>(KITCHEN_RECIPES[0]);
  const [addedMsg, setAddedMsg] = useState(false);

  const categories = ['All', 'Desserts', 'Appetizers', 'Beverages', 'Breakfast'];

  const filtered = selectedCat === 'All'
    ? KITCHEN_RECIPES
    : KITCHEN_RECIPES.filter((r) => r.category === selectedCat);

  const handleAddIngredients = (recipe: FullRecipe) => {
    const itemToAdd = menuItems.find((m) => m.id === recipe.storeProductId) || menuItems[0];
    addToCart(itemToAdd, 1);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-[#173612]">
      {/* 1. Header Banner */}
      <header className="py-12 sm:py-20 px-4 sm:px-6 bg-[#FAF9F6] border-b border-[#EAF3E4] text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-[#173612] p-2 flex items-center justify-center shadow-md">
              <ChefHat className="w-8 h-8 text-[#173612]" />
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#43670F]">
            Nourishing Recipes & Culinary Delights
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase text-[#0F240B] font-bebas tracking-tight">
            In The Kitchen
          </h1>
          <p className="text-base sm:text-lg text-[#173612] max-w-2xl mx-auto font-serif leading-relaxed">
            Wholesome recipes crafted with pure A2 farm milk, cultured butter, and fresh seasonal ingredients from our dairy farmers.
          </p>

          {/* Category Filter Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                  selectedCat === cat
                    ? 'bg-[#173612] text-white shadow'
                    : 'bg-[#F5FAF0] border border-[#CBE0A3] text-[#173612] hover:bg-[#EAF3E4]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. Featured Recipe Spotlight (Florida Milk Layout) */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-[#EAF3E4]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Photo with Florida Milk Bottle & Seal Emblem */}
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-[#EAF3E4] bg-gray-100">
            <img
              src={activeRecipe.image}
              alt={activeRecipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 z-10 w-24 h-auto drop-shadow-md">
              <img
                src="/images/milk-bottle-and-seal.png"
                alt="Florida Milk Bottle and Seal"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#173612] shadow border border-[#173612]/20">
              {activeRecipe.servings} • {activeRecipe.prepTime}
            </div>
          </div>

          {/* Recipe Details */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-[#43670F]">
                  Featured
                </span>
                <span className="text-3xl font-black uppercase text-[#0F240B] font-bebas">
                  Farmhouse Recipe
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0F240B] font-bebas leading-tight">
                {activeRecipe.title}
              </h2>
              <p className="text-xs text-[#385A2A] mt-1 font-semibold">Recipe by {activeRecipe.author}</p>
            </div>

            <p className="text-sm sm:text-base text-[#173612] leading-relaxed font-serif">
              {activeRecipe.description}
            </p>

            {/* Ingredients */}
            <div className="bg-[#F5FAF0] p-5 rounded-2xl border border-[#CBE0A3] space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0F240B]">
                Ingredients:
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#173612] font-semibold">
                {activeRecipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#43670F]" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preparation Steps */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0F240B]">
                Preparation Steps:
              </h3>
              <ol className="space-y-2 text-xs text-[#173612]/90 list-decimal pl-4 leading-relaxed font-medium">
                {activeRecipe.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Order Ingredients Button with aligned layout */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => handleAddIngredients(activeRecipe)}
                className="btn-red px-6 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition text-center"
              >
                {addedMsg ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Ingredients Added To Basket!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>Order Farm Ingredients</span>
                  </>
                )}
              </button>

              <Link
                href="/menu"
                className="btn-blkborder px-6 sm:px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition text-center flex items-center justify-center"
              >
                Shop All Dairy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recipe Cards Grid */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0F240B] font-bebas">
            More Farmhouse Kitchen Recipes
          </h2>
          <p className="text-sm text-[#173612]">Select any recipe above to view full preparation details.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => {
                setActiveRecipe(r);
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              className="bg-white rounded-2xl overflow-hidden border border-[#EAF3E4] shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                <img
                  src={r.image}
                  alt={r.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/95 text-[#173612] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow">
                  {r.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-base text-[#0F240B] font-serif group-hover:text-[#43670F] transition line-clamp-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-[#173612]/80 mt-1 line-clamp-2">{r.description}</p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-[#385A2A]">
                  <span className="font-mono">{r.prepTime}</span>
                  <span className="font-bold text-[#173612] group-hover:underline">View Recipe →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
