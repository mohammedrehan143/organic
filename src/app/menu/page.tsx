'use client';

import React, { useState, useMemo } from 'react';
import { useOrder } from '@/context/OrderContext';
import { MenuItem } from '@/types/cafe';
import {
  Search,
  Sparkles,
  Plus,
  Clock,
  Star,
  Check,
  Milk,
  Egg,
  Croissant,
  Flame,
  IceCream,
  GlassWater,
  Apple,
} from 'lucide-react';
import Image from 'next/image';

const CATEGORIES = [
  { id: 'All', label: 'All Farm Goods', icon: Sparkles },
  { id: 'Organic Milk & Dairy', label: 'Milk & Dairy', icon: Milk },
  { id: 'Farm Fresh Eggs & Poultry', label: 'Eggs & Poultry', icon: Egg },
  { id: 'Artisan Bakery', label: 'Artisan Bakery', icon: Croissant },
  { id: 'Raw Honey & Spreads', label: 'Honey & Spreads', icon: Flame },
  { id: 'Cold Pressed Beverages', label: 'Cold-Pressed', icon: GlassWater },
  { id: 'Artisan Desserts', label: 'Farm Desserts', icon: IceCream },
];

export default function MenuPage() {
  const { menuItems, setSelectedMenuDetail, addToCart } = useOrder();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg' | 'vegan'>('all');
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleQuickAdd = (item: MenuItem) => {
    addToCart(item, 1);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category match
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Dietary match
      if (dietaryFilter !== 'all') {
        if (dietaryFilter === 'veg' && item.dietary !== 'veg' && item.dietary !== 'vegan') {
          return false;
        }
        if (dietaryFilter === 'vegan' && item.dietary !== 'vegan') {
          return false;
        }
        if (dietaryFilter === 'non-veg' && item.dietary !== 'non-veg') {
          return false;
        }
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchNotes = item.tasteNotes?.some((n) => n.toLowerCase().includes(q));
        return matchName || matchDesc || matchNotes;
      }

      return true;
    });
  }, [menuItems, selectedCategory, dietaryFilter, searchQuery]);

  return (
    <div className="min-h-screen pb-24 bg-[#FAF9F6]">
      {/* Header Banner matching Florida Milk Clean Style */}
      <div className="bg-white border-b border-gray-200 py-10 px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#43670F]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#75791B]">
                  Certified Pure & Local
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#252525] uppercase tracking-tight mt-1 font-bebas">
                Zafiroo Organic Farm Catalog
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-sans">
                Wholesome A2 pasture milk, slow-churned cultured butter, Vedic ghee, and farm-fresh harvest.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search A2 milk, butter, ghee, eggs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 bg-white text-xs text-[#252525] focus:outline-none focus:border-[#43670F] shadow-sm font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Horizontal Category Pill Filter */}
          <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#252525] text-[#FEEF30] shadow-md scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-[#252525]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dietary Filter Buttons */}
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-gray-500 font-medium">Filter:</span>
            {(['all', 'veg', 'vegan', 'non-veg'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDietaryFilter(filter)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider capitalize transition ${
                  dietaryFilter === filter
                    ? 'bg-[#43670F] text-white'
                    : 'bg-gray-200/70 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'All Types' : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-base font-bold text-gray-600">No organic items match your filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setDietaryFilter('all');
              }}
              className="btn-motive px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                {/* Photo & badges */}
                <div
                  onClick={() => setSelectedMenuDetail(item)}
                  className="relative w-full h-56 bg-gray-100 cursor-pointer overflow-hidden group"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#43670F] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                    100% Organic
                  </div>
                  {item.signature && (
                    <div className="absolute top-3 right-3 bg-[#FEEF30] text-[#252525] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                      Farm Classic
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#75791B]">
                      {item.category}
                    </span>
                    <h3
                      onClick={() => setSelectedMenuDetail(item)}
                      className="text-lg font-bold text-[#252525] mt-1 hover:text-[#43670F] transition cursor-pointer"
                    >
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Taste / Purity Notes */}
                  {item.tasteNotes && item.tasteNotes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tasteNotes.slice(0, 3).map((note, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-md border border-gray-200"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price & Add to Cart */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Price</span>
                      <span className="text-2xl font-black text-[#252525] font-bebas">{item.price}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedMenuDetail(item)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#252525] rounded-xl text-xs font-bold transition active:scale-95"
                      >
                        Customize
                      </button>
                      <button
                        onClick={() => handleQuickAdd(item)}
                        className="p-2.5 btn-motive text-[#252525] rounded-xl shadow-sm transition active:scale-95"
                        title="Add to Farm Basket"
                      >
                        {addedId === item.id ? (
                          <Check className="w-4 h-4 text-black" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
