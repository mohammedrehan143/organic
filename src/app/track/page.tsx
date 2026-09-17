'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useOrder } from '@/context/OrderContext';
import { useSearchParams } from 'next/navigation';
import { Order } from '@/types/cafe';
import {
  Search,
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
  RefreshCw,
} from 'lucide-react';
import { generateWhatsAppOtpLink, generateWhatsAppLocationShareLink } from '@/lib/whatsapp';
import { BillModal } from '@/components/BillModal';
import { OrderCompletionFeedback } from '@/components/OrderCompletionFeedback';

function TrackPageContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const phoneParam = searchParams.get('phone');

  const { orders } = useOrder();

  const [searchQuery, setSearchQuery] = useState(tokenParam || phoneParam || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [matchingOrders, setMatchingOrders] = useState<Order[]>([]);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search logic
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSelectedOrder(orders[0] || null);
      setMatchingOrders([]);
      return;
    }

    const q = query.trim().toLowerCase();
    const cleanDigits = q.replace(/[^0-9]/g, '');

    const matches = orders.filter((o) => {
      if (o.id.toLowerCase() === q) return true;
      if (o.tokenId.toLowerCase() === q) return true;
      if (o.trackingCode.toLowerCase() === q) return true;
      if (cleanDigits.length >= 4 && o.customer.phone.replace(/[^0-9]/g, '').includes(cleanDigits)) {
        return true;
      }
      return false;
    });

    setMatchingOrders(matches);
    if (matches.length > 0) {
      setSelectedOrder(matches[0]);
    } else {
      setSelectedOrder(null);
    }
  };

  useEffect(() => {
    if (tokenParam) {
      handleSearch(tokenParam);
    } else if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, [tokenParam, orders]);

  // Keep selectedOrder in sync with orders list
  useEffect(() => {
    if (selectedOrder) {
      const refreshed = orders.find((o) => o.id === selectedOrder.id || o.tokenId === selectedOrder.tokenId);
      if (refreshed && JSON.stringify(refreshed) !== JSON.stringify(selectedOrder)) {
        setSelectedOrder(refreshed);
      }
    }
  }, [orders, selectedOrder]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 5-Stage Stepper calculation
  const stages = [
    { key: 'new', label: 'Order Received', shortLabel: 'Received', icon: Clock, desc: 'Farm dispatch alerted' },
    { key: 'preparing', label: 'Fresh Harvest Packed', shortLabel: 'Packed', icon: ChefHat, desc: 'Cold insulation' },
    { key: 'ready', label: 'Seal Verified', shortLabel: 'Verified', icon: PackageCheck, desc: 'Quality checked' },
    {
      key: 'delivering',
      label: selectedOrder?.deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready at Farm Hub',
      shortLabel: selectedOrder?.deliveryMethod === 'delivery' ? 'On Way' : 'Ready',
      icon: Bike,
      desc: selectedOrder?.deliveryMethod === 'delivery' ? 'Rider en route' : 'Counter ready',
    },
    { key: 'completed', label: 'Delivered & Enjoyed', shortLabel: 'Delivered', icon: CheckCircle2, desc: 'Completed' },
  ];

  const statusMap: Record<string, number> = {
    new: 0,
    preparing: 1,
    ready: 2,
    delivering: 3,
    completed: 4,
    cancelled: -1,
  };

  const currentStep = selectedOrder ? (statusMap[selectedOrder.status] ?? 0) : 0;

  // WhatsApp links
  const whatsappOtpUrl = selectedOrder
    ? generateWhatsAppOtpLink(
        selectedOrder.customer.phone,
        selectedOrder.deliveryOtp,
        selectedOrder.tokenId,
        selectedOrder.total,
        selectedOrder.customer.name
      )
    : '';

  const whatsappRiderPinUrl =
    selectedOrder && selectedOrder.riderPhone
      ? generateWhatsAppLocationShareLink(
          selectedOrder.riderPhone,
          selectedOrder.customer.lat,
          selectedOrder.customer.lng,
          selectedOrder.customer.address
        )
      : '';

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-5xl mx-auto space-y-8 text-[#173612]">
      {/* Title & Lookup Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ECF5DE] border border-[#CBE0A3] text-[#173612] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Live Farm Store Logistics</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0F240B] font-bebas tracking-tight">
          Track Your Organic Farm Order
        </h1>
        <p className="text-xs sm:text-sm text-[#173612]/80">
          Enter your 10-digit mobile number or order token ID to view real-time chilled packaging & delivery progress.
        </p>

        {/* Search Input with aligned button layout */}
        <div className="pt-2 flex items-center justify-center gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Phone (e.g. 98865) or Token"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612] shadow-sm"
            />
          </div>
          <button
            onClick={handleManualRefresh}
            className={`p-3.5 rounded-2xl bg-white border-2 border-gray-200 text-[#173612] hover:bg-[#F5FAF0] shadow-sm transition ${
              isRefreshing ? 'animate-spin text-[#173612]' : ''
            }`}
            title="Refresh Order Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* If multiple orders found under same phone */}
        {matchingOrders.length > 1 && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-[#385A2A] font-bold">Active Orders:</span>
            {matchingOrders.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  selectedOrder?.id === o.id
                    ? 'bg-[#173612] text-white border-[#173612] shadow-sm'
                    : 'bg-white text-[#173612] border-gray-200 hover:border-[#173612]'
                }`}
              >
                #{o.tokenId} ({o.status})
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedOrder ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#EAF3E4] shadow-sm space-y-3">
          <Clock className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-[#0F240B]">No matching order found</h3>
          <p className="text-xs text-[#173612]/70 max-w-sm mx-auto">
            Please verify your phone number or token ID, or place a new order from our organic shop.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Status Header Card */}
          <div className="bg-white p-4 sm:p-8 rounded-3xl border border-[#EAF3E4] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-widest text-[#43670F]">
                  Token #{selectedOrder.tokenId}
                </span>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ECF5DE] text-[#173612] border border-[#CBE0A3]">
                  {selectedOrder.deliveryMethod === 'delivery' ? 'Direct Farm Delivery' : 'Farm Hub Pickup'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F240B] capitalize mt-1 font-bebas tracking-wide">
                {selectedOrder.status === 'delivering'
                  ? selectedOrder.deliveryMethod === 'delivery'
                    ? 'Courier En Route'
                    : 'Ready At Farm Hub'
                  : selectedOrder.status === 'ready'
                  ? 'Cold-Packaged & Sealed'
                  : selectedOrder.status === 'preparing'
                  ? 'Fresh Bottling & Packing'
                  : selectedOrder.status === 'completed'
                  ? 'Delivered & Enjoyed'
                  : 'Order Confirmed'}
              </h2>
              <p className="text-xs text-[#173612]/80 mt-1">
                Estimated Delivery Window:{' '}
                <strong className="text-[#0F240B] font-bold">{selectedOrder.estimatedTime}</strong>
              </p>
            </div>

            <button
              onClick={() => setBillModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border-2 border-gray-200 hover:bg-[#F5FAF0] text-[#173612] text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4 text-[#173612]" />
              <span>Print 80mm Bill Receipt</span>
            </button>
          </div>

          {/* 5-Stage Stepper Pipeline */}
          <div className="bg-white p-4 sm:p-8 rounded-3xl border border-[#EAF3E4] shadow-sm space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0F240B]">
              Fulfillment Pipeline
            </h3>

            <div className="relative pt-2 pb-1">
              <div className="absolute top-6 left-6 right-6 h-1.5 bg-gray-100 -z-0">
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
                  const Icon = stage.icon;

                  return (
                    <div key={stage.key} className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-[#173612] text-white ring-4 ring-[#feef30]/70 scale-110 shadow-md'
                            : isPassed
                            ? 'bg-[#173612] text-white'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span
                        className={`text-[9px] xs:text-[10px] sm:text-xs font-bold mt-2 leading-tight ${
                          isCurrent
                            ? 'text-[#0F240B] font-black'
                            : isPassed
                            ? 'text-[#173612]'
                            : 'text-gray-400'
                        }`}
                      >
                        <span className="hidden xs:inline">{stage.label}</span>
                        <span className="xs:hidden">{stage.shortLabel}</span>
                      </span>
                      <span className="hidden sm:block text-[9px] text-gray-500 mt-0.5">
                        {stage.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Doorstep Verification OTP Card */}
          <div className="p-4 sm:p-7 bg-[#F5FAF0] rounded-3xl border-2 border-[#CBE0A3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#feef30] border-2 border-[#173612] flex items-center justify-center text-[#173612] shrink-0">
                <ShieldCheck className="w-8 h-8 fill-[#173612] text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#385A2A]">
                    Doorstep Verification OTP
                  </span>
                  <span className="text-[10px] bg-[#feef30] text-[#173612] font-black px-2 py-0.5 rounded-full border border-[#173612]/20">
                    Strict DB Validation
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-[#0F240B] mt-1">
                  {selectedOrder.deliveryOtp}
                </p>
                <p className="text-xs text-[#173612]/80 mt-1">
                  Give this code to your courier partner only after verifying your chilled package.
                </p>
              </div>
            </div>

            <a
              href={whatsappOtpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#173612] hover:bg-[#0F240B] text-white rounded-2xl text-xs font-bold shadow-md transition active:scale-95 shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-[#feef30]" />
              <span>Send to my WhatsApp</span>
            </a>
          </div>

          {/* Assigned Rider Card */}
          {selectedOrder.riderName && (
            <div className="p-6 bg-white rounded-3xl border border-[#EAF3E4] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#F5FAF0] border border-[#CBE0A3] flex items-center justify-center text-xl shrink-0">
                  🛵
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#43670F]">
                    Designated Courier Partner
                  </span>
                  <h4 className="text-base font-bold text-[#0F240B]">
                    {selectedOrder.riderName}
                  </h4>
                  <p className="text-xs text-[#173612]/70 font-mono">
                    {selectedOrder.riderPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={`tel:${selectedOrder.riderPhone}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#173612] hover:bg-[#0F240B] text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Courier</span>
                </a>

                {whatsappRiderPinUrl && (
                  <a
                    href={whatsappRiderPinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#ECF5DE] hover:bg-[#E2F0CF] text-[#173612] border border-[#CBE0A3] rounded-xl text-xs font-bold transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#173612]" />
                    <span>Share Location Pin</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Order Details & Items Card */}
          <div className="bg-white p-4 sm:p-8 rounded-3xl border border-[#EAF3E4] shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0F240B]">
              Order Summary & Destination
            </h4>

            <div className="p-4 bg-[#F5FAF0] rounded-2xl border border-[#CBE0A3] text-xs text-[#173612] space-y-1.5">
              <p>
                <strong className="text-[#0F240B]">Delivery To:</strong> {selectedOrder.customer.name} ({selectedOrder.customer.phone})
              </p>
              <p>
                <strong className="text-[#0F240B]">Destination Address:</strong> {selectedOrder.customer.address}
              </p>
              {selectedOrder.customer.deliveryInstructions && (
                <p className="text-[#385A2A] italic">
                  <strong>Notes:</strong> &quot;{selectedOrder.customer.deliveryInstructions}&quot;
                </p>
              )}
            </div>

            <div className="divide-y divide-gray-100 pt-2">
              {selectedOrder.items.map((ci) => (
                <div key={ci.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#0F240B]">
                      {ci.quantity}x {ci.menuItem.name}
                    </span>
                    {ci.selectedOptions && Object.keys(ci.selectedOptions).length > 0 && (
                      <p className="text-[10px] text-[#385A2A] mt-0.5">
                        {Object.values(ci.selectedOptions).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-[#0F240B]">₹{ci.itemTotal}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-200 space-y-1.5 text-xs text-[#173612]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className={selectedOrder.deliveryFee === 0 ? 'text-emerald-700 font-bold' : ''}>
                  {selectedOrder.deliveryFee === 0 ? 'FREE' : `₹${selectedOrder.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹{selectedOrder.tax}</span>
              </div>
              {selectedOrder.tip > 0 && (
                <div className="flex justify-between">
                  <span>Rider Tip</span>
                  <span>₹{selectedOrder.tip}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-[#0F240B] pt-2 border-t border-gray-200 font-bebas text-lg">
                <span>Total Paid ({selectedOrder.paymentMethod})</span>
                <span>₹{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* If completed, show feedback component */}
          {selectedOrder.status === 'completed' && (
            <OrderCompletionFeedback
              orderId={selectedOrder.id}
              initialRating={selectedOrder.rating}
              initialTags={selectedOrder.feedbackTags}
              initialNote={selectedOrder.feedbackNote}
              onOpenBill={() => setBillModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* Bill Receipt Modal */}
      <BillModal
        order={selectedOrder}
        isOpen={billModalOpen}
        onClose={() => setBillModalOpen(false)}
      />
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#173612]">Loading order tracker...</div>}>
      <TrackPageContent />
    </Suspense>
  );
}
