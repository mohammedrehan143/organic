'use client';

import React from 'react';
import { useOrder } from '@/context/OrderContext';
import { ShoppingBag, Plus, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

export function FarmShopSection() {
  const { menuItems, addToCart, setCartDrawerOpen, setSelectedMenuDetail } = useOrder();
  const [addedId, setAddedId] = React.useState<string | null>(null);

  const handleQuickAdd = (item: any) => {
    addToCart(item, 1);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  // Show top organic dairy & farm goods
  const farmItems = menuItems.slice(0, 6);

  return (
    <section className="py-24 px-6 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEEF30] text-[#252525] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Direct From Our Local Farms</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#252525] font-bebas tracking-tight">
            Fresh Organic Dairy & Farm Goods
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-sans">
            Harvested daily, non-homogenized, free of synthetic growth hormones, and delivered cold to your doorstep.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {farmItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              {/* Image & Badges */}
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

              {/* Details */}
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

                {/* Price and Cart Buttons */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Fresh Price</span>
                    <span className="text-2xl font-black text-[#252525] font-bebas">{item.price}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedMenuDetail(item)}
                      className="px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#252525] transition"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleQuickAdd(item)}
                      className="p-2.5 rounded-lg btn-motive text-[#252525] shadow transition transform active:scale-95"
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

        {/* View All Button */}
        <div className="text-center pt-4">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#252525] hover:bg-black text-white font-bold rounded-full text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition transform hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4 text-[#FEEF30]" />
            <span>Browse Full Organic Catalog ({menuItems.length} Farm Items)</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
