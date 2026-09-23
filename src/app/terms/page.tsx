'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, PhoneCall, Sparkles } from 'lucide-react';
import { CAFE_METADATA } from '@/data/cafeData';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F5FAF0]/40 text-[#173612] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#173612] hover:text-[#43670F] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Farm Store</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAF3E4] shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#173612] flex items-center justify-center shadow-sm">
            <ShieldAlert className="w-7 h-7 text-[#173612]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#43670F]">
              Official Customer Policy
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase text-[#0F240B] font-bebas tracking-tight mt-1">
              Zafiroo Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Address: {CAFE_METADATA.address} • Delivery Hotline: {CAFE_METADATA.phone}
            </p>
          </div>
        </div>

        {/* Policy Details Cards */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAF3E4] shadow-sm space-y-6">
          <h2 className="text-xl font-black uppercase text-[#0F240B] font-bebas tracking-wide border-b border-gray-100 pb-3">
            Store Policies & Order Acceptance Guidelines
          </h2>

          {/* 1. Glass Bottle Policy */}
          <div className="p-5 rounded-2xl bg-[#ECF5DE] border border-[#CBE0A3] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0F240B] text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5 text-[#173612] shrink-0" />
              <span>1. Reusable Glass Bottle Policy</span>
            </div>
            <p className="text-xs sm:text-sm text-[#173612] font-semibold leading-relaxed pl-7">
              All Zafiroo milk is supplied in sterilized, reusable glass bottles.
            </p>
            <p className="text-[11px] sm:text-xs text-[#173612]/80 leading-relaxed pl-7">
              To support sustainable zero-waste dairying, please return empty bottles to our delivery partner during subsequent deliveries.
            </p>
          </div>

          {/* 2. On-the-spot order checking */}
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-950 text-sm sm:text-base">
              <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
              <span>2. Delivery Arrival & On-The-Spot Inspection</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-900 font-semibold leading-relaxed pl-7">
              When your order is arrived please check the product carefully are all items available because ones you receive no exchange and return available so please check on the spot.
            </p>
            <p className="text-[11px] sm:text-xs text-blue-800/90 leading-relaxed pl-7">
              Because our dairy and egg items are fresh, temperature-sensitive perishable foodstuffs, our delivery agents are instructed to wait while you verify the order contents. Once accepted and OTP is verified, no further returns or exchanges can be accommodated.
            </p>
          </div>

          {/* 3. Eggs condition check */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm sm:text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>3. Eggs Quality Check & Instant Exchange</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900 font-semibold leading-relaxed pl-7">
              When your eggs order has arrived please check weather the eggs are in good condition it should not be cracked or broken please check on the spot so you can get exchange.
            </p>
            <p className="text-[11px] sm:text-xs text-emerald-800/90 leading-relaxed pl-7">
              Open your 12-egg carton or 30-egg tray in the presence of the delivery courier. If any egg is cracked or defective, inform the rider on the spot for an immediate free exchange or replacement.
            </p>
          </div>

          {/* 4. Milk broken policy */}
          <div className="p-5 rounded-2xl bg-[#F5FAF0] border border-[#CBE0A3] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0F240B] text-sm sm:text-base">
              <PhoneCall className="w-5 h-5 text-[#173612] shrink-0" />
              <span>4. Milk Damage Support & Instant Fresh Replacement</span>
            </div>
            <p className="text-xs sm:text-sm text-[#173612] font-semibold leading-relaxed pl-7">
              If the milk it broken you can contact directly to the Zafiroo agents so you can exchange and get fresh milk contact as soon as possible.
            </p>
            <p className="text-[11px] sm:text-xs text-[#2E6125] font-bold leading-relaxed pl-7">
              Zafiroo Agent Helpline: {CAFE_METADATA.phone} (Call or WhatsApp)
            </p>
          </div>

          {/* Free Delivery Announcement */}
          <div className="p-4 rounded-2xl bg-[#ECF5DE] border border-[#CBE0A3] text-xs font-bold text-[#173612] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#173612] shrink-0" />
            <span>🚚 Free Delivery is provided on all products across our serviceable zones in Bangalore.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
