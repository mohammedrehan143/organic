'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useOrder } from '@/context/OrderContext';
import {
  Order,
  OrderStatus,
  DeliveryAgent,
  SosAlert,
  SosReason,
} from '@/types/cafe';
import {
  formatFullOneLineAddress,
  buildGoogleMapsUrl,
  getCurrentLocationAddress,
} from '@/lib/location';
import { verifyAdminPin } from '@/lib/adminAuth';
import {
  Shield,
  Clock,
  Flame,
  PackageCheck,
  Bike,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Navigation,
  Printer,
  X,
  Lock,
  LogOut,
  ChevronRight,
  TrendingUp,
  BarChart3,
  DollarSign,
  Users,
  Search,
  KeyRound,
  BellRing,
  Volume2,
  RefreshCw,
  Send,
  Sparkles,
} from 'lucide-react';
import { BillModal } from '@/components/BillModal';
import { generateWhatsAppOtpLink, generateRiderSosWhatsAppLink } from '@/lib/whatsapp';
import { CAFE_METADATA } from '@/data/cafeData';

export default function AdminPage() {
  const {
    orders,
    updateOrderStatus,
    assignDeliveryAgent,
    deliveryAgents,
    sosAlerts,
    latestActiveSos,
    triggerRiderSos,
    resolveSosAlert,
    playOrderChime,
    playSosSiren,
    verifyDeliveryOtp,
    kitchenPin,
    updateKitchenPin,
  } = useOrder();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authRole, setAuthRole] = useState<'admin' | 'rider'>('admin');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');

  // Mode: Kitchen KDS vs Rider Mobile Mode vs Analytics
  const [activeTab, setActiveTab] = useState<'kds' | 'rider' | 'analytics'>('kds');

  // Rider Login State
  const [riderPhoneInput, setRiderPhoneInput] = useState('');
  const [currentRider, setCurrentRider] = useState<DeliveryAgent | null>(null);
  const [riderOtpInputs, setRiderOtpInputs] = useState<Record<string, string>>({});
  const [riderOtpFeedback, setRiderOtpFeedback] = useState<Record<string, { success: boolean; message: string }>>({});

  // KDS Clock & Midnight Countdown
  const [currentTime, setCurrentTime] = useState('');
  const [midnightCountdown, setMidnightCountdown] = useState('');

  // Full-Screen 5-Second Red SOS Alert Takeover
  const [fullScreenSosAlert, setFullScreenSosAlert] = useState<SosAlert | null>(null);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosActionCenterOpen, setSosActionCenterOpen] = useState(false);

  // Rider SOS Modal
  const [riderSosModalOpen, setRiderSosModalOpen] = useState(false);
  const [riderSosReason, setRiderSosReason] = useState<SosReason>('breakdown');
  const [riderSosNotes, setRiderSosNotes] = useState('');
  const [riderSosSubmitting, setRiderSosSubmitting] = useState(false);

  // Bill Receipt Modal
  const [activeBillOrder, setActiveBillOrder] = useState<Order | null>(null);

  // Status Filter in KDS
  const [kdsFilter, setKdsFilter] = useState<'all' | OrderStatus>('all');

  // Clock Timer
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Calculate time until midnight
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setMidnightCountdown(`${hours}h ${mins}m ${secs}s`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Monitor latestActiveSos for 5-Second Red Alert Takeover
  useEffect(() => {
    if (latestActiveSos && latestActiveSos.status === 'active') {
      // Trigger takeover if not already dismissed for this alert
      setFullScreenSosAlert(latestActiveSos);
      setSosCountdown(5);
      playSosSiren();

      const timer = setInterval(() => {
        setSosCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setFullScreenSosAlert(null); // Auto-minimize to top banner after 5s
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [latestActiveSos, playSosSiren]);

  // Auth Handler
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    const result = verifyAdminPin(pinInput, kitchenPin);

    if (result.valid) {
      setIsAuthenticated(true);
      setPinInput('');
    } else {
      setPinError(result.message);
    }
  };

  // Update Kitchen PIN
  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length < 4) {
      setPinError('New PIN must be at least 4 digits');
      return;
    }
    updateKitchenPin(newPinInput.trim());
    setPinSuccessMsg(`Kitchen PIN successfully changed to: ${newPinInput.trim()}`);
    setNewPinInput('');
    setTimeout(() => setPinSuccessMsg(''), 4000);
  };

  // Rider Login Handler
  const handleRiderLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = riderPhoneInput.replace(/[^0-9]/g, '');
    if (!clean) return;

    const found = deliveryAgents.find(
      (a) => a.phone.replace(/[^0-9]/g, '').includes(clean) || clean.includes(a.phone.replace(/[^0-9]/g, ''))
    );

    if (found) {
      setCurrentRider(found);
    } else {
      // Register temporary session rider
      const newRider: DeliveryAgent = {
        id: `AGT-${clean.slice(-4)}-01`,
        name: `Rider (${clean.slice(-4)})`,
        phone: `+91 ${clean.slice(-10)}`,
        status: 'active',
        vehicleType: 'Motorcycle',
        ordersDeliveredCount: 0,
      };
      setCurrentRider(newRider);
    }
  };

  // Rider Doorstep OTP Submit
  const handleRiderOtpVerify = (orderId: string) => {
    const entered = riderOtpInputs[orderId] || '';
    const result = verifyDeliveryOtp(orderId, entered);
    setRiderOtpFeedback((prev) => ({
      ...prev,
      [orderId]: result,
    }));

    if (result.success) {
      setRiderOtpInputs((prev) => ({ ...prev, [orderId]: '' }));
    }
  };

  // Rider Trigger Emergency SOS
  const handleRiderSosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRider) return;
    setRiderSosSubmitting(true);

    try {
      let lat: number | undefined;
      let lng: number | undefined;
      let locationAddress: string | undefined;

      try {
        const loc = await getCurrentLocationAddress();
        lat = loc.lat;
        lng = loc.lng;
        locationAddress = loc.formattedAddress;
      } catch (err) {
        console.warn('Rider geolocation fetch failed:', err);
      }

      await triggerRiderSos({
        agentId: currentRider.id,
        agentName: currentRider.name,
        agentPhone: currentRider.phone,
        reason: riderSosReason,
        notes: riderSosNotes,
        lat,
        lng,
        locationAddress,
      });

      setRiderSosModalOpen(false);
      setRiderSosNotes('');
    } finally {
      setRiderSosSubmitting(false);
    }
  };

  // Filtered Orders for KDS
  const filteredKdsOrders = useMemo(() => {
    if (kdsFilter === 'all') return orders;
    return orders.filter((o) => o.status === kdsFilter);
  }, [orders, kdsFilter]);

  // Assigned Orders for Logged-In Rider
  const riderAssignedOrders = useMemo(() => {
    if (!currentRider) return [];
    return orders.filter(
      (o) =>
        (o.deliveryAgentId === currentRider.id ||
          (o.riderPhone && o.riderPhone.replace(/[^0-9]/g, '') === currentRider.phone.replace(/[^0-9]/g, '')) ||
          o.status === 'delivering') &&
        o.deliveryMethod === 'delivery'
    );
  }, [orders, currentRider]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    const deliveryOrders = orders.filter((o) => o.deliveryMethod === 'delivery').length;
    const pickupOrders = orders.filter((o) => o.deliveryMethod === 'pickup').length;

    return {
      totalOrders,
      completedOrders: completedOrders.length,
      totalRevenue,
      avgOrderValue,
      deliveryOrders,
      pickupOrders,
    };
  }, [orders]);

  // If not authenticated, render Admin Login Modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-6 bg-banhmi-bg">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-cream-200 shadow-warm-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-banhmi-card border border-banhmi-gold/40 text-banhmi-red rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-espresso-950 font-display tracking-tight">
              KITCHEN & LOGISTICS PORTAL
            </h1>
            <p className="text-xs text-espresso-600">
              Enter Universal Master Key or Kitchen PIN to access KDS, Rider Dispatch, and SOS Center.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            {pinError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center">
                {pinError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-espresso-700 mb-1.5">
                Kitchen Access PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-espresso-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter 4-digit PIN (Default: 1234)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-center font-mono text-lg tracking-widest text-espresso-900 focus:outline-none focus:border-banhmi-red shadow-sm"
                />
              </div>
              <p className="text-[11px] text-espresso-500 mt-1 text-center">
                Default Kitchen PIN is <strong>1234</strong> or Master Key <strong>9999</strong>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 font-bold rounded-2xl shadow-warm-md transition active:scale-95 text-xs uppercase tracking-wider"
            >
              Authenticate & Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-banhmi-bg">
      {/* 1. FULL-SCREEN 5-SECOND RED ALERT TAKEOVER (Emergency SOS) */}
      {fullScreenSosAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-red-600 animate-hazard-strobe text-white shadow-2xl select-none">
          <div className="max-w-2xl w-full bg-black/80 backdrop-blur-xl border-4 border-red-500 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl">
            {/* Header Alert Pulse */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-red-600/50 flex items-center justify-center animate-sos-pulse border-2 border-white">
                <AlertTriangle className="w-12 h-12 text-white animate-bounce" />
              </div>
              <span className="text-sm font-black uppercase tracking-widest bg-white text-red-700 px-4 py-1 rounded-full">
                🚨 RIDER EMERGENCY DISASTER SOS 🚨
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
                RIDER IN CRISIS: {fullScreenSosAlert.reason.toUpperCase()}
              </h2>
            </div>

            {/* Rider & Location Information */}
            <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-left space-y-2 text-sm">
              <p>
                <strong>Courier Partner:</strong> {fullScreenSosAlert.agentName} (
                <a href={`tel:${fullScreenSosAlert.agentPhone}`} className="underline font-mono">
                  {fullScreenSosAlert.agentPhone}
                </a>
                )
              </p>
              {fullScreenSosAlert.tokenId && (
                <p>
                  <strong>Carrying Order:</strong> #{fullScreenSosAlert.tokenId}
                </p>
              )}
              {fullScreenSosAlert.locationAddress && (
                <p>
                  <strong>GPS Location:</strong> {fullScreenSosAlert.locationAddress}
                </p>
              )}
              {fullScreenSosAlert.notes && (
                <p className="italic text-red-200">
                  <strong>Notes:</strong> &quot;{fullScreenSosAlert.notes}&quot;
                </p>
              )}
            </div>

            {/* Emergency Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`tel:${fullScreenSosAlert.agentPhone}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-red-700 hover:bg-cream-100 font-bold rounded-2xl shadow-lg transition active:scale-95 text-xs uppercase tracking-wider"
              >
                <Phone className="w-4 h-4" />
                <span>Call Courier Partner Now</span>
              </a>

              {fullScreenSosAlert.lat && fullScreenSosAlert.lng && (
                <a
                  href={buildGoogleMapsUrl(fullScreenSosAlert.locationAddress || '', fullScreenSosAlert.lat, fullScreenSosAlert.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-800 hover:bg-red-700 text-white border border-white/40 font-bold rounded-2xl shadow-lg transition active:scale-95 text-xs uppercase tracking-wider"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open Live GPS in Google Maps</span>
                </a>
              )}
            </div>

            {/* Auto-minimize Countdown */}
            <div className="pt-2 flex items-center justify-between text-xs text-red-200 border-t border-white/20">
              <span>Auto-minimizing to top banner in <strong>{sosCountdown}s</strong>...</span>
              <button
                onClick={() => setFullScreenSosAlert(null)}
                className="text-white hover:underline font-bold"
              >
                Minimize Now &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PERSISTENT TOP SOS EMERGENCY BANNER (If any active SOS alert exists) */}
      {latestActiveSos && latestActiveSos.status === 'active' && !fullScreenSosAlert && (
        <div className="sticky top-0 z-30 bg-red-700 text-white px-6 py-3 flex items-center justify-between shadow-xl animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
            <span className="text-xs sm:text-sm font-bold truncate">
              🚨 <strong>ACTIVE SOS ALERT:</strong> {latestActiveSos.agentName} reported {latestActiveSos.reason.toUpperCase()}
              {latestActiveSos.locationAddress ? ` near ${latestActiveSos.locationAddress}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setSosActionCenterOpen(true)}
              className="px-3.5 py-1.5 bg-white text-red-700 hover:bg-cream-100 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition"
            >
              Open Action Center
            </button>
            <button
              onClick={() => resolveSosAlert(latestActiveSos.id, 'Kitchen Admin')}
              className="px-3 py-1.5 bg-red-900 hover:bg-black/40 text-white rounded-xl text-xs font-bold transition"
            >
              Mark Resolved
            </button>
          </div>
        </div>
      )}

      {/* 3. ADMIN HEADER & SUB-NAVIGATION */}
      <div className="bg-espresso-950 text-cream-50 px-6 py-4 border-b border-cream-900/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-banhmi-gold/20 border border-banhmi-gold/40 flex items-center justify-center text-banhmi-gold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight font-display text-cream-50">
                  ZAFIROO KITCHEN & LOGISTICS
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-cream-400">
                Clock: <strong>{currentTime}</strong> • Midnight Reset in: <strong>{midnightCountdown}</strong>
              </p>
            </div>
          </div>

          {/* Tab Switcher & Logout */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-espresso-900 p-1 rounded-2xl border border-cream-800">
              <button
                onClick={() => setActiveTab('kds')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'kds'
                    ? 'bg-banhmi-gold text-espresso-950 shadow-sm'
                    : 'text-cream-300 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>KDS Live</span>
              </button>

              <button
                onClick={() => setActiveTab('rider')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'rider'
                    ? 'bg-banhmi-gold text-espresso-950 shadow-sm'
                    : 'text-cream-300 hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Rider Portal</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'analytics'
                    ? 'bg-banhmi-gold text-espresso-950 shadow-sm'
                    : 'text-cream-300 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>
            </div>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="p-2.5 rounded-xl bg-espresso-900 hover:bg-rose-950 text-cream-300 hover:text-rose-400 border border-cream-800 transition"
              title="Lock / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. TAB 1: KITCHEN DISPLAY SYSTEM (KDS) */}
      {activeTab === 'kds' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
          {/* Quick Filters & Sound Chime Test */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-cream-200 shadow-warm-sm">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(['all', 'new', 'preparing', 'ready', 'delivering', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setKdsFilter(st)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition ${
                    kdsFilter === st
                      ? 'bg-banhmi-red text-cream-50 shadow-sm'
                      : 'bg-cream-50 text-espresso-700 hover:bg-cream-100 border border-cream-200'
                  }`}
                >
                  {st} (
                  {st === 'all'
                    ? orders.length
                    : orders.filter((o) => o.status === st).length}
                  )
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={playOrderChime}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cream-50 hover:bg-cream-100 border border-cream-300 text-espresso-700 text-xs font-semibold transition"
                title="Test Web Audio API Chime"
              >
                <Volume2 className="w-3.5 h-3.5 text-banhmi-gold" />
                <span>Test Chime</span>
              </button>
              <button
                onClick={() => setSosActionCenterOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SOS Center ({sosAlerts.filter((a) => a.status === 'active').length})</span>
              </button>
            </div>
          </div>

          {/* KDS Active Order Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKdsOrders.map((order) => {
              const isDelivery = order.deliveryMethod === 'delivery';

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-3xl border shadow-warm-sm overflow-hidden flex flex-col justify-between transition-all ${
                    order.status === 'new'
                      ? 'border-amber-400 ring-2 ring-amber-300/40'
                      : order.status === 'preparing'
                      ? 'border-orange-400'
                      : order.status === 'ready'
                      ? 'border-emerald-400'
                      : 'border-cream-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-cream-100 bg-cream-50/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-espresso-950 font-mono">
                          #{order.tokenId}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isDelivery
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {isDelivery ? 'Delivery' : 'Counter Pickup'}
                        </span>
                      </div>
                      <p className="text-[11px] text-espresso-600 mt-0.5 font-mono">
                        {order.id} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                        order.status === 'new'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'preparing'
                          ? 'bg-orange-100 text-orange-800'
                          : order.status === 'ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'delivering'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'completed'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Customer Info & Address */}
                  <div className="px-5 pt-3 pb-2 text-xs space-y-1 text-espresso-800 border-b border-cream-100">
                    <p className="font-bold text-espresso-950">
                      {order.customer.name} (
                      <a href={`tel:${order.customer.phone}`} className="underline text-banhmi-red">
                        {order.customer.phone}
                      </a>
                      )
                    </p>
                    <p className="text-[11px] text-espresso-600 line-clamp-2">
                      📍 {order.customer.address}
                    </p>
                    {order.customer.deliveryInstructions && (
                      <p className="text-[10px] text-espresso-500 italic">
                        &quot;{order.customer.deliveryInstructions}&quot;
                      </p>
                    )}
                  </div>

                  {/* Line Items */}
                  <div className="p-5 flex-1 space-y-2 divide-y divide-cream-100 max-h-56 overflow-y-auto">
                    {order.items.map((ci) => (
                      <div key={ci.id} className="pt-2 first:pt-0 flex justify-between text-xs">
                        <div>
                          <p className="font-bold text-espresso-950">
                            {ci.quantity}x {ci.menuItem.name}
                          </p>
                          {ci.selectedOptions && Object.keys(ci.selectedOptions).length > 0 && (
                            <p className="text-[10px] text-espresso-500">
                              {Object.values(ci.selectedOptions).join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-espresso-800">₹{ci.itemTotal}</span>
                      </div>
                    ))}
                  </div>

                  {/* Assigned Rider Banner (if assigned) */}
                  {order.riderName && (
                    <div className="px-5 py-2.5 bg-banhmi-card/60 border-t border-cream-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5 text-banhmi-red" />
                        <span className="font-bold text-espresso-900">{order.riderName}</span>
                      </div>
                      <span className="font-mono text-[11px] text-espresso-600">{order.riderPhone}</span>
                    </div>
                  )}

                  {/* Order Footer & Actions */}
                  <div className="p-5 border-t border-cream-200 bg-cream-50/40 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-espresso-950">
                      <span>Total: ₹{order.total.toFixed(2)} ({order.paymentMethod})</span>
                      <button
                        onClick={() => setActiveBillOrder(order)}
                        className="text-banhmi-red hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Thermal Bill</span>
                      </button>
                    </div>

                    {/* Status Progression Buttons */}
                    <div className="space-y-2">
                      {order.status === 'new' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Accept & Start Cooking</span>
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Mark Thermal Packed (Ready)</span>
                        </button>
                      )}

                      {order.status === 'ready' && isDelivery && (
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase text-espresso-600">
                            Dispatch Delivery Partner:
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {deliveryAgents.map((agent) => (
                              <button
                                key={agent.id}
                                onClick={() => assignDeliveryAgent(order.id, agent.id)}
                                className="px-2 py-1.5 bg-white hover:bg-banhmi-card border border-cream-300 rounded-lg text-[11px] font-bold text-espresso-900 truncate transition active:scale-95"
                              >
                                {agent.name.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {order.status === 'ready' && !isDelivery && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify Pickup OTP & Handover</span>
                        </button>
                      )}

                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="w-full text-center text-[10px] text-espresso-400 hover:text-rose-600 pt-1"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAB 2: DELIVERY AGENT RIDER MOBILE PORTAL */}
      {activeTab === 'rider' && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
          {/* Rider Phone Login / Switcher */}
          {!currentRider ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm-md space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-banhmi-card border border-banhmi-gold/40 text-banhmi-red rounded-2xl flex items-center justify-center mx-auto">
                  <Bike className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-espresso-950">Rider Mobile Login</h2>
                <p className="text-xs text-espresso-600">
                  Enter your registered 10-digit phone number to inspect your delivery runs.
                </p>
              </div>

              <form onSubmit={handleRiderLogin} className="space-y-3">
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210 (Aarav Sharma)"
                  value={riderPhoneInput}
                  onChange={(e) => setRiderPhoneInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-xs text-espresso-900 focus:outline-none focus:border-banhmi-red"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition"
                >
                  Access Assigned Runs
                </button>
              </form>

              {/* Quick Select Rider Pills */}
              <div className="pt-2 border-t border-cream-100">
                <span className="text-[11px] font-bold text-espresso-500 uppercase tracking-wider block mb-2 text-center">
                  Or Quick Demo Rider:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {deliveryAgents.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setCurrentRider(a)}
                      className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 rounded-xl text-xs font-semibold text-espresso-800 border border-cream-300 transition"
                    >
                      {a.name} ({a.vehicleType.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Logged in Rider Status Header */}
              <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-banhmi-card border border-banhmi-gold/40 flex items-center justify-center text-xl">
                    🛵
                  </div>
                  <div>
                    <h3 className="font-bold text-espresso-950 text-sm">{currentRider.name}</h3>
                    <p className="text-xs text-espresso-600 font-mono">{currentRider.phone}</p>
                    <p className="text-[10px] text-banhmi-gold font-bold uppercase mt-0.5">
                      {currentRider.vehicleType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentRider(null)}
                    className="px-3 py-1.5 rounded-xl border border-cream-300 text-xs font-semibold text-espresso-700 hover:bg-cream-50 transition"
                  >
                    Switch
                  </button>
                </div>
              </div>

              {/* 🚨 LARGE EMERGENCY SOS BUTTON */}
              <div className="p-5 bg-red-50 rounded-3xl border-2 border-red-300 shadow-warm-sm flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-red-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
                    <span>EMERGENCY DISASTER SOS</span>
                  </h4>
                  <p className="text-xs text-red-700 mt-0.5">
                    Bike breakdown, water-logging, flood, or medical threat? Broadcast instant GPS alert to kitchen.
                  </p>
                </div>
                <button
                  onClick={() => setRiderSosModalOpen(true)}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition active:scale-95 shrink-0"
                >
                  Trigger SOS
                </button>
              </div>

              {/* Assigned Active Orders */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-900">
                  Active Assigned Deliveries ({riderAssignedOrders.length})
                </h3>

                {riderAssignedOrders.length === 0 ? (
                  <div className="p-8 bg-white rounded-3xl border border-cream-200 text-center text-xs text-espresso-600 space-y-2">
                    <PackageCheck className="w-8 h-8 text-espresso-400 mx-auto" />
                    <p className="font-bold">No orders currently assigned to you.</p>
                    <p>When the kitchen dispatches orders, they will appear here in real-time.</p>
                  </div>
                ) : (
                  riderAssignedOrders.map((order) => {
                    const feedback = riderOtpFeedback[order.id];
                    const mapsUrl = buildGoogleMapsUrl(order.customer.address, order.customer.lat, order.customer.lng);
                    const whatsappOtpUrl = generateWhatsAppOtpLink(
                      order.customer.phone,
                      order.deliveryOtp,
                      order.tokenId,
                      order.total,
                      order.customer.name
                    );

                    return (
                      <div
                        key={order.id}
                        className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm-sm space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-base font-black text-espresso-950 font-mono">
                              #{order.tokenId}
                            </span>
                            <p className="text-xs text-espresso-500">Order ID: {order.id}</p>
                          </div>
                          <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                            {order.status}
                          </span>
                        </div>

                        {/* Customer 1-Line Address Card */}
                        <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2 text-xs">
                          <p className="font-bold text-espresso-950">
                            Customer: {order.customer.name}
                          </p>
                          <p className="text-espresso-800 leading-relaxed">
                            📍 <strong>Complete 1-Line Destination:</strong> {order.customer.address}
                          </p>
                          {order.customer.deliveryInstructions && (
                            <p className="text-espresso-600 italic">
                              <strong>Rider Note:</strong> &quot;{order.customer.deliveryInstructions}&quot;
                            </p>
                          )}
                        </div>

                        {/* 1-Tap Navigation & Call Buttons */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-3 bg-banhmi-gold hover:bg-[#c39162] text-espresso-950 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Google Maps 1-Tap</span>
                          </a>

                          <a
                            href={`tel:${order.customer.phone}`}
                            className="flex items-center justify-center gap-1.5 py-3 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Customer</span>
                          </a>
                        </div>

                        {/* WhatsApp OTP Share (All SMS removed) */}
                        <a
                          href={whatsappOtpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Share OTP Reminder to Customer WhatsApp</span>
                        </a>

                        <hr className="border-cream-200" />

                        {/* STRICT DOORSTEP 4-DIGIT OTP VERIFICATION FORM */}
                        <div className="space-y-2 pt-1">
                          <label className="block text-xs font-bold uppercase tracking-wider text-espresso-900">
                            Doorstep 4-Digit OTP Handover Verification *
                          </label>

                          {feedback && (
                            <div
                              className={`p-2.5 rounded-xl text-xs font-bold text-center ${
                                feedback.success
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-50 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {feedback.message}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="Enter 4-digit customer OTP"
                              value={riderOtpInputs[order.id] || ''}
                              onChange={(e) =>
                                setRiderOtpInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                              }
                              className="flex-1 px-4 py-2.5 rounded-xl border border-cream-300 bg-white font-mono text-center text-base tracking-widest text-espresso-900 focus:outline-none focus:border-banhmi-red shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleRiderOtpVerify(order.id)}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-95"
                            >
                              Verify & Complete
                            </button>
                          </div>
                          <p className="text-[10px] text-espresso-500">
                            Strict DB validation. Bypass codes disabled for delivery integrity.
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 3: BUSINESS ANALYTICS & ADMIN PIN SETTINGS */}
      {activeTab === 'analytics' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
          {/* Revenue KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-espresso-500">
                Total Revenue
              </span>
              <p className="text-3xl font-black text-banhmi-red font-mono">
                ₹{metrics.totalRevenue.toFixed(2)}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold">
                +18.4% from artisan kitchen sales
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-espresso-500">
                Total Orders
              </span>
              <p className="text-3xl font-black text-espresso-950 font-mono">
                {metrics.totalOrders}
              </p>
              <p className="text-[11px] text-espresso-500">
                {metrics.completedOrders} completed successfully
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-espresso-500">
                Average Order Value (AOV)
              </span>
              <p className="text-3xl font-black text-espresso-950 font-mono">
                ₹{metrics.avgOrderValue.toFixed(2)}
              </p>
              <p className="text-[11px] text-espresso-500">
                High culinary margin per order
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-espresso-500">
                Delivery vs Pickup
              </span>
              <p className="text-xl font-bold text-espresso-950">
                {metrics.deliveryOrders} Delivery / {metrics.pickupOrders} Pickup
              </p>
              <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-banhmi-red h-full"
                  style={{
                    width: `${
                      metrics.totalOrders > 0
                        ? (metrics.deliveryOrders / metrics.totalOrders) * 100
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Courier Performance Leaderboard */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-espresso-950">
              Courier Delivery Leaderboard
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-espresso-800">
                <thead>
                  <tr className="border-b border-cream-200 text-espresso-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5">Agent ID</th>
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Phone</th>
                    <th className="py-2.5">Vehicle</th>
                    <th className="py-2.5">Completed Runs</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 font-medium">
                  {deliveryAgents.map((agent) => (
                    <tr key={agent.id}>
                      <td className="py-3 font-mono font-bold text-banhmi-red">{agent.id}</td>
                      <td className="py-3 font-bold">{agent.name}</td>
                      <td className="py-3 font-mono">{agent.phone}</td>
                      <td className="py-3">{agent.vehicleType}</td>
                      <td className="py-3 font-bold">{agent.ordersDeliveredCount} deliveries</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {agent.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Custom Kitchen PIN Configuration Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm-sm max-w-lg space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-banhmi-red" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-espresso-950">
                Kitchen PIN Configuration
              </h3>
            </div>
            <p className="text-xs text-espresso-600">
              Current Kitchen PIN is <strong>{kitchenPin}</strong>. You can update it here for team access.
            </p>

            {pinSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                {pinSuccessMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePin} className="space-y-3">
              <input
                type="text"
                placeholder="Enter new 4-digit PIN"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs text-espresso-900 font-mono tracking-widest focus:outline-none focus:border-banhmi-red"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 font-bold rounded-xl text-xs transition active:scale-95"
              >
                Update Kitchen PIN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. SOS ACTION CENTER MODAL (Admin inspection of active alerts) */}
      {sosActionCenterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-cream-200 pb-4">
              <div className="flex items-center gap-2.5 text-red-700">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-black uppercase tracking-tight">
                  Logistics SOS Emergency Action Center
                </h3>
              </div>
              <button
                onClick={() => setSosActionCenterOpen(false)}
                className="p-1.5 rounded-full hover:bg-cream-100 text-espresso-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {sosAlerts.length === 0 ? (
                <p className="text-xs text-espresso-600 text-center py-6">
                  No active or past SOS alerts recorded.
                </p>
              ) : (
                sosAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-5 rounded-2xl border space-y-3 ${
                      alert.status === 'active'
                        ? 'bg-red-50 border-red-300 shadow-sm'
                        : 'bg-cream-50 border-cream-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-red-800">
                        {alert.id} • {new Date(alert.createdAt).toLocaleTimeString()}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          alert.status === 'active'
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <div className="text-xs text-espresso-900 space-y-1">
                      <p>
                        <strong>Rider:</strong> {alert.agentName} (
                        <a href={`tel:${alert.agentPhone}`} className="underline text-red-700 font-mono">
                          {alert.agentPhone}
                        </a>
                        )
                      </p>
                      <p>
                        <strong>Disaster Reason:</strong>{' '}
                        <span className="font-black uppercase text-red-700">{alert.reason}</span>
                      </p>
                      {alert.locationAddress && (
                        <p>
                          <strong>Location:</strong> {alert.locationAddress}
                        </p>
                      )}
                      {alert.notes && <p className="italic text-espresso-700">&quot;{alert.notes}&quot;</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-cream-200">
                      <a
                        href={`tel:${alert.agentPhone}`}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Courier</span>
                      </a>

                      {alert.lat && alert.lng && (
                        <a
                          href={buildGoogleMapsUrl(alert.locationAddress || '', alert.lat, alert.lng)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google Maps Pin</span>
                        </a>
                      )}

                      {alert.status === 'active' && (
                        <button
                          onClick={() => resolveSosAlert(alert.id, 'Kitchen Admin')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition ml-auto"
                        >
                          Resolve Alert
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. RIDER SOS MODAL */}
      {riderSosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-red-500 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-base font-black uppercase tracking-tight">
                  Trigger Emergency SOS
                </h3>
              </div>
              <button
                onClick={() => setRiderSosModalOpen(false)}
                className="p-1 rounded-full text-espresso-600 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRiderSosSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1.5">
                  Select Disaster Reason *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'breakdown', label: '🛵 Bike Breakdown' },
                    { key: 'flood', label: '🌊 Severe Rain / Flood' },
                    { key: 'traffic', label: '🚗 Gridlock Traffic' },
                    { key: 'accident', label: '⚠️ Road Incident' },
                    { key: 'medical', label: '🏥 Medical Issue' },
                    { key: 'threat', label: '🛡️ Safety Threat' },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setRiderSosReason(cat.key as SosReason)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                        riderSosReason === cat.key
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-cream-50 text-espresso-800 border-cream-300 hover:border-red-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe your location or immediate issue..."
                  value={riderSosNotes}
                  onChange={(e) => setRiderSosNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50 text-xs text-espresso-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <p className="text-[11px] text-espresso-600 italic">
                * Your high-accuracy GPS coordinates will automatically be transmitted to the kitchen display.
              </p>

              <button
                type="submit"
                disabled={riderSosSubmitting}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50"
              >
                {riderSosSubmitting ? 'Broadcasting Emergency...' : '🚨 Broadcast SOS To Kitchen'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 9. BILL RECEIPT MODAL */}
      <BillModal
        order={activeBillOrder}
        isOpen={Boolean(activeBillOrder)}
        onClose={() => setActiveBillOrder(null)}
      />
    </div>
  );
}
