'use client';

import React, { useState } from 'react';
import { Order } from '@/types/cafe';
import { OriginalBillReceipt } from './OriginalBillReceipt';
import { X, Printer, FileText, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface BillModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BillModal({ order, isOpen, onClose }: BillModalProps) {
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloadingImage(true);
      const element = document.getElementById('printable-receipt');
      if (!element) {
        handlePrint();
        return;
      }

      // Render high-resolution 2.5x sharp image
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Zafiroo_Invoice_Token_${order.tokenId || order.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating bill image:', err);
      // Fallback to native print/save as PDF
      handlePrint();
    } finally {
      setIsDownloadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-4 sm:p-6 border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-[#173612] shrink-0">
              <FileText className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="font-black text-[#0F240B] text-sm sm:text-base leading-tight truncate">
                Official Tax Invoice &amp; Bill (Token #{order.tokenId})
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">
                Order ID: {order.id} • Customer: {order.customer?.name || 'Customer'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close invoice"
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Preview */}
        <div className="max-h-[68vh] overflow-y-auto bg-stone-100/70 p-3 sm:p-4 rounded-2xl border border-stone-200 flex justify-center">
          <OriginalBillReceipt order={order} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2.5">
            {/* Download Clear PNG Image */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloadingImage}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isDownloadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                  <span>Generating Image...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Download Image (PNG)</span>
                </>
              )}
            </button>

            {/* Download PDF / Print Single Page */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-[#173612] hover:bg-[#0F240B] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Download PDF / Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
