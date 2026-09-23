'use client';

import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, PhoneCall } from 'lucide-react';
import { CAFE_METADATA } from '@/data/cafeData';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn text-[#173612]">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EAF3E4] overflow-hidden animate-scaleIn max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#F5FAF0] border-b border-[#EAF3E4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-[#173612] flex items-center justify-center text-[#173612] font-black shadow-sm">
              <ShieldAlert className="w-5 h-5 text-[#173612]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F240B] font-bebas tracking-wide">
                Zafiroo Organic Dairy Farm Policies & Terms
              </h2>
              <p className="text-xs text-[#2E6125] font-semibold">
                Bylanarasapura, Hoskote Taluk, Bangalore - 562122
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200/60 text-[#173612] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-sm text-[#173612] leading-relaxed">
          <p className="font-semibold text-gray-700">
            Welcome to Zafiroo Organic Dairy Farm. Please read our official delivery, inspection, exchange, and glass bottle handling policies carefully:
          </p>

          {/* Policy 1: Glass Bottle Policy */}
          <div className="p-4 rounded-2xl bg-[#ECF5DE] border border-[#CBE0A3] flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-[#173612] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#0F240B] text-sm">
                1. Reusable Glass Bottle Policy
              </h3>
              <p className="text-[#173612] mt-1 font-medium">
                Our farm milk is served in eco-friendly reusable sterilized glass bottles. Customers are requested to return empty clean bottles during subsequent deliveries.
              </p>
            </div>
          </div>

          {/* Policy 2: On-the-Spot Order Verification */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-950 text-sm">
                2. On-the-Spot Order Arrival & Verification
              </h3>
              <p className="text-blue-900 mt-1 font-medium">
                When your order is arrived please check the product carefully are all items available because ones you receive no exchange and return available so please check on the spot.
              </p>
            </div>
          </div>

          {/* Policy 3: Eggs Condition Check */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-950 text-sm">
                3. Eggs Condition & Instant Exchange
              </h3>
              <p className="text-emerald-900 mt-1 font-medium">
                When your eggs order has arrived please check weather the eggs are in good condition it should not be cracked or broken please check on the spot so you can get exchange.
              </p>
            </div>
          </div>

          {/* Policy 4: Milk Breakage Support */}
          <div className="p-4 rounded-2xl bg-[#F5FAF0] border border-[#CBE0A3] flex items-start gap-3.5">
            <PhoneCall className="w-5 h-5 text-[#173612] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#0F240B] text-sm">
                4. Immediate Milk Damage Assistance
              </h3>
              <p className="text-[#173612] mt-1 font-medium">
                If the milk it broken you can contact directly to the Zafiroo agents so you can exchange and get fresh milk contact as soon as possible.
              </p>
              <p className="text-xs text-[#2E6125] font-bold mt-1">
                Zafiroo Agent Hotline: +91 7259635948, +91 9731301135
              </p>
            </div>
          </div>

          {/* Store Address & Contact */}
          <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 space-y-1">
            <p><strong>Farm & Dispatch Hub:</strong> Bylanarasapura, Hoskote Taluk, Bangalore - 562122</p>
            <p><strong>Delivery Line & Agent Support:</strong> +91 7259635948, +91 9731301135</p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#173612] hover:bg-[#0F240B] text-white font-bold text-xs uppercase tracking-wider shadow transition cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
