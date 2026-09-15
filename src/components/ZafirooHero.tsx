'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useOrder } from '@/context/OrderContext';
import { ChevronDown, ChevronRight, ShoppingBag, Truck } from 'lucide-react';

export function ZafirooHero() {
  const { setCartDrawerOpen, setTrackingModalOpen, activeTrackingOrder } = useOrder();

  const scrollToFamilies = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('farm-families');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative w-full min-h-[95vh] flex items-center justify-center overflow-hidden select-none bg-black">
      {/* 1. Background Video Layer (127878-739487730_medium.mp4) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/header-01-smaller.jpg"
          className="w-full h-full object-cover scale-105 filter brightness-[0.82] contrast-[1.05]"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Parallax & Sunlight Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/60 pointer-events-none" />
      </div>

      {/* 2. Florida Milk Iconic Circular Title Emblem (.ct-page_title) */}
      <div className="relative z-10 my-16 px-4 flex flex-col items-center justify-center">
        {/* Active Live Order Pill if tracking */}
        {activeTrackingOrder && (
          <button
            onClick={() => setTrackingModalOpen(true)}
            className="mb-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/95 text-black font-bold text-xs shadow-xl backdrop-blur-md hover:bg-[#feef30] transition transform hover:scale-105"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Active Order #{activeTrackingOrder.tokenId} ({activeTrackingOrder.status})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* The Florida Milk Yellow Sun Circle Emblem */}
        <div className="relative w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] md:w-[560px] md:h-[560px] rounded-full bg-[#FEEF30] shadow-[0_20px_60px_rgba(0,0,0,0.45)] border-[6px] border-white/60 flex flex-col items-center justify-center text-center p-6 sm:p-10 transition transform hover:scale-[1.01] duration-500">
          {/* Main Title Heading */}
          <div className="space-y-1">
            <span className="block font-serif italic text-2xl sm:text-4xl md:text-5xl text-[#252525] font-normal leading-none tracking-tight">
              Zafiroo
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase text-[#252525] tracking-wider leading-[0.85] font-bebas">
              ORGANIC
            </h1>
            <span className="block text-xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-widest text-[#252525]">
              STORE
            </span>
          </div>

          {/* Subtitle */}
          <h2 className="text-xs sm:text-base md:text-lg font-bold text-[#252525] mt-3 sm:mt-4 max-w-[280px] sm:max-w-md leading-snug px-2">
            Delivering wholesome organic products<br className="hidden sm:inline" /> from our local farms to your table.
          </h2>

          {/* Cow Icon Emblem from Florida Milk */}
          <div className="mt-3 sm:mt-4 flex justify-center">
            <img
              src="/images/icon-cow.png"
              alt="Farm Cow Icon"
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
            />
          </div>

          {/* Quick Action Buttons inside circle */}
          <div className="mt-4 flex items-center gap-2 sm:gap-3">
            <Link
              href="/menu"
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#252525] hover:bg-black text-white text-xs sm:text-sm font-bold rounded-full shadow-md transition transform hover:scale-105 flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Fresh Dairy</span>
            </Link>
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white hover:bg-cream-100 text-[#252525] text-xs sm:text-sm font-bold rounded-full shadow-md transition transform hover:scale-105 flex items-center gap-1.5"
            >
              <span>Order Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Florida Milk Circular Bottom-Right Action Bubble (.ct-btn_circle) */}
      <div className="hidden lg:block absolute bottom-6 right-10 xl:right-24 z-20">
        <Link
          href="#farm-families"
          onClick={scrollToFamilies}
          className="w-44 h-44 xl:w-52 xl:h-52 rounded-full border-[8px] border-white bg-[#EEEEEE] hover:bg-[#D8D8D8] text-[#252525] flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-300 transform hover:scale-105 group"
        >
          <span className="text-xs font-serif italic text-gray-700">meet our</span>
          <span className="text-2xl xl:text-3xl font-black uppercase text-[#252525] font-bebas tracking-wide leading-tight">
            Farm Families
          </span>
          <div className="mt-1 w-8 h-8 rounded-full bg-[#252525] text-white flex items-center justify-center group-hover:bg-[#feef30] group-hover:text-black transition">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>

      {/* 4. Florida Milk Bouncing Chevron Down Scroll Button (.ct-btn-scroll-down) */}
      <a
        href="#farm-families"
        onClick={scrollToFamilies}
        aria-label="Scroll down to farm families"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-[#FEEF30] text-[#252525] shadow-lg flex items-center justify-center transition-all duration-300 animate-bounce"
      >
        <ChevronDown className="w-6 h-6 text-[#252525]" />
      </a>
    </header>
  );
}
