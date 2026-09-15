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
  ChevronRight,
  Store,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { generateWhatsAppOtpLink, generateWhatsAppLocationShareLink } from '@/lib/whatsapp';
import { BillModal } from '@/components/BillModal';
import { OrderCompletionFeedback } from '@/components/OrderCompletionFeedback';

function TrackPageContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const phoneParam = searchParams.get('phone');

  const { orders, findOrderByIdOrPhone } = useOrder();

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
    { key: 'new', label: 'Order Received', icon: Clock, desc: 'Kitchen notified' },
    { key: 'preparing', label: 'Chef Preparing', icon: ChefHat, desc: 'Crafting fresh' },
    { key: 'ready', label: 'Thermal Packaged', icon: PackageCheck, desc: 'Heat-locked' },
    {
      key: 'delivering',
      label: selectedOrder?.deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready at Counter',
      icon: Bike,
      desc: selectedOrder?.deliveryMethod === 'delivery' ? 'Courier en route' : 'Counter ready',
    },
    { key: 'completed', label: 'Delivered & Enjoyed', icon: CheckCircle2, desc: 'Complete' },
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
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
      {/* Title & Lookup Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cream-100 border border-banhmi-gold/30 text-banhmi-red text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Live Kitchen Logistics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-espresso-950 tracking-tight">
          Track Your Artisan Order
        </h1>
        <p className="text-xs sm:text-sm text-espresso-600">
          Enter your 10-digit phone number or order token ID to inspect real-time preparation and courier status.
        </p>

        {/* Search Input */}
        <div className="pt-2 flex items-center justify-center gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-espresso-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Phone (e.g. 98865) or Token"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-cream-300 bg-white text-xs text-espresso-900 focus:outline-none focus:border-banhmi-red shadow-sm"
            />
          </div>
          <button
            onClick={handleManualRefresh}
            className={`p-3 rounded-2xl bg-white border border-cream-300 text-espresso-700 hover:bg-cream-50 shadow-sm transition ${
              isRefreshing ? 'animate-spin text-banhmi-red' : ''
            }`}
            title="Refresh Order Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* If multiple orders found under same phone */}
        {matchingOrders.length > 1 && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-espresso-600 font-semibold">Active Orders:</span>
            {matchingOrders.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                  selectedOrder?.id === o.id
                    ? 'bg-banhmi-red text-cream-50 border-banhmi-red shadow-sm'
                    : 'bg-white text-espresso-800 border-cream-300 hover:border-banhmi-gold'
                }`}
              >
                #{o.tokenId} ({o.status})
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedOrder ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-cream-200 shadow-warm-sm space-y-3">
          <Clock className="w-10 h-10 text-espresso-400 mx-auto" />
          <h3 className="text-base font-bold text-espresso-900">No matching order found</h3>
          <p className="text-xs text-espresso-600 max-w-sm mx-auto">
            Please verify your phone number or token ID, or place a new order from our artisan menu.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Status Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-widest text-banhmi-gold">
                  Token #{selectedOrder.tokenId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cream-100 text-banhmi-red border border-cream-300">
                  {selectedOrder.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Studio Pickup'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-espresso-950 capitalize mt-1">
                {selectedOrder.status === 'delivering'
                  ? selectedOrder.deliveryMethod === 'delivery'
                    ? 'Courier En Route'
                    : 'Ready At Counter'
                  : selectedOrder.status === 'ready'
                  ? 'Therma-Core Packaged'
                  : selectedOrder.status === 'preparing'
                  ? 'Chefs Crafting'
                  : selectedOrder.status === 'completed'
                  ? 'Delivered & Enjoyed'
                  : 'Order Confirmed'}
              </h2>
              <p className="text-xs text-espresso-600 mt-1">
                Estimated Delivery Window:{' '}
                <strong className="text-espresso-900">{selectedOrder.estimatedTime}</strong>
              </p>
            </div>

            <button
              onClick={() => setBillModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cream-300 hover:bg-cream-50 text-espresso-800 text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4 text-banhmi-red" />
              <span>Print 80mm Bill Receipt</span>
            </button>
          </div>

          {/* 5-Stage Stepper Pipeline */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm-sm space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-900">
              Fulfillment Pipeline
            </h3>

            <div className="relative pt-2 pb-1">
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
                  const Icon = stage.icon;

                  return (
                    <div key={stage.key} className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-banhmi-red text-cream-50 ring-4 ring-banhmi-gold/40 scale-110 shadow-warm-md'
                            : isPassed
                            ? 'bg-banhmi-red text-cream-50'
                            : 'bg-cream-100 text-espresso-400 border border-cream-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-bold mt-2.5 leading-tight ${
                          isCurrent
                            ? 'text-banhmi-red font-black'
                            : isPassed
                            ? 'text-espresso-900'
                            : 'text-espresso-400'
                        }`}
                      >
                        {stage.label}
                      </span>
                      <span className="hidden sm:block text-[9px] text-espresso-500 mt-0.5">
                        {stage.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Doorstep Verification OTP Card */}
          <div className="p-6 sm:p-7 bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-500/10 rounded-3xl border-2 border-amber-300 shadow-warm-sm flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-900 shrink-0">
                <ShieldCheck className="w-8 h-8 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-900">
                    Doorstep Verification OTP
                  </span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-950 font-bold px-2 py-0.5 rounded-full">
                    Strict DB Validation
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-espresso-950 mt-1">
                  {selectedOrder.deliveryOtp}
                </p>
                <p className="text-xs text-espresso-700 mt-1">
                  Give this code to your courier partner only when handing over the package.
                </p>
              </div>
            </div>

            <a
              href={whatsappOtpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-sm transition active:scale-95 shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send to my WhatsApp</span>
            </a>
          </div>

          {/* Assigned Rider Card */}
          {selectedOrder.riderName && (
            <div className="p-6 bg-white rounded-3xl border border-cream-200 shadow-warm-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-banhmi-card border border-banhmi-gold/40 flex items-center justify-center text-xl shrink-0">
                  🛵
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-banhmi-gold">
                    Designated Courier Partner
                  </span>
                  <h4 className="text-base font-bold text-espresso-950">
                    {selectedOrder.riderName}
                  </h4>
                  <p className="text-xs text-espresso-600 font-mono">
                    {selectedOrder.riderPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={`tel:${selectedOrder.riderPhone}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Courier</span>
                </a>

                {whatsappRiderPinUrl && (
                  <a
                    href={whatsappRiderPinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Share Location Pin</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Order Details & Items Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-espresso-900">
              Order Summary & Destination
            </h4>

            <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 text-xs text-espresso-800 space-y-1">
              <p>
                <strong>Delivery To:</strong> {selectedOrder.customer.name} ({selectedOrder.customer.phone})
              </p>
              <p>
                <strong>1-Line Destination:</strong> {selectedOrder.customer.address}
              </p>
              {selectedOrder.customer.deliveryInstructions && (
                <p className="text-espresso-600 italic">
                  <strong>Notes:</strong> &quot;{selectedOrder.customer.deliveryInstructions}&quot;
                </p>
              )}
            </div>

            <div className="divide-y divide-cream-100 pt-2">
              {selectedOrder.items.map((ci) => (
                <div key={ci.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-espresso-950">
                      {ci.quantity}x {ci.menuItem.name}
                    </span>
                    {ci.selectedOptions && Object.keys(ci.selectedOptions).length > 0 && (
                      <p className="text-[10px] text-espresso-500 mt-0.5">
                        {Object.values(ci.selectedOptions).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-espresso-900">₹{ci.itemTotal}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-cream-200 space-y-1 text-xs text-espresso-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : `₹${selectedOrder.deliveryFee}`}</span>
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
              <div className="flex justify-between text-base font-black text-espresso-950 pt-2 border-t border-cream-200">
                <span>Total Paid ({selectedOrder.paymentMethod})</span>
                <span className="text-banhmi-red">₹{selectedOrder.total.toFixed(2)}</span>
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
    <Suspense fallback={<div className="p-12 text-center text-xs text-espresso-600">Loading order tracker...</div>}>
      <TrackPageContent />
    </Suspense>
  );
}
