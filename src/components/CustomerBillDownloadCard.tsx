'use client';

import React from 'react';
import { Order } from '@/types/cafe';

interface CustomerBillDownloadCardProps {
  order: Order;
  onOpenBill: () => void;
  className?: string;
}

export function CustomerBillDownloadCard({
  order,
  onOpenBill,
  className = '',
}: CustomerBillDownloadCardProps) {
  if (order.status === 'cancelled') return null;

  const isUnlocked = Boolean(order.billApproved);

  if (!isUnlocked) {
    return (
      <button
        type="button"
        disabled
        title="Bill is locked until store admin approves access"
        className={`w-full py-3 px-4 rounded-xl bg-gray-200 text-gray-400 font-bold text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center border border-gray-300 select-none ${className}`}
      >
        Bill
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenBill}
      title="Download and print official bill"
      className={`w-full py-3 px-4 rounded-xl bg-[#173612] hover:bg-[#0F240B] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition transform active:scale-95 cursor-pointer flex items-center justify-center border border-[#2E6125] ${className}`}
    >
      Bill
    </button>
  );
}
