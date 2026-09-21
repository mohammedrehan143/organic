'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Clock,
  RefreshCw,
  Crown,
  ArrowRight,
  Search,
  Gift,
  Zap,
} from 'lucide-react';
import { CAFE_METADATA } from '@/data/cafeData';

export function MembershipSection() {
  const perks = [
    {
      icon: Clock,
      title: 'Daily Sunrise Delivery',
      desc: 'Wake up to freshly bottled organic milk fresh and waiting at your doorstep before 8:30 AM.',
    },
    {
      icon: RefreshCw,
      title: 'Sterilized Bottle Swap',
      desc: 'Eco-friendly sterilized glass bottles replaced every morning. Zero bottle deposit required for members.',
    },
    {
      icon: ShieldCheck,
      title: 'Guaranteed Daily Allocation',
      desc: 'Members receive 100% priority allocation of fresh daily milk, normal white eggs & authentic Nati eggs.',
    },
    {
      icon: Zap,
      title: 'Flexible Postpaid / Prepaid',
      desc: 'Choose 1-Month Postpaid (settle at month-end) or 6-Months Prepaid (upfront savings + free gift).',
    },
  ];

  return (
    <section id="membership" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0F240B] text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#43670F]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#173612] text-xs font-black uppercase tracking-wider shadow-lg">
            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Zafiroo Farm Membership Schemes</span>
          </div>

          <h2 className="text-3xl xs:text-4xl sm:text-6xl font-black uppercase tracking-tight text-white font-bebas">
            100% Free Daily Doorstep Deliveries
          </h2>

          <p className="text-sm sm:text-base text-white/85 max-w-2xl mx-auto leading-relaxed">
            Join the Zafiroo Organic Club with our <strong>1-Month Postpaid</strong> or <strong>6-Months Prepaid</strong> schemes. Check your active membership anytime using your mobile number.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/membership"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#0F240B] font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition"
            >
              <Crown className="w-4 h-4 fill-[#0F240B]" />
              <span>Explore Membership Schemes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/membership"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 hover:scale-105 active:scale-95 transition"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Check Profile by Mobile No.</span>
            </Link>
          </div>
        </div>

        {/* 2 Plans Side-By-Side Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Plan 1: 1 Month Postpaid */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 space-y-5 flex flex-col justify-between hover:border-emerald-400/50 transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  POSTPAID SCHEME
                </span>
                <span className="text-xs text-gray-300 font-mono">30 Days</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white font-serif">1 Month Organic Pass</h3>
                <p className="text-xs text-emerald-100/80 mt-1">
                  Pay at month-end. Enjoy 100% free daily deliveries with zero advance commitment.
                </p>
              </div>
              <div className="text-3xl font-black text-white">
                ₹299 <span className="text-xs text-gray-400 font-normal">/ month (Postpaid)</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free doorstep deliveries every morning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Postpaid billing cycle (settle invoice at month-end)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero glass bottle deposit required</span>
                </li>
              </ul>
            </div>
            <Link
              href="/membership"
              className="w-full py-3 bg-white text-[#173612] hover:bg-emerald-50 font-bold rounded-2xl text-xs uppercase tracking-wider text-center transition block"
            >
              Select 1-Month Postpaid
            </Link>
          </div>

          {/* Plan 2: 6 Months Prepaid */}
          <div className="bg-gradient-to-b from-[#1C3E14] to-[#122A0D] rounded-3xl p-6 sm:p-8 border-2 border-amber-400/80 space-y-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
              BEST VALUE
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-amber-300" />
                  <span>PREPAID VIP CLUB</span>
                </span>
                <span className="text-xs text-gray-300 font-mono">180 Days</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white font-serif">6 Months VIP Club</h3>
                <p className="text-xs text-emerald-100/80 mt-1">
                  Prepaid upfront activation with ₹300 instant savings and free insulated cooler bag.
                </p>
              </div>
              <div className="text-3xl font-black text-amber-300">
                ₹1,499 <span className="text-xs text-gray-400 line-through">₹1,794</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>180 days uninterrupted free daily deliveries</span>
                </li>
                <li className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Complimentary Thermal Milk Cooler Bag (worth ₹450)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>10% extra discount on seasonal farm specials</span>
                </li>
              </ul>
            </div>
            <Link
              href="/membership"
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#0F240B] font-black rounded-2xl text-xs uppercase tracking-wider text-center transition block shadow-md"
            >
              Select 6-Months Prepaid
            </Link>
          </div>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {perks.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-400/50 transition-all duration-300 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white text-[#173612] flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  {perk.title}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  {perk.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
