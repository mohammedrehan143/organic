'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
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
  Loader2,
  AlertTriangle,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { generateWhatsAppOtpLink, generateWhatsAppLocationShareLink } from '@/lib/whatsapp';
import { BillModal } from '@/components/BillModal';
import { OrderCompletionFeedback } from '@/components/OrderCompletionFeedback';

function OrderCard({
  order,
  index,
  totalCount,
  onOpenBill,
}: {
  order: Order;
  index: number;
  totalCount: number;
  onOpenBill: (order: Order) => void;
}) {
  const stages = [
    { key: 'new', label: 'Order Received', shortLabel: 'Received', icon: Clock, desc: 'Farm dispatch alerted' },
    { key: 'preparing', label: 'Harvest Packed', shortLabel: 'Packed', icon: ChefHat, desc: 'Cold insulation' },
    { key: 'ready', label: 'Seal Verified', shortLabel: 'Verified', icon: PackageCheck, desc: 'Quality checked' },
    {
      key: 'delivering',
      label: order.deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready at Farm Hub',
      shortLabel: order.deliveryMethod === 'delivery' ? 'On Way' : 'Ready',
      icon: Bike,
      desc: order.deliveryMethod === 'delivery' ? 'Rider en route' : 'Counter ready',
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

  const currentStep = statusMap[order.status] ?? 0;

  const whatsappOtpUrl = generateWhatsAppOtpLink(
    order.customer?.phone || '',
    order.deliveryOtp,
    order.tokenId,
    order.total,
    order.customer?.name || 'Customer'
  );

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
    <div className="bg-white rounded-3xl border border-[#EAF3E4] shadow-sm overflow-hidden space-y-6 p-4 sm:p-8">
      {/* Order Top Bar with Order Index & Meta */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {totalCount > 1 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#173612] text-white">
                Order {index + 1} of {totalCount} {index === 0 ? '(Latest)' : ''}
              </span>
            )}
            <span className="text-xs font-bold uppercase tracking-widest text-[#385A2A]">
              Token #{order.tokenId}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              (ID: #{order.id})
            </span>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ECF5DE] text-[#173612] border border-[#CBE0A3]">
              {order.deliveryMethod === 'delivery' ? 'Direct Farm Delivery' : 'Farm Hub Pickup'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#0F240B] capitalize mt-1.5 font-bebas tracking-wide">
            {order.status === 'delivering'
              ? order.deliveryMethod === 'delivery'
                ? 'Courier En Route'
                : 'Ready At Farm Hub'
              : order.status === 'ready'
              ? 'Cold-Packaged & Sealed'
              : order.status === 'preparing'
              ? 'Fresh Bottling & Packing'
              : order.status === 'completed'
              ? 'Delivered & Enjoyed'
              : 'Order Confirmed'}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#173612]/80 mt-1">
            {formattedDate && (
              <span>Placed: <strong>{formattedDate}</strong></span>
            )}
            <span>•</span>
            <span>
              Delivery Window: <strong className="text-[#0F240B] font-bold">{order.estimatedTime}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => onOpenBill(order)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border-2 border-gray-200 hover:bg-[#F5FAF0] text-[#173612] text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4 text-[#173612]" />
          <span>Print 80mm Bill Receipt</span>
        </button>
      </div>

      {/* 5-Stage Stepper Pipeline */}
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
                        ? 'bg-[#173612] text-white ring-4 ring-emerald-500/40 scale-110 shadow-md'
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
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#173612] flex items-center justify-center text-[#173612] shrink-0">
            <ShieldCheck className="w-8 h-8 fill-[#173612] text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#385A2A]">
                Doorstep Verification OTP
              </span>
              <span className="text-[10px] bg-[#173612] text-white font-black px-2 py-0.5 rounded-full">
                Strict DB Validation
              </span>
            </div>
            <p className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-[#0F240B] mt-1">
              {order.deliveryOtp}
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
          <MessageCircle className="w-4 h-4 text-white" />
          <span>Send to my WhatsApp</span>
        </a>
      </div>

      {/* Spot-Check & Broken Bottle Policy Banner */}
      <div className="p-4 rounded-2xl bg-[#ECF5DE] border border-[#CBE0A3] flex items-start gap-3 text-xs text-[#173612]">
        <AlertTriangle className="w-4 h-4 text-[#173612] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#0F240B]">
            On-the-Spot Inspection Policy & Glass Bottle Care
          </p>
          <p className="text-[11px] leading-relaxed text-[#173612]/90">
            When your order has arrived, please check the product carefully to confirm all items are intact. Once received and OTP is shared, no exchange or return is available. In case of glass bottle breakage or loss, a ₹200 replacement fee per bottle applies.
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
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span>₹{order.tax}</span>
          </div>
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

      {/* If completed, show feedback component */}
      {order.status === 'completed' && (
        <OrderCompletionFeedback
          orderId={order.id}
          initialRating={order.rating}
          initialTags={order.feedbackTags}
          initialNote={order.feedbackNote}
          onOpenBill={() => onOpenBill(order)}
        />
      )}
    </div>
  );
}

function TrackPageContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const phoneParam = searchParams.get('phone');

  const { orders: contextOrders } = useOrder();

  const [searchQuery, setSearchQuery] = useState(phoneParam || tokenParam || '');
  const [matchingOrders, setMatchingOrders] = useState<Order[]>([]);
  const [selectedOrderToken, setSelectedOrderToken] = useState<string>('all');
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<Order | null>(null);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch orders from API (/api/orders) and merge with contextOrders
  const executeSearch = useCallback(
    async (query: string) => {
      const q = query.trim();
      const cleanDigits = q.replace(/[^0-9]/g, '');

      setIsLoading(true);
      setHasSearched(true);

      try {
        let apiUrl = '/api/orders?limit=30';
        if (cleanDigits.length >= 4) {
          apiUrl = `/api/orders?phone=${encodeURIComponent(cleanDigits)}&limit=30`;
        } else if (q.length > 0) {
          apiUrl = `/api/orders?query=${encodeURIComponent(q)}&limit=30`;
        }

        const res = await fetch(apiUrl);
        const data = await res.json();
        const serverOrders: Order[] = data.success && Array.isArray(data.orders) ? data.orders : [];

        // Build a deduplicated map merging server orders and context orders
        const orderMap = new Map<string, Order>();

        for (const o of serverOrders) {
          orderMap.set(o.tokenId || o.id, o);
        }

        for (const o of contextOrders) {
          const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
          const tenDigit = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
          const matchesPhone =
            cleanDigits.length >= 4 &&
            (oPhone.includes(cleanDigits) || cleanDigits.includes(oPhone) || oPhone.includes(tenDigit));
          const matchesToken =
            q && (o.tokenId.toLowerCase().includes(q.toLowerCase()) || o.id.toLowerCase().includes(q.toLowerCase()));

          if (!q || matchesPhone || matchesToken) {
            if (!orderMap.has(o.tokenId || o.id)) {
              orderMap.set(o.tokenId || o.id, o);
            }
          }
        }

        let combined = Array.from(orderMap.values());

        // Precise in-memory filter if query was provided
        if (cleanDigits.length >= 4) {
          const tenDigit = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
          combined = combined.filter((o) => {
            const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
            const oTen = oPhone.length >= 10 ? oPhone.slice(-10) : oPhone;
            return (
              oPhone.includes(cleanDigits) ||
              cleanDigits.includes(oPhone) ||
              oPhone.includes(tenDigit) ||
              tenDigit.includes(oPhone) ||
              oTen === tenDigit
            );
          });
        } else if (q.length > 0) {
          const lowerQ = q.toLowerCase();
          combined = combined.filter(
            (o) =>
              o.tokenId.toLowerCase().includes(lowerQ) ||
              o.id.toLowerCase().includes(lowerQ) ||
              o.trackingCode.toLowerCase().includes(lowerQ) ||
              (o.customer?.name || '').toLowerCase().includes(lowerQ)
          );
        }

        // Sort newest first
        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setMatchingOrders(combined);
        setSelectedOrderToken('all');
      } catch (err) {
        console.error('Failed to query orders from database:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [contextOrders]
  );

  // Auto trigger on initial mount if phoneParam or tokenParam or contextOrders present
  useEffect(() => {
    if (phoneParam) {
      setSearchQuery(phoneParam);
      executeSearch(phoneParam);
    } else if (tokenParam) {
      setSearchQuery(tokenParam);
      executeSearch(tokenParam);
    } else if (contextOrders.length > 0) {
      // If no URL params, show the recent orders from context and API
      executeSearch('');
    } else {
      executeSearch('');
    }
  }, [phoneParam, tokenParam, executeSearch]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleOpenBill = (order: Order) => {
    setSelectedOrderForBill(order);
    setBillModalOpen(true);
  };

  // Determine orders to render
  const ordersToRender =
    selectedOrderToken === 'all'
      ? matchingOrders
      : matchingOrders.filter((o) => o.tokenId === selectedOrderToken || o.id === selectedOrderToken);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-5xl mx-auto space-y-8 text-[#173612]">
      {/* Title & Lookup Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ECF5DE] border border-[#CBE0A3] text-[#173612] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Live Farm Store Database Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0F240B] font-bebas tracking-tight">
          Track Your Organic Farm Orders
        </h1>
        <p className="text-xs sm:text-sm text-[#173612]/80">
          Enter your 10-digit mobile number or order token ID to view all orders linked to your phone in our live database.
        </p>

        {/* Search Input Form */}
        <form onSubmit={handleFormSubmit} className="pt-2 flex items-center justify-center gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter 10-digit phone (e.g. 98865...) or Token"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612] shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-3 rounded-2xl bg-[#173612] hover:bg-[#0F240B] text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching</span>
              </span>
            ) : (
              <span>Track Orders</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => executeSearch(searchQuery)}
            disabled={isLoading}
            className={`p-3.5 rounded-2xl bg-white border-2 border-gray-200 text-[#173612] hover:bg-[#F5FAF0] shadow-sm transition cursor-pointer ${
              isLoading ? 'animate-spin text-[#173612]' : ''
            }`}
            title="Refresh from Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>

        {/* Results summary and multi-order tabs */}
        {matchingOrders.length > 0 && (
          <div className="pt-3 space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECF5DE] border border-[#CBE0A3] text-xs text-[#173612] font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-[#173612]" />
              <span>
                Found <strong>{matchingOrders.length} {matchingOrders.length === 1 ? 'order' : 'orders'}</strong> in farm database
                {searchQuery ? ` for "${searchQuery}"` : ''}
              </span>
            </div>

            {matchingOrders.length > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedOrderToken('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    selectedOrderToken === 'all'
                      ? 'bg-[#173612] text-white border-[#173612] shadow-sm'
                      : 'bg-white text-[#173612] border-gray-200 hover:border-[#173612]'
                  }`}
                >
                  All Orders ({matchingOrders.length})
                </button>

                {matchingOrders.map((o, idx) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedOrderToken(o.tokenId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      selectedOrderToken === o.tokenId
                        ? 'bg-[#173612] text-white border-[#173612] shadow-sm'
                        : 'bg-white text-[#173612] border-gray-200 hover:border-[#173612]'
                    }`}
                  >
                    #{o.tokenId} • ₹{typeof o.total === 'number' ? o.total.toFixed(0) : o.total} ({o.status})
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#EAF3E4] shadow-sm space-y-3">
          <Loader2 className="w-8 h-8 text-[#173612] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#0F240B]">
            Querying farm database for orders...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && hasSearched && matchingOrders.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#EAF3E4] shadow-sm space-y-3">
          <Clock className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-[#0F240B]">No orders found in database</h3>
          <p className="text-xs text-[#173612]/70 max-w-md mx-auto">
            {searchQuery
              ? `We couldn't find any farm orders registered with "${searchQuery}". Please verify your 10-digit mobile number or order token ID.`
              : 'Please enter your 10-digit mobile number or order token ID in the search box above.'}
          </p>
        </div>
      )}

      {/* Order Cards Stack - ALL orders for this 1 number rendered */}
      {!isLoading && ordersToRender.length > 0 && (
        <div className="space-y-8">
          {ordersToRender.map((order, idx) => (
            <OrderCard
              key={order.id || order.tokenId}
              order={order}
              index={idx}
              totalCount={matchingOrders.length}
              onOpenBill={handleOpenBill}
            />
          ))}
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
