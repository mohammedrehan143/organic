'use client';

import React from 'react';
import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';
import { ShoppingBag, Navigation, MapPin, ChevronDown, Loader2 } from 'lucide-react';

export function ZafirooNavbar() {
  const {
    cartCount,
    setCartDrawerOpen,
    setTrackingModalOpen,
    userLocation,
    setLocationModalOpen,
    autoDetectLocation,
    isDetectingLocation,
  } = useOrder();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#EAF3E4] shadow-sm text-[#173612]">
      {/* Top micro delivery banner / location auto-setter */}
      <div className="bg-[#173612] text-white text-[11px] py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* FREE DELIVERY FOR ALL PRODUCTS & Delivery Line (Replaces Daily Harvest) */}
          <div className="flex items-center gap-2 truncate">
            <span className="px-2 py-0.5 rounded-full bg-white text-[#173612] font-black text-[9px] sm:text-[10px] uppercase tracking-wider shrink-0 shadow-xs">
              🚚 FREE DELIVERY
            </span>
            <span className="text-white/95 font-semibold text-[10px] sm:text-[11px] truncate">
              Free Delivery For All Products • Call: +91 7259635948
            </span>
          </div>

          {/* Quick Location Pill in top banner */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 hover:text-emerald-300 font-bold transition px-2 sm:px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
              title="Click to set delivery location"
            >
              <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />
              <span className="truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[200px] text-[10px] sm:text-[11px]">
                {userLocation ? userLocation.shortAddress : 'Set Location'}
              </span>
              <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-75 shrink-0" />
            </button>
            <button
              onClick={autoDetectLocation}
              disabled={isDetectingLocation}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-[#173612] bg-white hover:bg-emerald-50 rounded-full transition cursor-pointer"
              title="Auto-Detect GPS"
            >
              {isDetectingLocation ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
              ) : (
                <Navigation className="w-2.5 h-2.5" />
              )}
              <span>GPS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo with Clean Cow Face */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-[#173612] flex items-center justify-center p-0.5 shadow-sm transition transform group-hover:scale-105 overflow-hidden">
            <img
              src="/images/cow-face-clean.png"
              alt="Zafiroo Cow Face Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-serif italic text-xs sm:text-sm text-[#43670F] font-bold">Zafiroo</span>
              <span className="text-base sm:text-xl font-black uppercase text-[#0F240B] font-bebas tracking-wide">
                ORGANIC STORE
              </span>
            </div>
            <span className="hidden xs:block text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#2E6125] -mt-1">
              Farm-Fresh & Wholesome
            </span>
          </div>
        </Link>

        {/* Right Actions: Tracking & Cart */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Tracking Option Button */}
          <Link
            href="/track"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full bg-white hover:bg-[#F5FAF0] text-[#173612] border-2 border-[#173612] text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Track Order Status"
          >
            <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#173612] shrink-0" />
            <span className="hidden sm:inline font-bold">Track Order</span>
            <span className="sm:hidden font-bold text-xs">Track</span>
          </Link>

          {/* Cart Option Button */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 bg-[#173612] hover:bg-[#0F240B] text-white rounded-full font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer"
            title="View Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
            <span className="hidden xs:inline font-bold">Cart</span>
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-[#173612] text-[10px] sm:text-[11px] font-black flex items-center justify-center shrink-0 shadow-xs">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
