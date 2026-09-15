'use client';

import React, { useState, useEffect } from 'react';
import { useOrder } from '@/context/OrderContext';
import { MenuItem } from '@/types/cafe';
import { X, Plus, Minus, Clock, Flame, Sparkles, Check } from 'lucide-react';
import Image from 'next/image';

export function MenuDetailModal() {
  const { selectedMenuDetail, setSelectedMenuDetail, addToCart } = useOrder();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedMenuDetail) {
      setQuantity(1);
      // Initialize with first option for each category if available
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

  const handleAddToCart = () => {
    addToCart(selectedMenuDetail, quantity, selectedOptions);
    setSelectedMenuDetail(null);
  };

  const unitPrice = selectedMenuDetail.priceNumber;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-banhmi-bg rounded-3xl shadow-2xl border border-cream-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedMenuDetail(null)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-espresso-800 shadow-md transition-transform active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative w-full h-64 sm:h-72 bg-espresso-900 overflow-hidden">
          <Image
            src={selectedMenuDetail.image}
            alt={selectedMenuDetail.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-banhmi-bg via-transparent to-black/30" />
          
          {/* Dietary Badge */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                selectedMenuDetail.dietary === 'veg'
                  ? 'bg-emerald-600/90 text-white'
                  : selectedMenuDetail.dietary === 'vegan'
                  ? 'bg-green-700/90 text-white'
                  : selectedMenuDetail.dietary === 'egg'
                  ? 'bg-amber-600/90 text-white'
                  : 'bg-rose-700/90 text-white'
              }`}
            >
              {selectedMenuDetail.dietary}
            </span>
            {selectedMenuDetail.signature && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-banhmi-gold/95 text-espresso-950 flex items-center gap-1 backdrop-blur-md shadow-sm">
                <Sparkles className="w-3 h-3 fill-current" />
                Signature
              </span>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-widest text-banhmi-gold">
                  {selectedMenuDetail.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-espresso-900 mt-1">
                  {selectedMenuDetail.name}
                </h2>
              </div>
              <span className="text-2xl font-bold text-banhmi-red shrink-0">
                {selectedMenuDetail.price}
              </span>
            </div>

            <p className="text-espresso-700 mt-2 text-sm sm:text-base leading-relaxed">
              {selectedMenuDetail.detailedDescription || selectedMenuDetail.description}
            </p>

            {/* Meta Tags (Prep Time, Calories) */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-medium text-espresso-600">
              {selectedMenuDetail.prepTime && (
                <div className="flex items-center gap-1.5 bg-cream-100 px-3 py-1.5 rounded-full border border-cream-300">
                  <Clock className="w-3.5 h-3.5 text-banhmi-gold" />
                  <span>Prep: {selectedMenuDetail.prepTime}</span>
                </div>
              )}
              {selectedMenuDetail.calories && (
                <div className="flex items-center gap-1.5 bg-cream-100 px-3 py-1.5 rounded-full border border-cream-300">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>{selectedMenuDetail.calories} kcal</span>
                </div>
              )}
            </div>

            {/* Taste Notes */}
            {selectedMenuDetail.tasteNotes && selectedMenuDetail.tasteNotes.length > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase text-espresso-500">Taste Notes:</span>
                {selectedMenuDetail.tasteNotes.map((note, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 bg-banhmi-card rounded-md border border-banhmi-gold/30 text-espresso-800"
                  >
                    {note}
                  </span>
                ))}
              </div>
            )}
          </div>

          <hr className="border-cream-200" />

          {/* Customization Options */}
          {selectedMenuDetail.customizationOptions && Object.keys(selectedMenuDetail.customizationOptions).length > 0 && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-espresso-900">
                Personalize Your Order
              </h3>

              {Object.entries(selectedMenuDetail.customizationOptions).map(([category, options]) => {
                if (!options || options.length === 0) return null;
                const currentVal = selectedOptions[category];

                return (
                  <div key={category} className="space-y-2">
                    <label className="text-xs font-semibold capitalize text-espresso-700">
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
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                              isSelected
                                ? 'border-banhmi-red bg-banhmi-red/10 text-banhmi-red font-semibold shadow-sm'
                                : 'border-cream-300 bg-white/70 hover:border-banhmi-gold/50 text-espresso-800'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="w-4 h-4 text-banhmi-red" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Bar: Quantity and Add to Cart */}
          <div className="pt-4 flex items-center justify-between gap-4 border-t border-cream-200">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-2xl border border-cream-300 shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 rounded-lg hover:bg-cream-100 text-espresso-700 transition"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-espresso-900 text-sm w-6 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1.5 rounded-lg hover:bg-cream-100 text-espresso-700 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-between px-6 py-3.5 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 font-bold rounded-2xl shadow-warm-md hover:shadow-warm-xl transition-all active:scale-[0.98]"
            >
              <span>Add to Order</span>
              <span>₹{totalPrice}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
