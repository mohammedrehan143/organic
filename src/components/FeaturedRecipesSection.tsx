'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';
import { ShoppingBag, ChevronRight, Check } from 'lucide-react';

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
    title: 'Guava Maria Cookie Ice Cream',
    author: 'Chris Valdes',
    authorUrl: 'https://instagram.com/chefchrisvaldes',
    image: '/images/recipe-1.png',
    description: 'An irresistible artisan frozen custard featuring rich organic heavy cream, sweet tropical guava ribbons, and crisp traditional Maria cookie crumble in every bite.',
    ingredients: ['2 cups Farm-Fresh A2 Milk', '1 cup Organic Heavy Cream', '3/4 cup Guava Puree', '1 cup Crushed Maria Cookies', '1/2 cup Wildflower Honey'],
    servings: '6 Servings',
    prepTime: '25 mins + Chilling',
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
  const { menuItems, addToCart, setCartDrawerOpen } = useOrder();

  const current = RECIPES[currentIndex];

  const handleAddIngredients = () => {
    // Find matching dairy items in store (e.g. A2 milk, butter, or organic ice cream)
    const matchedItem = menuItems.find((m) => m.id === 'org-des1') || menuItems[0];
    if (matchedItem) {
      addToCart(matchedItem, 1);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  return (
    <section id="recipes" className="py-24 px-6 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Recipe Tabs */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {RECIPES.map((recipe, idx) => (
            <button
              key={recipe.id}
              onClick={() => setCurrentIndex(idx)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                currentIndex === idx
                  ? 'bg-[#252525] text-[#FEEF30]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Recipe {idx + 1}: {recipe.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Florida Milk Featured Recipe Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Image with Florida Milk Bottle and Seal Overlay */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-lg aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50 flex items-center justify-center p-4">
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-full object-cover rounded-xl transition-all duration-500"
              />

              {/* The Florida Milk Signature Bottle & Seal Emblem */}
              <div className="absolute top-4 right-4 z-10 w-24 h-auto drop-shadow-md">
                <img
                  src="/images/milk-bottle-and-seal.png"
                  alt="Florida Milk Bottle & Seal"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Servings Pill */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-[#252525] shadow">
                {current.servings} • {current.prepTime}
              </div>
            </div>
          </div>

          {/* Right Column: Recipe Details */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl font-bold uppercase tracking-widest text-[#75791B]">
                  Featured
                </span>
                <span className="text-3xl sm:text-4xl font-black uppercase text-[#252525] font-bebas">
                  Recipe
                </span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#b2101c] font-bebas leading-tight">
                {current.title}
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Recipe by{' '}
                <a
                  href={current.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-[#252525] hover:text-[#43670F]"
                >
                  {current.author}
                </a>
              </p>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              {current.description}
            </p>

            {/* Ingredients preview */}
            <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/70">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Key Organic Ingredients:
              </h4>
              <ul className="text-xs text-gray-800 space-y-1">
                {current.ingredients.slice(0, 3).map((ing, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#43670F]" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons matching Florida Milk */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={handleAddIngredients}
                className="btn-red px-7 py-3 rounded text-sm font-bold uppercase tracking-wider shadow flex items-center gap-2"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Added To Basket!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>Order Farm Ingredients</span>
                  </>
                )}
              </button>

              <Link
                href="/in-the-kitchen"
                className="btn-blkborder px-7 py-3 rounded text-sm font-bold uppercase tracking-wider transition"
              >
                All Recipes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
