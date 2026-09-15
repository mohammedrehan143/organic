'use client';

import React, { useState } from 'react';
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
  ShoppingBag,
  Store,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

export function CheckoutModal() {
  const router = useRouter();
  const {
    checkoutModalOpen,
    setCheckoutModalOpen,
    cart,
    cartSubtotal,
    placeOrder,
    setActiveTrackingOrder,
  } = useOrder();

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [line1, setLine1] = useState(''); // Street / Area
  const [line2, setLine2] = useState(''); // Flat / House / Landmark
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay' | 'cashfree'>('cod');
  const [coordinates, setCoordinates] = useState<{ lat?: number; lng?: number }>({});

  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMessage, setGeocodeMessage] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      setGeocodeMessage('✓ Location locked with GPS precision!');
      setTimeout(() => setGeocodeMessage(''), 3000);
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

    if (deliveryMethod === 'delivery' && !line1.trim()) {
      setErrorMessage('Please enter your delivery street/address.');
      return;
    }

    setSubmitting(true);

    try {
      // 1-line seamless concatenation
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
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      });

      // Confetti burst
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4A2818', '#D4A373', '#2E1509', '#F7F3EC'],
        });
      } catch (e) {
        // fallback
      }

      setCheckoutModalOpen(false);
      setActiveTrackingOrder(order);
      router.push(`/track?token=${order.tokenId}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-xl my-8 bg-banhmi-bg rounded-3xl shadow-2xl border border-cream-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-cream-200 bg-white/70 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-banhmi-card border border-banhmi-gold/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-banhmi-red" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-espresso-900">Artisan Checkout</h2>
              <p className="text-xs text-espresso-600">Freshly crafted & thermally packaged</p>
            </div>
          </div>
          <button
            onClick={() => setCheckoutModalOpen(false)}
            className="p-2 rounded-full hover:bg-cream-100 text-espresso-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Delivery Method Toggle */}
          <div className="grid grid-cols-2 gap-3 bg-white p-1.5 rounded-2xl border border-cream-300">
            <button
              type="button"
              onClick={() => setDeliveryMethod('delivery')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${
                deliveryMethod === 'delivery'
                  ? 'bg-banhmi-red text-cream-50 shadow-sm'
                  : 'text-espresso-700 hover:bg-cream-50'
              }`}
            >
              <Navigation className="w-4 h-4" />
              Home Delivery
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMethod('pickup')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${
                deliveryMethod === 'pickup'
                  ? 'bg-banhmi-red text-cream-50 shadow-sm'
                  : 'text-espresso-700 hover:bg-cream-50'
              }`}
            >
              <Store className="w-4 h-4" />
              Studio Pickup
            </button>
          </div>

          {/* Customer Personal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-900">
              Customer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white text-xs text-espresso-900 focus:outline-none focus:border-banhmi-red shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1">
                  Phone Number (For OTP) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white text-xs text-espresso-900 focus:outline-none focus:border-banhmi-red shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-espresso-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. aarav@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white text-xs text-espresso-900 focus:outline-none focus:border-banhmi-red shadow-sm"
              />
            </div>
          </div>

          {/* Delivery Address Section (if Home Delivery) */}
          {deliveryMethod === 'delivery' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-900">
                  Delivery Destination
                </h3>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={geocoding}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-banhmi-card hover:bg-banhmi-gold/20 text-banhmi-red border border-banhmi-gold/40 rounded-xl text-[11px] font-bold transition active:scale-95 disabled:opacity-50"
                >
                  {geocoding ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-banhmi-red" />
                  )}
                  {geocoding ? 'Detecting GPS...' : 'Use Current Location'}
                </button>
              </div>

              {geocodeMessage && (
                <p className="text-[11px] font-medium text-banhmi-red bg-cream-100 p-2 rounded-lg border border-cream-300">
                  {geocodeMessage}
                </p>
              )}

              {/* Line 1: Street / Area with auto-complete */}
              <div className="relative">
                <label className="block text-xs font-semibold text-espresso-700 mb-1">
                  Line 1: Street / Road / Locality *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12th Main Road, HAL 2nd Stage, Indiranagar"
                  value={line1}
                  onChange={(e) => handleLine1Change(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white text-xs text-espresso-900 focus:outline-none focus:border-banhmi-red shadow-sm"
                />

                {addressSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white rounded-xl shadow-xl border border-cream-300 overflow-hidden divide-y divide-cream-100">
                    {addressSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-cream-50 text-espresso-800 flex items-center justify-between"
                      >
                        <span className="truncate">{s.formatted}</span>
                        <ChevronRight className="w-3 h-3 text-espresso-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Line 2: Flat / House / Landmark */}
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1">
                  Line 2: House No., Flat, Floor, Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Oakwood Palms, Opposite Sony Center"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white text-xs text-espresso-900 focus:outline-none focus:border-banhmi-red shadow-sm"
                />
              </div>

              {/* 1-Line Preview Banner */}
              {(line1 || line2) && (
                <div className="p-2.5 bg-banhmi-card rounded-xl border border-banhmi-gold/30 text-[11px] text-espresso-800">
                  <span className="font-bold text-banhmi-red">1-Line Navigation Query: </span>
                  {formatFullOneLineAddress(line1, line2)}
                </div>
              )}

              {/* Delivery Instructions */}
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1">
                  Rider Drop Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring bell twice, leave at reception if unreachable"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-white text-xs text-espresso-900 focus:outline-none focus:border-banhmi-red shadow-sm"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-banhmi-card rounded-2xl border border-banhmi-gold/30 space-y-2 text-xs text-espresso-800">
              <div className="flex items-center gap-2 font-bold text-espresso-950">
                <Store className="w-4 h-4 text-banhmi-red" />
                <span>Studio Counter Pickup Point</span>
              </div>
              <p className="leading-relaxed">
                <strong>Zafiroo Cafe:</strong> {CAFE_METADATA.address}
              </p>
              <p className="text-espresso-600">
                Operating Hours: {CAFE_METADATA.hours}. Your order will be prepared and ready at the studio counter in ~15 minutes.
              </p>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-900">
              Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between gap-1 transition ${
                  paymentMethod === 'cod'
                    ? 'border-banhmi-red bg-banhmi-red/10 text-banhmi-red font-semibold'
                    : 'border-cream-300 bg-white hover:bg-cream-50 text-espresso-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Banknote className="w-4 h-4" />
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-banhmi-red"
                  />
                </div>
                <span className="text-xs font-bold">
                  {deliveryMethod === 'delivery' ? 'Cash on Delivery' : 'Pay at Counter'}
                </span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between gap-1 transition ${
                  paymentMethod === 'razorpay'
                    ? 'border-banhmi-red bg-banhmi-red/10 text-banhmi-red font-semibold'
                    : 'border-cream-300 bg-white hover:bg-cream-50 text-espresso-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <CreditCard className="w-4 h-4" />
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="accent-banhmi-red"
                  />
                </div>
                <span className="text-xs font-bold">Razorpay UPI / Cards</span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between gap-1 transition ${
                  paymentMethod === 'cashfree'
                    ? 'border-banhmi-red bg-banhmi-red/10 text-banhmi-red font-semibold'
                    : 'border-cream-300 bg-white hover:bg-cream-50 text-espresso-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-4 h-4" />
                  <input
                    type="radio"
                    name="payment"
                    value="cashfree"
                    checked={paymentMethod === 'cashfree'}
                    onChange={() => setPaymentMethod('cashfree')}
                    className="accent-banhmi-red"
                  />
                </div>
                <span className="text-xs font-bold">Cashfree PG</span>
              </label>
            </div>
          </div>

          {/* Doorstep Verification Notice */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Doorstep 4-Digit Security OTP</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                A secret 4-digit code will be generated upon placing this order. Share it with your delivery courier only after verifying your package.
              </p>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="p-4 bg-white rounded-2xl border border-cream-200 space-y-2 text-xs text-espresso-800">
            <div className="flex justify-between">
              <span>Items Total ({cart.length})</span>
              <span className="font-semibold">₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className={deliveryFee === 0 ? 'text-emerald-600 font-bold' : ''}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-espresso-950 pt-2 border-t border-cream-100">
              <span>Grand Total</span>
              <span className="text-banhmi-red text-base">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 font-bold rounded-2xl shadow-warm-md hover:shadow-warm-xl transition active:scale-[0.98] disabled:opacity-50 text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Order...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Place Order • ₹{grandTotal.toFixed(2)}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
