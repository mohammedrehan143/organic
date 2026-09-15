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
    <footer className="bg-[#252525] text-white pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Florida Milk Pre-footer Newsletter Banner (.ct-footer-pre) */}
        <div className="pb-12 mb-12 border-b border-gray-700/60 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-serif">
              Join Zafiroo Organic Store to receive farm updates, harvest news & events!
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Fresh weekly delivery schedules, raw milk test reports, and seasonal organic harvests.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            {subscribed ? (
              <div className="px-6 py-3 rounded bg-[#43670F] text-white text-sm font-bold animate-fadeIn">
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
                  className="w-full sm:w-80 px-4 py-3 bg-white text-[#252525] placeholder-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-[#feef30] text-sm font-medium"
                />
                <button
                  type="submit"
                  className="btn-motive px-8 py-3 rounded text-sm font-bold uppercase tracking-wider whitespace-nowrap shadow hover:scale-[1.02] active:scale-95 transition"
                >
                  Join
                </button>
              </>
            )}
          </form>
        </div>

        {/* Florida Milk 4-Column Footer Link List (.ct-footer-list) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14 text-left">
          {/* Column 1: On the Farm */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#feef30]" />
              <Link href="/on-the-farm" className="hover:text-[#feef30] transition">On the farm</Link>
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
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
            <h4 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#feef30]" />
              <Link href="/in-the-kitchen" className="hover:text-[#feef30] transition">In the kitchen</Link>
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link href="/in-the-kitchen" className="hover:text-[#feef30] transition">
                  Featured Recipes
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#feef30] transition">
                  Pure A2 Whole Milk
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#feef30] transition">
                  Artisan Cultured Butter
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#feef30] transition">
                  Vedic Bilona Cow Ghee
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#feef30] transition">
                  Lactose-Free & Yogurt
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: In the Schools & Community */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#feef30]" />
              <Link href="/in-the-schools" className="hover:text-[#feef30] transition">In the community</Link>
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link href="/in-the-schools" className="hover:text-[#feef30] transition">
                  Kids Corner with SunnyBell
                </Link>
              </li>
              <li>
                <Link href="/in-the-news" className="hover:text-[#feef30] transition">
                  Contests & Sweepstakes
                </Link>
              </li>
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
            <h4 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#feef30]" />
              <span>Store & Logistics</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
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
                <span className="text-xs text-gray-400 block pt-1">
                  Delivery Line: {CAFE_METADATA.phone}
                </span>
              </li>
              <li>
                <span className="text-xs text-gray-400 block">
                  Address: {CAFE_METADATA.address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar matching Florida Milk */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FEEF30] p-1 flex items-center justify-center">
              <img src="/images/icon-cow.png" alt="Cow icon" className="w-5 h-5 object-contain" />
            </div>
            <span>© {new Date().getFullYear()} Zafiroo Organic Store. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#farm-families" className="hover:text-white transition">Privacy Policy</a>
            <a href="#farm-families" className="hover:text-white transition">Terms of Service</a>
            <a href="#farm-families" className="hover:text-white transition">Nutrition Disclosures</a>
            <Link href="/admin" className="text-[#FEEF30] hover:underline font-bold">Admin KDS</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
