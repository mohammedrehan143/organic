'use client';

import React from 'react';
import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';
import { ChevronDown, ChevronRight, ShoppingBag } from 'lucide-react';

const HERO_VIDEOS = [
  {
    id: 'dairy-harvest',
    src: '/hero-video.mp4',
    poster: '/images/header-01-smaller.jpg',
  },
  {
    id: 'eggs-packing',
    src: '/videos/eggs-packing.mp4',
    poster: '/videos/preview-eggs-basket.jpg',
  },
  {
    id: 'cows-pasture',
    src: '/videos/cows-open-area.mp4',
    poster: '/videos/preview-cows-nz.jpg',
  },
];

export function ZafirooHero() {
  const { setCartDrawerOpen } = useOrder();
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);
  const videoRefs = React.useRef<(HTMLVideoElement | null)[]>([]);

  // Automatic seamless slideshow cycle every 7.5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
    }, 7500);

    return () => clearInterval(timer);
  }, []);

  // Restart active video playback on slide transition
  React.useEffect(() => {
    const activeVideo = videoRefs.current[currentVideoIndex];
    if (activeVideo) {
      activeVideo.currentTime = 0;
      activeVideo.play().catch(() => {});
    }
  }, [currentVideoIndex]);

  const scrollToShop = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('shop');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative w-full min-h-[90vh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden select-none bg-black">
      {/* 1. Background Video Slideshow (3 videos seamlessly cycling in the background) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {HERO_VIDEOS.map((video, idx) => {
          const isActive = currentVideoIndex === idx;
          return (
            <div
              key={video.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
                autoPlay
                loop
                muted
                playsInline
                poster={video.poster}
                className="w-full h-full object-cover scale-105 filter brightness-[0.78] contrast-[1.08]"
              >
                <source src={video.src} type="video/mp4" />
              </video>
            </div>
          );
        })}

        {/* Parallax & Sunlight Vignette Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/35 to-black/75 pointer-events-none" />
      </div>

      {/* 2. Clean Hero Overlay without circle container */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center flex flex-col items-center justify-center space-y-4 sm:space-y-6">
        {/* Free Delivery Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-6 sm:py-2 rounded-full bg-white text-[#173612] text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-lg border border-[#173612]/20">
          <span>Free Doorstep Delivery On All Products</span>
        </div>

        {/* Clean Cow Face Logo */}
        <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-white border-3 border-white shadow-2xl flex items-center justify-center p-1 hover:scale-105 transition-transform duration-300">
          <img
            src="/images/cow-face-clean.png"
            alt="Zafiroo Cow Face Logo"
            className="w-full h-full object-contain rounded-full"
          />
        </div>

        {/* Main Title Heading */}
        <div className="space-y-1 sm:space-y-2 text-white">
          <span className="block font-serif italic text-2xl sm:text-4xl md:text-5xl text-white font-bold drop-shadow-md tracking-tight">
            Zafiroo
          </span>
          <h1 className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-wider font-bebas text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] leading-[0.9]">
            ORGANIC STORE
          </h1>
          <p className="text-sm xs:text-base sm:text-xl font-medium text-white/95 max-w-2xl mx-auto drop-shadow-md leading-relaxed px-2">
            Pure organic milk in glass bottles & farm-fresh white eggs delivered cold from our local pastures in Bylanarasapura, Hoskote to your table.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full max-w-md">
          <Link
            href="/menu"
            className="w-full xs:w-auto px-6 sm:px-8 py-3.5 bg-white hover:bg-white/90 text-[#173612] font-black text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-xl hover:scale-105 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#173612]" />
            <span>Shop Milk & Eggs</span>
          </Link>
          <a
            href="#shop"
            onClick={scrollToShop}
            className="w-full xs:w-auto px-6 sm:px-8 py-3.5 bg-[#173612]/90 hover:bg-[#173612] text-white border border-white/30 font-black text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-xl hover:scale-105 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Browse Farm Items</span>
          </a>
        </div>
      </div>

      {/* 3. Bouncing Chevron Down Scroll Button */}
      <a
        href="#shop"
        onClick={scrollToShop}
        aria-label="Scroll down to farm shop"
        className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-emerald-50 text-[#173612] shadow-lg flex items-center justify-center transition-all duration-300 animate-bounce border border-[#173612]/20 cursor-pointer"
      >
        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#173612]" />
      </a>
    </header>
  );
}
