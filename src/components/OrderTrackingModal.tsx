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
    setActiveTrackingOrder,
  } = useOrder();

  const [billOpen, setBillOpen] = useState(false);

  if (!trackingModalOpen || !activeTrackingOrder) return null;

  const currentOrder =
    orders.find((o) => o.id === activeTrackingOrder.id || o.tokenId === activeTrackingOrder.tokenId) ||
    activeTrackingOrder;

  // 5-Stage Stepper calculation
  const stages = [
    { key: 'new', label: 'Order Received', icon: Clock, desc: 'Sent to artisan kitchen' },
    { key: 'preparing', label: 'Chef Preparing', icon: ChefHat, desc: 'Crafting fresh ingredients' },
    { key: 'ready', label: 'Thermal Packaged', icon: PackageCheck, desc: 'Sealed for peak heat' },
    {
      key: 'delivering',
      label: currentOrder.deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready at Counter',
      icon: Bike,
      desc: currentOrder.deliveryMethod === 'delivery' ? 'Rider heading to you' : 'Pickup at Studio Counter',
    },
    { key: 'completed', label: 'Delivered & Enjoyed', icon: CheckCircle2, desc: 'Bon appétit!' },
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
        <div
          className="relative w-full max-w-2xl my-8 bg-banhmi-bg rounded-3xl shadow-2xl border border-cream-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-cream-200 bg-white/70 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-banhmi-card border border-banhmi-gold/40 flex items-center justify-center">
                <Bike className="w-5 h-5 text-banhmi-red" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-espresso-950">
                    Live Order Tracking
                  </h2>
                  <span className="text-xs bg-banhmi-red text-cream-50 font-mono font-bold px-2.5 py-0.5 rounded-full">
                    #{currentOrder.tokenId}
                  </span>
                </div>
                <p className="text-xs text-espresso-600">
                  Estimated Delivery: <strong>{currentOrder.estimatedTime}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBillOpen(true)}
                className="p-2 rounded-xl hover:bg-cream-100 text-espresso-700 transition flex items-center gap-1 text-xs font-semibold border border-cream-300"
                title="Print Thermal Bill"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Bill</span>
              </button>
              <button
                onClick={() => setTrackingModalOpen(false)}
                className="p-2 rounded-full hover:bg-cream-100 text-espresso-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* 5-Stage Stepper Pipeline */}
            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-900">
                  Fulfillment Pipeline
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cream-100 text-banhmi-red border border-cream-300 capitalize">
                  {currentOrder.status}
                </span>
              </div>

              <div className="relative pt-2 pb-1">
                {/* Horizontal Progress bar */}
                <div className="absolute top-6 left-6 right-6 h-1 bg-cream-200 -z-0">
                  <div
                    className="h-full bg-banhmi-red transition-all duration-500 rounded-full"
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
                              ? 'bg-banhmi-red text-cream-50 ring-4 ring-banhmi-gold/40 scale-110 shadow-warm-md'
                              : isPassed
                              ? 'bg-banhmi-red text-cream-50'
                              : 'bg-cream-100 text-espresso-400 border border-cream-300'
                          }`}
                        >
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-bold mt-2 leading-tight ${
                            isCurrent ? 'text-banhmi-red' : isPassed ? 'text-espresso-900' : 'text-espresso-400'
                          }`}
                        >
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Doorstep Verification OTP Card */}
            <div className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-500/10 rounded-3xl border-2 border-amber-300 shadow-warm-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-900 shrink-0">
                  <ShieldCheck className="w-7 h-7 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-900">
                      Doorstep Security OTP
                    </span>
                    <span className="text-[10px] bg-amber-200/70 text-amber-950 font-bold px-2 py-0.5 rounded-full">
                      Strict Verification
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-espresso-950 mt-0.5">
                    {currentOrder.deliveryOtp}
                  </p>
                  <p className="text-[11px] text-espresso-600">
                    Share with rider only after safely taking custody of your package.
                  </p>
                </div>
              </div>

              <a
                href={whatsappOtpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send to my WhatsApp</span>
              </a>
            </div>

            {/* Assigned Rider Card (if dispatched) */}
            {currentOrder.riderName && (
              <div className="p-5 bg-white rounded-3xl border border-cream-200 shadow-warm-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-banhmi-card border border-banhmi-gold/40 flex items-center justify-center text-banhmi-red shrink-0 font-bold">
                    🛵
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-banhmi-gold">
                      Artisan Courier Partner
                    </span>
                    <h4 className="text-sm font-bold text-espresso-950">
                      {currentOrder.riderName}
                    </h4>
                    <p className="text-xs text-espresso-600 font-mono">
                      {currentOrder.riderPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${currentOrder.riderPhone}`}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Courier</span>
                  </a>

                  {whatsappRiderPinUrl && (
                    <a
                      href={whatsappRiderPinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition"
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
            <div className="p-5 bg-white rounded-3xl border border-cream-200 shadow-warm-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-espresso-900">
                Order & Destination Details
              </h4>
              <p className="text-xs text-espresso-800 leading-relaxed">
                <strong>Address:</strong> {currentOrder.customer.address}
              </p>
              {currentOrder.customer.deliveryInstructions && (
                <p className="text-xs text-espresso-600 italic">
                  <strong>Instructions:</strong> &quot;{currentOrder.customer.deliveryInstructions}&quot;
                </p>
              )}

              <div className="pt-2 border-t border-cream-100 divide-y divide-cream-100">
                {currentOrder.items.map((it) => (
                  <div key={it.id} className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-espresso-900">
                        {it.quantity}x {it.menuItem.name}
                      </span>
                      {it.selectedOptions && Object.keys(it.selectedOptions).length > 0 && (
                        <p className="text-[10px] text-espresso-500">
                          {Object.values(it.selectedOptions).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-espresso-950">₹{it.itemTotal}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-cream-200 flex justify-between text-sm font-bold text-espresso-950">
                <span>Total Paid ({currentOrder.paymentMethod})</span>
                <span className="text-banhmi-red">₹{currentOrder.total.toFixed(2)}</span>
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
                className="inline-flex items-center gap-1.5 text-xs font-bold text-banhmi-red hover:underline"
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
