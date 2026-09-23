'use client';

import React from 'react';
import { Membership } from '@/types/cafe';
import { CheckCircle2, ShieldCheck, MapPin, Phone, Truck, Calendar, Clock, CreditCard, Crown, Zap } from 'lucide-react';

interface MembershipBillReceiptProps {
  membership: Membership;
}

export function MembershipBillReceipt({ membership }: MembershipBillReceiptProps) {
  const isSixMonths = membership.planType === '6_months';
  const startDate = new Date(membership.startDate);
  const endDate = new Date(membership.endDate);
  const createdDate = new Date(membership.createdAt || membership.startDate);

  const dateStr = createdDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = createdDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const isPaid = membership.paymentStatus === 'paid' || isSixMonths;
  const isDue = membership.paymentStatus === 'due';

  return (
    <div
      id="printable-receipt"
      className="w-full max-w-[650px] mx-auto bg-white p-5 sm:p-7 text-espresso-950 font-sans border-2 border-[#173612] rounded-2xl shadow-sm space-y-4 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none text-xs"
    >
      {/* 1. Header: Farm Brand & Invoice Meta */}
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
            Membership Tax Invoice
          </span>
          <p className="font-mono text-xs font-black text-[#173612]">
            MEMBERSHIP #{membership.id}
          </p>
          <p className="text-[10px] font-mono text-gray-600">
            Invoice: INV-{membership.id.replace('MEM-', '')}
          </p>
          <div className="text-[10px] text-gray-700 flex items-center sm:justify-end gap-1.5">
            <Calendar className="w-3 h-3 text-[#173612]" />
            <span>{dateStr}</span>
            <Clock className="w-3 h-3 text-[#173612] ml-1" />
            <span>{timeStr}</span>
          </div>
        </div>
      </div>

      {/* 2. Member & Delivery Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200">
        {/* Customer Column */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
            Subscribed Member Details:
          </p>
          <p className="font-black text-xs text-[#0F240B]">
            {membership.customerName}
          </p>
          <p className="font-mono text-[11px] font-semibold text-gray-800">
            Registered Phone: {membership.phone}
          </p>
          {membership.customerEmail && (
            <p className="text-[10px] text-gray-700">
              Email: {membership.customerEmail}
            </p>
          )}
          {membership.address && (
            <p className="text-[11px] text-gray-700 leading-snug">
              Delivery Address: {membership.address}
            </p>
          )}
        </div>

        {/* Fulfillment & Courier Column */}
        <div className="space-y-1 sm:border-l sm:border-gray-200 sm:pl-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
            Assigned Delivery Partner:
          </p>
          <p className="flex items-center gap-1 font-bold text-xs text-[#173612]">
            <Truck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Syed • Electric Eco-Van</span>
          </p>
          <p className="font-mono text-[11px] text-gray-800">
            Daily Sunrise Route: 6:00 AM - 7:30 AM
          </p>
          <p className="flex items-center gap-1 text-[11px] text-gray-800">
            <CreditCard className="w-3.5 h-3.5 text-gray-600" />
            <span>Billing Model: <strong className="uppercase">{membership.billingType}</strong></span>
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Delivery Fee: <strong>100% FREE DAILY DELIVERY</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Subscription Package Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#173612] text-white text-[10px] uppercase font-black tracking-wider">
              <th className="py-1.5 px-2.5 rounded-l-lg w-10 text-center">#</th>
              <th className="py-1.5 px-2.5">Subscription Plan &amp; Entitlements</th>
              <th className="py-1.5 px-2.5 text-center w-24">Validity</th>
              <th className="py-1.5 px-2.5 text-right w-24">Billing Mode</th>
              <th className="py-1.5 px-2.5 rounded-r-lg text-right w-28">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-[11px]">
            <tr className="hover:bg-gray-50/50">
              <td className="py-2.5 px-2.5 text-center font-mono text-gray-500">1</td>
              <td className="py-2.5 px-2.5">
                <div className="flex items-center gap-1.5">
                  {isSixMonths ? (
                    <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <strong className="text-gray-900 text-xs">{membership.planName}</strong>
                </div>
                <div className="text-[10px] text-gray-600 space-y-0.5 mt-1 leading-snug">
                  <p>• 100% Free Doorstep Delivery every single morning (Zero delivery charges)</p>
                  <p>• Zero minimum order threshold on Farm-Fresh Milk &amp; Nati Eggs</p>
                  <p>• Priority sunrise morning delivery dispatch straight from Bylanarasapura pasture farm</p>
                </div>
              </td>
              <td className="py-2.5 px-2.5 text-center font-mono text-gray-800">
                <span className="font-bold">{isSixMonths ? '180 Days' : '30 Days'}</span>
                <span className="block text-[9px] text-gray-500">
                  {startDate.toLocaleDateString('en-IN')} - {endDate.toLocaleDateString('en-IN')}
                </span>
              </td>
              <td className="py-2.5 px-2.5 text-right font-mono font-bold uppercase text-gray-700">
                {membership.billingType}
              </td>
              <td className="py-2.5 px-2.5 text-right font-bold font-mono text-[#0F240B] text-xs">
                ₹{membership.price.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Financial Summary & Official Stamp */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t-2 border-gray-200">
        {/* Verification Stamp Badge */}
        <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-300">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="text-[10px]">
            <p className="font-black text-emerald-950 uppercase tracking-wide">
              Official Membership Invoice Verified
            </p>
            <p className="text-emerald-800">
              Farm Dispatch Hub • Approved by Store Admin &amp; Syed
            </p>
          </div>
        </div>

        {/* Totals Table */}
        <div className="w-full sm:w-64 space-y-1 text-[11px]">
          <div className="flex justify-between text-gray-700">
            <span>Scheme Rate:</span>
            <span className="font-mono font-semibold">₹{membership.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-emerald-800 font-bold">
            <span>Daily Delivery Cost:</span>
            <span className="font-mono">100% FREE (SAVED ₹4,500+)</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>GST / Taxes:</span>
            <span className="font-mono">₹0.00 (Exempt Farm Produce)</span>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t-2 border-[#173612] text-xs font-black text-[#0F240B]">
            <span>TOTAL AMOUNT:</span>
            <span className="font-mono text-sm px-2 py-0.5 bg-[#173612] text-white rounded">
              ₹{membership.price.toFixed(2)}
            </span>
          </div>
          <div className="pt-1 flex justify-end">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                isPaid
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : isDue
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : 'bg-blue-100 text-blue-900 border border-blue-300'
              }`}
            >
              {isPaid ? '✓ PAID & ACTIVATED' : isDue ? '🚨 MONTH-END SETTLEMENT DUE' : '● POSTPAID CYCLE ACTIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Policy & Quality Guarantee Note */}
      <div className="p-2.5 bg-amber-50/90 rounded-xl border border-amber-300 text-[10px] text-amber-950 space-y-0.5 leading-snug">
        <p className="font-black uppercase tracking-wider text-amber-900">
          ★ Zafiroo Farm Membership Guarantee:
        </p>
        <p>• All milk is delivered in sterilized glass bottles; eggs are cushioned in eco-molded pulp crates.</p>
        <p>• Zero cancellation fees during trial; instant replacement in case of any glass breakage or spoilage.</p>
        <p>• For subscription modifications or pause requests: WhatsApp +91 7259635948, +91 9731301135.</p>
      </div>

      {/* 6. Footer Note */}
      <div className="text-center text-[10px] text-gray-600 pt-1 space-y-0.5 border-t border-dashed border-gray-300">
        <p className="font-black text-[#173612] uppercase tracking-wider">
          *** Thank You for Being an Esteemed Zafiroo Farm Member ***
        </p>
        <p>Pure single-source organic dairy straight from our Hoskote pasture farm to your doorstep.</p>
      </div>
    </div>
  );
}
