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
  Lock,
  FileText,
  Printer,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Membership, MembershipPlanType } from '@/types/cafe';
import { MembershipBillModal } from '@/components/MembershipBillModal';
import {
  getCurrentLocationAddress,
  formatFullOneLineAddress,
  searchAddressQuery,
  AddressSuggestion,
} from '@/lib/location';

export default function MembershipPage() {
  const [activeTab, setActiveTab] = useState<'schemes' | 'check'>('schemes');

  // Lookup state
  const [searchPhone, setSearchPhone] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    membership: Membership;
    memberships: Membership[];
    daysRemaining: number;
    isExpired: boolean;
  } | null>(null);
  const [searchError, setSearchError] = useState('');
  const [skipLoading, setSkipLoading] = useState(false);
  const [skipSuccessMsg, setSkipSuccessMsg] = useState('');

  // Settlement modal state (for 1-month postpaid month-end bill)
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [settlementMethod, setSettlementMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [settlementSuccessMsg, setSettlementSuccessMsg] = useState('');

  // Milk quantity options (0.5 for Half Liter, then integer 1, 2, 3, 4, 5, etc.)
  const [schemesDailyQuantity, setSchemesDailyQuantity] = useState<number>(1);
  const [selectedDailyQuantity, setSelectedDailyQuantity] = useState<number>(1);

  // Enrollment modal state
  const [selectedPlanForEnroll, setSelectedPlanForEnroll] = useState<MembershipPlanType | null>(null);
  const [enrollStep, setEnrollStep] = useState<'details' | 'prepaid_payment'>('details');
  const [enrollName, setEnrollName] = useState('');
  const [enrollPhone, setEnrollPhone] = useState('');
  
  // 2-section address state: GPS address and Landmark address (same like checkout modal)
  const [enrollLine1, setEnrollLine1] = useState('');
  const [enrollLine2, setEnrollLine2] = useState('');
  const [enrollGeocoding, setEnrollGeocoding] = useState(false);
  const [enrollGeocodeMessage, setEnrollGeocodeMessage] = useState('');
  const [enrollAddressSuggestions, setEnrollAddressSuggestions] = useState<AddressSuggestion[]>([]);

  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollBottlePreference, setEnrollBottlePreference] = useState<'1L' | '2 * 500ml'>('1L');
  const [prepaidPaymentMethod, setPrepaidPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState<Membership | null>(null);
  const [activeBillMembership, setActiveBillMembership] = useState<Membership | null>(null);

  // Trigger GPS Geolocation for membership address
  const handleEnrollUseCurrentLocation = async () => {
    setEnrollGeocoding(true);
    setEnrollGeocodeMessage('Detecting building-level GPS precision...');
    try {
      const loc = await getCurrentLocationAddress();
      setEnrollLine1(loc.formattedAddress);
      setEnrollGeocodeMessage('✓ GPS location locked! Please enter your House/Flat No. & Landmark below.');
      setTimeout(() => setEnrollGeocodeMessage(''), 5000);
    } catch (err: any) {
      console.warn('Geolocation error:', err);
      setEnrollGeocodeMessage('Could not retrieve GPS coordinates. Please type address manually.');
      setTimeout(() => setEnrollGeocodeMessage(''), 4000);
    } finally {
      setEnrollGeocoding(false);
    }
  };

  // Search address suggestions for GPS Line 1
  const handleEnrollLine1Change = async (val: string) => {
    setEnrollLine1(val);
    if (val.length >= 3) {
      const suggestions = await searchAddressQuery(val);
      setEnrollAddressSuggestions(suggestions);
    } else {
      setEnrollAddressSuggestions([]);
    }
  };

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
          memberships: data.memberships || [data.membership],
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
        const billAmount = searchResult.membership.price ? `₹${searchResult.membership.price.toLocaleString('en-IN')}` : '₹2,160';
        setSkipSuccessMsg(`⏩ Fast-forwarded 30 days! Month-end bill of ${billAmount} is now due for settlement.`);
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

  // Pay Month-End Postpaid Settlement Bill
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

        const billAmount = searchResult.membership.price ? `₹${searchResult.membership.price.toLocaleString('en-IN')}` : '₹2,160';
        setSettlementModalOpen(false);
        setSettlementSuccessMsg(`🎉 Month-end bill of ${billAmount} settled successfully! Membership renewed for the next 30 days.`);
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

    if (!enrollLine1.trim() && !enrollLine2.trim()) {
      setEnrollError('Please provide your delivery address (GPS location and Landmark).');
      return;
    }

    if (!enrollLine2.trim()) {
      setEnrollError('Please enter your House/Flat No. & Landmark for accurate morning delivery.');
      return;
    }

    const fullAddress = formatFullOneLineAddress(enrollLine1, enrollLine2);
    const finalBottlePref = selectedDailyQuantity === 0.5
      ? '1 * 500ml'
      : selectedDailyQuantity === 1
      ? enrollBottlePreference
      : `${selectedDailyQuantity} × 1L`;

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
          address: fullAddress,
          planType: '1_month',
          bottlePreference: finalBottlePref,
          dailyQuantity: selectedDailyQuantity,
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
    const fullAddress = formatFullOneLineAddress(enrollLine1, enrollLine2);
    const finalBottlePref = selectedDailyQuantity === 0.5
      ? '1 * 500ml'
      : selectedDailyQuantity === 1
      ? enrollBottlePreference
      : `${selectedDailyQuantity} × 1L`;

    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          customerName: enrollName.trim(),
          customerEmail: enrollEmail.trim() || undefined,
          address: fullAddress,
          planType: '6_months',
          bottlePreference: finalBottlePref,
          dailyQuantity: selectedDailyQuantity,
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
              Unlock 100% Free Daily Doorstep Deliveries, priority morning harvesting, zero bottle breakage fees, and exclusive member savings.
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
        {activeTab === 'schemes' && (() => {
          const isHalf = schemesDailyQuantity === 0.5;
          const monthDailyPrice = isHalf ? 38 : schemesDailyQuantity * 72;
          const sixMonthDailyPrice = isHalf ? 36 : schemesDailyQuantity * 70;
          const schemesMonthTotal = monthDailyPrice * 30;
          const schemesSixMonthTotal = sixMonthDailyPrice * 180;
          const schemesQtyLabel = isHalf ? 'Half Liter (0.5L)' : `${schemesDailyQuantity}L`;

          return (
            <div className="space-y-8">
              {/* Daily Milk Quantity Selector Card */}
              <div className="bg-white rounded-3xl border-2 border-[#D8ECCE] p-5 sm:p-6 shadow-md max-w-3xl mx-auto space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAF3E4] pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#385A2A] block">
                      Step 1: Daily Milk Quantity
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#0F240B]">
                      Select Daily Milk Requirement (Doorstep Sunrise Delivery)
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 bg-[#173612] text-amber-300 rounded-full self-start sm:self-auto shadow-sm">
                    🥛 1-Mo: ₹{monthDailyPrice}/d • 6-Mo VIP: ₹{sixMonthDailyPrice}/d
                  </span>
                </div>

                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                  {[
                    { value: 0.5, label: 'Half Liter', sub: '₹38 / ₹36 VIP' },
                    { value: 1, label: '1 Litre', sub: '₹72 / ₹70 VIP' },
                    { value: 2, label: '2 Litres', sub: '₹144 / ₹140 VIP' },
                    { value: 3, label: '3 Litres', sub: '₹216 / ₹210 VIP' },
                    { value: 4, label: '4 Litres', sub: '₹288 / ₹280 VIP' },
                    { value: 5, label: '5 Litres', sub: '₹360 / ₹350 VIP' },
                    { value: 6, label: '6 Litres', sub: '₹432 / ₹420 VIP' },
                    { value: 7, label: '7 Litres', sub: '₹504 / ₹490 VIP' },
                    { value: 8, label: '8 Litres', sub: '₹576 / ₹560 VIP' },
                    { value: 9, label: '9 Litres', sub: '₹648 / ₹630 VIP' },
                    { value: 10, label: '10 Litres', sub: '₹720 / ₹700 VIP' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSchemesDailyQuantity(opt.value)}
                      className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                        schemesDailyQuantity === opt.value
                          ? 'border-[#173612] bg-[#173612] text-white shadow-sm ring-2 ring-[#86B970]/50'
                          : 'border-[#D8ECCE] bg-[#F5FAF0] text-[#173612] hover:bg-emerald-100/60'
                      }`}
                    >
                      <div className="font-black text-xs">{opt.label}</div>
                      <div className={`text-[10px] ${schemesDailyQuantity === opt.value ? 'text-amber-300 font-bold' : 'text-[#385A2A]'}`}>
                        {opt.sub}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 font-medium pt-0.5">
                  {isHalf
                    ? 'Pure organic cow milk bottled fresh every morning: 1 × 500ml sterilized glass bottle at ₹38/day (1-Month) or ₹36/day (6-Months VIP).'
                    : `Pure organic cow milk bottled fresh every morning: ${schemesDailyQuantity} Litre${schemesDailyQuantity > 1 ? 's' : ''}/day at ₹72/L (1-Month) or ₹70/L (6-Months VIP).`}
                </p>
              </div>

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
                        Perfect for trying daily pure organic milk with zero advance commitment. Pay at month-end.
                      </p>
                    </div>

                    {/* Price Block */}
                    <div className="p-4 bg-[#F5FAF0] rounded-2xl border border-[#D8ECCE] space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-black text-[#0F240B]">
                          ₹{schemesMonthTotal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-gray-500 font-bold">/ 30 Days</span>
                      </div>
                      <div className="text-[11px] font-bold text-gray-600">
                        {schemesQtyLabel}/day × ₹{monthDailyPrice}/day × 30 days
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                        <span>Postpaid Billing: ₹0 Advance • Settle ₹{schemesMonthTotal.toLocaleString('en-IN')} invoice at month-end</span>
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
                          <span><strong>Daily Allocation:</strong> {schemesQtyLabel} fresh organic milk delivered every morning</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>100% Free Daily Doorstep Delivery</strong> across entire 30 days</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Postpaid Settlement:</strong> Pay ₹{schemesMonthTotal.toLocaleString('en-IN')} at month-end</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Zero Deposit Required:</strong> Glass milk bottle security deposit waived</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedPlanForEnroll('1_month');
                        setSelectedDailyQuantity(schemesDailyQuantity);
                        setEnrollBottlePreference('1L');
                        setEnrollStep('details');
                        setEnrollSuccess(null);
                        setEnrollError('');
                      }}
                      className="w-full py-3.5 bg-[#173612] hover:bg-[#0F240B] text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Enroll in 1-Month Postpaid (₹0 Advance)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[11px] text-gray-500 text-center mt-2">
                      {schemesQtyLabel}/day at ₹{monthDailyPrice}/day. Settle ₹{schemesMonthTotal.toLocaleString('en-IN')} at month-end.
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
                        Maximum peace of mind for families who insist on pure unadulterated organic nutrition daily.
                      </p>
                    </div>

                    {/* Price Block */}
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-black text-amber-300">
                          ₹{schemesSixMonthTotal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-emerald-200 font-bold">/ 180 Days</span>
                      </div>
                      <div className="text-[11px] font-bold text-emerald-200">
                        {schemesQtyLabel}/day × ₹{sixMonthDailyPrice}/day for 180 days (VIP rate ₹{isHalf ? '36' : '70'}/{isHalf ? 'half L' : 'L'})
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span>VIP Discount: ₹{isHalf ? '36' : '70'}/{isHalf ? 'half L' : 'L'} • Save ₹{(monthDailyPrice - sixMonthDailyPrice) * 180} vs monthly rate</span>
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
                          <span><strong>Daily Allocation:</strong> {schemesQtyLabel} fresh organic milk delivered every morning</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                          <span><strong>100% Free Doorstep Delivery</strong> across entire 180 days</span>
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
                        setSelectedDailyQuantity(schemesDailyQuantity);
                        setEnrollBottlePreference('1L');
                        setEnrollStep('details');
                        setEnrollSuccess(null);
                        setEnrollError('');
                      }}
                      className="btn-shining-gold w-full py-3.5 rounded-2xl text-[#261603] font-black text-xs uppercase tracking-wider shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Enroll in 6-Months Prepaid (₹{schemesSixMonthTotal.toLocaleString('en-IN')})</span>
                      <ArrowRight className="w-4 h-4 text-[#261603]" />
                    </button>
                    <p className="text-[11px] text-emerald-200 text-center mt-2">
                      {schemesQtyLabel}/day at ₹{sixMonthDailyPrice}/day (VIP ₹{isHalf ? '36' : '70'}/{isHalf ? 'half L' : 'L'}). Prepaid upfront for 180 days.
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
                  <h4 className="font-bold text-sm text-[#0F240B]">Morning Delivery</h4>
                  <p className="text-xs text-gray-600">
                    Fresh farm produce delivered every morning to your doorstep.
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
          );
        })()}

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

            {/* SEARCH RESULT: DIGITAL MEMBERSHIP CARDS */}
            {searchResult && (
              <div className="space-y-6 animate-fadeIn">
                {/* Count badge if multiple */}
                {searchResult.memberships.length > 1 && (
                  <div className="text-center text-xs font-bold text-[#385A2A] bg-[#EAF3E4] border border-[#CBE0A3] rounded-2xl px-4 py-2">
                    📋 {searchResult.memberships.length} memberships found for this number
                  </div>
                )}

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
                        ₹{searchResult.membership.price ? searchResult.membership.price.toLocaleString('en-IN') : '2,160'} DUE
                      </span>
                    </div>

                    <p className="text-xs text-rose-100 leading-relaxed">
                      Your 30-day billing cycle for unlimited free doorstep deliveries is completed. Pay your month-end invoice to renew and continue receiving sunrise milk deliveries.
                    </p>

                    <button
                      onClick={() => setSettlementModalOpen(true)}
                      className="w-full py-3.5 bg-white hover:bg-rose-50 text-rose-800 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-rose-700" />
                      <span>Pay Month-End Bill (₹{searchResult.membership.price ? searchResult.membership.price.toLocaleString('en-IN') : '2,160'})</span>
                      <ArrowRight className="w-4 h-4 text-rose-700" />
                    </button>
                  </div>
                )}

                {/* 3. MEMBERSHIP CARDS — One per membership */}
                {searchResult.memberships.map((m, idx) => {
                  const now = new Date();
                  const endDate = new Date(m.endDate);
                  const diffMs = endDate.getTime() - now.getTime();
                  const mDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                  const mExpired = diffMs <= 0;
                  const isDue = mExpired || m.paymentStatus === 'due';
                  const mQty = m.dailyQuantity || (m.planName?.includes('0.5L') || m.planName?.toLowerCase().includes('half liter') ? 0.5 : 1);
                  const mQtyLabel = mQty === 0.5 ? 'Half Liter (0.5L)' : `${mQty}L`;

                  return (
                    <div key={m.id} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#173612] via-[#0F240B] to-[#0A1807] text-white p-6 sm:p-8 shadow-2xl border-2 border-[#CBE0A3]">
                      {/* Decorative Watermark */}
                      <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                        <Crown className="w-48 h-48 text-white" />
                      </div>

                      {/* Multiple card index badge */}
                      {searchResult.memberships.length > 1 && (
                        <div className="absolute top-4 left-4 text-[10px] bg-white/10 text-white font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
                          Membership {idx + 1} of {searchResult.memberships.length}
                        </div>
                      )}

                      {/* Header Row */}
                      <div className={`flex items-center justify-between border-b border-white/15 pb-4 mb-5 ${searchResult.memberships.length > 1 ? 'mt-6' : ''}`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black">
                            <Crown className="w-6 h-6 fill-black" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm uppercase tracking-wider text-white">
                              ZAFIROO ORGANIC PASS
                            </h3>
                            <span className="text-[10px] text-emerald-300 font-mono">
                              ID: {m.id}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isDue
                              ? 'bg-rose-500 text-white'
                              : 'bg-emerald-400 text-black flex items-center gap-1'
                          }`}
                        >
                          {!isDue && (
                            <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                          )}
                          {isDue ? 'BILL DUE / EXPIRED' : 'ACTIVE MEMBER'}
                        </span>
                      </div>

                      {/* Member Information */}
                      <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Member Name</span>
                          <strong className="text-white text-base block truncate">
                            {m.customerName}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Phone Number</span>
                          <strong className="text-white font-mono text-sm block">
                            {m.phone}
                          </strong>
                        </div>
                      </div>

                      {/* Scheme & Billing Badge */}
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3 mb-6">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest block">
                              Current Scheme
                            </span>
                            <span className="text-sm font-black text-white">
                              {m.planName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                              🥛 {mQtyLabel} Daily
                            </span>
                            <span
                              className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg ${
                                m.billingType === 'postpaid'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              }`}
                            >
                              {m.billingType === 'postpaid' ? 'Postpaid' : 'Prepaid'}
                            </span>
                          </div>
                        </div>

                        {/* Progress to Expiry */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-gray-300">
                            <span>Validity Countdown</span>
                            <strong className={isDue ? 'text-rose-400' : 'text-amber-300'}>
                              {isDue
                                ? 'Cycle Completed (Bill Due)'
                                : `${mDaysRemaining} days remaining`}
                            </strong>
                          </div>
                          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isDue
                                  ? 'bg-rose-500'
                                  : 'bg-gradient-to-r from-emerald-400 to-amber-300'
                              }`}
                              style={{
                                width: `${
                                  isDue
                                    ? 100
                                    : Math.min(
                                        100,
                                        Math.max(5, (mDaysRemaining / (m.planType === '6_months' ? 180 : 30)) * 100)
                                      )
                                }%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400 pt-0.5">
                            <span>Started: {new Date(m.startDate).toLocaleDateString('en-IN')}</span>
                            <span>Expires: {new Date(m.endDate).toLocaleDateString('en-IN')}</span>
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
                            <span>Daily Quota: {mQtyLabel}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
                            <span>Priority Sunrise Morning Delivery</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
                            <span>Zero Bottle Breakage Deposit</span>
                          </div>
                        </div>
                      </div>

                      {/* Official Membership Tax Invoice & Bill (Permission controlled by store admin) */}
                      <div className="pt-4 mt-2 border-t border-white/15">
                        {m.billApproved ? (
                          <button
                            type="button"
                            onClick={() => setActiveBillMembership(m)}
                            className="btn-shining-gold w-full py-3.5 px-4 rounded-2xl text-[#261603] font-black text-xs uppercase tracking-wider shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <FileText className="w-4 h-4 text-[#261603]" />
                            <span>📄 Download Official Membership Bill (Tax Invoice)</span>
                          </button>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-center space-y-1">
                            <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-black uppercase tracking-wider">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Membership Bill Locked (Pending Admin Approval)</span>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-snug">
                              Your official membership tax invoice &amp; payment receipt will be unlocked for download once store administration approves access.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

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
                <span>1-Month Organic Pass (30 Days, {searchResult.membership.dailyQuantity === 0.5 ? 'Half Liter' : `${searchResult.membership.dailyQuantity || 1}L`}/day):</span>
                <strong className="text-[#0F240B]">₹{searchResult.membership.price ? searchResult.membership.price.toFixed(2) : '2,160.00'}</strong>
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
                <span className="text-xl text-emerald-800 font-black">₹{searchResult.membership.price ? searchResult.membership.price.toFixed(2) : '2,160.00'}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                Select Settlement Payment Method:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
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
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handlePaySettlementBill}
                disabled={settlementLoading}
                className="w-full py-3.5 bg-[#173612] hover:bg-[#0F240B] text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {settlementLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Settlement...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{searchResult.membership.price ? searchResult.membership.price.toLocaleString('en-IN') : '2,160'} (Simulate Settlement)</span>
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
                    <span className="text-gray-500">Daily Milk Quantity:</span>
                    <strong className="text-emerald-800 font-black">
                      {enrollSuccess.dailyQuantity === 0.5 ? 'Half Liter (0.5 L) / Day' : `${enrollSuccess.dailyQuantity || 1} Litre${(enrollSuccess.dailyQuantity || 1) > 1 ? 's' : ''} / Day`}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Daily Milk Packaging:</span>
                    <strong className="text-emerald-800 font-black">
                      {enrollSuccess.dailyQuantity === 0.5
                        ? '1 × 500ml Bottle'
                        : enrollSuccess.bottlePreference === '2 * 500ml'
                        ? '2 × 500ml Bottles'
                        : `${enrollSuccess.dailyQuantity || 1} × 1L Bottle`}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Billing Mode:</span>
                    <strong className="uppercase text-emerald-800 font-black">{enrollSuccess.billingType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan Rate:</span>
                    <strong className="text-[#0F240B] font-mono font-bold">
                      ₹{enrollSuccess.price.toLocaleString('en-IN')}
                    </strong>
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
                    className="flex-1 py-3 bg-[#173612] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow hover:bg-[#0F240B] cursor-pointer"
                  >
                    View My Membership Card
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-[#173612] rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            ) : enrollStep === 'details' ? (() => {
              const isSixMonthPlan = selectedPlanForEnroll === '6_months';
              const isHalf = selectedDailyQuantity === 0.5;
              const enrollDailyPrice = isSixMonthPlan
                ? (isHalf ? 36 : selectedDailyQuantity * 70)
                : (isHalf ? 38 : selectedDailyQuantity * 72);
              const enrollMonthTotal = enrollDailyPrice * 30;
              const enrollSixMonthTotal = enrollDailyPrice * 180;
              const enrollQtyLabel = isHalf ? 'Half Liter (0.5L)' : `${selectedDailyQuantity}L`;

              return (
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
                        ? `₹${enrollMonthTotal.toLocaleString('en-IN')}/mo • Postpaid Billing (₹0 due today, ${enrollQtyLabel}/day × ₹${enrollDailyPrice}/day × 30 days, settle at month-end)`
                        : `₹${enrollSixMonthTotal.toLocaleString('en-IN')} for 180 Days • Prepaid VIP Scheme (${enrollQtyLabel}/day × ₹${enrollDailyPrice}/day × 180 days)`}
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

                    {/* DAILY MILK QUANTITY SELECTOR (0.5 for Half Liter, then integer 1, 2, 3, 4, 5, etc.) */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between">
                        <span>Daily Milk Quantity (1 Day Quota) *</span>
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          ₹{enrollDailyPrice} / Day{isSixMonthPlan ? ' (VIP)' : ''}
                        </span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedDailyQuantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSelectedDailyQuantity(val);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-[#0F240B] bg-white focus:outline-none focus:border-[#173612] shadow-xs cursor-pointer"
                        >
                          {[0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((qty) => {
                            const dayPrice = qty === 0.5
                              ? (isSixMonthPlan ? 36 : 38)
                              : qty * (isSixMonthPlan ? 70 : 72);
                            const label = qty === 0.5 ? 'Half Liter (0.5 L / day)' : `${qty} Litre${qty > 1 ? 's' : ''} / day`;
                            return (
                              <option key={qty} value={qty}>
                                {label} — ₹{dayPrice} / day{isSixMonthPlan ? ' (VIP)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {isHalf
                          ? `Half liter milk delivered fresh every morning at ₹${enrollDailyPrice}/day${isSixMonthPlan ? ' (6-Month VIP rate)' : ''}.`
                          : `${selectedDailyQuantity} Litre${selectedDailyQuantity > 1 ? 's' : ''} milk delivered fresh every morning at ₹${isSixMonthPlan ? '70' : '72'}/L (₹${enrollDailyPrice}/day).`}
                      </p>
                    </div>

                    {/* DAILY MILK PACKAGING PREFERENCE */}
                    {selectedDailyQuantity === 1 ? (
                      <div>
                        <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between">
                          <span>Daily Milk Bottle Packaging *</span>
                          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Sterilized Glass Bottles
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            value={enrollBottlePreference}
                            onChange={(e) => setEnrollBottlePreference(e.target.value as '1L' | '2 * 500ml')}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-[#0F240B] bg-white focus:outline-none focus:border-[#173612] shadow-xs cursor-pointer"
                          >
                            <option value="1L">1L (Single 1 Litre Bottle / Day)</option>
                            <option value="2 * 500ml">2 * 500ml (Two 500ml Bottles / Day)</option>
                          </select>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Choose between a single 1L glass bottle or two 500ml bottles delivered fresh every morning.
                        </p>
                      </div>
                    ) : selectedDailyQuantity === 0.5 ? (
                      <div className="p-2.5 bg-[#F5FAF0] rounded-xl border border-[#D8ECCE] text-[11px] text-[#173612] flex items-center gap-2">
                        <span>🥛 Daily Packaging: <strong>1 × 500ml sterilized glass bottle / day</strong></span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-[#F5FAF0] rounded-xl border border-[#D8ECCE] text-[11px] text-[#173612] flex items-center gap-2">
                        <span>🥛 Daily Packaging: <strong>{selectedDailyQuantity} × 1L sterilized glass bottles / day</strong></span>
                      </div>
                    )}

                    {/* CHANGE 2: DELIVERY ADDRESS WITH 2 SECTIONS (GPS ADDRESS & LANDMARK ADDRESS) */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-gray-700">
                          Delivery Address <span className="text-rose-600">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleEnrollUseCurrentLocation}
                          disabled={enrollGeocoding}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#173612] hover:bg-[#0F240B] text-white border border-[#173612]/30 rounded-xl text-[11px] font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {enrollGeocoding ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 fill-white text-white" />
                          )}
                          <span>{enrollGeocoding ? 'Detecting GPS...' : 'Auto-Detect GPS'}</span>
                        </button>
                      </div>

                      {enrollGeocodeMessage && (
                        <p className="text-[11px] font-bold text-[#173612] bg-[#ECF5DE] p-2.5 rounded-xl border border-[#CBE0A3]">
                          {enrollGeocodeMessage}
                        </p>
                      )}

                      {/* Section 1: GPS Address / Line 1 */}
                      <div className="relative">
                        <label className="block text-[11px] font-bold text-[#173612] mb-1">
                          GPS Address: Street / Road / Locality <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 12th Main Road, Indiranagar, Bengaluru"
                          value={enrollLine1}
                          onChange={(e) => handleEnrollLine1Change(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612] shadow-sm"
                        />

                        {enrollAddressSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 max-h-48 overflow-y-auto">
                            {enrollAddressSuggestions.map((s, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setEnrollLine1(s.formatted);
                                  setEnrollAddressSuggestions([]);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F5FAF0] text-[#173612] flex items-center justify-between cursor-pointer"
                              >
                                <span className="truncate font-medium">{s.formatted}</span>
                                <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Section 2: Landmark Address / Line 2 */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-[#173612]">
                            Landmark Address: House No., Flat & Landmark <span className="text-rose-600">*</span>
                          </label>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Mandatory
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Flat 402, Oakwood Palms, Near Sony Center / Landmark"
                          value={enrollLine2}
                          onChange={(e) => {
                            setEnrollLine2(e.target.value);
                            if (enrollError) setEnrollError('');
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-[#173612] focus:outline-none focus:border-[#173612] shadow-sm"
                        />
                        <p className="text-[10px] text-[#385A2A] font-semibold mt-1">
                          Complete address (House / Flat No.) and a nearby Landmark are compulsory for accurate doorstep delivery.
                        </p>
                      </div>

                      {/* 1-Line Preview Banner */}
                      {(enrollLine1 || enrollLine2) && (
                        <div className="p-2.5 bg-[#F5FAF0] rounded-xl border border-[#CBE0A3] text-[11px] text-[#173612]">
                          <span className="font-bold text-[#0F240B]">Delivery Destination: </span>
                          {formatFullOneLineAddress(enrollLine1, enrollLine2)}
                          {!enrollLine2.trim() && (
                            <span className="block text-rose-600 font-bold mt-1 text-[10px]">
                              ⚠️ Please enter House/Flat No. & Landmark above to complete your delivery address.
                            </span>
                          )}
                        </div>
                      )}
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
                      className="w-full py-3.5 bg-[#173612] hover:bg-[#0F240B] text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md transition active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {enrollLoading ? (
                        <span>Saving to Database...</span>
                      ) : selectedPlanForEnroll === '1_month' ? (
                        <>
                          <Zap className="w-4 h-4 text-amber-300" />
                          <span>Confirm & Activate 1-Month Postpaid (₹0 Today • Settle ₹{enrollMonthTotal.toLocaleString('en-IN')})</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 text-amber-300" />
                          <span>Proceed to Prepaid VIP Checkout (₹{enrollSixMonthTotal.toLocaleString('en-IN')}) →</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              );
            })() : (() => {
              const isHalf = selectedDailyQuantity === 0.5;
              const vipDailyPrice = isHalf ? 36 : selectedDailyQuantity * 70;
              const vipTotal = vipDailyPrice * 180;
              const vipQtyLabel = isHalf ? 'Half Liter (0.5L)' : `${selectedDailyQuantity}L`;

              return (
                <>
                  {/* STEP 2: PREPAID VIP PAYMENT PAGE FOR 6 MONTHS */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                        Step 2 of 2 • VIP Prepaid Checkout
                      </span>
                      <button
                        onClick={() => setEnrollStep('details')}
                        className="text-[11px] font-bold text-[#173612] hover:underline cursor-pointer"
                      >
                        ← Edit Details
                      </button>
                    </div>
                    <h3 className="text-xl font-black text-[#0F240B]">
                      Prepaid Membership Payment
                    </h3>
                    <p className="text-xs text-gray-500">
                      Pay upfront for 180 days of unlimited free doorstep deliveries ({vipQtyLabel}/day).
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
                      <span>6-Month VIP Club Scheme ({vipQtyLabel}/day @ ₹{vipDailyPrice}/day):</span>
                      <span>₹{vipTotal.toLocaleString('en-IN')}.00</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Daily Packaging Option:</span>
                      <strong className="text-emerald-900 font-bold">
                        {selectedDailyQuantity === 0.5
                          ? '1 × 500ml Glass Bottle'
                          : enrollBottlePreference === '2 * 500ml'
                          ? '2 × 500ml Glass Bottles'
                          : `${selectedDailyQuantity} × 1L Glass Bottle`}
                      </strong>
                    </div>
                    <div className="flex justify-between text-emerald-800">
                      <span>180 Days Daily Delivery Charges:</span>
                      <strong>₹0.00 (Free)</strong>
                    </div>
                    <div className="pt-2 border-t border-[#D8ECCE] flex justify-between items-baseline font-black text-sm text-[#0F240B]">
                      <span>Total Prepaid Amount:</span>
                      <span className="text-2xl text-emerald-900 font-black">₹{vipTotal.toLocaleString('en-IN')}.00</span>
                    </div>
                  </div>

                  {/* Payment Methods Choice */}
                  <div className="space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                      Select Prepaid Payment Method:
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
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
                    </div>
                  </div>

                  {/* Submit Payment */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleCompletePrepaidPayment}
                      disabled={enrollLoading}
                      className="btn-shining-gold w-full py-4 rounded-2xl text-[#261603] font-black text-xs uppercase tracking-wider shadow-xl transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {enrollLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#261603]" />
                          <span>Processing VIP Activation...</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 text-[#261603] fill-[#261603]" />
                          <span>⚡ Pay ₹{vipTotal.toLocaleString('en-IN')} & Activate VIP Pass</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setEnrollStep('details')}
                      className="w-full py-2 text-xs text-gray-500 font-bold hover:text-gray-800 cursor-pointer"
                    >
                      ← Back to Customer Details
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* MEMBERSHIP BILL RECEIPT MODAL */}
      <MembershipBillModal
        membership={activeBillMembership}
        isOpen={Boolean(activeBillMembership)}
        onClose={() => setActiveBillMembership(null)}
      />
    </div>
  );
}
