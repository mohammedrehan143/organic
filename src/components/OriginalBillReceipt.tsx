'use client';

import React from 'react';
import { Order } from '@/types/cafe';
import { formatThermalReceiptData } from '@/lib/billUtils';
import { CheckCircle2, ShieldCheck, MapPin, Phone, Truck, Calendar, Clock, CreditCard } from 'lucide-react';

interface OriginalBillReceiptProps {
  order: Order;
}

export function OriginalBillReceipt({ order }: OriginalBillReceiptProps) {
  const receipt = formatThermalReceiptData(order);

  return (
    <div
      id="printable-receipt"
      className="w-full max-w-[650px] mx-auto bg-white p-5 sm:p-7 text-espresso-950 font-sans border-2 border-[#173612] rounded-2xl shadow-sm space-y-4 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none text-xs"
    >
      {/* 1. Header: Brand & Invoice Meta */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b-2 border-[#173612]">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#173612]" />
            <h1 className="text-base sm:text-lg font-black text-[#173612] tracking-wide uppercase">
              Zafiroo Organic Dairy Farm
            </h1>
          </div>
          <p className="text-[11px] font-bold text-emerald-900">
            Pure Single-Source Certified Organic Dairy &amp; Pasture Farm Eggs
          </p>
          <div className="text-[10px] text-gray-700 leading-tight space-y-0.5">
            <p className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#173612] shrink-0" />
              <span>Farm Hub: Bylanarasapura, Hoskote Taluk, Bangalore - 562122</span>
            </p>
            <p className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#173612] shrink-0" />
              <span>Direct Helpline: +91 7259635948, +91 9731301135</span>
            </p>
            <p className="text-[10px] text-gray-600">
              Email: care@zafiroo-organic.com | 100% Free Doorstep Delivery
            </p>
          </div>
        </div>

        {/* Invoice Meta Box */}
        <div className="sm:text-right shrink-0 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 space-y-1">
          <span className="inline-block px-2 py-0.5 bg-[#173612] text-white text-[10px] font-black uppercase rounded tracking-wider">
            Tax Invoice &amp; Cash Bill
          </span>
          <p className="font-mono text-xs font-black text-[#173612]">
            TOKEN: #{receipt.tokenId}
          </p>
          <p className="text-[10px] font-mono text-gray-600">
            Order: {receipt.orderId}
          </p>
          <div className="text-[10px] text-gray-700 flex items-center sm:justify-end gap-1.5">
            <Calendar className="w-3 h-3 text-[#173612]" />
            <span>{receipt.dateStr}</span>
            <Clock className="w-3 h-3 text-[#173612] ml-1" />
            <span>{receipt.timeStr}</span>
          </div>
        </div>
      </div>

      {/* 2. Customer & Delivery Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200">
        {/* Customer Column */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
            Billed To &amp; Delivery Address:
          </p>
          <p className="font-black text-xs text-[#0F240B]">
            {receipt.customerName}
          </p>
          <p className="font-mono text-[11px] font-semibold text-gray-800">
            Phone: {receipt.customerPhone}
          </p>
          {receipt.customerAddress && (
            <p className="text-[11px] text-gray-700 leading-snug">
              Address: {receipt.customerAddress}
            </p>
          )}
        </div>

        {/* Delivery & Courier Column */}
        <div className="space-y-1 sm:border-l sm:border-gray-200 sm:pl-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
            Fulfillment &amp; Courier Partner:
          </p>
          <p className="flex items-center gap-1 font-bold text-xs text-[#173612]">
            <Truck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Syed • Electric Eco-Van</span>
          </p>
          <p className="font-mono text-[11px] text-gray-800">
            Courier Phone: 7259635948
          </p>
          <p className="flex items-center gap-1 text-[11px] text-gray-800">
            <CreditCard className="w-3.5 h-3.5 text-gray-600" />
            <span>Payment: <strong>{receipt.paymentMethod.toUpperCase()}</strong></span>
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Doorstep Verification OTP: <strong className="font-mono text-[11px]">{receipt.otp}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Itemized Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#173612] text-white text-[10px] uppercase font-black tracking-wider">
              <th className="py-1.5 px-2.5 rounded-l-lg w-10 text-center">#</th>
              <th className="py-1.5 px-2.5">Item Description</th>
              <th className="py-1.5 px-2.5 text-center w-16">Qty</th>
              <th className="py-1.5 px-2.5 text-right w-20">Rate (₹)</th>
              <th className="py-1.5 px-2.5 rounded-r-lg text-right w-24">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-[11px]">
            {receipt.items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50/50">
                <td className="py-2 px-2.5 text-center font-mono text-gray-500">{index + 1}</td>
                <td className="py-2 px-2.5 font-bold text-gray-900">
                  {item.name}
                  {item.customizations && (
                    <span className="block text-[10px] font-normal text-emerald-800">
                      • {item.customizations}
                    </span>
                  )}
                </td>
                <td className="py-2 px-2.5 text-center font-bold font-mono">{item.qty}</td>
                <td className="py-2 px-2.5 text-right font-mono text-gray-700">₹{item.price.toFixed(2)}</td>
                <td className="py-2 px-2.5 text-right font-bold font-mono text-[#0F240B]">
                  ₹{item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Financial Summary & Totals */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t-2 border-gray-200">
        {/* Verification Stamp Badge */}
        <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-300">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="text-[10px]">
            <p className="font-black text-emerald-950 uppercase tracking-wide">
              Official Tax Invoice Verified
            </p>
            <p className="text-emerald-800">
              Farm Dispatch Hub • Approved by Syed &amp; Zafiroo
            </p>
          </div>
        </div>

        {/* Totals Table */}
        <div className="w-full sm:w-64 space-y-1 text-[11px]">
          <div className="flex justify-between text-gray-700">
            <span>Items Subtotal:</span>
            <span className="font-mono font-semibold">₹{receipt.subtotal.toFixed(2)}</span>
          </div>
          {receipt.tax > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>GST / Taxes:</span>
              <span className="font-mono">₹{receipt.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-emerald-800 font-bold">
            <span>Daily Express Delivery:</span>
            <span className="font-mono">{receipt.deliveryFee === 0 ? 'FREE' : `₹${receipt.deliveryFee.toFixed(2)}`}</span>
          </div>
          {receipt.tip > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Rider Tip:</span>
              <span className="font-mono">₹{receipt.tip.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-1.5 border-t-2 border-[#173612] text-xs font-black text-[#0F240B]">
            <span>GRAND TOTAL:</span>
            <span className="font-mono text-sm px-2 py-0.5 bg-[#173612] text-white rounded">
              ₹{receipt.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Policy & Quality Guarantee Note */}
      <div className="p-2.5 bg-amber-50/90 rounded-xl border border-amber-300 text-[10px] text-amber-950 space-y-0.5 leading-snug">
        <p className="font-black uppercase tracking-wider text-amber-900">
          ★ Zafiroo Farm Quality &amp; Spot Check Guarantee:
        </p>
        <p>• Please inspect the sterilized glass bottles and egg crates upon delivery.</p>
        <p>• In case of any breakage or discrepancy, instant on-the-spot replacement is provided.</p>
        <p>• For queries or subscription changes: WhatsApp +91 7259635948, +91 9731301135.</p>
      </div>

      {/* 6. Footer Note */}
      <div className="text-center text-[10px] text-gray-600 pt-1 space-y-0.5 border-t border-dashed border-gray-300">
        <p className="font-black text-[#173612] uppercase tracking-wider">
          *** Thank You for Choosing Zafiroo Organic Dairy Farm ***
        </p>
        <p>Nourishing families with farm-fresh organic dairy straight from local pasture farms.</p>
      </div>
    </div>
  );
}
