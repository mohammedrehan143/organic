'use client';

import React, { useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import {
  X,
  Clock,
  CheckCircle2,
  PackageCheck,
  Bike,
  Sparkles,
  Phone,
  MessageCircle,
  Printer,
  ChevronRight,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { generateWhatsAppLocationShareLink } from '@/lib/whatsapp';
import { BillModal } from './BillModal';
import { OrderCompletionFeedback } from './OrderCompletionFeedback';
import Link from 'next/link';

export function OrderTrackingModal() {
  const {
    trackingModalOpen,
    setTrackingModalOpen,
    activeTrackingOrder,
    orders,
    updateOrderStatus,
  } = useOrder();

  const [billOpen, setBillOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!trackingModalOpen || !activeTrackingOrder) return null;

  const currentOrder =
    orders.find((o) => o.id === activeTrackingOrder.id || o.tokenId === activeTrackingOrder.tokenId) ||
    activeTrackingOrder;

  const isCancelled = currentOrder.status === 'cancelled';
  const isCancellable = currentOrder.status === 'new' || currentOrder.status === 'preparing';
  const isOutForDelivery = currentOrder.status === 'delivering' || currentOrder.status === 'ready';

  // 3-Stage Stepper calculation
  const stages = [
    { key: 'new', label: 'Order Placed', shortLabel: 'Placed', icon: Clock, desc: 'Farm dispatch alerted' },
    {
      key: 'delivering',
      label: currentOrder.deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready at Farm Hub',
      shortLabel: currentOrder.deliveryMethod === 'delivery' ? 'On Way' : 'Ready',
      icon: Bike,
      desc: currentOrder.deliveryMethod === 'delivery' ? 'Courier en route' : 'Counter ready',
    },
    { key: 'completed', label: 'Delivered & Enjoyed', shortLabel: 'Delivered', icon: CheckCircle2, desc: 'Order completed' },
  ];

  const statusMap: Record<string, number> = {
    new: 0,
    preparing: 0,
    ready: 1,
    delivering: 1,
    completed: 2,
    cancelled: -1,
  };

  const currentStep = statusMap[currentOrder.status] ?? 0;

  const whatsappRiderPinUrl = currentOrder.riderPhone
    ? generateWhatsAppLocationShareLink(
        currentOrder.riderPhone,
        currentOrder.customer.lat,
        currentOrder.customer.lng,
        currentOrder.customer.address
      )
    : '';

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await updateOrderStatus(currentOrder.id, 'cancelled');
      setShowCancelModal(false);
    } catch (err) {
      console.error('Failed to cancel order from modal:', err);
      alert('Failed to cancel order. It may already be out for delivery.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn text-[#173612]">
        <div
          className={`relative w-full max-w-2xl my-4 sm:my-8 bg-white rounded-3xl shadow-2xl overflow-hidden ${
            isCancelled ? 'border-2 border-red-300' : 'border border-[#EAF3E4]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Cancelled Banner If Order Cancelled */}
          {isCancelled && (
            <div className="bg-red-600 text-white font-black text-xs px-4 py-2.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-white animate-pulse shrink-0" />
                <span className="uppercase tracking-wider">ORDER CANCELLED BEFORE OUT FOR DELIVERY</span>
              </div>
              <span className="text-[10px] bg-white text-red-700 font-bold px-2 py-0.5 rounded uppercase">
                Cancelled
              </span>
            </div>
          )}

          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#EAF3E4] bg-[#F5FAF0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center shadow-sm ${
                  isCancelled
                    ? 'bg-red-50 border-red-500 text-red-600'
                    : 'bg-white border-[#173612] text-[#173612]'
                }`}
              >
                {isCancelled ? <XCircle className="w-5 h-5" /> : <Bike className="w-5 h-5 fill-[#173612]" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className={`text-base sm:text-lg font-black font-bebas tracking-wide ${
                      isCancelled ? 'text-red-600' : 'text-[#0F240B]'
                    }`}
                  >
                    {isCancelled ? 'Order Cancelled' : 'Live Order Tracking'}
                  </h2>
                  <span
                    className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full ${
                      isCancelled ? 'bg-red-600 text-white' : 'bg-[#173612] text-white'
                    }`}
                  >
                    #{currentOrder.tokenId}
                  </span>
                </div>

              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Cancel Button in Header (only when cancellable before Out for Delivery) */}
              {isCancellable && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition flex items-center gap-1.5 text-xs font-bold border border-rose-200 cursor-pointer"
                  title="Cancel Order"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cancel</span>
                </button>
              )}

              <button
                onClick={() => setTrackingModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200/60 text-[#173612] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
            {/* Out for Delivery Notice */}
            {isOutForDelivery && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] font-semibold text-amber-900 flex items-center gap-2">
                <span>🔒 Cancellation locked — order is out for delivery with our courier partner.</span>
              </div>
            )}

            {/* Stepper Pipeline OR Cancelled Card */}
            {isCancelled ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-900">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-red-800 text-sm">Order Cancelled Prior to Dispatch</p>
                  <p className="text-[11px] text-red-700">
                    This order was cancelled by the customer before courier handover. No delivery will take place.
                  </p>
                  <p className="text-[11px] text-[#385A2A] font-bold bg-emerald-50 border border-emerald-200 rounded-lg p-2 mt-1">
                    💳 <strong>Refund Policy:</strong> For online payments, refunds will be given within <strong>24 to 48 hours</strong> of cancellation to your original payment account.
                  </p>
                </div>
              </div>
            ) : (
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

                  <div className="relative z-10 grid grid-cols-3 gap-2">
                    {stages.map((stage, idx) => {
                      const isPassed = currentStep >= idx;
                      const isCurrent = currentStep === idx;
                      const IconComponent = stage.icon;

                      return (
                        <div key={stage.key} className="flex flex-col items-center text-center">
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-[#173612] text-white ring-4 ring-emerald-500/40 scale-110 shadow-md'
                                : isPassed
                                ? 'bg-[#173612] text-white'
                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                            }`}
                          >
                            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span
                            className={`text-[10px] sm:text-xs font-bold mt-2 leading-tight ${
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
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                <div
                  className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div className="text-center space-y-1.5">
                    <h3 className="text-xl font-black text-[#0F240B]">Cancel Order #{currentOrder.tokenId}?</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Are you sure you want to cancel this order? Once cancelled, organic farm harvest and packaging will be halted immediately.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Total Amount:</span>
                      <span>₹{typeof currentOrder.total === 'number' ? currentOrder.total.toFixed(2) : currentOrder.total}</span>
                    </div>
                  </div>

                  {/* Online Payment Refund Note */}
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left space-y-1">
                    <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span>💳 Online Payment Refund Note:</span>
                    </p>
                    <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                      For online payments, refunds will be given within <strong>24 to 48 hours</strong> of cancellation to your original payment account.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => setShowCancelModal(false)}
                      className="py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
                    >
                      Keep Order
                    </button>
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={handleConfirmCancel}
                      className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <span>Yes, Cancel</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Inspection & Glass Bottle Care Notice */}
            <div className="p-4 bg-[#F5FAF0] rounded-2xl border border-[#CBE0A3] text-xs text-[#173612] leading-relaxed">
              <p className="font-bold text-[#0F240B]">
                On-the-Spot Inspection Policy & Glass Bottle Care
              </p>
              <p className="text-[11px] text-[#2E6125] mt-0.5">
                Please inspect your items on the spot upon delivery. In case of glass bottle breakage or loss, a ₹200 replacement fee per bottle applies.
              </p>
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
