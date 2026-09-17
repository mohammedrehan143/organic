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

  const scrollToFamilies = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('farm-families');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative w-full min-h-[92vh] sm:min-h-[95vh] flex items-center justify-center overflow-hidden select-none bg-black">
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
                className="w-full h-full object-cover scale-105 filter brightness-[0.82] contrast-[1.05]"
              >
                <source src={video.src} type="video/mp4" />
              </video>
            </div>
          );
        })}

        {/* Parallax & Sunlight Vignette Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/20 to-black/65 pointer-events-none" />
      </div>

      {/* 2. Zafiroo Iconic Circular Title Emblem */}
      <div className="relative z-20 mt-14 sm:mt-24 mb-10 sm:mb-16 px-3 sm:px-4 flex flex-col items-center justify-center">
        {/* The Florida Milk Yellow Sun Circle Emblem */}
        <div className="relative w-[265px] h-[265px] xs:w-[305px] xs:h-[305px] sm:w-[410px] sm:h-[410px] md:w-[490px] md:h-[490px] rounded-full bg-[#FEEF30] shadow-[0_20px_60px_rgba(0,0,0,0.45)] border-4 sm:border-[5px] border-white/85 flex flex-col items-center justify-center text-center p-2.5 xs:p-3.5 sm:p-8 transition transform hover:scale-[1.01] duration-500">
          {/* Main Title Heading */}
          <div className="space-y-0 sm:space-y-0.5">
            <span className="block font-serif italic text-lg xs:text-xl sm:text-3xl md:text-4xl text-[#173612] font-semibold leading-none tracking-tight">
              Zafiroo
            </span>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase text-[#0F240B] tracking-wider leading-[0.85] font-bebas">
              ORGANIC
            </h1>
            <span className="block text-sm xs:text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-widest text-[#173612]">
              STORE
            </span>
          </div>

          {/* Subtitle */}
          <h2 className="text-[9px] xs:text-[11px] sm:text-sm md:text-base font-bold text-[#173612] mt-1 xs:mt-1.5 sm:mt-3 max-w-[195px] xs:max-w-[240px] sm:max-w-sm leading-tight sm:leading-snug px-1">
            Pure organic milk & pasture-raised eggs<br className="hidden sm:inline" /> from our local farms to your table.
          </h2>

          {/* Cow Icon Emblem */}
          <div className="mt-1 xs:mt-1.5 sm:mt-3 flex justify-center">
            <img
              src="/images/icon-cow.png"
              alt="Farm Cow Icon"
              className="w-7 h-7 xs:w-8 xs:h-8 sm:w-13 sm:h-13 object-contain"
            />
          </div>

          {/* Quick Action Buttons: Side-by-side on mobile, perfectly fitted inside the circle */}
          <div className="mt-2 xs:mt-2.5 sm:mt-4 flex flex-row items-center justify-center gap-2 sm:gap-3 w-full max-w-[220px] xs:max-w-[250px] sm:max-w-none">
            <Link
              href="/menu"
              className="btn-darkgreen px-3 xs:px-3.5 sm:px-5 py-1.5 xs:py-2 sm:py-2.5 text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FEEF30]" />
              <span>Shop Milk & Eggs</span>
            </Link>
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="px-3 xs:px-3.5 sm:px-5 py-1.5 xs:py-2 sm:py-2.5 bg-white hover:bg-[#F5FAF0] text-[#173612] border-2 border-[#173612] text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-bold rounded-full shadow-md transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Order Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Florida Milk Circular Bottom-Right Action Bubble */}
      <div className="hidden lg:block absolute bottom-6 right-10 xl:right-24 z-20">
        <Link
          href="#farm-families"
          onClick={scrollToFamilies}
          className="w-44 h-44 xl:w-52 xl:h-52 rounded-full border-[8px] border-white bg-[#EEEEEE] hover:bg-[#D8D8D8] text-[#173612] flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-300 transform hover:scale-105 group"
        >
          <span className="text-xs font-serif italic text-[#385A2A]">meet our</span>
          <span className="text-2xl xl:text-3xl font-black uppercase text-[#0F240B] font-bebas tracking-wide leading-tight">
            Farm Families
          </span>
          <div className="mt-1 w-8 h-8 rounded-full bg-[#173612] text-white flex items-center justify-center group-hover:bg-[#feef30] group-hover:text-[#173612] transition">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>

      {/* 4. Bouncing Chevron Down Scroll Button */}
      <a
        href="#farm-families"
        onClick={scrollToFamilies}
        aria-label="Scroll down to farm families"
        className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-[#FEEF30] text-[#173612] shadow-lg flex items-center justify-center transition-all duration-300 animate-bounce border border-[#173612]/20 cursor-pointer"
      >
        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#173612]" />
      </a>
    </header>
  );
}
