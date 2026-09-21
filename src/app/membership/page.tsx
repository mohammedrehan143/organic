'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  CheckCircle2,
  ShieldCheck,
  Search,
  Phone,
  Sparkles,
  Clock,
  ArrowRight,
  Gift,
  Calendar,
  Zap,
  Check,
  ArrowLeft,
  Truck,
  User,
  HeartHandshake,
  CheckCheck,
  CreditCard,
  Banknote,
  AlertTriangle,
  FastForward,
  QrCode,
  RefreshCw,
  X,
  MapPin,
  Mail,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Membership, MembershipPlanType } from '@/types/cafe';

export default function MembershipPage() {
  const [activeTab, setActiveTab] = useState<'schemes' | 'check'>('schemes');

  // Lookup state
  const [searchPhone, setSearchPhone] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    membership: Membership;
    daysRemaining: number;
    isExpired: boolean;
  } | null>(null);
  const [searchError, setSearchError] = useState('');
  const [skipLoading, setSkipLoading] = useState(false);
  const [skipSuccessMsg, setSkipSuccessMsg] = useState('');

  // Settlement modal state (for 1-month postpaid month-end bill)
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [settlementMethod, setSettlementMethod] = useState<'razorpay' | 'cod' | 'cashfree'>('razorpay');
  const [settlementSuccessMsg, setSettlementSuccessMsg] = useState('');

  // Enrollment modal state
  const [selectedPlanForEnroll, setSelectedPlanForEnroll] = useState<MembershipPlanType | null>(null);
  const [enrollStep, setEnrollStep] = useState<'details' | 'prepaid_payment'>('details');
  const [enrollName, setEnrollName] = useState('');
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollAddress, setEnrollAddress] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [prepaidPaymentMethod, setPrepaidPaymentMethod] = useState<'razorpay' | 'cod' | 'cashfree'>('razorpay');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState<Membership | null>(null);

  // Handle Search Membership by Phone
  const handleSearch = async (e?: React.FormEvent, overridePhone?: string) => {
    if (e) e.preventDefault();
    setSearchError('');
    setSkipSuccessMsg('');
    setSettlementSuccessMsg('');

    const phoneToLookup = overridePhone || searchPhone;
    const clean = phoneToLookup.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setSearchError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/membership?phone=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setSearchResult({
          membership: data.membership,
          daysRemaining: data.daysRemaining,
          isExpired: data.isExpired,
        });
      } else {
        setSearchResult(null);
        setSearchError(data.message || 'No membership found with this phone number.');
      }
    } catch {
      setSearchError('Unable to connect to database server. Please check your network.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Skip / Fast-Forward 30 Days (Simulation for testing Postpaid payment flow)
  const handleSkipToDue = async () => {
    if (!searchResult?.membership?.phone) return;
    setSkipLoading(true);
    setSkipSuccessMsg('');
    setSearchError('');

    try {
      const res = await fetch('/api/membership', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: searchResult.membership.phone,
          id: searchResult.membership.id,
          action: 'skip_to_due',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSkipSuccessMsg('⏩ Fast-forwarded 30 days! Month-end bill of ₹299 is now due for settlement.');
        // Refresh membership profile
        await handleSearch(undefined, searchResult.membership.phone);
      } else {
        setSearchError(data.message || 'Failed to simulate 30 days fast-forward.');
      }
    } catch {
      setSearchError('Network error while updating membership status.');
    } finally {
      setSkipLoading(false);
    }
  };

  // Pay Month-End Postpaid Settlement Bill (₹299)
  const handlePaySettlementBill = async () => {
    if (!searchResult?.membership?.phone) return;
    setSettlementLoading(true);

    try {
      const res = await fetch('/api/membership', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: searchResult.membership.phone,
          id: searchResult.membership.id,
          action: 'mark_paid',
          paymentMethod: settlementMethod,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Fire celebration confetti!
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
          });
        } catch {}

        setSettlementModalOpen(false);
        setSettlementSuccessMsg('🎉 Month-end bill of ₹299 settled successfully! Membership renewed for the next 30 days.');
        // Refresh membership profile
        await handleSearch(undefined, searchResult.membership.phone);
      } else {
        alert(data.message || 'Payment processing failed. Please try again.');
      }
    } catch {
      alert('Network error while settling bill.');
    } finally {
      setSettlementLoading(false);
    }
  };

  // Step 1 -> Step 2 validation or Direct 1-Month Postpaid activation
  const handleProceedFromDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollError('');

    const clean = enrollPhone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setEnrollError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!enrollName.trim()) {
      setEnrollError('Please enter your full name.');
      return;
    }

    // If 6 Months VIP: Go to Prepaid VIP Payment Step
    if (selectedPlanForEnroll === '6_months') {
      setEnrollStep('prepaid_payment');
      return;
    }

    // If 1 Month Postpaid: Directly activate with ₹0 advance commitment
    setEnrollLoading(true);
    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          customerName: enrollName.trim(),
          customerEmail: enrollEmail.trim() || undefined,
          address: enrollAddress.trim() || undefined,
          planType: '1_month',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch {}
        setEnrollSuccess(data.membership);
        setSearchPhone(clean);
      } else {
        setEnrollError(data.message || 'Failed to activate membership.');
      }
    } catch {
      setEnrollError('Unable to connect to registration server. Please try again.');
    } finally {
      setEnrollLoading(false);
    }
  };

  // Step 2: Complete 6-Month Prepaid VIP Payment & Activation
  const handleCompletePrepaidPayment = async () => {
    setEnrollError('');
    setEnrollLoading(true);

    const clean = enrollPhone.replace(/[^0-9]/g, '');

    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          customerName: enrollName.trim(),
          customerEmail: enrollEmail.trim() || undefined,
          address: enrollAddress.trim() || undefined,
          planType: '6_months',
          paymentMethod: prepaidPaymentMethod,
          paymentStatus: 'paid',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        try {
          confetti({
            particleCount: 110,
            spread: 85,
            origin: { y: 0.55 },
          });
        } catch {}

        setEnrollSuccess(data.membership);
        setSearchPhone(clean);
      } else {
        setEnrollError(data.message || 'Failed to process prepaid membership activation.');
      }
    } catch {
      setEnrollError('Unable to connect to payment server. Please try again.');
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFDFB] text-[#173612] pb-24">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-b from-[#EBF5E5] via-[#F4FAF0] to-[#FCFDFB] border-b border-[#D8ECCE] pt-8 pb-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#173612] bg-white px-4 py-2 rounded-full border border-[#CBE0A3] shadow-sm hover:shadow transition active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Farm Store</span>
            </Link>
          </div>

          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#173612] text-[#EBF5E5] text-xs font-bold tracking-wide uppercase shadow-sm">
              <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Zafiroo Organic Club</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0F240B]">
              FARM MEMBERSHIP SCHEMES
            </h1>
            <p className="text-sm sm:text-base text-[#385A2A] font-medium leading-relaxed">
              Unlock 100% Free Daily Doorstep Deliveries, priority sunrise harvesting, zero bottle breakage fees, and exclusive member savings.
            </p>

            {/* Navigation Tabs */}
            <div className="pt-4 flex justify-center">
              <div className="bg-white p-1.5 rounded-2xl border border-[#CBE0A3] shadow-sm flex max-w-md w-full">
                <button
                  onClick={() => {
                    setActiveTab('schemes');
                    setSearchResult(null);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                    activeTab === 'schemes'
                      ? 'bg-[#173612] text-white shadow-sm'
                      : 'text-[#385A2A] hover:text-[#0F240B]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Membership Schemes</span>
                </button>
                <button
                  onClick={() => setActiveTab('check')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                    activeTab === 'check'
                      ? 'bg-[#173612] text-white shadow-sm'
                      : 'text-[#385A2A] hover:text-[#0F240B]'
                  }`}
                >
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>Check by Mobile No.</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6">
        {/* TAB 1: SCHEMES COMPARISON */}
        {activeTab === 'schemes' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* SCHEME 1: 1 MONTH (POSTPAID) */}
              <div className="bg-white rounded-3xl border-2 border-[#D8ECCE] shadow-lg p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden hover:border-[#86B970] transition">
                <div className="absolute top-0 right-0 bg-[#EAF3E4] text-[#173612] text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl border-l border-b border-[#D8ECCE]">
                  POSTPAID FLEXIBILITY
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#385A2A] uppercase tracking-widest">
                      Flexible Scheme
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#0F240B]">
                      1 Month Organic Pass
                    </h2>
                    <p className="text-xs text-gray-600">
                      Perfect for trying daily pure organic milk and free-range eggs with zero advance commitment.
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="p-4 bg-[#F5FAF0] rounded-2xl border border-[#D8ECCE] space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-[#0F240B]">₹299</span>
                      <span className="text-xs text-gray-500 font-bold">/ 30 Days</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                      <span>Postpaid Billing: ₹0 Advance • Settle invoice at month-end</span>
                    </div>
                  </div>

                  {/* Benefits Checklist */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#173612]">
                      Scheme Privileges:
                    </span>
                    <ul className="space-y-2.5 text-xs text-gray-700">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>100% Free Daily Doorstep Delivery</strong> across entire 30 days</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Postpaid Settlement:</strong> Enjoy fresh orders daily; pay ₹299 at month-end</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Priority Morning Dispatch</strong> (6:00 AM – 8:30 AM early morning window)</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Zero Deposit Required:</strong> Glass milk bottle security deposit waived</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Pause or cancel anytime with zero hidden cancellation charges</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedPlanForEnroll('1_month');
                      setEnrollStep('details');
                      setEnrollSuccess(null);
                      setEnrollError('');
                    }}
                    className="w-full py-3.5 bg-[#173612] hover:bg-[#0F240B] text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Enroll in 1-Month Postpaid (₹0 Today)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-gray-500 text-center mt-2">
                    No upfront payment. Billed upon 30-day monthly cycle completion.
                  </p>
                </div>
              </div>

              {/* SCHEME 2: 6 MONTHS (PREPAID - VIP) */}
              <div className="bg-gradient-to-b from-[#173612] to-[#0D1F0A] text-white rounded-3xl border-2 border-amber-400/80 shadow-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                {/* Gold Highlight Tag */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-amber-500 text-[#0F240B] text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-sm">
                  ★ BEST VALUE - PREPAID
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Crown className="w-4 h-4 fill-amber-300" />
                      <span>VIP Privilege Scheme</span>
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      6 Months VIP Club
                    </h2>
                    <p className="text-xs text-emerald-100">
                      Maximum savings and complete peace of mind for families who insist on pure unadulterated organic nutrition daily.
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-amber-300">₹1,499</span>
                      <span className="text-xs text-emerald-200 line-through">₹1,794</span>
                      <span className="text-xs bg-amber-400 text-black font-black px-2 py-0.5 rounded-full">
                        SAVE ₹300
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span>Prepaid Scheme: Single upfront payment for 180 continuous days</span>
                    </div>
                  </div>

                  {/* Benefits Checklist */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      VIP Membership Privileges:
                    </span>
                    <ul className="space-y-2.5 text-xs text-emerald-50">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                        <span><strong>180 Days Guaranteed Free Daily Delivery</strong> (Save ₹1,800+ in delivery)</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Gift className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                        <span><strong>FREE Thermal Insulated Milk Bag</strong> (Keeps glass bottles fresh & protected)</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                        <span><strong>10% Extra Discount</strong> on Farm Value Trays, Desi Ghee & Fresh Curd</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                        <span><strong>VIP Monsoon & Festival Priority:</strong> Guaranteed delivery during heavy rain</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                        <span><strong>Zero Monthly Reminders:</strong> Completely prepaid and hassle-free for 6 months</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/15">
                  <button
                    onClick={() => {
                      setSelectedPlanForEnroll('6_months');
                      setEnrollStep('details');
                      setEnrollSuccess(null);
                      setEnrollError('');
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#0F240B] font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Enroll in 6-Months Prepaid (₹1,499)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-emerald-200 text-center mt-2">
                    Prepaid upfront checkout. Data permanently registered in database.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Benefits Banner */}
            <div className="bg-[#F5FAF0] rounded-3xl border border-[#D8ECCE] p-6 sm:p-8">
              <h3 className="text-lg font-bold text-[#0F240B] text-center mb-6">
                Why Join the Zafiroo Organic Family?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-white rounded-2xl border border-[#D8ECCE] space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF3E4] text-[#173612] flex items-center justify-center mx-auto">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-[#0F240B]">Zero Delivery Charges</h4>
                  <p className="text-xs text-gray-600">
                    Never pay extra for delivery whether you order 1 bottle of milk or 30 farm eggs.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#D8ECCE] space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF3E4] text-[#173612] flex items-center justify-center mx-auto">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-[#0F240B]">Sunrise Delivery</h4>
                  <p className="text-xs text-gray-600">
                    Fresh from our Bylanarasapura farm before 8:30 AM so your breakfast tea is never delayed.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#D8ECCE] space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF3E4] text-[#173612] flex items-center justify-center mx-auto">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-[#0F240B]">Postpaid & Prepaid Choice</h4>
                  <p className="text-xs text-gray-600">
                    Pick 1 Month Postpaid for month-end ease, or 6 Months Prepaid for maximum savings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHECK MEMBERSHIP PROFILE BY PHONE */}
        {activeTab === 'check' && (
          <div className="max-w-xl mx-auto space-y-8">
            {/* Phone Lookup Card */}
            <div className="bg-white rounded-3xl border border-[#D8ECCE] shadow-lg p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF3E4] text-[#173612] flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-[#0F240B]">
                  Check Membership Status
                </h2>
                <p className="text-xs text-gray-600">
                  Enter your registered 10-digit phone number to inspect your active plan, validity countdown, and unlocked member privileges.
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                {searchError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl text-center">
                    {searchError}
                  </div>
                )}

                {skipSuccessMsg && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-2xl text-center">
                    {skipSuccessMsg}
                  </div>
                )}

                {settlementSuccessMsg && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl text-center">
                    {settlementSuccessMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      autoFocus
                      placeholder="e.g. 9876543210"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#D8ECCE] bg-[#FDFEFD] text-sm text-[#0F240B] font-mono tracking-wider focus:outline-none focus:border-[#173612]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={searchLoading}
                  className="w-full py-3.5 bg-[#173612] hover:bg-[#0F240B] text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {searchLoading ? (
                    <span>Looking up Database...</span>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Check Membership Profile</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* SEARCH RESULT: DIGITAL MEMBERSHIP CARD */}
            {searchResult && (
              <div className="space-y-6 animate-fadeIn">
                {/* 1. FAST-FORWARD SKIP TEST BUTTON (For 1-Month Postpaid Scheme) */}
                {searchResult.membership.billingType === 'postpaid' && !searchResult.isExpired && searchResult.membership.paymentStatus !== 'due' && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <FastForward className="w-4 h-4 text-amber-700" />
                        <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                          Test Postpaid Billing Flow
                        </span>
                      </div>
                      <p className="text-xs text-amber-800">
                        Fast-forward 30 days immediately to trigger the 1-month postpaid bill payment page.
                      </p>
                    </div>
                    <button
                      onClick={handleSkipToDue}
                      disabled={skipLoading}
                      className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition active:scale-95 disabled:opacity-50 shrink-0 flex items-center gap-2"
                    >
                      {skipLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Fast-Forwarding...</span>
                        </>
                      ) : (
                        <>
                          <FastForward className="w-3.5 h-3.5" />
                          <span>⏩ Skip 30 Days (Bill Due)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* 2. MONTH-END BILL PAYMENT ALERT (If due or expired on 1-month postpaid) */}
                {(searchResult.isExpired || searchResult.membership.paymentStatus === 'due') && (
                  <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white rounded-3xl p-6 shadow-xl border-2 border-rose-300 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-white text-rose-700 flex items-center justify-center font-bold">
                          <AlertTriangle className="w-5 h-5 animate-bounce" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                            Action Required
                          </span>
                          <h4 className="text-lg font-black text-white">
                            Month-End Settlement Due
                          </h4>
                        </div>
                      </div>
                      <span className="text-sm font-black bg-amber-300 text-black px-3 py-1 rounded-xl shadow-xs">
                        ₹299 DUE
                      </span>
                    </div>

                    <p className="text-xs text-rose-100 leading-relaxed">
                      Your 30-day billing cycle for unlimited free doorstep deliveries is completed. Pay your month-end invoice to renew and continue receiving sunrise milk deliveries.
                    </p>

                    <button
                      onClick={() => setSettlementModalOpen(true)}
                      className="w-full py-3.5 bg-white hover:bg-rose-50 text-rose-800 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4 text-rose-700" />
                      <span>Pay Month-End Bill (₹299)</span>
                      <ArrowRight className="w-4 h-4 text-rose-700" />
                    </button>
                  </div>
                )}

                {/* 3. DIGITAL CARD */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#173612] via-[#0F240B] to-[#0A1807] text-white p-6 sm:p-8 shadow-2xl border-2 border-[#CBE0A3]">
                  {/* Decorative Watermark */}
                  <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                    <Crown className="w-48 h-48 text-white" />
                  </div>

                  {/* Header Row */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black">
                        <Crown className="w-6 h-6 fill-black" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-wider text-white">
                          ZAFIROO ORGANIC PASS
                        </h3>
                        <span className="text-[10px] text-emerald-300 font-mono">
                          ID: {searchResult.membership.id}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        searchResult.isExpired || searchResult.membership.paymentStatus === 'due'
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-400 text-black flex items-center gap-1'
                      }`}
                    >
                      {!searchResult.isExpired && searchResult.membership.paymentStatus !== 'due' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                      )}
                      {searchResult.isExpired || searchResult.membership.paymentStatus === 'due'
                        ? 'MONTH-END BILL DUE'
                        : 'ACTIVE MEMBER'}
                    </span>
                  </div>

                  {/* Member Information */}
                  <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Member Name</span>
                      <strong className="text-white text-base block truncate">
                        {searchResult.membership.customerName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Phone Number</span>
                      <strong className="text-white font-mono text-sm block">
                        {searchResult.membership.phone}
                      </strong>
                    </div>
                  </div>

                  {/* Scheme & Billing Badge */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest block">
                          Current Scheme
                        </span>
                        <span className="text-sm font-black text-white">
                          {searchResult.membership.planName}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg ${
                          searchResult.membership.billingType === 'postpaid'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                            : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        }`}
                      >
                        {searchResult.membership.billingType === 'postpaid' ? 'Postpaid' : 'Prepaid'}
                      </span>
                    </div>

                    {/* Progress to Expiry */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-300">
                        <span>Validity Countdown</span>
                        <strong className={searchResult.isExpired || searchResult.membership.paymentStatus === 'due' ? 'text-rose-400' : 'text-amber-300'}>
                          {searchResult.isExpired || searchResult.membership.paymentStatus === 'due'
                            ? 'Cycle Completed (Bill Due)'
                            : `${searchResult.daysRemaining} days remaining`}
                        </strong>
                      </div>
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            searchResult.isExpired || searchResult.membership.paymentStatus === 'due'
                              ? 'bg-rose-500'
                              : 'bg-gradient-to-r from-emerald-400 to-amber-300'
                          }`}
                          style={{
                            width: `${
                              searchResult.isExpired || searchResult.membership.paymentStatus === 'due'
                                ? 100
                                : Math.min(
                                    100,
                                    Math.max(5, (searchResult.daysRemaining / (searchResult.membership.planType === '6_months' ? 180 : 30)) * 100)
                                  )
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 pt-0.5">
                        <span>Started: {new Date(searchResult.membership.startDate).toLocaleDateString('en-IN')}</span>
                        <span>Expires: {new Date(searchResult.membership.endDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Privileges Unlocked */}
                  <div className="space-y-2 text-xs">
                    <span className="text-emerald-300 font-bold uppercase tracking-wider text-[10px] block">
                      Active Member Privileges:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-100">
                      <div className="flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span>100% Free Daily Doorstep Delivery</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span>Early Sunrise Slot Priority</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span>Zero Bottle Breakage Deposit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {searchResult.membership.billingType === 'postpaid'
                            ? 'Month-End Postpaid Settlement'
                            : 'VIP Monsoon Guarantee + Insulated Bag'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => setActiveTab('schemes')}
                    className="text-xs font-bold text-[#173612] hover:underline"
                  >
                    Want to explore other schemes? Click here.
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MONTH-END POSTPAID SETTLEMENT MODAL */}
      {settlementModalOpen && searchResult && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-[#CBE0A3] shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSettlementModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#385A2A]">
                Postpaid Settle & Renew
              </span>
              <h3 className="text-2xl font-black text-[#0F240B]">
                Month-End Bill Settlement
              </h3>
              <p className="text-xs text-gray-500">
                Settle invoice for Member <strong>{searchResult.membership.customerName}</strong> ({searchResult.membership.phone}).
              </p>
            </div>

            {/* Bill Summary */}
            <div className="bg-[#F5FAF0] rounded-2xl border border-[#D8ECCE] p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-700">
                <span>1-Month Organic Pass (30 Days Cycle):</span>
                <strong className="text-[#0F240B]">₹299.00</strong>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span>Free Daily Doorstep Deliveries:</span>
                <strong>₹0.00 (Included)</strong>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Glass Bottle Deposit / Breakage:</span>
                <strong>₹0.00 (Waived)</strong>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Applicable GST:</span>
                <strong>₹0.00</strong>
              </div>
              <div className="pt-2 border-t border-[#D8ECCE] flex justify-between items-baseline font-black text-sm text-[#0F240B]">
                <span>Total Amount Due:</span>
                <span className="text-xl text-emerald-800 font-black">₹299.00</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                Select Settlement Payment Method:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <label
                  className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col justify-between gap-1 transition ${
                    settlementMethod === 'razorpay'
                      ? 'border-[#173612] bg-[#ECF5DE] font-bold text-[#0F240B]'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CreditCard className="w-4 h-4 text-[#173612]" />
                    <input
                      type="radio"
                      name="settle_pay"
                      checked={settlementMethod === 'razorpay'}
                      onChange={() => setSettlementMethod('razorpay')}
                      className="accent-[#173612]"
                    />
                  </div>
                  <span className="text-[11px]">Razorpay UPI/Card</span>
                </label>

                <label
                  className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col justify-between gap-1 transition ${
                    settlementMethod === 'cod'
                      ? 'border-[#173612] bg-[#ECF5DE] font-bold text-[#0F240B]'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Banknote className="w-4 h-4 text-[#173612]" />
                    <input
                      type="radio"
                      name="settle_pay"
                      checked={settlementMethod === 'cod'}
                      onChange={() => setSettlementMethod('cod')}
                      className="accent-[#173612]"
                    />
                  </div>
                  <span className="text-[11px]">Pay to Partner</span>
                </label>

                <label
                  className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col justify-between gap-1 transition ${
                    settlementMethod === 'cashfree'
                      ? 'border-[#173612] bg-[#ECF5DE] font-bold text-[#0F240B]'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck className="w-4 h-4 text-[#173612]" />
                    <input
                      type="radio"
                      name="settle_pay"
                      checked={settlementMethod === 'cashfree'}
                      onChange={() => setSettlementMethod('cashfree')}
                      className="accent-[#173612]"
                    />
                  </div>
                  <span className="text-[11px]">Cashfree PG</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handlePaySettlementBill}
                disabled={settlementLoading}
                className="w-full py-3.5 bg-[#173612] hover:bg-[#0F240B] text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {settlementLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Settlement...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹299 (Simulate Settlement)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSettlementModalOpen(false)}
                className="w-full py-2.5 text-xs text-gray-500 font-bold hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENROLLMENT DRAWER / MODAL */}
      {selectedPlanForEnroll && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-[#CBE0A3] shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedPlanForEnroll(null);
                setEnrollStep('details');
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
            >
              ✕
            </button>

            {enrollSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-[#0F240B]">
                  MEMBERSHIP ACTIVATED!
                </h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto">
                  Welcome <strong>{enrollSuccess.customerName}</strong>! Your{' '}
                  <strong>{enrollSuccess.planName}</strong> is permanently active in the database under{' '}
                  <span className="font-mono font-bold text-[#173612]">{enrollSuccess.phone}</span>.
                </p>

                <div className="p-4 bg-[#F5FAF0] rounded-2xl border border-[#D8ECCE] text-xs text-left space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Member ID:</span>
                    <strong className="font-mono">{enrollSuccess.id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Scheme Type:</span>
                    <strong className="uppercase">{enrollSuccess.planName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Billing Mode:</span>
                    <strong className="uppercase text-emerald-800 font-black">{enrollSuccess.billingType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Validity:</span>
                    <span>{enrollSuccess.planType === '6_months' ? '180 Days' : '30 Days'} (Daily Free Delivery)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Status:</span>
                    <strong className="uppercase text-emerald-700 font-black">
                      {enrollSuccess.paymentStatus === 'paid' ? 'Paid Upfront' : 'Postpaid Active'}
                    </strong>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedPlanForEnroll(null);
                      setEnrollStep('details');
                      setActiveTab('check');
                      const clean = enrollSuccess.phone.replace(/[^0-9]/g, '');
                      setSearchPhone(clean);
                      handleSearch(undefined, clean);
                    }}
                    className="flex-1 py-3 bg-[#173612] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow hover:bg-[#0F240B]"
                  >
                    View My Membership Card
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-[#173612] rounded-xl text-xs font-bold flex items-center justify-center"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            ) : enrollStep === 'details' ? (
              <>
                {/* STEP 1: CUSTOMER DETAILS */}
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#385A2A]">
                    Step 1 of {selectedPlanForEnroll === '6_months' ? '2' : '1'} • Details
                  </span>
                  <h3 className="text-xl font-black text-[#0F240B]">
                    {selectedPlanForEnroll === '1_month'
                      ? 'Enroll in 1 Month Pass (Postpaid)'
                      : 'Enroll in 6 Months VIP Club (Prepaid)'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedPlanForEnroll === '1_month'
                      ? '₹299/mo • Postpaid Billing (₹0 due today, settle invoice at month-end)'
                      : '₹1,499 for 180 Days • Prepaid VIP Scheme (Save ₹300)'}
                  </p>
                </div>

                {enrollError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
                    {enrollError}
                  </div>
                )}

                <form onSubmit={handleProceedFromDetails} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={enrollName}
                        onChange={(e) => setEnrollName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#173612]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      10-Digit Mobile Number * (Database Primary Key)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={enrollPhone}
                        onChange={(e) => setEnrollPhone(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 font-mono focus:outline-none focus:border-[#173612]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Apartment, Street, Area"
                        value={enrollAddress}
                        onChange={(e) => setEnrollAddress(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#173612]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={enrollEmail}
                        onChange={(e) => setEnrollEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#173612]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={enrollLoading}
                    className="w-full py-3.5 bg-[#173612] hover:bg-[#0F240B] text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md transition active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                  >
                    {enrollLoading ? (
                      <span>Saving to Database...</span>
                    ) : selectedPlanForEnroll === '1_month' ? (
                      <>
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>Confirm & Activate 1-Month Postpaid (₹0 Today)</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-amber-300" />
                        <span>Proceed to Prepaid VIP Checkout (₹1,499) →</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* STEP 2: PREPAID VIP PAYMENT PAGE FOR 6 MONTHS */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                      Step 2 of 2 • VIP Prepaid Checkout
                    </span>
                    <button
                      onClick={() => setEnrollStep('details')}
                      className="text-[11px] font-bold text-[#173612] hover:underline"
                    >
                      ← Edit Details
                    </button>
                  </div>
                  <h3 className="text-xl font-black text-[#0F240B]">
                    Prepaid Membership Payment
                  </h3>
                  <p className="text-xs text-gray-500">
                    Pay upfront for 180 days of unlimited free doorstep deliveries.
                  </p>
                </div>

                {enrollError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
                    {enrollError}
                  </div>
                )}

                {/* Plan Invoice Breakdown */}
                <div className="bg-[#F5FAF0] rounded-2xl border border-[#D8ECCE] p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-700">
                    <span>6-Month VIP Club Scheme:</span>
                    <span className="line-through text-gray-400">₹1,794.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>VIP Plan Discount:</span>
                    <span>-₹295.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span>180 Days Daily Delivery Charges:</span>
                    <strong>₹0.00 (Free)</strong>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span>FREE Thermal Insulated Milk Bag:</span>
                    <strong>INCLUDED (₹0)</strong>
                  </div>
                  <div className="pt-2 border-t border-[#D8ECCE] flex justify-between items-baseline font-black text-sm text-[#0F240B]">
                    <span>Total Prepaid Amount:</span>
                    <span className="text-2xl text-emerald-900 font-black">₹1,499.00</span>
                  </div>
                </div>

                {/* Payment Methods Choice */}
                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                    Select Prepaid Payment Method:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <label
                      className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col justify-between gap-1 transition ${
                        prepaidPaymentMethod === 'razorpay'
                          ? 'border-[#173612] bg-[#ECF5DE] font-bold text-[#0F240B]'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <CreditCard className="w-4 h-4 text-[#173612]" />
                        <input
                          type="radio"
                          name="prepaid_pay"
                          checked={prepaidPaymentMethod === 'razorpay'}
                          onChange={() => setPrepaidPaymentMethod('razorpay')}
                          className="accent-[#173612]"
                        />
                      </div>
                      <span className="text-[11px]">Razorpay UPI/Cards</span>
                    </label>

                    <label
                      className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col justify-between gap-1 transition ${
                        prepaidPaymentMethod === 'cod'
                          ? 'border-[#173612] bg-[#ECF5DE] font-bold text-[#0F240B]'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Banknote className="w-4 h-4 text-[#173612]" />
                        <input
                          type="radio"
                          name="prepaid_pay"
                          checked={prepaidPaymentMethod === 'cod'}
                          onChange={() => setPrepaidPaymentMethod('cod')}
                          className="accent-[#173612]"
                        />
                      </div>
                      <span className="text-[11px]">Pay on First Delivery</span>
                    </label>

                    <label
                      className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col justify-between gap-1 transition ${
                        prepaidPaymentMethod === 'cashfree'
                          ? 'border-[#173612] bg-[#ECF5DE] font-bold text-[#0F240B]'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <ShieldCheck className="w-4 h-4 text-[#173612]" />
                        <input
                          type="radio"
                          name="prepaid_pay"
                          checked={prepaidPaymentMethod === 'cashfree'}
                          onChange={() => setPrepaidPaymentMethod('cashfree')}
                          className="accent-[#173612]"
                        />
                      </div>
                      <span className="text-[11px]">Cashfree PG</span>
                    </label>
                  </div>
                </div>

                {/* Submit Payment */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleCompletePrepaidPayment}
                    disabled={enrollLoading}
                    className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#0F240B] font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {enrollLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing VIP Activation...</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 fill-[#0F240B]" />
                        <span>⚡ Pay ₹1,499 & Activate VIP Pass</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setEnrollStep('details')}
                    className="w-full py-2 text-xs text-gray-500 font-bold hover:text-gray-800"
                  >
                    ← Back to Customer Details
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
