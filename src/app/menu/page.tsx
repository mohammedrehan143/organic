'use client';

import React, { useState, useMemo } from 'react';
import { useOrder } from '@/context/OrderContext';
import { MenuItem } from '@/types/cafe';
import {
  Search,
  Sparkles,
  Plus,
  Minus,
  Clock,
  Check,
  Milk,
  Egg,
  Croissant,
  Flame,
  GlassWater,
  MapPin,
  ChevronDown,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Farm Goods', icon: Sparkles },
  { id: 'Organic Milk', label: 'Organic Milk (Glass Bottle)', icon: Milk },
  { id: 'Organic Ghee', label: 'Organic Ghee', icon: Sparkles },
  { id: 'Normal Eggs', label: 'Normal White Eggs', icon: Egg },
  { id: 'Nati Eggs', label: 'Nati Eggs (Desi)', icon: Egg },
];

export default function MenuPage() {
  const { menuItems, setSelectedMenuDetail, addToCart, updateQuantity, removeFromCart, cart, userLocation, setLocationModalOpen } = useOrder();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg' | 'vegan'>('all');

  const getItemQuantity = (itemId: string) => {
    return cart
      .filter((ci) => ci.menuItem?.id === itemId || (ci as any).itemId === itemId)
      .reduce((sum, ci) => sum + (ci.quantity || 0), 0);
  };

  const handleIncrement = (item: MenuItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    addToCart(item, 1);
  };

  const handleDecrement = (item: MenuItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const matching = cart.filter((ci) => ci.menuItem?.id === item.id || (ci as any).itemId === item.id);
    if (matching.length === 0) return;
    const lastItem = matching[matching.length - 1];
    if (lastItem.quantity > 1) {
      updateQuantity(lastItem.id, lastItem.quantity - 1);
    } else {
      removeFromCart(lastItem.id);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category match
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Eggs') {
          if (item.category !== 'Nati Eggs' && item.category !== 'Normal Eggs') {
            return false;
          }
        } else if (item.category !== selectedCategory) {
          return false;
        }
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
    <div className="min-h-screen pb-24 bg-[#F5FAF0]/30 text-[#173612]">
      {/* Location Bar at top of Catalog */}
      <div className="bg-[#ECF5DE] border-b border-[#CBE0A3] py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#173612] shrink-0" />
            <span className="text-[#385A2A] font-semibold hidden sm:inline">Delivering fresh items to:</span>
            <span className="text-[#385A2A] font-semibold sm:hidden">To:</span>
            <span className="font-bold text-[#0F240B] truncate">
              {userLocation ? userLocation.shortAddress : 'Auto-detecting delivery hub...'}
            </span>
          </div>
          <button
            onClick={() => setLocationModalOpen(true)}
            className="font-bold text-[#173612] underline hover:text-[#43670F] transition shrink-0 ml-2"
          >
            <span className="hidden sm:inline">Change Location</span>
            <span className="sm:hidden">Change</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border-b border-[#EAF3E4] py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#173612]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#43670F]">
                  Certified Pure & Local • 🚚 Free Delivery For All Products
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#0F240B] uppercase tracking-tight mt-1 font-bebas">
                Zafiroo Organic Farm Catalog
              </h1>
              <p className="text-xs sm:text-sm text-[#173612]/80 mt-1 font-sans">
                Pure A2 milk in glass bottles, normal white eggs in 12 & 30 packs, and organic farm goods with 100% Free Doorstep Delivery.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pure milk, fresh eggs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 bg-white text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612] shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Horizontal Category Pill Filter with fixed button layout */}
          <div className="pt-4 flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#173612] text-white shadow-md scale-105'
                      : 'bg-[#F5FAF0] hover:bg-[#EAF3E4] text-[#173612] border border-[#CBE0A3]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dietary Filter Buttons with balanced layout */}
          <div className="flex items-center gap-2 pt-1 text-xs flex-wrap">
            <span className="text-[#385A2A] font-bold">Filter:</span>
            {(['all', 'veg', 'non-veg'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDietaryFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider capitalize transition ${
                  dietaryFilter === filter
                    ? 'bg-[#173612] text-white shadow-sm'
                    : 'bg-[#F5FAF0] text-[#173612] border border-[#CBE0A3] hover:bg-[#EAF3E4]'
                }`}
              >
                {filter === 'all' ? 'All Types' : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-base font-bold text-[#173612]">No organic items match your filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setDietaryFilter('all');
              }}
              className="btn-motive px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto gap-6 sm:gap-8">
            {filteredItems.map((item) => {
              const itemQty = getItemQuantity(item.id);
              const isInCart = itemQty > 0;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${
                    isInCart
                      ? 'border-[#173612] shadow-md ring-1 ring-[#173612]/30'
                      : 'border-[#EAF3E4] shadow-sm hover:shadow-xl'
                  }`}
                >
                  {/* Photo & badges */}
                  <div
                    onClick={() => setSelectedMenuDetail(item)}
                    className="relative w-full aspect-square bg-[#FAF9F6] cursor-pointer overflow-hidden group"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#173612] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow border border-white/30">
                      Free Delivery
                    </div>

                    {!item.isAvailable ? (
                      <div className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow animate-pulse">
                        Out of Stock
                      </div>
                    ) : isInCart ? (
                      <div className="absolute top-3 right-3 bg-[#173612] text-[#ECF5DE] border border-[#CBE0A3] text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#CBE0A3]" />
                        <span>{itemQty} in basket</span>
                      </div>
                    ) : item.signature ? (
                      <div className="absolute top-3 right-3 bg-white text-[#173612] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow border border-[#173612]/20">
                        Farm Classic
                      </div>
                    ) : null}

                    {item.category === 'Organic Milk' && (
                      <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                        Sterilized Glass Bottle
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#43670F]">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Free Delivery
                        </span>
                      </div>
                      <h3
                        onClick={() => setSelectedMenuDetail(item)}
                        className="text-lg font-bold text-[#0F240B] mt-1 hover:text-[#43670F] transition cursor-pointer"
                      >
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#173612]/80 mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Taste / Purity Notes */}
                    {item.tasteNotes && item.tasteNotes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tasteNotes.slice(0, 3).map((note, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2.5 py-0.5 bg-[#F5FAF0] text-[#173612] rounded-md border border-[#CBE0A3] font-semibold"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price & Add to Cart with balanced button layout */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-[#385A2A] uppercase font-bold block">Price</span>
                        <span className="text-2xl font-black text-[#0F240B] font-bebas">{item.price}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMenuDetail(item)}
                          className="h-10 px-4 bg-[#F5FAF0] hover:bg-[#EAF3E4] text-[#173612] border border-[#CBE0A3] rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center cursor-pointer"
                        >
                          Details
                        </button>

                        {!item.isAvailable ? (
                          <button
                            type="button"
                            disabled
                            className="h-10 px-4 bg-gray-100 border border-gray-300 text-gray-500 rounded-xl font-bold text-xs cursor-not-allowed"
                          >
                            Out of Stock
                          </button>
                        ) : isInCart ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="h-10 px-2 rounded-xl bg-[#173612] text-white flex items-center justify-between gap-2 shadow-sm border border-[#173612]"
                          >
                            <button
                              type="button"
                              onClick={(e) => handleDecrement(item, e)}
                              className="w-8 h-8 rounded-lg hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition cursor-pointer"
                              title="Decrease quantity"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4 stroke-[2.5]" />
                            </button>
                            <span className="font-black text-sm min-w-[20px] text-center text-[#ECF5DE]">
                              {itemQty}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleIncrement(item, e)}
                              className="w-8 h-8 rounded-lg hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition cursor-pointer"
                              title="Increase quantity"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleIncrement(item, e)}
                            className="h-10 px-4 bg-[#173612] hover:bg-[#0F240B] text-white rounded-xl shadow-sm hover:shadow transition transform active:scale-95 flex items-center justify-center gap-1.5 font-bold text-xs cursor-pointer"
                            title="Add to Farm Basket"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
