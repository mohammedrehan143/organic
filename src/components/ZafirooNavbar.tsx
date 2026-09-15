'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { ShoppingBag, Navigation, Menu as MenuIcon, X, Sparkles } from 'lucide-react';

export function ZafirooNavbar() {
  const pathname = usePathname();
  const { cartCount, setCartDrawerOpen, activeTrackingOrder, setTrackingModalOpen } = useOrder();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { href: '/on-the-farm', label: 'On the farm' },
    { href: '/in-the-kitchen', label: 'In the kitchen' },
    { href: '/in-the-schools', label: 'In the schools' },
    { href: '/in-the-news', label: 'In the news' },
    { href: '/menu', label: 'Organic Shop' },
    { href: '/track', label: 'Track Order' },
    { href: '/admin', label: 'Store KDS' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Logo matching Florida Milk style */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-full bg-[#FEEF30] border-2 border-[#252525] flex items-center justify-center p-1 shadow-sm transition transform group-hover:scale-105">
            <img
              src="/images/icon-cow.png"
              alt="Zafiroo Organic Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif italic text-sm text-[#43670F] font-bold">Zafiroo</span>
              <span className="text-xl font-black uppercase text-[#252525] font-bebas tracking-wide">
                ORGANIC STORE
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 -mt-1">
              Farm-Fresh & Wholesome
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links matching Florida Milk */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold tracking-tight transition-colors py-1 ${
                  isActive
                    ? 'text-[#43670F] border-b-2 border-[#43670F]'
                    : 'text-[#252525] hover:text-[#43670F]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Active Order Tracker Pill */}
          {activeTrackingOrder && (
            <button
              onClick={() => setTrackingModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEEF30] hover:bg-[#f0df01] text-[#252525] text-xs font-bold shadow-sm transition transform hover:scale-105"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Order #{activeTrackingOrder.tokenId}</span>
            </button>
          )}

          {/* Cart Button with motive yellow badge */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#252525] hover:bg-black text-white rounded-full font-bold text-xs shadow-md transition transform hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-[#FEEF30]" />
            <span className="hidden sm:inline">Farm Basket</span>
            <span className="w-5 h-5 rounded-full bg-[#FEEF30] text-[#252525] text-[11px] font-black flex items-center justify-center">
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#252525] hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-6 py-5 space-y-3 shadow-xl animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-[#252525] hover:text-[#43670F] border-b border-gray-100"
            >
              {link.label}
            </Link>
          ))}
          {activeTrackingOrder && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setTrackingModalOpen(true);
              }}
              className="w-full text-left py-2 text-xs font-bold text-[#43670F] flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Track Live Order #{activeTrackingOrder.tokenId}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
