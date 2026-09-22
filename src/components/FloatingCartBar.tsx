'use client';

import React from 'react';
import { useOrder } from '@/context/OrderContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export function FloatingCartBar() {
  const { cartCount, cartSubtotal, cartDrawerOpen, checkoutModalOpen, setCartDrawerOpen } = useOrder();

  if (cartCount === 0 || cartDrawerOpen || checkoutModalOpen) return null;

  return (
    <aside
      aria-label="Farm basket quick checkout summary"
      className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-md w-auto"
    >
      <button
        type="button"
        onClick={() => setCartDrawerOpen(true)}
        className="w-full sm:w-auto px-5 py-3 bg-[#173612] text-white rounded-2xl shadow-2xl hover:bg-[#0F240B] border-2 border-[#CBE0A3]/60 flex items-center justify-between sm:justify-center gap-4 text-xs sm:text-sm font-bold transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-white text-[#173612] flex items-center justify-center font-black text-xs shadow-xs">
            {cartCount}
          </div>
          <span className="text-[#ECF5DE] font-medium">
            {cartCount === 1 ? 'item' : 'items'} in basket
          </span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="font-bebas text-base sm:text-lg text-white font-black tracking-wide">
            ₹{cartSubtotal}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[#173612] bg-[#ECF5DE] px-3 py-1 rounded-xl font-bold">
          <span>View Basket</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </button>
    </aside>
  );
}
