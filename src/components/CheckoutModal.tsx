'use client';

import React, { useState, useEffect } from 'react';
import { useOrder } from '@/context/OrderContext';
import { CAFE_METADATA } from '@/data/cafeData';
import {
  getCurrentLocationAddress,
  formatFullOneLineAddress,
  searchAddressQuery,
  AddressSuggestion,
} from '@/lib/location';
import {
  X,
  MapPin,
  Navigation,
  CheckCircle,
  CreditCard,
  Banknote,
  Loader2,
  Sparkles,
  Store,
  ChevronRight,
  ShieldCheck,
  Printer,
  Clock,
  Bike,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { Order } from '@/types/cafe';
import { BillModal } from './BillModal';

// Helper to load official Razorpay Checkout SDK
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function CheckoutModal() {
  const router = useRouter();
  const {
    checkoutModalOpen,
    setCheckoutModalOpen,
    cart,
    cartSubtotal,
    placeOrder,
    updateOrderStatus,
    setActiveTrackingOrder,
    userLocation,
    setUserLocation,
  } = useOrder();

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay' | 'cashfree'>('cod');
  const [coordinates, setCoordinates] = useState<{ lat?: number; lng?: number }>({});

  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMessage, setGeocodeMessage] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxOrderData, setSandboxOrderData] = useState<any>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelPlacedOrder = async () => {
    if (!placedOrder) return;
    setIsCancelling(true);
    try {
      const res = await updateOrderStatus(placedOrder.id, 'cancelled');
      if (res) {
        setPlacedOrder(res);
      } else {
        setPlacedOrder((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
      }
      setShowCancelModal(false);
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order. It may already be out for delivery.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCloseModal = () => {
    setPlacedOrder(null);
    setShowCancelModal(false);
    setCheckoutModalOpen(false);
  };

  // Auto-sync with userLocation when opened
  useEffect(() => {
    if (checkoutModalOpen && userLocation) {
      if (!line1) {
        setLine1(userLocation.formattedAddress);
        setCoordinates({ lat: userLocation.lat, lng: userLocation.lng });
      }
    }
  }, [checkoutModalOpen, userLocation]);

  if (!checkoutModalOpen) return null;

  const threshold = CAFE_METADATA.freeDeliveryThreshold;
  const isFreeDelivery = cartSubtotal >= threshold || deliveryMethod === 'pickup';
  const deliveryFee = isFreeDelivery ? 0 : CAFE_METADATA.deliveryFee;
  const tax = Math.round(cartSubtotal * CAFE_METADATA.taxRate * 100) / 100;
  const grandTotal = cartSubtotal + deliveryFee + tax;

  // Trigger GPS Geolocation
  const handleUseCurrentLocation = async () => {
    setGeocoding(true);
    setGeocodeMessage('Detecting building-level GPS precision...');
    try {
      const loc = await getCurrentLocationAddress();
      setLine1(loc.formattedAddress);
      setCoordinates({ lat: loc.lat, lng: loc.lng });

      const short = loc.suburb || loc.road || loc.building || loc.city || 'Custom Location';
      const cityPart = loc.city ? `, ${loc.city}` : '';
      setUserLocation({
        formattedAddress: loc.formattedAddress,
        shortAddress: `${short}${cityPart}`,
        road: loc.road,
        houseNumber: loc.houseNumber,
        building: loc.building,
        suburb: loc.suburb,
        city: loc.city,
        state: loc.state,
        postcode: loc.postcode,
        lat: loc.lat,
        lng: loc.lng,
      });

      setGeocodeMessage('✓ GPS location locked! Please enter your House/Flat No. & Landmark below.');
      setTimeout(() => setGeocodeMessage(''), 5000);
    } catch (err: any) {
      console.warn('Geolocation error:', err);
      setGeocodeMessage('Could not retrieve GPS coordinates. Please type address manually.');
      setTimeout(() => setGeocodeMessage(''), 4000);
    } finally {
      setGeocoding(false);
    }
  };

  // Search suggestions
  const handleLine1Change = async (val: string) => {
    setLine1(val);
    if (val.length >= 3) {
      const suggestions = await searchAddressQuery(val);
      setAddressSuggestions(suggestions);
    } else {
      setAddressSuggestions([]);
    }
  };

  const handleSelectSuggestion = (s: AddressSuggestion) => {
    setLine1(s.formatted);
    setCoordinates({ lat: s.lat, lng: s.lng });
    setAddressSuggestions([]);

    const short = s.street || s.name || s.city || 'Custom Location';
    const cityPart = s.city ? `, ${s.city}` : '';
    setUserLocation({
      formattedAddress: s.formatted,
      shortAddress: `${short}${cityPart}`,
      road: s.street,
      suburb: s.name,
      city: s.city,
      state: s.state,
      postcode: s.postcode,
      lat: s.lat,
      lng: s.lng,
    });
  };

  const completeOrderPlacement = async (
    paymentStatus: string,
    razorpayPaymentId?: string,
    razorpayOrderId?: string
  ) => {
    const finalAddress =
      deliveryMethod === 'delivery'
        ? formatFullOneLineAddress(line1, line2)
        : CAFE_METADATA.address;

    const order = await placeOrder({
      deliveryMethod,
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim() || undefined,
        address: finalAddress,
        unitOrApt: line2.trim() || undefined,
        deliveryInstructions: instructions.trim() || undefined,
        lat: coordinates.lat,
        lng: coordinates.lng,
      },
      items: cart,
      subtotal: cartSubtotal,
      deliveryFee,
      tax,
      tip: 0,
      total: grandTotal,
      estimatedTime: deliveryMethod === 'delivery' ? '25-35 min' : '12-18 min',
      paymentMethod:
        paymentMethod === 'cod'
          ? deliveryMethod === 'delivery'
            ? 'Cash on Delivery'
            : 'Pay at Counter'
          : paymentMethod === 'razorpay'
          ? 'Razorpay UPI/Cards'
          : 'Cashfree PG',
      paymentStatus,
    });

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#173612', '#FFFFFF', '#43670F', '#F7F3EC'],
      });
    } catch (e) {
      // fallback
    }

    setShowSandboxModal(false);
    setActiveTrackingOrder(order);
    setPlacedOrder(order);
    setBillModalOpen(true); // Automatically generate bill receipt after order is placed
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    if (deliveryMethod === 'delivery') {
      if (!line1.trim()) {
        setErrorMessage('Please enter your delivery street / road / locality (Line 1).');
        return;
      }

      if (!line2.trim() || line2.trim().length < 3) {
        setErrorMessage('Please enter your complete address (House/Flat No.) and Landmark (Line 2 is mandatory for delivery).');
        return;
      }
    }

    setSubmitting(true);

    try {
      // 1. Cash on delivery flow
      if (paymentMethod === 'cod') {
        await completeOrderPlacement('pending');
        return;
      }

      // 2. Razorpay payment flow
      if (paymentMethod === 'razorpay') {
        const finalAddress =
          deliveryMethod === 'delivery'
            ? formatFullOneLineAddress(line1, line2)
            : CAFE_METADATA.address;

        const rzpRes = await fetch('/api/razorpay/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: grandTotal,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            notes: {
              customer: customerName.trim(),
              phone: cleanPhone,
              address: finalAddress,
            },
          }),
        });

        const rzpData = await rzpRes.json();
        if (!rzpRes.ok || !rzpData.success) {
          throw new Error(rzpData.error || 'Failed to initialize Razorpay checkout');
        }

        // If sandbox fallback mode (keys not yet configured in .env.local)
        if (rzpData.isMock && (!rzpData.key || rzpData.key === 'rzp_test_placeholder')) {
          setSandboxOrderData(rzpData);
          setShowSandboxModal(true);
          setSubmitting(false);
          return;
        }

        // Real Razorpay Checkout SDK Flow
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error('Could not load Razorpay SDK. Please check your internet connection.');
        }

        const options = {
          key: rzpData.key,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: 'Zafiroo Organic Store',
          description: `Order Payment (${cart.length} Farm Items)`,
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=200&auto=format&fit=crop',
          order_id: rzpData.id,
          prefill: {
            name: customerName.trim(),
            contact: cleanPhone,
            email: customerEmail.trim() || 'care@zafiroo-organic.com',
          },
          notes: {
            address: finalAddress,
          },
          theme: {
            color: '#173612',
          },
          handler: async function (response: any) {
            try {
              setSubmitting(true);
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.success) {
                throw new Error(verifyData.error || 'Razorpay payment verification failed');
              }

              await completeOrderPlacement(
                'paid',
                response.razorpay_payment_id,
                response.razorpay_order_id
              );
            } catch (verErr: any) {
              setErrorMessage(verErr.message || 'Payment verification failed. Please try again.');
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            },
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.on('payment.failed', function (resp: any) {
          setErrorMessage(resp.error?.description || 'Payment was declined or failed.');
          setSubmitting(false);
        });
        razorpayInstance.open();
        return;
      }

      // 3. Cashfree or other methods
      await completeOrderPlacement('paid');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    const isCancelled = placedOrder.status === 'cancelled';
    const stages = [
      { key: 'new', label: 'Order Placed', icon: Clock },
      {
        key: 'delivering',
        label: placedOrder.deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready at Hub',
        icon: Bike,
      },
      { key: 'completed', label: 'Delivered', icon: CheckCircle2 },
    ];

    return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn text-[#173612]">
          <div
            className="relative w-full max-w-xl my-4 sm:my-8 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#EAF3E4] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-4 sm:p-5 border-b border-[#EAF3E4] ${isCancelled ? 'bg-rose-50' : 'bg-[#F5FAF0]'} flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl ${isCancelled ? 'bg-rose-100 border-2 border-rose-600 text-rose-700' : 'bg-emerald-100 border-2 border-emerald-700 text-emerald-800'} flex items-center justify-center shadow-sm shrink-0`}>
                  {isCancelled ? <XCircle className="w-6 h-6 text-rose-600" /> : <CheckCircle2 className="w-6 h-6 text-emerald-700" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0F240B] font-bebas tracking-wide">
                    {isCancelled ? 'Order Cancelled' : 'Order Placed Successfully!'}
                  </h2>
                  <p className={`text-xs ${isCancelled ? 'text-rose-700' : 'text-emerald-800'} font-semibold`}>
                    {isCancelled ? 'Cancelled prior to courier dispatch' : 'Order Details & Live Dispatch Tracking'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-gray-200/60 text-[#173612] transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Container */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
              {/* Cancelled Alert Banner */}
              {isCancelled && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 text-xs">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="block font-black text-rose-950 uppercase">Order Cancelled By Customer</strong>
                    <p>You cancelled this order before dispatch. No harvesting or doorstep delivery will take place.</p>
                    <p className="text-[#385A2A] font-bold text-[11px] bg-emerald-50 border border-emerald-200 rounded-lg p-2 mt-1">
                      💳 <strong>Refund Policy:</strong> For online payments, refunds will be given within <strong>24 to 48 hours</strong> of cancellation to your original payment source.
                    </p>
                  </div>
                </div>
              )}

              {/* Order Meta Bar */}
              <div className="p-4 rounded-2xl bg-[#ECF5DE] border border-[#CBE0A3] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#385A2A] block">
                    Order Token
                  </span>
                  <span className="text-lg font-black text-[#0F240B] font-mono">
                    #{placedOrder.tokenId}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#385A2A] block">
                    Order ID
                  </span>
                  <span className="text-xs font-bold text-[#173612] font-mono">
                    #{placedOrder.id}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#385A2A] block">
                    Estimated Delivery
                  </span>
                  <span className="text-xs font-black text-emerald-800">
                    {placedOrder.estimatedTime}
                  </span>
                </div>
              </div>

              {/* Fulfillment Pipeline */}
              <div className="p-4 rounded-2xl bg-[#F5FAF0] border border-[#CBE0A3] space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0F240B] block">
                  Live Fulfillment Status: Order Placed
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {stages.map((stage, idx) => {
                    const Icon = stage.icon;
                    const isActive = idx === 0;
                    return (
                      <div key={stage.key} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ${
                            isActive
                              ? 'bg-[#173612] text-white ring-2 ring-emerald-500'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[9px] sm:text-[10px] mt-1 font-bold ${
                            isActive ? 'text-[#0F240B]' : 'text-gray-400'
                          }`}
                        >
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer & Delivery Address */}
              <div className="p-4 rounded-2xl bg-white border border-[#EAF3E4] space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#173612] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0F240B] block">
                      {placedOrder.customer.name} ({placedOrder.customer.phone})
                    </span>
                    <p className="text-gray-600 mt-0.5">
                      {placedOrder.customer.address}
                    </p>
                    {placedOrder.customer.unitOrApt && (
                      <p className="text-[#385A2A] font-bold mt-1 text-[11px] bg-[#ECF5DE] px-2.5 py-0.5 rounded-md inline-block border border-[#CBE0A3]">
                        📍 Landmark / Flat: {placedOrder.customer.unitOrApt}
                      </p>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Method: {placedOrder.deliveryMethod === 'delivery' ? 'Direct Farm Delivery' : 'Farm Hub Pickup'}</span>
                  <span>Payment: <strong className="text-[#0F240B]">{placedOrder.paymentMethod}</strong></span>
                </div>
              </div>

              {/* Ordered Items Breakdown */}
              <div className="p-4 rounded-2xl bg-white border border-[#EAF3E4] space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#0F240B] block">
                  Items Ordered ({placedOrder.items.length})
                </span>
                <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto">
                  {placedOrder.items.map((it, idx) => {
                    const itemName = it.menuItem?.name || (it as any).name || 'Farm Item';
                    const itemPrice = it.itemTotal ?? ((it.menuItem?.priceNumber || (it as any).price || 0) * it.quantity);
                    return (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#173612] bg-[#F5FAF0] w-6 h-6 rounded-full flex items-center justify-center text-[10px] border border-[#CBE0A3]">
                            {it.quantity}x
                          </span>
                          <span className="font-semibold text-[#0F240B]">{itemName}</span>
                        </div>
                        <span className="font-bold text-[#0F240B]">
                          ₹{itemPrice.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between font-black text-sm">
                  <span>Grand Total</span>
                  <span className="text-base text-emerald-800">₹{placedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBillModalOpen(true)}
                    className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 hover:bg-[#F5FAF0] text-[#173612] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print 80mm Bill Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleCloseModal();
                      router.push(`/track?token=${placedOrder.tokenId}`);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#173612] hover:bg-[#0F240B] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bike className="w-4 h-4" />
                    <span>Live Order Tracking</span>
                  </button>
                </div>

                {!isCancelled && (
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl border-2 border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Cancel Order</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#173612] hover:bg-[#0F240B] text-white text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
                >
                  Done & Return to Farm Store
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Cancel Confirmation Modal */}
        {showCancelModal && placedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-200 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-600">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0F240B]">Cancel Order #{placedOrder.tokenId}?</h3>
                <p className="text-xs text-gray-600">
                  Are you sure you want to cancel this order? Once cancelled, organic farm harvest and packaging will be stopped immediately.
                </p>
              </div>

              {/* Refund Policy Notice */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left space-y-1">
                <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <span>💳 Online Payment Refund Note:</span>
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  For online payments, refunds will be given within <strong>24 to 48 hours</strong> of cancellation to your original payment method.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-xs font-bold text-gray-700 transition"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancelPlacedOrder}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
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

        <BillModal
          order={placedOrder}
          isOpen={billModalOpen}
          onClose={() => setBillModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn text-[#173612]">
      <div
        className="relative w-full max-w-xl my-4 sm:my-8 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#EAF3E4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAF3E4] bg-[#F5FAF0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#173612] flex items-center justify-center text-[#173612] shadow-sm">
              <Sparkles className="w-5 h-5 fill-[#173612]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0F240B] font-bebas tracking-wide">
                Zafiroo Farm Checkout
              </h2>
              <p className="text-xs text-[#2E6125] font-semibold">
                Freshly packed in temperature-controlled cold pouches
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 rounded-full hover:bg-gray-200/60 text-[#173612] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
              {errorMessage}
            </div>
          )}

          {/* Delivery Method Toggle with balanced layout */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 bg-[#F5FAF0] p-1.5 rounded-2xl border border-[#CBE0A3]">
            <button
              type="button"
              onClick={() => setDeliveryMethod('delivery')}
              className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                deliveryMethod === 'delivery'
                  ? 'bg-[#173612] text-white shadow-sm font-black'
                  : 'text-[#173612] hover:bg-white/80'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Direct Farm Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMethod('pickup')}
              className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                deliveryMethod === 'pickup'
                  ? 'bg-[#173612] text-white shadow-sm font-black'
                  : 'text-[#173612] hover:bg-white/80'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Farm Hub Pickup</span>
            </button>
          </div>

          {/* Customer Personal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0F240B]">
              Customer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#173612] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173612] mb-1">
                  Mobile Phone (10 digits) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612] shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#173612] mb-1">
                Email Address (optional)
              </label>
              <input
                type="email"
                placeholder="e.g. aarav@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612] shadow-sm"
              />
            </div>
          </div>

          {/* Delivery Address Section (if Home Delivery) */}
          {deliveryMethod === 'delivery' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0F240B]">
                  Delivery Address
                </h3>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={geocoding}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#173612] hover:bg-[#0F240B] text-white border border-[#173612]/30 rounded-xl text-[11px] font-bold transition active:scale-95 disabled:opacity-50"
                >
                  {geocoding ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 fill-white text-white" />
                  )}
                  <span>{geocoding ? 'Detecting GPS...' : 'Auto-Detect GPS'}</span>
                </button>
              </div>

              {geocodeMessage && (
                <p className="text-[11px] font-bold text-[#173612] bg-[#ECF5DE] p-2.5 rounded-xl border border-[#CBE0A3]">
                  {geocodeMessage}
                </p>
              )}

              {/* Line 1: Street / Area with auto-complete */}
              <div className="relative">
                <label className="block text-xs font-bold text-[#173612] mb-1">
                  Line 1: Street / Road / Locality *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12th Main Road, Indiranagar, Bengaluru"
                  value={line1}
                  onChange={(e) => handleLine1Change(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612] shadow-sm"
                />

                {addressSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 max-h-48 overflow-y-auto">
                    {addressSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F5FAF0] text-[#173612] flex items-center justify-between"
                      >
                        <span className="truncate font-medium">{s.formatted}</span>
                        <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Line 2: Flat / House / Landmark (Compulsory) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#173612]">
                    Line 2: House No., Flat & Landmark <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Mandatory
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Oakwood Palms, Near Sony Center / Landmark"
                  value={line2}
                  onChange={(e) => {
                    setLine2(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs font-semibold text-[#173612] focus:outline-none shadow-sm transition ${
                    errorMessage && (!line2.trim() || line2.trim().length < 3)
                      ? 'border-rose-400 ring-1 ring-rose-300 bg-rose-50/20'
                      : 'border-gray-300 focus:border-[#173612]'
                  }`}
                />
                <p className="text-[10px] text-[#385A2A] font-semibold mt-1">
                  Complete address (House / Flat No.) and a nearby Landmark are compulsory for accurate doorstep delivery.
                </p>
              </div>

              {/* 1-Line Preview Banner */}
              {(line1 || line2) && (
                <div className="p-2.5 bg-[#F5FAF0] rounded-xl border border-[#CBE0A3] text-[11px] text-[#173612]">
                  <span className="font-bold text-[#0F240B]">Delivery Destination: </span>
                  {formatFullOneLineAddress(line1, line2)}
                  {!line2.trim() && (
                    <span className="block text-rose-600 font-bold mt-1 text-[10px]">
                      ⚠️ Please enter House/Flat No. & Landmark above to complete your delivery address.
                    </span>
                  )}
                </div>
              )}

              {/* Delivery Instructions */}
              <div>
                <label className="block text-xs font-bold text-[#173612] mb-1">
                  Rider Drop Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring bell twice, leave at reception if unreachable"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612] shadow-sm"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#F5FAF0] rounded-2xl border border-[#CBE0A3] space-y-2 text-xs text-[#173612]">
              <div className="flex items-center gap-2 font-bold text-[#0F240B]">
                <Store className="w-4 h-4 text-[#173612]" />
                <span>Zafiroo Farm Hub Pickup Point</span>
              </div>
              <p className="leading-relaxed">
                <strong>Address:</strong> {CAFE_METADATA.address}
              </p>
              <p className="text-[#385A2A]">
                Operating Hours: {CAFE_METADATA.hours}. Your order will be ready at the farm counter in ~15 minutes.
              </p>
            </div>
          )}

          {/* Payment Method Selector with clean button layout */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0F240B]">
              Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                className={`p-3.5 rounded-2xl border-2 cursor-pointer flex flex-col justify-between gap-1.5 transition ${
                  paymentMethod === 'cod'
                    ? 'border-[#173612] bg-[#ECF5DE] text-[#0F240B] font-black shadow-xs'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-[#173612]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Banknote className="w-4 h-4 text-[#173612]" />
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#173612]"
                  />
                </div>
                <span className="text-xs font-bold">
                  {deliveryMethod === 'delivery' ? 'Cash on Delivery' : 'Pay at Counter'}
                </span>
              </label>

              <label
                className={`p-3.5 rounded-2xl border-2 cursor-pointer flex flex-col justify-between gap-1.5 transition ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#173612] bg-[#ECF5DE] text-[#0F240B] font-black shadow-xs'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-[#173612]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <CreditCard className="w-4 h-4 text-[#173612]" />
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="accent-[#173612]"
                  />
                </div>
                <span className="text-xs font-bold">Razorpay UPI / Cards</span>
              </label>

              <label
                className={`p-3.5 rounded-2xl border-2 cursor-pointer flex flex-col justify-between gap-1.5 transition ${
                  paymentMethod === 'cashfree'
                    ? 'border-[#173612] bg-[#ECF5DE] text-[#0F240B] font-black shadow-xs'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-[#173612]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-4 h-4 text-[#173612]" />
                  <input
                    type="radio"
                    name="payment"
                    value="cashfree"
                    checked={paymentMethod === 'cashfree'}
                    onChange={() => setPaymentMethod('cashfree')}
                    className="accent-[#173612]"
                  />
                </div>
                <span className="text-xs font-bold">Cashfree PG</span>
              </label>
            </div>
          </div>

          {/* Zafiroo Official Store Policy Notice */}
          <div className="p-4 bg-[#F5FAF0] rounded-2xl border-2 border-[#173612]/20 space-y-2 text-xs text-[#173612]">
            <div className="flex items-center gap-2 font-bold text-[#0F240B]">
              <ShieldCheck className="w-4 h-4 text-[#173612]" />
              <span className="uppercase tracking-wider">Zafiroo Delivery & Acceptance Policy:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#173612]/90 leading-relaxed list-disc pl-4 font-medium">
              <li>
                <strong>Glass Bottle Breakage:</strong> When glass bottle breaks the customer has to pay rupees 200 per bottle.
              </li>
              <li>
                <strong>Spot Verification:</strong> When your order is arrived please check the product carefully are all items available because ones you receive no exchange and return available so please check on the spot.
              </li>
              <li>
                <strong>Eggs Inspection:</strong> When your eggs order has arrived please check weather the eggs are in good condition it should not be cracked or broken please check on the spot so you can get exchange.
              </li>
              <li>
                <strong>Milk Damage Assistance:</strong> If the milk it broken you can contact directly to the Zafiroo agents so you can exchange and get fresh milk contact as soon as possible (Helpline: +91 7259635948).
              </li>
            </ul>
          </div>

          {/* Doorstep Verification Notice */}
          <div className="p-3.5 bg-[#ECF5DE] rounded-2xl border border-[#CBE0A3] flex items-start gap-2.5 text-xs text-[#173612]">
            <ShieldCheck className="w-4 h-4 text-[#173612] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#0F240B]">Doorstep Handover & Inspection</p>
              <p className="text-[11px] text-[#173612]/80 mt-0.5">
                Verify your fresh package and milk glass bottles on the spot with the courier partner upon arrival.
              </p>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="p-4 bg-[#F5FAF0] rounded-2xl border border-[#CBE0A3] space-y-2 text-xs text-[#173612]">
            <div className="flex justify-between">
              <span>Items Total ({cart.length})</span>
              <span className="font-bold text-[#0F240B]">₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : ''}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between font-black text-sm text-[#0F240B] pt-2 border-t border-gray-200 font-bebas text-base">
              <span>Grand Total</span>
              <span className="text-[#0F240B] text-xl">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order Button with dynamic label for Razorpay and COD */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 flex items-center justify-center gap-2 bg-[#173612] hover:bg-[#0F240B] text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition active:scale-[0.98] disabled:opacity-50 text-sm uppercase tracking-wider cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>
                  {paymentMethod === 'razorpay'
                    ? 'Connecting to Razorpay...'
                    : 'Confirming Order...'}
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>
                  {paymentMethod === 'razorpay'
                    ? `Pay with Razorpay • ₹${grandTotal.toFixed(2)}`
                    : `Place Order • ₹${grandTotal.toFixed(2)}`}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Razorpay Test / Sandbox Simulator Modal */}
        {showSandboxModal && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-5 text-[#173612] animate-scaleIn">
              {/* Sandbox Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0C2340] text-[#3395FF] flex items-center justify-center font-black text-lg shadow-sm">
                    R
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0C2340]">Razorpay Gateway</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                      Sandbox Simulation Mode
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSandboxModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Amount to pay */}
              <div className="p-4 rounded-2xl bg-[#F5FAF0] border border-[#CBE0A3] text-center space-y-1">
                <span className="text-xs text-[#385A2A] font-semibold uppercase tracking-wider">
                  Amount Payable
                </span>
                <div className="text-3xl font-black text-[#0F240B] font-bebas">
                  ₹{grandTotal.toFixed(2)}
                </div>
                <p className="text-[11px] text-[#173612]/80">
                  {cart.length} Farm Products • Fast cold-chain delivery
                </p>
              </div>

              {/* Info about configuration */}
              <div className="p-3 bg-[#ECF5DE] rounded-xl border border-[#CBE0A3] text-xs text-[#173612] space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-[#0F240B]">
                  <Sparkles className="w-3.5 h-3.5 text-[#173612]" />
                  Razorpay Ready for Testing
                </p>
                <p className="text-[11px] leading-relaxed text-[#173612]/80">
                  You can simulate an instant test transaction right now. When you're ready for live customer payments, just paste your <code className="font-bold bg-white px-1 py-0.5 rounded text-[#0F240B]">RAZORPAY_KEY_ID</code> and <code className="font-bold bg-white px-1 py-0.5 rounded text-[#0F240B]">RAZORPAY_KEY_SECRET</code> into <code className="font-bold bg-white px-1 py-0.5 rounded text-[#0F240B]">.env.local</code>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setSubmitting(true);
                      setShowSandboxModal(false);
                      const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                      const verifyRes = await fetch('/api/razorpay/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          razorpay_order_id: sandboxOrderData?.id || `order_test_${Date.now()}`,
                          razorpay_payment_id: mockPaymentId,
                          razorpay_signature: 'sandbox_test_sig',
                        }),
                      });
                      const verifyData = await verifyRes.json();
                      if (verifyData.success) {
                        await completeOrderPlacement('paid', mockPaymentId, sandboxOrderData?.id);
                      } else {
                        setErrorMessage('Verification failed');
                        setSubmitting(false);
                      }
                    } catch (e: any) {
                      setErrorMessage(e.message || 'Error completing simulated payment');
                      setSubmitting(false);
                    }
                  }}
                  className="w-full py-3.5 px-4 bg-[#173612] hover:bg-[#0F240B] text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Simulate Successful Payment (Instant)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSandboxModal(false);
                    setErrorMessage('Payment simulation cancelled by customer.');
                  }}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel Payment Simulation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
