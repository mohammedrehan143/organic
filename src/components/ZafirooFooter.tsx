'use client';

import React, { useState } from 'react';
import { CAFE_METADATA } from '@/data/cafeData';
import Link from 'next/link';

export function ZafirooFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#0F240B] text-white pt-12 pb-8 sm:pt-16 sm:pb-12 border-t border-[#173612]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Florida Milk Pre-footer Newsletter Banner (.ct-footer-pre) */}
        <div className="pb-8 sm:pb-12 mb-8 sm:mb-12 border-b border-white/15 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h3 className="text-lg xs:text-xl sm:text-2xl font-black tracking-tight text-white font-serif">
              Join Zafiroo Organic Store to receive farm updates, harvest news & events!
            </h3>
            <p className="text-xs text-white/70 mt-1 max-w-xl">
              Fresh weekly delivery schedules, raw milk test reports, and seasonal organic harvests.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            {subscribed ? (
              <div className="px-6 py-3 rounded-full bg-[#173612] border border-[#feef30] text-[#feef30] text-sm font-bold animate-fadeIn text-center">
                ✓ Welcome to the Organic Farm Family!
              </div>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full sm:w-80 px-4 py-3 bg-white text-[#173612] placeholder-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-[#feef30] text-sm font-semibold shadow-inner"
                />
                <button
                  type="submit"
                  className="btn-motive px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider whitespace-nowrap shadow-md hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                >
                  Join
                </button>
              </>
            )}
          </form>
        </div>

        {/* Florida Milk 4-Column Footer Link List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-14 text-left">
          {/* Column 1: On the Farm */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 border-b border-white/15 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#feef30]" />
              <Link href="/on-the-farm" className="hover:text-[#feef30] transition">On the farm</Link>
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-white/80">
              <li>
                <Link href="/on-the-farm" className="hover:text-[#feef30] transition">
                  Meet Our Farmers
                </Link>
              </li>
              <li>
                <Link href="/on-the-farm" className="hover:text-[#feef30] transition">
                  Meet the Cows
                </Link>
              </li>
              <li>
                <Link href="/on-the-farm" className="hover:text-[#feef30] transition">
                  Organic Dairy Facts
                </Link>
              </li>
              <li>
                <Link href="/on-the-farm" className="hover:text-[#feef30] transition">
                  From the Farm to the Fridge
                </Link>
              </li>
              <li>
                <Link href="/on-the-farm" className="hover:text-[#feef30] transition">
                  Pasture Grazing Practices
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: In the Kitchen */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 border-b border-white/15 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#feef30]" />
              <Link href="/in-the-kitchen" className="hover:text-[#feef30] transition">In the kitchen</Link>
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-white/80">
              <li>
                <Link href="/in-the-kitchen" className="hover:text-[#feef30] transition">
                  Featured Recipes
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#feef30] transition">
                  Organic Milk (1L & Half)
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#feef30] transition">
                  Nati Eggs (12 & 30 Packs)
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#feef30] transition">
                  Normal Eggs (12 & 30 Packs)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: In the Schools & Community */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 border-b border-white/15 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#feef30]" />
              <Link href="/in-the-schools" className="hover:text-[#feef30] transition">In the community</Link>
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-white/80">
              <li>
                <Link href="/in-the-news" className="hover:text-[#feef30] transition">
                  Health & High-Quality Protein
                </Link>
              </li>
              <li>
                <Link href="/in-the-schools" className="hover:text-[#feef30] transition">
                  Sports & Performance Recovery
                </Link>
              </li>
              <li>
                <Link href="/in-the-schools" className="hover:text-[#feef30] transition">
                  Dairy Curriculum & Farm Tours
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Store Logistics & KDS */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 border-b border-white/15 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#feef30]" />
              <span>Store & Logistics</span>
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-white/80">
              <li>
                <Link href="/track" className="hover:text-[#feef30] transition">
                  Live Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#feef30] transition">
                  Store KDS & Dispatch Hub
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#feef30] transition">
                  Rider Portal & Emergency SOS
                </Link>
              </li>
              <li>
                <span className="text-xs text-white/60 block pt-1">
                  Delivery Line: {CAFE_METADATA.phone}
                </span>
              </li>
              <li>
                <span className="text-xs text-white/60 block">
                  Address: {CAFE_METADATA.address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FEEF30] p-1 flex items-center justify-center shrink-0">
              <img src="/images/icon-cow.png" alt="Cow icon" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
            </div>
            <span>© {new Date().getFullYear()} Zafiroo Organic Store. All Rights Reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            <a href="#farm-families" className="hover:text-[#feef30] transition">Privacy Policy</a>
            <a href="#farm-families" className="hover:text-[#feef30] transition">Terms of Service</a>
            <a href="#farm-families" className="hover:text-[#feef30] transition">Nutrition Disclosures</a>
            <Link href="/admin" className="text-[#FEEF30] hover:underline font-bold">Admin KDS</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
