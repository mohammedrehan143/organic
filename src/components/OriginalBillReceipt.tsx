'use client';

import React from 'react';
import { Order } from '@/types/cafe';
import { formatThermalReceiptData } from '@/lib/billUtils';

interface OriginalBillReceiptProps {
  order: Order;
}

export function OriginalBillReceipt({ order }: OriginalBillReceiptProps) {
  const receipt = formatThermalReceiptData(order);

  return (
    <div
      id="printable-receipt"
      className="w-full max-w-[80mm] mx-auto bg-white p-4 text-black font-mono text-[11px] leading-tight border border-dashed border-gray-300 shadow-sm"
    >
      {/* Brand Header */}
      <div className="text-center space-y-1 mb-3">
        <h1 className="text-sm font-black tracking-widest uppercase">
          *** {receipt.storeName} ***
        </h1>
        <p className="text-[10px] text-gray-700">ARTISAN CAFE & CLOUD KITCHEN</p>
        <p className="text-[9px] text-gray-600 px-2">{receipt.storeAddress}</p>
        <p className="text-[9px] text-gray-600">Ph: {receipt.storePhone}</p>
        <p className="text-[9px] text-gray-500">GSTIN: 29AAAFZ1921R1Z8</p>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Meta Info */}
      <div className="space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>TOKEN: <strong>#{receipt.tokenId}</strong></span>
          <span>ORDER: {receipt.orderId}</span>
        </div>
        <div className="flex justify-between">
          <span>DATE: {receipt.dateStr}</span>
          <span>TIME: {receipt.timeStr}</span>
        </div>
        <div>
          <span>TYPE: <strong>{receipt.deliveryMethod.toUpperCase()}</strong></span>
        </div>
        <div>
          <span>PAYMENT: {receipt.paymentMethod}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Customer Info */}
      <div className="space-y-0.5 text-[10px]">
        <div>CUST: {receipt.customerName} ({receipt.customerPhone})</div>
        {receipt.customerAddress && (
          <div className="text-[9px] text-gray-800 leading-none mt-0.5">
            ADDR: {receipt.customerAddress}
          </div>
        )}
        {receipt.riderName && (
          <div className="text-[9px]">RIDER: {receipt.riderName}</div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Line Items Table */}
      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between font-bold border-b border-gray-200 pb-0.5">
          <span className="w-1/2">ITEM</span>
          <span className="w-1/6 text-center">QTY</span>
          <span className="w-1/6 text-right">RATE</span>
          <span className="w-1/6 text-right">AMT</span>
        </div>

        {receipt.items.map((item, index) => (
          <div key={index} className="py-0.5">
            <div className="flex justify-between font-semibold">
              <span className="w-1/2 truncate">{item.name}</span>
              <span className="w-1/6 text-center">{item.qty}</span>
              <span className="w-1/6 text-right">₹{item.price}</span>
              <span className="w-1/6 text-right">₹{item.total}</span>
            </div>
            {item.customizations && (
              <p className="text-[8.5px] text-gray-600 pl-2">
                - {item.customizations}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Totals */}
      <div className="space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>₹{receipt.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST (5%):</span>
          <span>₹{receipt.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>DELIVERY FEE:</span>
          <span>{receipt.deliveryFee === 0 ? 'FREE' : `₹${receipt.deliveryFee.toFixed(2)}`}</span>
        </div>
        {receipt.tip > 0 && (
          <div className="flex justify-between">
            <span>RIDER TIP:</span>
            <span>₹{receipt.tip.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-black pt-1 flex justify-between font-black text-xs">
          <span>TOTAL:</span>
          <span>₹{receipt.grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Doorstep OTP Box */}
      <div className="my-2 p-1.5 border border-black text-center space-y-0.5">
        <p className="text-[9px] font-bold">DOORSTEP DELIVERY OTP</p>
        <p className="text-base font-black tracking-widest">{receipt.otp}</p>
        <p className="text-[8px] text-gray-600">Provide to rider only after receiving order</p>
      </div>

      {/* Footer message */}
      <div className="text-center text-[9px] text-gray-700 mt-3 space-y-0.5">
        <p>*** THANK YOU FOR YOUR PATRONAGE ***</p>
        <p>Handmade with French & Vietnamese passion</p>
        <p>Instagram: @zafiroogourmet</p>
      </div>
    </div>
  );
}
