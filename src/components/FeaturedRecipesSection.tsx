'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';
import { ShoppingBag, ChevronRight, Check, ArrowRight } from 'lucide-react';

interface RecipeItem {
  id: string;
  title: string;
  author: string;
  authorUrl: string;
  image: string;
  description: string;
  ingredients: string[];
  servings: string;
  prepTime: string;
}

const RECIPES: RecipeItem[] = [
  {
    id: 'r1',
    title: 'Farmhouse Saffron Cardamom Kheer',
    author: 'Zafiroo Farm Kitchen',
    authorUrl: '#',
    image: '/images/recipe-1.png',
    description: 'A rich and comforting traditional slow-simmered dessert crafted with pure A2 farm milk in glass bottles, fragrant Kashmiri saffron, and green cardamom.',
    ingredients: ['1 Litre Farm Milk in Glass Bottle', '1/4 cup Basmati Rice', '1/3 cup Organic Cane Sugar', 'Kashmiri Saffron', 'Green Cardamom'],
    servings: '4 Servings',
    prepTime: '25 mins',
  },
  {
    id: 'r2',
    title: 'Study Snack Stack Board',
    author: 'Annmarie Watts',
    authorUrl: 'https://www.instagram.com/motherof_spartans/',
    image: '/images/recipe-2.png',
    description: 'Nutrient-dense grazing board loaded with artisan cheddar cubes, organic fruit skewers, sourdough crisps, and cultured honey-yogurt dip for clean all-day focus.',
    ingredients: ['200g Artisanal Farm Cheese', '1 cup Organic Greek Yogurt', '2 tbsp Raw Forest Honey', 'Fresh Seasonal Berries', 'Handmade Sourdough Crackers'],
    servings: '4 Servings',
    prepTime: '15 mins',
  },
];

export function FeaturedRecipesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addedNotice, setAddedNotice] = useState(false);
  const { menuItems, addToCart } = useOrder();

  const current = RECIPES[currentIndex];

  const handleAddIngredients = () => {
    const matchedItem = menuItems.find((m) => m.id === 'org-des1') || menuItems[0];
    if (matchedItem) {
      addToCart(matchedItem, 1);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  return (
    <section id="recipes" className="py-14 sm:py-24 px-4 sm:px-6 bg-white border-b border-gray-200 text-[#173612]">
      <div className="max-w-6xl mx-auto">
        {/* Recipe Tabs with balanced button layout */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 flex-wrap">
          {RECIPES.map((recipe, idx) => (
            <button
              key={recipe.id}
              onClick={() => setCurrentIndex(idx)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                currentIndex === idx
                  ? 'bg-[#173612] text-white shadow-md scale-105'
                  : 'bg-[#F5FAF0] text-[#173612] hover:bg-[#EAF3E4] border border-[#CBE0A3]'
              }`}
            >
              Recipe {idx + 1}: {recipe.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Featured Recipe Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
          {/* Left Column: Image */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-lg aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-[#EAF3E4] bg-gray-50 flex items-center justify-center p-2 sm:p-4">
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-full object-cover rounded-xl transition-all duration-500"
              />

              {/* Signature Bottle & Seal */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-16 sm:w-24 h-auto drop-shadow-md">
                <img
                  src="/images/milk-bottle-and-seal.png"
                  alt="Florida Milk Bottle & Seal"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Servings Pill */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-[#173612] shadow border border-[#173612]/20">
                {current.servings} • {current.prepTime}
              </div>
            </div>
          </div>

          {/* Right Column: Recipe Details */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 text-left">
            <div>
              <div className="flex items-baseline gap-2 mb-1 sm:mb-2">
                <span className="text-base sm:text-xl font-bold uppercase tracking-widest text-[#43670F]">
                  Featured
                </span>
                <span className="text-2xl sm:text-4xl font-black uppercase text-[#0F240B] font-bebas">
                  Recipe
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#0F240B] font-bebas leading-tight">
                {current.title}
              </h3>

              <p className="text-xs text-[#2E6125] mt-1 font-medium">
                Recipe crafted by{' '}
                <a
                  href={current.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-[#173612] hover:text-[#43670F]"
                >
                  {current.author}
                </a>
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#173612] leading-relaxed">
              {current.description}
            </p>

            {/* Ingredients preview */}
            <div className="bg-[#F5FAF0] p-4 sm:p-5 rounded-2xl border border-[#CBE0A3]">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0F240B] mb-2">
                Key Organic Farm Ingredients:
              </h4>
              <ul className="text-xs text-[#173612] space-y-1.5 font-medium">
                {current.ingredients.slice(0, 3).map((ing, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#43670F] shrink-0" />
                    <span className="truncate">{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <button
                onClick={handleAddIngredients}
                className="btn-motive px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4 text-[#173612]" />
                    <span>Ingredients Added to Basket!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#173612]" />
                    <span>Shop Recipe Ingredients</span>
                  </>
                )}
              </button>
              <Link
                href="/in-the-kitchen"
                className="px-5 sm:px-6 py-3 rounded-full border-2 border-[#173612] text-[#173612] hover:bg-[#F5FAF0] text-xs sm:text-sm font-bold uppercase tracking-wider transition text-center"
              >
                Full Method
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
