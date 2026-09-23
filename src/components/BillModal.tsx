'use client';

import React from 'react';
import { Order } from '@/types/cafe';
import { OriginalBillReceipt } from './OriginalBillReceipt';
import { X, Printer, FileText } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-4 sm:p-6 border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <h3 className="font-black text-[#0F240B] text-xs sm:text-sm truncate">
                Tax Invoice &amp; Bill (Token #{order.tokenId})
              </h3>
              <p className="text-[10px] text-gray-500 font-mono">
                Order ID: {order.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-[#173612] transition cursor-pointer"
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
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-[#173612] text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#173612] hover:bg-[#0F240B] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
