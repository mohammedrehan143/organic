'use client';

import React, { useState, useEffect } from 'react';
import { useOrder } from '@/context/OrderContext';
import { X, Plus, Minus, Clock, Flame, Sparkles, Check } from 'lucide-react';
import Image from 'next/image';

export function MenuDetailModal() {
  const { selectedMenuDetail, setSelectedMenuDetail, addToCart, menuItems } = useOrder();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedMenuDetail) {
      setQuantity(1);
      const initial: Record<string, string> = {};
      if (selectedMenuDetail.customizationOptions) {
        Object.entries(selectedMenuDetail.customizationOptions).forEach(([cat, opts]) => {
          if (opts && opts.length > 0) {
            initial[cat] = opts[0];
          }
        });
      }
      setSelectedOptions(initial);
    }
  }, [selectedMenuDetail]);

  if (!selectedMenuDetail) return null;

  const handleOptionSelect = (category: string, option: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [category]: option,
    }));
  };

  const portionVal = selectedOptions.portion || '';
  const priceMatch = portionVal.match(/₹(\d+)/);
  const selectedPortionPrice = priceMatch ? parseInt(priceMatch[1], 10) : null;
  
  // Match corresponding pack size item if switching portion
  const matchedItem = selectedPortionPrice
    ? menuItems.find(
        (m) => m.category === selectedMenuDetail.category && m.priceNumber === selectedPortionPrice
      )
    : null;

  const activeItem = matchedItem || selectedMenuDetail;
  const unitPrice = activeItem.priceNumber;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(activeItem, quantity, selectedOptions);
    setSelectedMenuDetail(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn text-[#173612]">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-[#EAF3E4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedMenuDetail(null)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-[#173612] shadow-md transition-transform active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative w-full h-52 sm:h-72 bg-gray-100 overflow-hidden">
          <Image
            src={activeItem.image}
            alt={activeItem.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
          
          {/* Dietary & Stock Badge */}
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
            {!activeItem.isAvailable ? (
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-md animate-pulse">
                Out of Stock
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#173612] text-white border border-white/30 shadow-md">
                🚚 Free Delivery
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                activeItem.dietary === 'veg'
                  ? 'bg-emerald-700 text-white'
                  : activeItem.dietary === 'vegan'
                  ? 'bg-[#173612] text-white'
                  : activeItem.dietary === 'egg'
                  ? 'bg-amber-600 text-white'
                  : 'bg-rose-700 text-white'
              }`}
            >
              {activeItem.dietary}
            </span>
            {activeItem.signature && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-white text-[#173612] flex items-center gap-1 backdrop-blur-md shadow-sm border border-[#173612]/20">
                <Sparkles className="w-3 h-3 fill-current" />
                Farm Classic
              </span>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#43670F]">
                  {activeItem.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F240B] mt-1 font-bebas tracking-wide">
                  {activeItem.name}
                </h2>
              </div>
              <span className="text-2xl font-black text-[#0F240B] font-bebas shrink-0">
                {activeItem.price}
              </span>
            </div>

            <p className="text-[#173612] mt-2 text-sm sm:text-base leading-relaxed">
              {activeItem.detailedDescription || activeItem.description}
            </p>

            {/* Meta Tags (Prep Time, Calories) */}
            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold text-[#173612]">
              {selectedMenuDetail.prepTime && (
                <div className="flex items-center gap-1.5 bg-[#F5FAF0] px-3 py-1.5 rounded-full border border-[#CBE0A3]">
                  <Clock className="w-3.5 h-3.5 text-[#173612]" />
                  <span>Harvest & Pack: {selectedMenuDetail.prepTime}</span>
                </div>
              )}
              {selectedMenuDetail.calories && (
                <div className="flex items-center gap-1.5 bg-[#F5FAF0] px-3 py-1.5 rounded-full border border-[#CBE0A3]">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>{selectedMenuDetail.calories} kcal</span>
                </div>
              )}
            </div>

            {/* Taste Notes */}
            {selectedMenuDetail.tasteNotes && selectedMenuDetail.tasteNotes.length > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase text-[#385A2A]">Purity & Taste:</span>
                {selectedMenuDetail.tasteNotes.map((note, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 bg-[#F5FAF0] rounded-md border border-[#CBE0A3] text-[#173612] font-semibold"
                  >
                    {note}
                  </span>
                ))}
              </div>
            )}
          </div>

          <hr className="border-[#EAF3E4]" />

          {/* Customization Options */}
          {selectedMenuDetail.customizationOptions && Object.keys(selectedMenuDetail.customizationOptions).length > 0 && (
            <div className="space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#0F240B]">
                Personalize Your Farm Goods
              </h3>

              {Object.entries(selectedMenuDetail.customizationOptions).map(([category, options]) => {
                if (!options || options.length === 0) return null;
                const currentVal = selectedOptions[category];

                return (
                  <div key={category} className="space-y-2">
                    <label className="text-xs font-bold capitalize text-[#173612]">
                      {category} Selection
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {options.map((opt) => {
                        const isSelected = currentVal === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleOptionSelect(category, opt)}
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                              isSelected
                                ? 'border-[#173612] bg-[#ECF5DE] text-[#0F240B] shadow-xs'
                                : 'border-gray-200 bg-white hover:border-[#173612]/40 text-[#173612]'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#173612]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Bar: Quantity and Add to Cart with balanced button layout */}
          <div className="pt-4 flex items-center justify-between gap-4 border-t border-gray-100">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-[#F5FAF0] px-3.5 py-2.5 rounded-2xl border border-[#CBE0A3] shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 rounded-lg hover:bg-white text-[#173612] transition disabled:opacity-40"
                disabled={quantity <= 1 || !activeItem.isAvailable}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-[#0F240B] text-sm w-6 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1.5 rounded-lg hover:bg-white text-[#173612] transition disabled:opacity-40"
                disabled={!activeItem.isAvailable}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button or Out of Stock */}
            {!activeItem.isAvailable ? (
              <button
                type="button"
                disabled
                className="flex-1 h-12 flex items-center justify-center px-4 sm:px-6 bg-gray-200 text-gray-500 font-bold rounded-2xl cursor-not-allowed text-xs sm:text-sm"
              >
                <span>Currently Out of Stock</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-12 flex items-center justify-between px-4 sm:px-6 bg-[#173612] hover:bg-[#0F240B] text-white font-bold rounded-2xl shadow-md hover:shadow-xl transition-all active:scale-[0.98] text-xs sm:text-sm cursor-pointer"
              >
                <span>
                  <span className="hidden xs:inline">Add to Farm Basket</span>
                  <span className="xs:hidden">Add to Basket</span>
                </span>
                <span>₹{totalPrice}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
