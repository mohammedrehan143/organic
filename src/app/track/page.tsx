'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';
import { Order } from '@/types/cafe';
import {
  Search,
  Clock,
  CheckCircle2,
  PackageCheck,
  Bike,
  Sparkles,
  Phone,
  MessageCircle,
  Printer,
  RefreshCw,
  Loader2,
  AlertTriangle,
  MapPin,
  CheckCircle,
  XCircle,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { generateWhatsAppLocationShareLink } from '@/lib/whatsapp';
import { BillModal } from '@/components/BillModal';
import { OrderCompletionFeedback } from '@/components/OrderCompletionFeedback';
import { WHATSAPP_COMMUNITY_URL } from '@/data/cafeData';

function OrderCard({
  order,
  index,
  totalCount,
  onOpenBill,
  onCancelOrder,
}: {
  order: Order;
  index: number;
  totalCount: number;
  onOpenBill: (order: Order) => void;
  onCancelOrder?: (orderId: string) => Promise<void>;
}) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isCancelled = order.status === 'cancelled';
  const isCancellable = order.status === 'new' || order.status === 'preparing';
  const isOutForDelivery = order.status === 'delivering' || order.status === 'ready';

  const stages = [
    { key: 'new', label: 'Order Placed', shortLabel: 'Placed', icon: Clock, desc: 'Farm dispatch alerted' },
    {
      key: 'delivering',
      label: order.deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready at Farm Hub',
      shortLabel: order.deliveryMethod === 'delivery' ? 'On Way' : 'Ready',
      icon: Bike,
      desc: order.deliveryMethod === 'delivery' ? 'Courier en route' : 'Counter ready',
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

  const currentStep = statusMap[order.status] ?? 0;

  const whatsappRiderPinUrl =
    order.riderPhone && order.customer
      ? generateWhatsAppLocationShareLink(
          order.riderPhone,
          order.customer.lat,
          order.customer.lng,
          order.customer.address
        )
      : '';

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  return (
    <div
      className={`bg-white rounded-3xl border shadow-sm overflow-hidden space-y-6 p-4 sm:p-8 transition-all ${
        isCancelled
          ? 'border-2 border-red-300 bg-red-50/20'
          : 'border-[#EAF3E4]'
      }`}
    >
      {/* Red Highlight Alert Banner If Order Cancelled */}
      {isCancelled && (
        <div className="bg-red-600 text-white font-black text-xs px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white animate-pulse shrink-0" />
            <span className="uppercase tracking-wider">
              ORDER CANCELLED
            </span>
          </div>
          <span className="text-[10px] bg-white text-red-700 font-bold px-2 py-0.5 rounded uppercase">
            Cancelled
          </span>
        </div>
      )}

      {/* Order Top Bar with Order Index & Meta */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {totalCount > 1 && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isCancelled ? 'bg-red-700 text-white' : 'bg-[#173612] text-white'
                }`}
              >
                Order {index + 1} of {totalCount} {index === 0 ? '(Latest)' : ''}
              </span>
            )}
            <span
              className={`text-xs font-bold uppercase tracking-widest ${
                isCancelled ? 'text-red-700 font-black' : 'text-[#385A2A]'
              }`}
            >
              Token #{order.tokenId}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              (ID: #{order.id})
            </span>
            <span
              className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isCancelled
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-[#ECF5DE] text-[#173612] border-[#CBE0A3]'
              }`}
            >
              {order.deliveryMethod === 'delivery' ? 'Direct Farm Delivery' : 'Farm Hub Pickup'}
            </span>
          </div>

          <h2
            className={`text-2xl sm:text-3xl font-black capitalize mt-1.5 font-bebas tracking-wide ${
              isCancelled
                ? 'text-red-600'
                : 'text-[#0F240B]'
            }`}
          >
            {isCancelled
              ? 'Order Cancelled'
              : order.status === 'completed'
              ? 'Delivered & Enjoyed'
              : order.status === 'delivering' || order.status === 'ready'
              ? order.deliveryMethod === 'delivery'
                ? 'Out for Delivery'
                : 'Ready At Farm Hub'
              : 'Order Placed'}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#173612]/80 mt-1">
            {formattedDate && (
              <span>Placed: <strong>{formattedDate}</strong></span>
            )}
          </div>

          {/* Out for Delivery Notice: Cancellation locked */}
          {isOutForDelivery && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
              <span>🔒 Cannot cancel: Order is out for delivery with our courier partner.</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Cancel Order & Print Bill */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
          {/* Customer Cancel Button (Enabled strictly before Out for Delivery) */}
          {isCancellable && onCancelOrder && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border-2 border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Cancel Order</span>
            </button>
          )}

        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
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
              <h3 className="text-xl font-black text-[#0F240B]">Cancel Order #{order.tokenId}?</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Are you sure you want to cancel this order? Once cancelled, organic farm harvest and packaging will be stopped immediately.
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 space-y-1">
              <div className="flex justify-between font-bold">
                <span>Items:</span>
                <span>{order.items?.length || 0} product(s)</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Amount:</span>
                <span>₹{typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</span>
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
                onClick={async () => {
                  if (onCancelOrder) {
                    setIsCancelling(true);
                    try {
                      await onCancelOrder(order.id);
                      setShowCancelModal(false);
                    } finally {
                      setIsCancelling(false);
                    }
                  }
                }}
                className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stepper Pipeline OR Cancelled Notice */}
      {isCancelled ? (
        <div className="px-4 py-3 bg-red-50 border-y border-red-100 flex items-start gap-2.5">
          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5 w-full">
            <p className="text-[11px] font-bold text-red-900 uppercase">Cancellation Recorded</p>
            <p className="text-[10px] text-red-700">This delivery route was aborted before dispatch.</p>
            {order.paymentStatus === 'refunded' ? (
              <div className="mt-2 text-[10px] text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 rounded-lg p-1.5 flex items-center gap-1.5 w-full">
                <CheckCircle className="w-3 h-3" />
                Refund Processed Successfully
              </div>
            ) : (
              <div className="mt-2 text-[10px] text-[#385A2A] font-bold bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 w-full">
                💳 Refund will be credited within 24-48 hrs for online payments.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
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

          <div className="relative z-10 grid grid-cols-3 gap-2">
            {stages.map((stage, idx) => {
              const isPassed = currentStep >= idx;
              const isCurrent = currentStep === idx;
              const Icon = stage.icon;

              return (
                <div key={stage.key} className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-[#173612] text-white ring-4 ring-emerald-500/40 scale-110 shadow-md'
                        : isPassed
                        ? 'bg-[#173612] text-white'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-bold mt-2 leading-tight ${
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
    )}

      {/* Spot-Check & Broken Bottle Policy Banner */}
      <div className="p-4 rounded-2xl bg-[#ECF5DE] border border-[#CBE0A3] flex items-start gap-3 text-xs text-[#173612]">
        <AlertTriangle className="w-4 h-4 text-[#173612] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#0F240B]">
            On-the-Spot Inspection Policy & Glass Bottle Care
          </p>
          <p className="text-[11px] leading-relaxed text-[#173612]/90">
            When your order has arrived, please check the product carefully to confirm all items are intact. Once received and verified with our courier partner, no exchange or return is available. In case of glass bottle breakage or loss, please contact our helpline immediately for assistance.
          </p>
        </div>
      </div>

      {/* Assigned Courier Partner Card */}
      {order.riderName && (
        <div className="p-5 sm:p-6 bg-[#F5FAF0] rounded-3xl border border-[#CBE0A3] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#CBE0A3] flex items-center justify-center text-xl shrink-0">
              🛵
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#385A2A]">
                Designated Courier Partner
              </span>
              <h4 className="text-base font-bold text-[#0F240B]">
                {order.riderName}
              </h4>
              <p className="text-xs text-[#173612]/70 font-mono">
                {order.riderPhone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href={`tel:${order.riderPhone}`}
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
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-[#0F240B]">
          Order Summary & Destination
        </h4>

        <div className="p-4 bg-[#F5FAF0] rounded-2xl border border-[#CBE0A3] text-xs text-[#173612] space-y-1.5">
          <p>
            <strong className="text-[#0F240B]">Delivery To:</strong> {order.customer?.name} ({order.customer?.phone})
          </p>
          <p>
            <strong className="text-[#0F240B]">Destination Address:</strong> {order.customer?.address}
          </p>
          {order.customer?.deliveryInstructions && (
            <p className="text-[#385A2A] italic">
              <strong>Notes:</strong> &quot;{order.customer.deliveryInstructions}&quot;
            </p>
          )}
        </div>

        <div className="divide-y divide-gray-100 pt-2">
          {order.items?.map((ci, itemIdx) => {
            const itemName = ci.menuItem?.name || (ci as any).name || 'Organic Farm Product';
            return (
              <div key={ci.id || itemIdx} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-[#0F240B]">
                    {ci.quantity}x {itemName}
                  </span>
                  {ci.selectedOptions && Object.keys(ci.selectedOptions).length > 0 && (
                    <p className="text-[10px] text-[#385A2A] mt-0.5">
                      {Object.values(ci.selectedOptions).join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-bold text-[#0F240B]">₹{ci.itemTotal}</span>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-gray-200 space-y-1.5 text-xs text-[#173612]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className={order.deliveryFee === 0 ? 'text-emerald-700 font-bold' : ''}>
              {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
            </span>
          </div>
          {order.tax > 0 && (
            <div className="flex justify-between">
              <span>GST</span>
              <span>₹{order.tax}</span>
            </div>
          )}
          {order.tip > 0 && (
            <div className="flex justify-between">
              <span>Rider Tip</span>
              <span>₹{order.tip}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-[#0F240B] pt-2 border-t border-gray-200 font-bebas text-lg">
            <span>Total Paid ({order.paymentMethod?.toUpperCase()})</span>
            <span>₹{typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</span>
          </div>
        </div>
      </div>

      {/* Payment Bill available once payment received + admin sent it */}
      {order.paymentStatus === 'paid' && order.billApproved && (
        <button
          onClick={() => onOpenBill(order)}
          className="w-full py-3.5 bg-[#173612] hover:bg-[#0F240B] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>View / Print Payment Bill</span>
        </button>
      )}

      {/* If completed, show feedback component */}
      {order.status === 'completed' && (
        <OrderCompletionFeedback
          orderId={order.id}
          initialRating={order.rating}
          initialTags={order.feedbackTags}
          initialNote={order.feedbackNote}
          onOpenBill={order.paymentStatus === 'paid' && order.billApproved ? () => onOpenBill(order) : undefined}
        />
      )}
    </div>
  );
}

function TrackPageContent() {
  const { orders: liveOrders } = useOrder();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const phoneParam = searchParams.get('phone');

  const [searchQuery, setSearchQuery] = useState(phoneParam || tokenParam || '');
  const [searchedPhone, setSearchedPhone] = useState('');
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<Order | null>(null);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Stable search function: queries membership and customer orders strictly for the provided input
  const executeSearch = useCallback(async (query: string, silent = false) => {
    const q = query.trim();
    if (!q) return;

    const cleanDigits = q.replace(/[^0-9]/g, '');
    const isPhoneSearch = cleanDigits.length >= 10;

    if (!silent) {
      setIsLoading(true);
    }
    setHasSearched(true);
    setSearchedPhone(isPhoneSearch ? cleanDigits.slice(-10) : '');

    try {
      if (typeof window !== 'undefined' && isPhoneSearch) {
        sessionStorage.setItem('zafiroo_tracked_phone', cleanDigits.slice(-10));
      }

      // 1. If 10-digit phone, lookup customer orders
      if (isPhoneSearch) {
        const phoneTen = cleanDigits.slice(-10);

        const ordRes = await fetch(`/api/orders?phone=${encodeURIComponent(phoneTen)}&limit=50`);

        if (ordRes.ok) {
          const ordData = await ordRes.json();
          if (ordData.success && Array.isArray(ordData.orders)) {
            const list: Order[] = ordData.orders;
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            // Merge on silent polls (never wipe visible cards); replace on fresh search
            setCustomerOrders((prev) => {
              if (!silent) return list;
              const map = new Map<string, Order>();
              for (const o of prev) map.set(o.id, o);
              for (const o of list) map.set(o.id, o);
              return Array.from(map.values())
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            });
          } else if (!silent) {
            setCustomerOrders([]);
          }
        } else if (!silent) {
          setCustomerOrders([]);
        }
      } else {
        // Search by Token ID or Order ID
        const ordRes = await fetch(`/api/orders?token=${encodeURIComponent(q)}&limit=10`);
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          if (ordData.success && Array.isArray(ordData.orders)) {
            setCustomerOrders((prev) => {
              if (!silent) return ordData.orders;
              const map = new Map<string, Order>();
              for (const o of prev) map.set(o.id, o);
              for (const o of ordData.orders) map.set(o.id, o);
              return Array.from(map.values())
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            });
          } else if (!silent) {
            setCustomerOrders([]);
          }
        } else if (!silent) {
          setCustomerOrders([]);
        }
      }
    } catch (err) {
      console.error('Failed to query customer profile and orders:', err);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  // Single mount effect (never re-runs unless URL params change, preventing screen blinking)
  useEffect(() => {
    if (phoneParam) {
      setSearchQuery(phoneParam);
      executeSearch(phoneParam);
    } else if (tokenParam) {
      setSearchQuery(tokenParam);
      executeSearch(tokenParam);
    } else {
      const savedPhone = typeof window !== 'undefined' ? sessionStorage.getItem('zafiroo_tracked_phone') : null;
      if (savedPhone) {
        setSearchQuery(savedPhone);
        executeSearch(savedPhone);
      }
    }
  }, [phoneParam, tokenParam, executeSearch]);

  // Real-time synchronization: sync any live updates from OrderContext into our local customerOrders state
  useEffect(() => {
    if (customerOrders.length === 0 || liveOrders.length === 0) return;

    setCustomerOrders((prev) => {
      let hasChanges = false;
      const updated = prev.map((order) => {
        const live = liveOrders.find((lo) => lo.id === order.id || lo.tokenId === order.tokenId);
        if (live) {
          // Compare relevant fields that might change
          if (
            live.status !== order.status ||
            live.paymentStatus !== order.paymentStatus ||
            live.riderName !== order.riderName ||
            live.riderPhone !== order.riderPhone
          ) {
            hasChanges = true;
            return { ...order, ...live };
          }
        }
        return order;
      });
      return hasChanges ? updated : prev;
    });
  }, [liveOrders]);

  // Fallback Polling: Ensure customer orders are fresh even if WebSocket RLS blocks anonymous users
  useEffect(() => {
    if (!searchQuery || !hasSearched) return;
    const timer = setInterval(() => {
      executeSearch(searchQuery, true);
    }, 5000);
    return () => clearInterval(timer);
  }, [searchQuery, hasSearched, executeSearch]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleOpenBill = (order: Order) => {
    setSelectedOrderForBill(order);
    setBillModalOpen(true);
  };

  // Filter current active orders vs delivered past orders vs cancelled orders
  const activeOrders = customerOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const cancelledOrders = customerOrders.filter((o) => o.status === 'cancelled');
  const completedOrders = customerOrders.filter((o) => o.status === 'completed');

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Cannot cancel this order. It may already be out for delivery.');
        return;
      }

      setCustomerOrders((prev) =>
        prev.map((o) => (o.id === orderId || o.tokenId === orderId ? { ...o, status: 'cancelled' } : o))
      );
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Network error while cancelling order.');
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-5xl mx-auto space-y-8 text-[#173612]">
      {/* Title & Lookup Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ECF5DE] border border-[#CBE0A3] text-[#173612] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Customer Portal & Order Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0F240B] font-bebas tracking-tight">
          Track Your Farm Orders
        </h1>
        <p className="text-xs sm:text-sm text-[#173612]/80">
          Enter your 10-digit mobile number or Token ID to check your live order status and delivery tracking.
        </p>

        {/* Search Input Form */}
        <form onSubmit={handleFormSubmit} className="pt-2 flex items-center justify-center gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter 10-digit mobile number (or Token ID)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612] shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3.5 rounded-2xl bg-[#173612] hover:bg-[#0F240B] text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </span>
            ) : (
              <span>Check Profile</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => executeSearch(searchQuery)}
            disabled={isLoading}
            className={`p-3.5 rounded-2xl bg-white border-2 border-gray-200 text-[#173612] hover:bg-[#F5FAF0] shadow-sm transition cursor-pointer ${
              isLoading ? 'animate-spin text-[#173612]' : ''
            }`}
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>

        {/* WhatsApp Community Quick Join Banner */}
        <div className="max-w-lg mx-auto p-3.5 sm:p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#0F240B]">
                Zafiroo WhatsApp Community
              </h4>
              <p className="text-[11px] text-[#2E6125]">
                Daily milk batch arrivals & delivery notices direct to members.
              </p>
            </div>
          </div>
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-black uppercase tracking-wider transition text-center shrink-0 active:scale-95 cursor-pointer shadow-xs"
          >
            Join Community
          </a>
        </div>
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#EAF3E4] shadow-sm space-y-3">
          <Loader2 className="w-8 h-8 text-[#173612] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#0F240B]">
            Loading your orders...
          </p>
        </div>
      )}

      {/* ORDERS SECTION */}
      {!isLoading && hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <h3 className="text-xl sm:text-2xl font-black text-[#0F240B] font-bebas uppercase tracking-wide flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[#173612]" />
              <span>Current Active Orders ({activeOrders.length})</span>
            </h3>
            {customerOrders.length > 0 && (
              <span className="text-xs text-[#2E6125] font-bold">
                {customerOrders.length} {customerOrders.length === 1 ? 'Order' : 'Orders'} on Record
              </span>
            )}
          </div>

          {activeOrders.length === 0 && cancelledOrders.length === 0 ? (
            <div className="p-8 sm:p-12 bg-white rounded-3xl border border-[#EAF3E4] text-center space-y-3 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-[#0F240B] text-base">
                No active orders in transit
              </h4>
              <p className="text-xs text-[#173612]/70 max-w-md mx-auto">
                {completedOrders.length > 0
                  ? 'All previous orders have been completed and delivered! You can inspect your past orders below.'
                  : `No orders are currently placed for ${searchedPhone ? `+91 ${searchedPhone}` : searchQuery}. Place an order from our farm store to track it live here.`}
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#173612] hover:bg-[#0F240B] text-white font-bold text-xs rounded-full shadow-md transition"
              >
                <span>Shop Fresh Milk &amp; Eggs</span>
              </Link>
            </div>
          ) : activeOrders.length > 0 ? (
            <div className="space-y-6">
              {activeOrders.map((order, idx) => (
                <OrderCard
                  key={order.id || order.tokenId}
                  order={order}
                  index={idx}
                  totalCount={activeOrders.length}
                  onOpenBill={handleOpenBill}
                  onCancelOrder={handleCancelOrder}
                />
              ))}
            </div>
          ) : null}

          {/* Dedicated Cancelled Orders Section */}
          {cancelledOrders.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between pb-1">
                <h4 className="text-sm font-black uppercase tracking-wider text-red-700 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Cancelled Orders ({cancelledOrders.length})</span>
                </h4>
                <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                  Cancelled
                </span>
              </div>

              <div className="space-y-6">
                {cancelledOrders.map((order, idx) => (
                  <OrderCard
                    key={order.id || order.tokenId}
                    order={order}
                    index={idx}
                    totalCount={cancelledOrders.length}
                    onOpenBill={handleOpenBill}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. PAST DELIVERED ORDERS SECTION */}
          {completedOrders.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-black uppercase tracking-wider text-[#0F240B] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Past Delivered Deliveries ({completedOrders.length})</span>
              </h4>

              <div className="space-y-3">
                {completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#0F240B]">#{order.tokenId}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Delivered & Enjoyed
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">
                        {order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                      </p>
                      <p className="font-bold text-[#0F240B] mt-0.5">
                        Total Paid: ₹{typeof order.total === 'number' ? order.total.toFixed(2) : order.total} ({order.paymentMethod})
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bill Receipt Modal */}
      <BillModal
        order={selectedOrderForBill}
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
