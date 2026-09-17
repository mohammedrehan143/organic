'use client';

import React, { useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import {
  X,
  Clock,
  CheckCircle2,
  PackageCheck,
  ChefHat,
  Bike,
  Sparkles,
  Phone,
  MessageCircle,
  ShieldCheck,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { generateWhatsAppOtpLink, generateWhatsAppLocationShareLink } from '@/lib/whatsapp';
import { BillModal } from './BillModal';
import { OrderCompletionFeedback } from './OrderCompletionFeedback';
import Link from 'next/link';

export function OrderTrackingModal() {
  const {
    trackingModalOpen,
    setTrackingModalOpen,
    activeTrackingOrder,
    orders,
  } = useOrder();

  const [billOpen, setBillOpen] = useState(false);

  if (!trackingModalOpen || !activeTrackingOrder) return null;

  const currentOrder =
    orders.find((o) => o.id === activeTrackingOrder.id || o.tokenId === activeTrackingOrder.tokenId) ||
    activeTrackingOrder;

  // 5-Stage Stepper calculation
  const stages = [
    { key: 'new', label: 'Order Received', shortLabel: 'Received', icon: Clock, desc: 'Farm dispatch alerted' },
    { key: 'preparing', label: 'Fresh Harvest Packed', shortLabel: 'Packed', icon: ChefHat, desc: 'Cold insulation' },
    { key: 'ready', label: 'Seal Verified', shortLabel: 'Verified', icon: PackageCheck, desc: 'Quality checked' },
    {
      key: 'delivering',
      label: currentOrder.deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready at Farm Hub',
      shortLabel: currentOrder.deliveryMethod === 'delivery' ? 'On Way' : 'Ready',
      icon: Bike,
      desc: currentOrder.deliveryMethod === 'delivery' ? 'Rider en route' : 'Counter ready',
    },
    { key: 'completed', label: 'Delivered & Enjoyed', shortLabel: 'Delivered', icon: CheckCircle2, desc: 'Complete' },
  ];

  const statusMap: Record<string, number> = {
    new: 0,
    preparing: 1,
    ready: 2,
    delivering: 3,
    completed: 4,
    cancelled: -1,
  };

  const currentStep = statusMap[currentOrder.status] ?? 0;

  // WhatsApp links
  const whatsappOtpUrl = generateWhatsAppOtpLink(
    currentOrder.customer.phone,
    currentOrder.deliveryOtp,
    currentOrder.tokenId,
    currentOrder.total,
    currentOrder.customer.name
  );

  const whatsappRiderPinUrl = currentOrder.riderPhone
    ? generateWhatsAppLocationShareLink(
        currentOrder.riderPhone,
        currentOrder.customer.lat,
        currentOrder.customer.lng,
        currentOrder.customer.address
      )
    : '';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn text-[#173612]">
        <div
          className="relative w-full max-w-2xl my-4 sm:my-8 bg-white rounded-3xl shadow-2xl border border-[#EAF3E4] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#EAF3E4] bg-[#F5FAF0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#feef30] border-2 border-[#173612] flex items-center justify-center text-[#173612] shadow-sm">
                <Bike className="w-5 h-5 fill-[#173612]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-[#0F240B] font-bebas tracking-wide">
                    Live Order Tracking
                  </h2>
                  <span className="text-xs bg-[#feef30] text-[#173612] font-mono font-black px-2.5 py-0.5 rounded-full border border-[#173612]/20">
                    #{currentOrder.tokenId}
                  </span>
                </div>
                <p className="text-xs text-[#2E6125] font-semibold">
                  Estimated Delivery: <strong>{currentOrder.estimatedTime}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBillOpen(true)}
                className="px-3 py-1.5 rounded-xl hover:bg-gray-100 text-[#173612] transition flex items-center gap-1.5 text-xs font-bold border border-gray-300"
                title="Print Thermal Bill"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bill</span>
              </button>
              <button
                onClick={() => setTrackingModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200/60 text-[#173612] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
            {/* 5-Stage Stepper Pipeline */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EAF3E4] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0F240B]">
                  Fulfillment Pipeline
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#ECF5DE] text-[#173612] border border-[#CBE0A3] capitalize">
                  {currentOrder.status}
                </span>
              </div>

              <div className="relative pt-2 pb-1">
                <div className="absolute top-6 left-6 right-6 h-1 bg-gray-100 -z-0">
                  <div
                    className="h-full bg-[#173612] transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(0, (currentStep / (stages.length - 1)) * 100))}%`,
                    }}
                  />
                </div>

                <div className="relative z-10 grid grid-cols-5 gap-1">
                  {stages.map((stage, idx) => {
                    const isPassed = currentStep >= idx;
                    const isCurrent = currentStep === idx;
                    const IconComponent = stage.icon;

                    return (
                      <div key={stage.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-[#173612] text-white ring-4 ring-[#feef30]/60 scale-110 shadow-md'
                              : isPassed
                              ? 'bg-[#173612] text-white'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}
                        >
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span
                          className={`text-[9px] xs:text-[10px] sm:text-xs font-bold mt-2 leading-tight ${
                            isCurrent ? 'text-[#0F240B] font-black' : isPassed ? 'text-[#173612]' : 'text-gray-400'
                          }`}
                        >
                          <span className="hidden xs:inline">{stage.label}</span>
                          <span className="xs:hidden">{stage.shortLabel}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Doorstep Verification OTP Card */}
            <div className="p-5 bg-[#F5FAF0] rounded-3xl border-2 border-[#CBE0A3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#feef30] border-2 border-[#173612] flex items-center justify-center text-[#173612] shrink-0">
                  <ShieldCheck className="w-7 h-7 fill-[#173612] text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#385A2A]">
                      Doorstep Security OTP
                    </span>
                    <span className="text-[10px] bg-[#feef30] text-[#173612] font-black px-2 py-0.5 rounded-full border border-[#173612]/20">
                      Strict Verification
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-[#0F240B] mt-0.5">
                    {currentOrder.deliveryOtp}
                  </p>
                  <p className="text-[11px] text-[#2E6125]">
                    Share with rider only after safely verifying your chilled package.
                  </p>
                </div>
              </div>

              <a
                href={whatsappOtpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#173612] hover:bg-[#0F240B] text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 shrink-0"
              >
                <MessageCircle className="w-4 h-4 text-[#feef30]" />
                <span>Send to WhatsApp</span>
              </a>
            </div>

            {/* Assigned Rider Card (if dispatched) */}
            {currentOrder.riderName && (
              <div className="p-5 bg-white rounded-3xl border border-[#EAF3E4] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F5FAF0] border border-[#CBE0A3] flex items-center justify-center text-xl shrink-0">
                    🛵
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#43670F]">
                      Organic Courier Partner
                    </span>
                    <h4 className="text-sm font-bold text-[#0F240B]">
                      {currentOrder.riderName}
                    </h4>
                    <p className="text-xs text-[#173612]/70 font-mono">
                      {currentOrder.riderPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${currentOrder.riderPhone}`}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#173612] hover:bg-[#0F240B] text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Courier</span>
                  </a>

                  {whatsappRiderPinUrl && (
                    <a
                      href={whatsappRiderPinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#ECF5DE] hover:bg-[#E2F0CF] text-[#173612] border border-[#CBE0A3] rounded-xl text-xs font-bold transition"
                      title="Share live location pin via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Share Pin</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Address & Order Details Summary */}
            <div className="p-5 bg-[#F5FAF0] rounded-3xl border border-[#CBE0A3] shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0F240B]">
                Order & Destination Details
              </h4>
              <p className="text-xs text-[#173612] leading-relaxed">
                <strong className="text-[#0F240B]">Address:</strong> {currentOrder.customer.address}
              </p>
              {currentOrder.customer.deliveryInstructions && (
                <p className="text-xs text-[#385A2A] italic">
                  <strong>Instructions:</strong> &quot;{currentOrder.customer.deliveryInstructions}&quot;
                </p>
              )}

              <div className="pt-2 border-t border-gray-200 divide-y divide-gray-100">
                {currentOrder.items.map((it) => (
                  <div key={it.id} className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-[#0F240B]">
                        {it.quantity}x {it.menuItem.name}
                      </span>
                      {it.selectedOptions && Object.keys(it.selectedOptions).length > 0 && (
                        <p className="text-[10px] text-[#385A2A]">
                          {Object.values(it.selectedOptions).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-[#0F240B]">₹{it.itemTotal}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-[#0F240B] font-bebas text-base">
                <span>Total Paid ({currentOrder.paymentMethod})</span>
                <span>₹{currentOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* If completed, show feedback component */}
            {currentOrder.status === 'completed' && (
              <OrderCompletionFeedback
                orderId={currentOrder.id}
                initialRating={currentOrder.rating}
                initialTags={currentOrder.feedbackTags}
                initialNote={currentOrder.feedbackNote}
                onOpenBill={() => setBillOpen(true)}
              />
            )}

            {/* Full page link */}
            <div className="text-center pt-2">
              <Link
                href={`/track?token=${currentOrder.tokenId}`}
                onClick={() => setTrackingModalOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173612] hover:underline"
              >
                <span>Open Fullscreen Dedicated Tracking Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <BillModal
        order={currentOrder}
        isOpen={billOpen}
        onClose={() => setBillOpen(false)}
      />
    </>
  );
}
