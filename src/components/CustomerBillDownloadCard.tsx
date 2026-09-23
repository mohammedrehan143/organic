'use client';

import React from 'react';
import { Order } from '@/types/cafe';
import { FileText, Lock, Printer } from 'lucide-react';

interface CustomerBillDownloadCardProps {
  order: Order;
  onOpenBill: () => void;
  variant?: 'card' | 'compact';
}

export function CustomerBillDownloadCard({
  order,
  onOpenBill,
  variant = 'card',
}: CustomerBillDownloadCardProps) {
  if (order.status === 'cancelled') return null;

  const isUnlocked = Boolean(order.billApproved);

  if (variant === 'compact') {
    return isUnlocked ? (
      <button
        type="button"
        onClick={onOpenBill}
        className="w-full py-3 px-4 rounded-xl bg-[#173612] hover:bg-[#0F240B] text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
      >
        <FileText className="w-4 h-4 text-emerald-400" />
        <span>Download / Print Bill (Unlocked)</span>
      </button>
    ) : (
      <div className="w-full py-2.5 px-3 bg-amber-50 rounded-xl border border-amber-200 text-center text-xs space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-amber-800 font-bold text-[11px]">
          <Lock className="w-3.5 h-3.5 text-amber-700" />
          <span>Bill Download Locked (Awaiting Store Clearance)</span>
        </div>
        <p className="text-[10px] text-amber-700/80">
          Will unlock once store admin approves and releases the bill.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isUnlocked
          ? 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50/70 border-emerald-300 shadow-sm'
          : 'bg-amber-50/70 border-amber-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isUnlocked
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-200/80 text-amber-800'
            }`}
          >
            {isUnlocked ? (
              <FileText className="w-5 h-5 text-white" />
            ) : (
              <Lock className="w-5 h-5 text-amber-700" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-black text-[#0F240B] text-xs sm:text-sm">
                Official Tax Invoice &amp; Bill
              </h4>
              {isUnlocked ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-950 uppercase tracking-wide">
                  ✓ Unlocked by Admin
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                  🔒 Locked (Awaiting Store Release)
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#2E6125] mt-0.5 leading-relaxed">
              {isUnlocked
                ? 'Store admin has unlocked your bill. Click below to download PDF or print your official receipt.'
                : 'The download button will unlock here automatically as soon as the store admin approves the bill.'}
            </p>
          </div>
        </div>

        {isUnlocked ? (
          <button
            type="button"
            onClick={onOpenBill}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#173612] hover:bg-[#0F240B] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Download / Print Bill</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-200 text-gray-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2 shrink-0 border border-gray-300 opacity-80"
            title="Bill is locked until admin approves it in the store dashboard"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bill Locked</span>
          </button>
        )}
      </div>
    </div>
  );
}
