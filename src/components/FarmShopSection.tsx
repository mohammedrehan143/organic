'use client';

import React from 'react';
import { useOrder } from '@/context/OrderContext';
import { ShoppingBag, Plus, Minus, Sparkles, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FarmShopSection() {
  const { menuItems, cart, addToCart, updateQuantity, removeFromCart, setSelectedMenuDetail } = useOrder();
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const getItemQuantity = (itemId: string) => {
    return cart
      .filter((ci) => ci.menuItem?.id === itemId || (ci as any).itemId === itemId)
      .reduce((sum, ci) => sum + (ci.quantity || 0), 0);
  };

  const handleIncrement = (item: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    addToCart(item, 1);
  };

  const handleDecrement = (item: any, e?: React.MouseEvent) => {
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

  const filteredFarmItems = React.useMemo(() => {
    if (selectedCategory === 'All') return menuItems;
    if (selectedCategory === 'Eggs') {
      return menuItems.filter((i) => i.category === 'Nati Eggs' || i.category === 'Normal Eggs');
    }
    return menuItems.filter((i) => i.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  return (
    <section id="shop" className="py-14 sm:py-24 px-4 sm:px-6 bg-[#F5FAF0]/50 border-b border-[#EAF3E4] text-[#173612]">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#173612] text-white text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Free Doorstep Delivery On All Products</span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-5xl font-black uppercase text-[#0F240B] font-bebas tracking-tight">
            Fresh Organic Milk & Farm Eggs
          </h2>
          <p className="text-xs sm:text-base text-[#173612] font-sans px-2">
            Certified organic milk in reusable glass bottles, normal white eggs in 12 & 30 packs, and authentic pasture-raised Nati eggs delivered fresh to your doorstep with <strong>zero delivery fees</strong>.
          </p>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {[
            { id: 'All', label: 'All Farm Goods' },
            { id: 'Organic Milk', label: 'Organic Milk (Glass Bottle)' },
            { id: 'Organic Ghee', label: 'Organic Ghee' },
            { id: 'Normal Eggs', label: 'Normal White Eggs' },
            { id: 'Nati Eggs', label: 'Nati Eggs (Desi)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-[#173612] text-white shadow-md scale-105'
                  : 'bg-white text-[#173612] border border-[#CBE0A3] hover:bg-[#EAF3E4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto gap-6 sm:gap-8">
          {filteredFarmItems.map((item) => {
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
                {/* Image & Badges */}
                <div
                  onClick={() => setSelectedMenuDetail(item)}
                  className="relative w-full aspect-square bg-[#FAF9F6] cursor-pointer overflow-hidden group"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Free Delivery Tag */}
                  <div className="absolute top-3 left-3 bg-[#173612] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow border border-white/30">
                    Free Delivery
                  </div>

                  {/* Stock, In-Basket, or Signature Badge */}
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

                  {/* Glass Bottle Notice for milk */}
                  {item.category === 'Organic Milk' && (
                    <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      Sterilized Glass Bottle
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#43670F]">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Free Delivery
                      </span>
                    </div>
                    <h3
                      onClick={() => setSelectedMenuDetail(item)}
                      className="text-base sm:text-lg font-bold text-[#0F240B] mt-1 hover:text-[#43670F] transition cursor-pointer"
                    >
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#173612]/80 mt-1 sm:mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Price and Cart Buttons */}
                  <div className="pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between gap-2 sm:gap-3">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-[#385A2A] uppercase font-bold block">
                        Direct Farm Price
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-[#0F240B] font-bebas">
                        {item.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMenuDetail(item)}
                        className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-[#F5FAF0] hover:bg-[#EAF3E4] text-[11px] sm:text-xs font-bold text-[#173612] border border-[#CBE0A3] transition active:scale-95 flex items-center justify-center cursor-pointer"
                      >
                        Details
                      </button>

                      {!item.isAvailable ? (
                        <button
                          type="button"
                          disabled
                          className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-gray-100 border border-gray-300 text-gray-500 font-bold text-[11px] sm:text-xs cursor-not-allowed"
                        >
                          Out of Stock
                        </button>
                      ) : isInCart ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="h-9 sm:h-10 px-1.5 rounded-xl bg-[#173612] text-white flex items-center justify-between gap-1.5 sm:gap-2 shadow-sm border border-[#173612]"
                        >
                          <button
                            type="button"
                            onClick={(e) => handleDecrement(item, e)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition cursor-pointer"
                            title="Decrease quantity"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                          </button>
                          <span className="font-black text-xs sm:text-sm min-w-[20px] text-center text-[#ECF5DE]">
                            {itemQty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleIncrement(item, e)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition cursor-pointer"
                            title="Increase quantity"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleIncrement(item, e)}
                          className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-[#173612] hover:bg-[#0F240B] text-white shadow-sm hover:shadow transition transform active:scale-95 flex items-center justify-center gap-1.5 font-bold text-[11px] sm:text-xs cursor-pointer"
                          title="Add to Farm Basket"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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

        {/* View All Button */}
        <div className="text-center pt-2 sm:pt-4 flex justify-center">
          <Link
            href="/menu"
            className="btn-darkgreen px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition transform hover:scale-105 inline-flex items-center gap-2 text-center"
          >
            <ShoppingBag className="w-4 h-4 text-white shrink-0" />
            <span className="hidden sm:inline">Browse In-Stock Farm Items ({menuItems.length} Products)</span>
            <span className="sm:hidden">Browse In-Stock Items ({menuItems.length})</span>
            <ArrowRight className="w-4 h-4 text-white shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
