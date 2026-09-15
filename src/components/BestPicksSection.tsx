'use client';

import React from 'react';
import { useOrder } from '@/context/OrderContext';
import { MenuItem } from '@/types/cafe';
import { Sparkles, Plus, Clock, Star } from 'lucide-react';
import Image from 'next/image';

export function BestPicksSection() {
  const { menuItems, setSelectedMenuDetail, addToCart } = useOrder();

  const bestPicks = menuItems.filter((item) => item.featured || item.signature).slice(0, 6);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-banhmi-card border border-banhmi-gold/30 text-banhmi-red text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Curated Spotlights</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-espresso-950 tracking-tight">
          Chef&apos;s Signature Best Picks
        </h2>
        <p className="text-sm sm:text-base text-espresso-600">
          Hand-crafted delicacies prepared daily in small batches with uncompromised artisan ingredients.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bestPicks.map((item) => {
          return (
            <div
              key={item.id}
              className="group bg-white rounded-3xl overflow-hidden border border-cream-200 shadow-warm-sm hover:shadow-warm-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              {/* Image Box */}
              <div
                onClick={() => setSelectedMenuDetail(item)}
                className="relative w-full h-56 bg-espresso-100 cursor-pointer overflow-hidden"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                      item.dietary === 'veg'
                        ? 'bg-emerald-600/90 text-white'
                        : item.dietary === 'vegan'
                        ? 'bg-green-700/90 text-white'
                        : item.dietary === 'egg'
                        ? 'bg-amber-600/90 text-white'
                        : 'bg-rose-700/90 text-white'
                    }`}
                  >
                    {item.dietary}
                  </span>
                  {item.signature && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-banhmi-gold text-espresso-950 flex items-center gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Signature
                    </span>
                  )}
                </div>

                {item.prepTime && (
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-banhmi-gold" />
                    <span>{item.prepTime}</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-banhmi-gold">
                    {item.category}
                  </span>
                  <h3
                    onClick={() => setSelectedMenuDetail(item)}
                    className="text-lg font-bold text-espresso-950 mt-1 hover:text-banhmi-red transition cursor-pointer"
                  >
                    {item.name}
                  </h3>
                  <p className="text-xs text-espresso-600 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Taste Notes */}
                {item.tasteNotes && item.tasteNotes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tasteNotes.slice(0, 3).map((note, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 bg-banhmi-card text-espresso-700 rounded-md border border-banhmi-gold/20"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-cream-200">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-espresso-500 uppercase tracking-wider font-medium">Price</span>
                    <span className="text-xl font-black text-banhmi-red">{item.price}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedMenuDetail(item)}
                      className="px-4 py-2.5 bg-banhmi-card hover:bg-banhmi-gold/20 text-espresso-900 border border-banhmi-gold/30 rounded-xl text-xs font-bold transition active:scale-95"
                    >
                      Customize
                    </button>
                    <button
                      onClick={() => addToCart(item, 1)}
                      className="p-2.5 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 rounded-xl shadow-warm-sm transition active:scale-95"
                      title="Quick Add"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
