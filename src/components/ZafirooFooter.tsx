'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CAFE_METADATA, WHATSAPP_COMMUNITY_URL } from '@/data/cafeData';
import Link from 'next/link';
import { MessageSquare, PhoneCall, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { TermsModal } from './TermsModal';

export function ZafirooFooter() {
  const pathname = usePathname();
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Hide customer footer on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#0F240B] text-white pt-12 pb-8 sm:pt-16 sm:pb-12 border-t border-[#173612]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 1. WhatsApp Community Direct Join Banner */}
        <div className="pb-8 sm:pb-12 mb-8 sm:mb-12 border-b border-white/15 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/20 text-[#25D366] text-xs font-bold uppercase tracking-wider mb-1">
              <MessageSquare className="w-3.5 h-3.5 fill-[#25D366]" />
              <span>Zafiroo WhatsApp Community</span>
            </div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-black tracking-tight text-white font-serif">
              Join Zafiroo Official WhatsApp Community for instant farm updates & fresh daily drops!
            </h3>
            <p className="text-xs text-white/70 max-w-xl">
              Get real-time morning milk dispatch schedules, fresh white egg availability, and direct customer support in our community.
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Join WhatsApp Community</span>
            </a>
          </div>
        </div>

        {/* 2. Streamlined Footer Columns ('On the Farm' removed, 'In the Community' removed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mb-10 sm:mb-14 text-left">
          {/* Column 1: Farm Products (Featured recipes removed) */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 border-b border-white/15 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Our Farm Goods</span>
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-white/80">
              <li>
                <Link href="/menu" className="hover:text-emerald-300 transition flex items-center justify-between">
                  <span>Organic Milk in Glass Bottle (1L & 500ml)</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Free Delivery</span>
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-emerald-300 transition flex items-center justify-between">
                  <span>Normal White Eggs (12 & 30 Packs)</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Free Delivery</span>
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-emerald-300 transition flex items-center justify-between">
                  <span>Authentic Nati Eggs (Free-Range)</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Free Delivery</span>
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-emerald-300 transition flex items-center justify-between text-white/60">
                  <span>Pure Organic Cow Ghee</span>
                  <span className="text-[10px] text-rose-400 font-bold">Out of Stock</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Orders & Delivery */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 border-b border-white/15 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Orders & Policies</span>
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-white/80">
              <li>
                <span className="text-white font-bold block">
                  Free Doorstep Delivery
                </span>
              </li>
              <li>
                <Link href="/membership" className="hover:text-amber-300 transition flex items-center justify-between text-amber-300 font-bold">
                  <span>Farm Membership Schemes</span>
                  <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-black">1 & 6 Mo</span>
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-emerald-300 transition flex items-center justify-between">
                  <span>Live Order Tracking</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Track Now</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setTermsModalOpen(true)}
                  className="hover:text-emerald-300 transition text-left cursor-pointer underline text-white"
                >
                  Zafiroo Store Policy & Terms
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact, Delivery Line & Address */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 border-b border-white/15 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Store Contact & Location</span>
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-white/80">
              <div className="flex items-start gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-white/60 uppercase font-bold block">Delivery Line</span>
                  <a
                    href={`tel:${CAFE_METADATA.phone.replace(/[^0-9+]/g, '')}`}
                    className="font-bold text-white hover:text-emerald-300 transition text-sm"
                  >
                    {CAFE_METADATA.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-white/60 uppercase font-bold block">Address</span>
                  <p className="text-white/90 leading-snug">
                    {CAFE_METADATA.address}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 3. Bottom Bar (Privacy policy removed, Nutrition disclosures removed, cow face logo in clean added) */}
        <div className="pt-6 sm:pt-8 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white border border-[#173612] p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src="/images/cow-face-clean.png"
                alt="Zafiroo Cow Face Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span>© {new Date().getFullYear()} Zafiroo Organic Dairy Farm. All Rights Reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            <button
              onClick={() => setTermsModalOpen(true)}
              className="hover:text-white transition cursor-pointer"
            >
              Terms & Conditions
            </button>
            <Link href="/terms" className="hover:text-white transition">
              Zafiroo Policies
            </Link>
            <Link href="/admin" className="text-emerald-300 hover:underline font-bold">
              Admin KDS
            </Link>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />
    </footer>
  );
}
