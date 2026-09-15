'use client';

import React from 'react';
import { Order } from '@/types/cafe';
import { OriginalBillReceipt } from './OriginalBillReceipt';
import { X, Printer } from 'lucide-react';

interface BillModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BillModal({ order, isOpen, onClose }: BillModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-banhmi-red" />
            <h3 className="font-bold text-gray-900 text-sm">Thermal POS Bill Preview (80mm)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Preview */}
        <div className="max-h-[65vh] overflow-y-auto bg-gray-50 p-3 rounded-2xl border border-gray-200 flex justify-center">
          <OriginalBillReceipt order={order} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 mt-5 pt-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-banhmi-red hover:bg-banhmi-redDark text-white text-xs font-bold rounded-xl shadow-warm-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print 80mm Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
