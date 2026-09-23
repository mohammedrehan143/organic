'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useOrder } from '@/context/OrderContext';
import {
  Order,
  OrderStatus,
  DeliveryAgent,
  SosAlert,
  SosReason,
  Membership,
} from '@/types/cafe';
import {
  formatFullOneLineAddress,
  buildGoogleMapsUrl,
  getCurrentLocationAddress,
} from '@/lib/location';
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
  Sparkles,
  ArrowLeft,
  Home,
  XCircle,
  AlertOctagon,
  Ban,
  Crown,
  Check,
  ExternalLink,
  MessageSquare,
  Mail,
  MapPin,
  Zap,
  RotateCcw,
  Copy,
  CreditCard,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { BillModal } from '@/components/BillModal';
import { generateRiderSosWhatsAppLink } from '@/lib/whatsapp';
import { CAFE_METADATA } from '@/data/cafeData';

export default function AdminPage() {
  const {
    orders,
    refreshOrders,
    updateOrderStatus,
    deleteOrder,
    clearAllOrders,
    assignDeliveryAgent,
    dispatchOrder,
    deliveryAgents,
    refreshDeliveryAgents,
    sosAlerts,
    refreshSosAlerts,
    latestActiveSos,
    triggerRiderSos,
    resolveSosAlert,
    playOrderChime,
    playSosSiren,
  } = useOrder();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authRole, setAuthRole] = useState<'admin' | 'rider'>('admin');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [updatingPin, setUpdatingPin] = useState(false);

  // Mode: Kitchen KDS vs Rider Mobile Mode vs Analytics vs Memberships
  const [activeTab, setActiveTab] = useState<'kds' | 'rider' | 'analytics' | 'memberships'>('kds');

  // Admin Memberships State
  const [adminMemberships, setAdminMemberships] = useState<Membership[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(false);
  const [membershipFilter, setMembershipFilter] = useState<'all' | '6_months' | '1_month' | 'due' | 'active'>('all');
  const [membershipSearch, setMembershipSearch] = useState('');
  const [membershipActionLoading, setMembershipActionLoading] = useState<string | null>(null);
  const [membershipActionMsg, setMembershipActionMsg] = useState('');
  const [extendConfirmMembership, setExtendConfirmMembership] = useState<Membership | null>(null);

  const fetchAdminMemberships = async () => {
    setMembershipsLoading(true);
    try {
      const res = await fetch('/api/membership');
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminMemberships(data.memberships || []);
      }
    } catch (err) {
      console.error('Failed to load admin memberships:', err);
    } finally {
      setMembershipsLoading(false);
    }
  };

  const handleMarkMembershipPaid = async (membership: Membership) => {
    setMembershipActionLoading(membership.id);
    setMembershipActionMsg('');
    try {
      const res = await fetch('/api/membership', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: membership.id,
          phone: membership.phone,
          action: 'mark_paid',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMembershipActionMsg(`✓ Marked month-end bill paid for ${membership.customerName}. Renewed for 30 days.`);
        await fetchAdminMemberships();
      }
    } catch (err) {
      console.error('Error marking paid:', err);
    } finally {
      setMembershipActionLoading(null);
    }
  };

  const handleExtendMembership30 = async (membership: Membership) => {
    setExtendConfirmMembership(null);
    setMembershipActionLoading(membership.id);
    setMembershipActionMsg('');
    try {
      const res = await fetch('/api/membership', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: membership.id,
          phone: membership.phone,
          action: 'extend_30',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMembershipActionMsg(`✓ Extended membership by 30 days for ${membership.customerName}.`);
        await fetchAdminMemberships();
      } else {
        setMembershipActionMsg(`✗ Failed to extend membership. Please try again.`);
      }
    } catch (err) {
      console.error('Error extending membership:', err);
      setMembershipActionMsg(`✗ Network error. Please try again.`);
    } finally {
      setMembershipActionLoading(null);
    }
  };

  // Rider Login State
  const [riderPhoneInput, setRiderPhoneInput] = useState('');
  const [currentRider, setCurrentRider] = useState<DeliveryAgent | null>(null);
  const [riderLoading, setRiderLoading] = useState(false);
  const [riderError, setRiderError] = useState('');
  // KDS Live Clock
  const [currentTime, setCurrentTime] = useState('');

  // Full-Screen 5-Second Red SOS Alert Takeover
  const [fullScreenSosAlert, setFullScreenSosAlert] = useState<SosAlert | null>(null);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosActionCenterOpen, setSosActionCenterOpen] = useState(false);
  const [shownSosIds, setShownSosIds] = useState<Set<string>>(new Set());

  // Rider SOS Modal
  const [riderSosModalOpen, setRiderSosModalOpen] = useState(false);
  const [riderSosReason, setRiderSosReason] = useState<SosReason>('breakdown');
  const [riderSosNotes, setRiderSosNotes] = useState('');
  const [riderSosSubmitting, setRiderSosSubmitting] = useState(false);

  // Bill Receipt Modal
  const [activeBillOrder, setActiveBillOrder] = useState<Order | null>(null);

  // Customer Refund Details Modal
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [actionLoadingOrderId, setActionLoadingOrderId] = useState<string | null>(null);

  const handleMarkAsRefunded = async (orderId: string) => {
    setIsProcessingRefund(true);
    try {
      const updated = await updateOrderStatus(orderId, 'cancelled', { paymentStatus: 'refunded' });
      if (updated && refundModalOrder && refundModalOrder.id === orderId) {
        setRefundModalOrder(updated);
      }
    } catch (err) {
      console.error('Failed to mark order as refunded:', err);
      alert('Failed to update refund status. Please try again.');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Status Filter in KDS: Order Placed ('new'), Out for Delivery ('delivering'), Delivered ('completed'), Cancelled ('cancelled')
  const [kdsFilter, setKdsFilter] = useState<'all' | 'new' | 'delivering' | 'completed' | 'cancelled'>('all');

  // Clock Timer
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-Time Background Sync for Kitchen KDS & Rider Dispatch Portal (Runs strictly inside Admin Portal)
  useEffect(() => {
    if (!isAuthenticated) return;

    refreshOrders();
    refreshDeliveryAgents();
    refreshSosAlerts();

    const interval = setInterval(() => {
      refreshOrders();
      refreshDeliveryAgents();
      refreshSosAlerts();
    }, 2000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshOrders, refreshDeliveryAgents, refreshSosAlerts]);

  // Monitor latestActiveSos for Full-Screen Red Alert Takeover
  useEffect(() => {
    if (authRole !== 'rider' && latestActiveSos && latestActiveSos.status === 'active' && !shownSosIds.has(latestActiveSos.id)) {
      // Only trigger if this SOS ID has not been shown yet (prevents looping to all riders)
      setShownSosIds((prev) => new Set([...prev, latestActiveSos.id]));
      setFullScreenSosAlert(latestActiveSos);
      playSosSiren();
    }
  }, [authRole, latestActiveSos, playSosSiren, shownSosIds]);

  // Auth Handler - Server & Database Verified
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPinInput('');
      } else {
        setPinError(data.message || 'Invalid PIN or Master Key. Access denied.');
      }
    } catch {
      setPinError('Connection to authentication server failed. Check your network.');
    } finally {
      setPinLoading(false);
    }
  };

  // Update Kitchen PIN in Database
  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    const clean = newPinInput.trim();
    if (clean.length < 4) {
      setPinError('New PIN must be at least 4 digits');
      return;
    }
    setUpdatingPin(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_pin', newPin: clean }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPinSuccessMsg('Admin access PIN updated successfully in database.');
        setNewPinInput('');
        setTimeout(() => setPinSuccessMsg(''), 4000);
      } else {
        setPinError(data.message || 'Failed to update PIN in database');
      }
    } catch {
      setPinError('Failed to communicate with database server.');
    } finally {
      setUpdatingPin(false);
    }
  };

  // Rider Login Handler - Verified against Supabase Database
  const handleRiderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = riderPhoneInput.replace(/[^0-9]/g, '');
    if (!clean) return;
    setRiderError('');
    setRiderLoading(true);

    try {
      const res = await fetch('/api/delivery/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.agent) {
        setCurrentRider(data.agent);
      } else {
        setRiderError(data.message || 'No courier partner account found with this phone number.');
      }
    } catch {
      setRiderError('Network error verifying rider identity.');
    } finally {
      setRiderLoading(false);
    }
  };

  // 1-Click Direct Delivery Completion (No OTP required)
  const handleMarkOrderDelivered = async (orderId: string) => {
    setActionLoadingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, 'completed');
    } finally {
      setActionLoadingOrderId(null);
    }
  };

  // Rider confirms cash payment collected for COD orders
  const handlePaymentReceived = async (orderId: string, currentStatus: string) => {
    if (!currentRider) return;
    await updateOrderStatus(orderId, currentStatus as any, {
      paymentStatus: 'paid',
      paymentReceivedAt: new Date().toISOString(),
      paymentReceivedBy: currentRider.name,
      paymentReceivedByPhone: currentRider.phone,
    } as any);
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

  // Filtered Orders for KDS: 2 Main Statuses: Order Placed ('new') & Out for Delivery ('delivering'), plus Delivered ('completed') & Cancelled ('cancelled')
  const filteredKdsOrders = useMemo(() => {
    if (kdsFilter === 'all') return orders;
    if (kdsFilter === 'new') {
      return orders.filter((o) => o.status === 'new' || o.status === 'preparing');
    }
    if (kdsFilter === 'delivering') {
      return orders.filter((o) => o.status === 'delivering' || o.status === 'ready');
    }
    if (kdsFilter === 'completed') {
      return orders.filter((o) => o.status === 'completed');
    }
    if (kdsFilter === 'cancelled') {
      return orders.filter((o) => o.status === 'cancelled');
    }
    return orders.filter((o) => o.status === kdsFilter);
  }, [orders, kdsFilter]);

  // Assigned Active Orders for Logged-In Rider (excluding completed and cancelled)
  const riderAssignedOrders = useMemo(() => {
    if (!currentRider) return [];
    const riderDigits = currentRider.phone.replace(/[^0-9]/g, '');
    return orders.filter(
      (o) =>
        o.deliveryMethod === 'delivery' &&
        o.status !== 'completed' &&
        o.status !== 'cancelled' &&
        (o.deliveryAgentId === currentRider.id ||
          (o.riderPhone && o.riderPhone.replace(/[^0-9]/g, '') === riderDigits))
    );
  }, [orders, currentRider]);

  // Orders waiting for courier claim / assignment
  const unassignedOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.deliveryMethod === 'delivery' &&
        o.status !== 'completed' &&
        o.status !== 'cancelled' &&
        !o.deliveryAgentId
    );
  }, [orders]);

  // Delivered runs completed by logged-in rider
  const riderCompletedOrders = useMemo(() => {
    if (!currentRider) return [];
    const riderDigits = currentRider.phone.replace(/[^0-9]/g, '');
    return orders.filter(
      (o) =>
        o.status === 'completed' &&
        o.deliveryMethod === 'delivery' &&
        (o.deliveryAgentId === currentRider.id ||
          (o.riderPhone && o.riderPhone.replace(/[^0-9]/g, '') === riderDigits))
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

  // Filtered Memberships for Admin Registry
  const filteredAdminMemberships = useMemo(() => {
    let list = adminMemberships;
    if (membershipSearch.trim()) {
      const q = membershipSearch.trim().toLowerCase();
      const qDigits = q.replace(/[^0-9]/g, '');
      list = list.filter((m) => {
        if (m.customerName?.toLowerCase().includes(q)) return true;
        if (m.id?.toLowerCase().includes(q)) return true;
        if (qDigits && m.phone?.replace(/[^0-9]/g, '').includes(qDigits)) return true;
        return false;
      });
    }
    if (membershipFilter === '6_months') {
      return list.filter((m) => m.planType === '6_months');
    }
    if (membershipFilter === '1_month') {
      return list.filter((m) => m.planType === '1_month');
    }
    if (membershipFilter === 'due') {
      return list.filter((m) => m.paymentStatus === 'due' || m.status === 'expired');
    }
    if (membershipFilter === 'active') {
      return list.filter((m) => m.status === 'active' && m.paymentStatus !== 'due');
    }
    return list;
  }, [adminMemberships, membershipSearch, membershipFilter]);

  // If not authenticated, render Admin Login Modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 bg-banhmi-bg">
        {/* Top Back Link */}
        <div className="w-full max-w-md mb-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173612] hover:text-[#0F240B] bg-white px-3.5 py-1.5 rounded-full border border-[#CBE0A3] shadow-sm hover:shadow transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Website</span>
          </Link>
          <span className="text-[11px] font-bold text-[#385A2A]">Zafiroo Kitchen & KDS</span>
        </div>

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
                Admin / Kitchen Access PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-espresso-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter Secure Access PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-center font-mono text-lg tracking-widest text-espresso-900 focus:outline-none focus:border-banhmi-red shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pinLoading}
              className="w-full py-3.5 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 font-bold rounded-2xl shadow-warm-md transition active:scale-95 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              {pinLoading ? 'Verifying...' : 'Authenticate & Enter'}
            </button>
          </form>

          {/* Bottom Return Button */}
          <div className="pt-2 border-t border-cream-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[#173612] hover:text-[#0F240B] transition py-2 px-4 rounded-xl hover:bg-[#F5FAF0] w-full"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Customer Website</span>
            </Link>
          </div>
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

            {/* Manual Minimize */}
            <div className="pt-2 flex items-center justify-center text-xs text-red-200 border-t border-white/20">
              <button
                onClick={() => setFullScreenSosAlert(null)}
                className="text-white hover:underline font-bold px-4 py-2"
              >
                Minimize to Top Banner &rarr;
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
                Clock: <strong>{currentTime}</strong> • Status: <strong>Persistent (Orders Stay Active Until Completed)</strong>
              </p>
            </div>
          </div>

          {/* Back to Website, Tab Switcher & Logout */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white hover:text-[#173612] text-cream-100 font-bold text-xs transition border border-white/20 shadow-sm cursor-pointer"
              title="Return to Customer Store Website"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Website</span>
              <span className="sm:hidden">Website</span>
            </Link>

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

              <button
                onClick={() => {
                  setActiveTab('memberships');
                  fetchAdminMemberships();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'memberships'
                    ? 'bg-banhmi-gold text-espresso-950 shadow-sm'
                    : 'text-cream-300 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Memberships</span>
              </button>
            </div>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="p-2.5 rounded-xl bg-espresso-900 hover:bg-rose-950 text-cream-300 hover:text-rose-400 border border-cream-800 transition cursor-pointer"
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
              {[
                { key: 'all' as const, label: 'All Orders', count: orders.length, isDanger: false },
                { key: 'new' as const, label: '1. Order Placed', count: orders.filter((o) => o.status === 'new' || o.status === 'preparing').length, isDanger: false },
                { key: 'delivering' as const, label: '2. Out for Delivery', count: orders.filter((o) => o.status === 'delivering' || o.status === 'ready').length, isDanger: false },
                { key: 'completed' as const, label: '3. Delivered', count: orders.filter((o) => o.status === 'completed').length, isDanger: false },
                { key: 'cancelled' as const, label: '4. Cancelled', count: orders.filter((o) => o.status === 'cancelled').length, isDanger: true },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setKdsFilter(f.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    kdsFilter === f.key
                      ? f.isDanger
                        ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400'
                        : 'bg-banhmi-red text-cream-50 shadow-sm'
                      : f.isDanger && f.count > 0
                      ? 'bg-red-50 text-red-700 border-2 border-red-400 hover:bg-red-100 font-black'
                      : 'bg-cream-50 text-espresso-700 hover:bg-cream-100 border border-cream-200'
                  }`}
                >
                  {f.isDanger && f.count > 0 && <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />}
                  <span>{f.label} ({f.count})</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => refreshOrders()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition cursor-pointer"
                title="Force refresh and sync directly with database"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sync DB</span>
              </button>
              {orders.length > 0 && (
                <button
                  onClick={async () => {
                    if (confirm('Permanently delete all orders from database and memory? This cannot be undone.')) {
                      await clearAllOrders();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition cursor-pointer"
                  title="Purge all orders"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Clear All</span>
                </button>
              )}
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

          {/* 💵 Payment Received → Awaiting Bill Send */}
          {orders.filter((o) => o.paymentStatus === 'paid' && !o.billApproved && o.status !== 'cancelled').length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl border-2 border-emerald-400 bg-emerald-50 shadow-warm-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-900">
                  <span className="text-lg">💵</span>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Payment Received — Bill Pending Send
                  </h3>
                </div>
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                  {orders.filter((o) => o.paymentStatus === 'paid' && !o.billApproved && o.status !== 'cancelled').length} order(s)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {orders
                  .filter((o) => o.paymentStatus === 'paid' && !o.billApproved && o.status !== 'cancelled')
                  .map((pb) => (
                    <div key={pb.id} className="bg-white rounded-2xl border border-emerald-200 p-3.5 text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-espresso-950">#{pb.tokenId}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {pb.status}
                        </span>
                      </div>
                      <div className="text-espresso-800 space-y-0.5">
                        <p className="font-bold text-espresso-950">👤 {pb.customer.name}</p>
                        <p>📞 {pb.customer.phone}</p>
                        <p className="leading-relaxed truncate">📍 {pb.customer.address}</p>
                        <p className="font-bold text-espresso-950">💳 {pb.paymentMethod}</p>
                        {pb.paymentReceivedBy && (
                          <p>🛵 Collected by {pb.paymentReceivedBy}{pb.paymentReceivedAt ? ` • ${new Date(pb.paymentReceivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-cream-200">
                        <span className="font-black text-banhmi-red font-mono">₹{pb.total}</span>
                        <button
                          onClick={() => updateOrderStatus(pb.id, pb.status as any, { billApproved: true } as any)}
                          className="px-3.5 py-2 bg-[#173612] hover:bg-[#0F240B] text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition active:scale-95 flex items-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-300" />
                          <span>Approve &amp; Unlock Bill →</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* KDS Active Order Cards Grid */}
          {filteredKdsOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center space-y-3 shadow-warm-sm">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold border border-emerald-200">
                ✓
              </div>
              <h3 className="text-base font-black text-espresso-950">No Orders in Database</h3>
              <p className="text-xs text-espresso-600 max-w-md mx-auto leading-relaxed">
                The database order queue is completely clear. New customer orders and delivery runs will appear here automatically in real time.
              </p>
              <button
                type="button"
                onClick={() => refreshOrders()}
                className="px-4 py-2 bg-[#173612] hover:bg-[#0F240B] text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync with Database</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKdsOrders.map((order) => {
              const isDelivery = order.deliveryMethod === 'delivery';
              const isCancelled = order.status === 'cancelled';

              return (
                <div
                  key={order.id}
                  className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all ${
                    isCancelled && order.paymentStatus === 'refunded'
                      ? 'border-2 border-emerald-500 bg-emerald-50/70 shadow-lg shadow-emerald-200/50 ring-2 ring-emerald-400/40'
                      : isCancelled
                      ? 'border-2 border-red-500 bg-red-50/70 shadow-lg shadow-red-200/50 ring-2 ring-red-400/40'
                      : order.status === 'new'
                      ? 'bg-white border-amber-400 ring-2 ring-amber-300/40 shadow-warm-sm'
                      : order.status === 'preparing'
                      ? 'bg-white border-orange-400 shadow-warm-sm'
                      : order.status === 'ready'
                      ? 'bg-white border-emerald-400 shadow-warm-sm'
                      : 'bg-white border-cream-200 shadow-warm-sm'
                  }`}
                >
                  {/* Top Cancelled / Refunded Banner Across Card Header */}
                  {isCancelled && (
                    <div className={`${order.paymentStatus === 'refunded' ? 'bg-emerald-600' : 'bg-red-600'} text-white px-4 py-2.5 flex items-center justify-between shadow-sm`}>
                      <div className="flex items-center gap-2">
                        {order.paymentStatus === 'refunded' ? (
                          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-white animate-pulse shrink-0" />
                        )}
                        <span className="font-black text-xs uppercase tracking-wider">
                          {order.paymentStatus === 'refunded' ? 'REFUND PROCESSED' : '🚨 ORDER CANCELLED'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] bg-white/90 ${order.paymentStatus === 'refunded' ? 'text-emerald-900' : 'text-red-800'} font-black px-2 py-0.5 rounded uppercase shadow-xs hidden sm:inline`}>
                          {order.paymentStatus === 'refunded' ? 'RESOLVED' : 'DO NOT DISPATCH'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRefundModalOrder(order)}
                          className="text-[10px] bg-white hover:bg-cream-100 text-espresso-900 font-black px-2.5 py-1 rounded-md uppercase shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-espresso-600" />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card Header */}
                  <div
                    className={`p-5 border-b flex items-center justify-between ${
                      isCancelled && order.paymentStatus === 'refunded'
                        ? 'border-emerald-200 bg-emerald-100/60'
                        : isCancelled
                        ? 'border-red-200 bg-red-100/60'
                        : 'border-cream-100 bg-cream-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-base font-black font-mono ${
                            isCancelled ? 'text-red-950 font-black' : 'text-espresso-950'
                          }`}
                        >
                          #{order.tokenId}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isCancelled
                              ? 'bg-red-200 text-red-900 border border-red-300'
                              : isDelivery
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

                    <div className="flex items-center gap-2">
                      {/* Prominent Header Bill Approve Toggle */}
                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, order.status as any, { billApproved: !order.billApproved } as any);
                          }}
                          className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition cursor-pointer active:scale-95 border shadow-xs flex items-center gap-1.5 ${
                            order.billApproved
                              ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                              : "bg-amber-300 text-amber-950 border-amber-500 hover:bg-amber-400 font-black animate-pulse"
                          }`}
                          title={order.billApproved ? "Customer can download bill. Click to lock." : "Customer bill is locked. Click to approve & unlock."}
                        >
                          {order.billApproved ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-white" />
                              <span>Bill Approved</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-amber-950" />
                              <span>Approve Bill</span>
                            </>
                          )}
                        </button>
                      )}

                      <span
                        className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                          order.paymentStatus === 'refunded'
                            ? 'bg-emerald-600 text-white font-black border border-emerald-700 shadow-sm flex items-center gap-1'
                            : isCancelled
                            ? 'bg-red-600 text-white font-black border border-red-700 shadow-sm flex items-center gap-1 animate-pulse'
                            : order.status === 'new' || order.status === 'preparing'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : order.status === 'delivering' || order.status === 'ready'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : order.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {order.paymentStatus === 'refunded' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Refunded</span>
                          </>
                        ) : isCancelled ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancelled</span>
                          </>
                        ) : order.status === 'new' || order.status === 'preparing' ? (
                          'Order Placed'
                        ) : order.status === 'delivering' || order.status === 'ready' ? (
                          'Out for Delivery'
                        ) : order.status === 'completed' ? (
                          'Delivered'
                        ) : (
                          'Cancelled'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Alert Note If Cancelled or Refunded */}
                  {isCancelled && (
                    <div className={`mx-5 mt-4 p-3.5 border-2 rounded-2xl flex items-start gap-3 text-xs ${
                      order.paymentStatus === 'refunded'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-red-100/90 border-red-300 text-red-900'
                    }`}>
                      {order.paymentStatus === 'refunded' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <p className={`font-black uppercase tracking-wide ${order.paymentStatus === 'refunded' ? 'text-emerald-900' : 'text-red-900'}`}>
                          {order.paymentStatus === 'refunded' ? 'Cancelled & Refund Processed' : 'Cancelled Before Courier Dispatch'}
                        </p>
                        <p className={`text-[11px] leading-relaxed font-medium ${order.paymentStatus === 'refunded' ? 'text-emerald-800' : 'text-red-800'}`}>
                          {order.paymentStatus === 'refunded' 
                            ? 'The customer cancelled this order and the online refund has been successfully processed.' 
                            : 'The customer cancelled this order prior to delivery dispatch. Keep organic products in cold storage. Do not pack or dispatch.'}
                        </p>
                      </div>
                    </div>
                  )}

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
                          <p className={`font-bold ${isCancelled ? 'line-through text-red-900/70' : 'text-espresso-950'}`}>
                            {ci.quantity}x {ci.menuItem.name}
                          </p>
                          {ci.selectedOptions && Object.keys(ci.selectedOptions).length > 0 && (
                            <p className="text-[10px] text-espresso-500">
                              {Object.values(ci.selectedOptions).join(', ')}
                            </p>
                          )}
                        </div>
                        <span className={`font-semibold ${isCancelled ? 'text-red-700' : 'text-espresso-800'}`}>
                          ₹{ci.itemTotal}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Assigned Rider Banner (if assigned) */}
                  {order.riderName && !isCancelled && (
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
                       <div className="flex flex-wrap items-center gap-2">
                         <button
                           onClick={() => updateOrderStatus(order.id, order.status as any, { billApproved: !order.billApproved } as any)}
                           className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl transition cursor-pointer active:scale-95 shadow-xs ${
                             order.billApproved
                               ? "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700"
                               : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                           }`}
                           title={order.billApproved ? "Customer can download bill. Click to revoke access." : "Customer cannot download bill. Click to grant access."}
                         >
                           {order.billApproved ? (
                             <>
                               <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                               <span>✓ Bill Download UNLOCKED</span>
                             </>
                           ) : (
                             <>
                               <Lock className="w-3.5 h-3.5 text-amber-800" />
                               <span>🔓 Show Bill (Unlock Customer Download)</span>
                             </>
                           )}
                         </button>
                         <button
                           onClick={() => setActiveBillOrder(order)}
                           className="px-3 py-1.5 bg-white hover:bg-cream-100 border border-cream-300 rounded-xl text-espresso-800 hover:text-espresso-950 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
                         >
                           <Printer className="w-3.5 h-3.5 text-[#173612]" />
                           <span>Preview / Print</span>
                         </button>
                       </div>
                    </div>

                    {/* Action Area: Blocked if Cancelled vs Normal Progression */}
                    <div className="space-y-2">
                      {isCancelled ? (
                        <div className="space-y-2">
                          {order.paymentStatus === 'refunded' ? (
                            <div className="py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-xs font-black text-center tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm">
                              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                              <span>ORDER CANCELLED & REFUNDED</span>
                            </div>
                          ) : (
                            <div className="py-2.5 px-4 bg-red-600 text-white rounded-xl text-xs font-black text-center tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm">
                              <Ban className="w-4 h-4 text-white shrink-0" />
                              <span>ORDER CANCELLED — DISPATCH BLOCKED</span>
                            </div>
                          )}

                          {/* Prominent Refund Action Button */}
                          <button
                            type="button"
                            onClick={() => setRefundModalOrder(order)}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-black text-center tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer ${
                              order.paymentStatus === 'refunded'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-amber-600 hover:bg-amber-700 text-white'
                            }`}
                          >
                            <RotateCcw className="w-4 h-4 shrink-0" />
                            <span>
                              {order.paymentStatus === 'refunded'
                                ? '✓ Refund Processed (View Details)'
                                : 'Process Refund • View Customer Details'}
                            </span>
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Dedicated Bill Approve Option for Customer */}
                          <div className="pb-1">
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, order.status as any, { billApproved: !order.billApproved } as any)}
                              className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-xs border ${
                                order.billApproved
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                                  : "bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500 animate-pulse"
                              }`}
                            >
                              {order.billApproved ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                  <span>✓ Bill Approved for Customer (Click to Lock)</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4 text-amber-950" />
                                  <span>Approve Bill for Customer</span>
                                </>
                              )}
                            </button>
                          </div>

                          {(order.status === 'new' || order.status === 'preparing') && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button
                                  disabled={actionLoadingOrderId === order.id}
                                  onClick={async () => {
                                    setActionLoadingOrderId(order.id);
                                    try {
                                      await dispatchOrder(order.id);
                                    } finally {
                                      setActionLoadingOrderId(null);
                                    }
                                  }}
                                  className="w-full py-3 bg-[#173612] hover:bg-[#0F240B] text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-[#2E6125] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Bike className="w-4 h-4 text-emerald-400" />
                                  <span>{actionLoadingOrderId === order.id ? 'Dispatching...' : '🚀 Dispatch Order'}</span>
                                </button>
                                <button
                                  disabled={actionLoadingOrderId === order.id}
                                  onClick={async () => {
                                    setActionLoadingOrderId(order.id);
                                    try {
                                      await updateOrderStatus(order.id, 'completed');
                                    } finally {
                                      setActionLoadingOrderId(null);
                                    }
                                  }}
                                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                  <span>{actionLoadingOrderId === order.id ? 'Delivering...' : '✓ Mark Delivered'}</span>
                                </button>
                              </div>
                              <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 bg-cream-100 rounded-lg text-espresso-700 font-medium border border-cream-200">
                                <span>🛵 Partner: <strong className="text-espresso-950 font-bold">Syed</strong> (Electric Eco-Van)</span>
                                <span className="font-mono text-espresso-600 font-semibold">{order.riderPhone || '7259635948'}</span>
                              </div>
                            </div>
                          )}

                          {(order.status === 'delivering' || order.status === 'ready') && (
                            <div className="space-y-2.5">
                              {/* Courier In Transit Info & WhatsApp Shortcuts */}
                              <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-xl space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-blue-950 flex items-center gap-1.5">
                                    <Bike className="w-4 h-4 text-blue-600 animate-pulse" />
                                    <span>Out for Delivery with Syed</span>
                                  </span>
                                  <span className="text-[11px] font-mono text-blue-800 font-bold">
                                    {order.riderPhone || '7259635948'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-blue-100">
                                  <a
                                    href={`tel:${order.riderPhone || '7259635948'}`}
                                    className="py-1.5 px-2 bg-white hover:bg-blue-100/70 border border-blue-300 rounded-lg text-center text-[10px] font-bold text-blue-900 transition flex items-center justify-center gap-1"
                                  >
                                    <Phone className="w-3 h-3 text-blue-600" />
                                    <span>Call Syed</span>
                                  </a>
                                  <a
                                    href={`https://wa.me/${(order.riderPhone || '917259635948').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`📦 *Order #${order.tokenId} Delivery Details*\nCustomer: ${order.customer.name}\nPhone: ${order.customer.phone}\nAddress: ${order.customer.address}\nAmount: ₹${order.total}\nOTP: ${order.deliveryOtp}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-center text-[10px] font-bold transition flex items-center justify-center gap-1"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WhatsApp Syed</span>
                                  </a>
                                </div>
                              </div>

                              {/* Primary Action Button: Mark Order Delivered */}
                              <button
                                disabled={actionLoadingOrderId === order.id}
                                onClick={async () => {
                                  setActionLoadingOrderId(order.id);
                                  try {
                                    await updateOrderStatus(order.id, 'completed');
                                  } finally {
                                    setActionLoadingOrderId(null);
                                  }
                                }}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <CheckCircle2 className="w-4 h-4 text-white" />
                                <span>{actionLoadingOrderId === order.id ? 'Marking Delivered...' : '✓ Mark Order Delivered'}</span>
                              </button>
                            </div>
                          )}

                          {order.status === 'completed' && (
                            <div className="py-2.5 px-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center border border-emerald-200 flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Delivered Successfully by Syed {order.deliveredAt ? `(${new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}</span>
                            </div>
                          )}

                          {/* Admin Cancel Order Button - available for any non-completed, non-cancelled order */}
                          {order.status !== 'completed' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5 text-rose-600" />
                              <span>Cancel Order (Admin)</span>
                            </button>
                          )}

                          {/* Permanent Delete Order Button */}
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Permanently delete order #${order.tokenId} (${order.id}) from database?`)) {
                                await deleteOrder(order.id);
                              }
                            }}
                            className="w-full py-1.5 px-3 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400" />
                            <span>Delete from Database</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
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
                {riderError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center">
                    {riderError}
                  </div>
                )}
                <input
                  type="tel"
                  required
                  placeholder="Enter registered 10-digit phone number"
                  value={riderPhoneInput}
                  onChange={(e) => setRiderPhoneInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-xs text-espresso-900 focus:outline-none focus:border-banhmi-red"
                />
                <button
                  type="submit"
                  disabled={riderLoading}
                  className="w-full py-3 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50"
                >
                  {riderLoading ? 'Verifying Courier Account...' : 'Access Assigned Runs'}
                </button>
              </form>

                <span className="text-[11px] font-bold text-espresso-500 uppercase tracking-wider block mb-2 text-center">
                  Sole Delivery Partner:
                </span>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const syed = deliveryAgents.find((a) => a.id === 'AGT-SYED-01') || deliveryAgents[0];
                      if (syed) setCurrentRider(syed);
                    }}
                    className="px-5 py-2.5 bg-[#173612] hover:bg-[#0F240B] text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Bike className="w-4 h-4 text-emerald-400" />
                    <span>Quick Access as Syed (7259635948)</span>
                  </button>
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

              {/* Ready Orders Available for Self-Claim / Pickup */}
              {unassignedOrders.length > 0 && (
                <div className="space-y-3 p-5 bg-amber-50 rounded-3xl border-2 border-amber-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ready for Pickup & Dispatch ({unassignedOrders.length})</span>
                    </h4>
                    <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Open Runs
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {unassignedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-espresso-950">#{order.tokenId}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              {order.status === 'delivering' ? 'Out for Delivery' : 'Order Placed'}
                            </span>
                          </div>
                          <p className="text-espresso-800 font-semibold mt-1">To: {order.customer.name}</p>
                          <p className="text-[11px] text-espresso-600 line-clamp-1">{order.customer.address}</p>
                        </div>
                        <button
                          onClick={() => assignDeliveryAgent(order.id, currentRider.id)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-95 shrink-0"
                        >
                          Claim & Start Run
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    const mapsUrl = buildGoogleMapsUrl(order.customer.address, order.customer.lat, order.customer.lng);

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
                            {order.status === 'delivering' ? 'Out for Delivery' : 'Order Placed'}
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

                        {/* Payment Received Button (COD before delivering) */}
                        {order.paymentStatus !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => handlePaymentReceived(order.id, order.status)}
                            className="w-full py-3.5 bg-[#173612] hover:bg-[#0F240B] text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                          >
                            <span>💵 Payment Received (₹{order.total})</span>
                          </button>
                        )}

                        {/* Bill Approve Option for Rider/Admin */}
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, order.status as any, { billApproved: !order.billApproved } as any)}
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-xs border ${
                            order.billApproved
                              ? "bg-emerald-600 text-white border-emerald-700"
                              : "bg-amber-100 text-amber-950 border-amber-300"
                          }`}
                        >
                          {order.billApproved ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>✓ Bill Approved for Customer</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-amber-800" />
                              <span>Approve Bill for Customer</span>
                            </>
                          )}
                        </button>

                        <hr className="border-cream-200" />

                        {/* Direct 1-Click Order Delivery Completion */}
                        <button
                          type="button"
                          disabled={actionLoadingOrderId === order.id}
                          onClick={() => handleMarkOrderDelivered(order.id)}
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-sm transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{actionLoadingOrderId === order.id ? 'Marking Delivered...' : 'Mark Order Delivered'}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Completed Runs Today */}
              {riderCompletedOrders.length > 0 && (
                <div className="space-y-3 p-5 bg-emerald-50 rounded-3xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Completed Deliveries Today ({riderCompletedOrders.length})</span>
                    </h4>
                    <span className="text-[10px] bg-emerald-700 text-white font-bold px-2.5 py-0.5 rounded-full">
                      Verified & Handed Over
                    </span>
                  </div>
                  <div className="divide-y divide-emerald-100">
                    {riderCompletedOrders.slice(0, 10).map((co) => (
                      <div key={co.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-mono font-bold text-emerald-950">#{co.tokenId}</span>
                          <span className="text-emerald-700 ml-2">to {co.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-900">₹{co.total} • Delivered</span>
                          {co.paymentStatus !== 'paid' ? (
                            <button
                              type="button"
                              onClick={() => handlePaymentReceived(co.id, co.status)}
                              className="px-2 py-1 bg-[#173612] hover:bg-[#0F240B] text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition active:scale-95"
                            >
                              Payment Received
                            </button>
                          ) : (
                            <span className="px-2 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider">
                              Paid
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

          {/* Database Admin PIN Configuration Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm-sm max-w-lg space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-banhmi-red" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-espresso-950">
                Admin Access PIN Configuration
              </h3>
            </div>
            <p className="text-xs text-espresso-600">
              Access PINs are securely managed in the Supabase database. Enter a new 4+ digit PIN below to update credentials.
            </p>

            {pinSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                {pinSuccessMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePin} className="space-y-3">
              <input
                type="password"
                placeholder="Enter new PIN (min 4 digits)"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs text-espresso-900 font-mono tracking-widest focus:outline-none focus:border-banhmi-red"
              />
              <button
                type="submit"
                disabled={updatingPin}
                className="px-5 py-2.5 bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 font-bold rounded-xl text-xs transition active:scale-95 disabled:opacity-50"
              >
                {updatingPin ? 'Updating Database...' : 'Update Access PIN'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. TAB 4: MEMBERSHIPS MANAGEMENT (CARDS ONE BELOW THE OTHER) */}
      {activeTab === 'memberships' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm shrink-0">
                <Crown className="w-6 h-6 fill-amber-500 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-espresso-950 font-display tracking-tight">
                    FARM MEMBERSHIP REGISTRY
                  </h2>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Live Database Sync
                  </span>
                </div>
                <p className="text-xs text-espresso-600 mt-0.5">
                  View, track, settle month-end bills, and manage 6-Month Prepaid VIP & 1-Month Postpaid Pass holders.
                </p>
              </div>
            </div>

            <button
              onClick={fetchAdminMemberships}
              disabled={membershipsLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-espresso-900 hover:bg-black text-cream-50 font-bold text-xs rounded-xl shadow transition active:scale-95 disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${membershipsLoading ? 'animate-spin' : ''}`} />
              <span>{membershipsLoading ? 'Syncing...' : 'Sync Memberships'}</span>
            </button>
          </div>

          {/* Action Notice / Toast */}
          {membershipActionMsg && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs">
              <span>{membershipActionMsg}</span>
              <button
                onClick={() => setMembershipActionMsg('')}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-espresso-500">
                Total Members
              </span>
              <p className="text-3xl font-black text-espresso-950 font-mono">
                {adminMemberships.length}
              </p>
              <p className="text-[11px] text-espresso-500 font-medium">
                Registered customer profiles
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                6-Month Prepaid VIP
              </span>
              <p className="text-3xl font-black text-amber-600 font-mono">
                {adminMemberships.filter((m) => m.planType === '6_months').length}
              </p>
              <p className="text-[11px] text-amber-700 font-medium">
                ₹12,600 paid upfront (180 days)
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                1-Month Postpaid Pass
              </span>
              <p className="text-3xl font-black text-emerald-700 font-mono">
                {adminMemberships.filter((m) => m.planType === '1_month').length}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                ₹2,160/mo postpaid cycle
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-rose-300 bg-rose-50/40 shadow-warm-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Month-End Bills Due</span>
              </span>
              <p className="text-3xl font-black text-rose-700 font-mono">
                {adminMemberships.filter((m) => m.paymentStatus === 'due' || m.status === 'expired').length}
              </p>
              <p className="text-[11px] text-rose-600 font-medium">
                Requires payment / renewal
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-cream-200 shadow-warm-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-espresso-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member name, phone or ID..."
                value={membershipSearch}
                onChange={(e) => setMembershipSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50 text-xs text-espresso-900 focus:outline-none focus:border-[#173612]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
              {[
                { key: 'all' as const, label: 'All', count: adminMemberships.length },
                { key: '6_months' as const, label: '6-Mo VIP', count: adminMemberships.filter((m) => m.planType === '6_months').length },
                { key: '1_month' as const, label: '1-Mo Postpaid', count: adminMemberships.filter((m) => m.planType === '1_month').length },
                { key: 'due' as const, label: '🚨 Bill Due', count: adminMemberships.filter((m) => m.paymentStatus === 'due' || m.status === 'expired').length },
                { key: 'active' as const, label: 'Active', count: adminMemberships.filter((m) => m.status === 'active' && m.paymentStatus !== 'due').length },
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setMembershipFilter(pill.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    membershipFilter === pill.key
                      ? 'bg-espresso-950 text-cream-50 shadow-sm'
                      : 'bg-cream-100 text-espresso-700 hover:bg-cream-200'
                  }`}
                >
                  {pill.label} ({pill.count})
                </button>
              ))}
            </div>
          </div>

          {/* MEMBERSHIP CARDS - RENDERED ONE BELOW THE OTHER (VERTICAL STACK) */}
          <div className="space-y-4">
            {filteredAdminMemberships.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-cream-200 text-center space-y-3">
                <Crown className="w-12 h-12 text-cream-400 mx-auto" />
                <h3 className="text-base font-bold text-espresso-900">
                  No Memberships Found
                </h3>
                <p className="text-xs text-espresso-500 max-w-sm mx-auto">
                  {membershipSearch
                    ? 'No members match your search criteria. Try a different query or clear filter.'
                    : 'No customer memberships enrolled in this category yet.'}
                </p>
              </div>
            ) : (
              filteredAdminMemberships.map((m) => {
                const isDue = m.paymentStatus === 'due' || m.status === 'expired';
                const now = new Date();
                const endDate = new Date(m.endDate);
                const diffMs = endDate.getTime() - now.getTime();
                const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                const cleanPhone = m.phone.replace(/[^0-9]/g, '');

                const waMessage = encodeURIComponent(
                  isDue
                    ? `Hello ${m.customerName}, this is Zafiroo Organic Farm. Your 1-Month Postpaid cycle has completed. Your month-end bill of ₹2,160 for 30 days of free daily deliveries is ready for settlement. Visit: ${typeof window !== 'undefined' ? window.location.origin : ''}/membership to settle & renew.`
                    : `Hello ${m.customerName}, thank you for being an esteemed ${m.planName} member with Zafiroo Organic Farm! Your free sunrise deliveries are active.`
                );

                return (
                  <div
                    key={m.id}
                    className={`bg-white rounded-3xl border-2 p-5 sm:p-6 transition shadow-warm-sm hover:shadow-warm-md relative overflow-hidden ${
                      isDue
                        ? 'border-rose-400 bg-rose-50/20'
                        : m.planType === '6_months'
                        ? 'border-amber-300'
                        : 'border-[#D8ECCE]'
                    }`}
                  >
                    {/* Top Tag */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200 pb-3.5 mb-4">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                            m.planType === '6_months'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {m.planType === '6_months' ? (
                            <>
                              <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                              <span>6-Month VIP Club (Prepaid)</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-700" />
                              <span>1-Month Organic Pass (Postpaid)</span>
                            </>
                          )}
                        </span>

                        <span className="text-xs font-mono font-bold text-espresso-500 bg-cream-100 px-2.5 py-1 rounded-xl">
                          ID: {m.id}
                        </span>
                      </div>

                      {/* Status Pill */}
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                          isDue
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {isDue ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>🚨 MONTH-END BILL DUE (₹2,160)</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            <span>ACTIVE MEMBER</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Main Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                      {/* Column 1: Customer Contact */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-espresso-400 block">
                          Customer Profile
                        </span>
                        <div className="space-y-1">
                          <h4 className="text-base font-black text-espresso-950">
                            {m.customerName}
                          </h4>
                          <div className="flex items-center gap-2 font-mono font-bold text-espresso-700">
                            <Phone className="w-3.5 h-3.5 text-espresso-400" />
                            <span>{m.phone}</span>
                          </div>
                          {m.address && (
                            <div className="flex items-start gap-1.5 text-espresso-600 text-[11px] leading-relaxed">
                              <MapPin className="w-3.5 h-3.5 text-espresso-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{m.address}</span>
                            </div>
                          )}
                          {m.customerEmail && (
                            <div className="flex items-center gap-1.5 text-espresso-600 text-[11px]">
                              <Mail className="w-3.5 h-3.5 text-espresso-400 shrink-0" />
                              <span className="truncate">{m.customerEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Column 2: Dates & Validity Countdown */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-espresso-400 block">
                          Membership Validity
                        </span>
                        <div className="space-y-2">
                          <div className="flex justify-between items-baseline">
                            <span className="text-espresso-600 text-[11px]">Days Remaining:</span>
                            <strong
                              className={`text-sm font-black ${
                                isDue ? 'text-rose-600' : 'text-emerald-700'
                              }`}
                            >
                              {isDue ? 'Cycle Completed (Due)' : `${daysRemaining} Days`}
                            </strong>
                          </div>

                          <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isDue
                                  ? 'bg-rose-500'
                                  : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                              }`}
                              style={{
                                width: `${
                                  isDue
                                    ? 100
                                    : Math.min(
                                        100,
                                        Math.max(
                                          5,
                                          (daysRemaining / (m.planType === '6_months' ? 180 : 30)) * 100
                                        )
                                      )
                                }%`,
                              }}
                            />
                          </div>

                          <div className="text-[11px] text-espresso-500 flex justify-between">
                            <span>Started: {new Date(m.startDate).toLocaleDateString('en-IN')}</span>
                            <span>Expires: {new Date(m.endDate).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Column 3: Billing & Financial Status */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-espresso-400 block">
                          Billing Status
                        </span>
                        <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-espresso-600">Scheme Rate:</span>
                            <strong className="text-espresso-950 font-black">
                              {m.planType === '6_months' ? '₹12,600.00' : '₹2,160.00 / mo'}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-espresso-600">Payment Mode:</span>
                            <strong className="uppercase font-bold text-espresso-800">
                              {m.billingType}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-cream-200">
                            <span className="text-espresso-600">Payment Status:</span>
                            <span
                              className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase ${
                                isDue
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isDue
                                ? '₹2,160 DUE NOW'
                                : m.billingType === 'prepaid'
                                ? 'PAID UPFRONT'
                                : 'POSTPAID ACTIVE'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="pt-4 mt-4 border-t border-cream-200 flex flex-wrap items-center justify-between gap-3">
                      {/* Left: Contact actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-espresso-800 text-xs font-bold transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Member</span>
                        </a>

                        <a
                          href={`https://wa.me/91${cleanPhone}?text=${waMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                          <span>WhatsApp Reminder</span>
                        </a>

                        <Link
                          href={`/track?phone=${cleanPhone}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-espresso-800 text-xs font-bold transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Orders</span>
                        </Link>
                      </div>

                      {/* Right: Operational actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {isDue && (
                          <button
                            onClick={() => handleMarkMembershipPaid(m)}
                            disabled={membershipActionLoading === m.id}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Month-End Bill Paid ({m.planType === '6_months' ? '₹12,600' : '₹2,160'})</span>
                          </button>
                        )}

                        <button
                          onClick={() => setExtendConfirmMembership(m)}
                          disabled={membershipActionLoading === m.id}
                          className="px-3 py-1.5 bg-cream-200 hover:bg-cream-300 text-espresso-900 text-xs font-bold rounded-xl transition active:scale-95 disabled:opacity-50"
                        >
                          + Extend 30 Days
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 8. EXTEND 30 DAYS CONFIRMATION MODAL */}
      {extendConfirmMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-cream-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-black text-espresso-950">Extend Membership?</h3>
              <p className="text-xs text-espresso-600">
                You are about to extend <strong>{extendConfirmMembership.customerName}&apos;s</strong> membership by <strong>30 days</strong> from their current expiry date.
              </p>
            </div>

            <div className="bg-cream-50 rounded-2xl p-3 border border-cream-200 text-xs text-espresso-700 space-y-1">
              <div className="flex justify-between"><span>Customer</span><strong>{extendConfirmMembership.customerName}</strong></div>
              <div className="flex justify-between"><span>Phone</span><strong className="font-mono">{extendConfirmMembership.phone}</strong></div>
              <div className="flex justify-between"><span>Plan</span><strong>{extendConfirmMembership.planType === '6_months' ? '6-Month VIP' : '1-Month Postpaid'}</strong></div>
              <div className="flex justify-between"><span>Current Expiry</span><strong>{new Date(extendConfirmMembership.endDate).toLocaleDateString('en-IN')}</strong></div>
              <div className="flex justify-between text-emerald-700"><span>New Expiry</span><strong>{new Date(new Date(extendConfirmMembership.endDate).getTime() + 30*24*60*60*1000).toLocaleDateString('en-IN')}</strong></div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setExtendConfirmMembership(null)}
                className="flex-1 py-2.5 rounded-2xl border border-cream-300 bg-cream-50 hover:bg-cream-100 text-espresso-800 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExtendMembership30(extendConfirmMembership)}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider shadow transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Confirm Extend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. SOS ACTION CENTER MODAL (Admin inspection of active alerts) */}
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

      {/* 9. CUSTOMER REFUND DETAILS MODAL */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn text-espresso-950">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-400 space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight">
                    Customer Refund Details
                  </h3>
                  <p className="text-xs text-amber-100 font-mono">
                    Order #{refundModalOrder.tokenId} • {refundModalOrder.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRefundModalOrder(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Order Cancellation Notice */}
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-900">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-black text-red-950 uppercase">Order Cancelled By Customer</strong>
                  <span>This order was cancelled prior to courier dispatch. Customer name, phone number, and refund processing options are provided below.</span>
                </div>
              </div>

              {/* Customer Contact Details Card (Name & Phone Prominently Displayed) */}
              <div className="p-4 bg-cream-50 rounded-2xl border border-cream-300 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-espresso-600 block border-b border-cream-200 pb-1.5">
                  Customer Information
                </span>

                <div className="space-y-2.5">
                  {/* Name */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-espresso-600 font-bold">Customer Name:</span>
                    <span className="text-base font-black text-espresso-950 font-sans">
                      {refundModalOrder.customer.name}
                    </span>
                  </div>

                  {/* Phone Number */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-cream-200/60">
                    <span className="text-xs text-espresso-600 font-bold">Phone Number:</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${refundModalOrder.customer.phone}`}
                        className="text-sm font-black font-mono text-banhmi-red hover:underline flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-cream-300 shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-banhmi-red" />
                        <span>{refundModalOrder.customer.phone}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(refundModalOrder.customer.phone)}
                        className="p-1.5 rounded-xl border border-cream-300 bg-white hover:bg-cream-100 text-espresso-700 transition cursor-pointer"
                        title="Copy phone number"
                      >
                        {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Address & Landmark */}
                  <div className="pt-2 border-t border-cream-200/60 text-xs">
                    <span className="text-espresso-600 font-bold block mb-1">Delivery Address & Landmark:</span>
                    <p className="text-espresso-900 leading-relaxed bg-white p-2.5 rounded-xl border border-cream-200">
                      📍 {refundModalOrder.customer.address}
                    </p>
                    {refundModalOrder.customer.unitOrApt && (
                      <p className="mt-1.5 text-[11px] text-[#385A2A] font-bold bg-[#ECF5DE] px-2.5 py-0.5 rounded-md inline-block border border-[#CBE0A3]">
                        Landmark / Unit: {refundModalOrder.customer.unitOrApt}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order & Payment Summary */}
              <div className="p-4 bg-white rounded-2xl border border-cream-300 space-y-3 shadow-xs">
                <span className="text-[11px] font-black uppercase tracking-wider text-espresso-600 block border-b border-cream-200 pb-1.5">
                  Refund & Payment Details
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-espresso-600 font-semibold block text-[11px]">Amount to Refund:</span>
                    <span className="text-xl font-black text-espresso-950 font-mono">
                      ₹{refundModalOrder.total.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-espresso-600 font-semibold block text-[11px]">Payment Method:</span>
                    <span className="font-bold text-espresso-900 block truncate">
                      {refundModalOrder.paymentMethod}
                    </span>
                  </div>

                  <div>
                    <span className="text-espresso-600 font-semibold block text-[11px]">Payment Status:</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        refundModalOrder.paymentStatus === 'refunded'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {refundModalOrder.paymentStatus === 'refunded' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Refund Processed</span>
                        </>
                      ) : (
                        <span>{refundModalOrder.paymentStatus || 'Pending Refund'}</span>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-espresso-600 font-semibold block text-[11px]">Order Created At:</span>
                    <span className="font-medium text-espresso-800 text-[11px]">
                      {new Date(refundModalOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Refund SLA Policy Alert */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-amber-950">
                    <CreditCard className="w-4 h-4 text-amber-700" />
                    <span>Online Payment Refund SLA (24 - 48 Hours)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    Refunds for online payments will be credited back to the customer&apos;s source account within <strong>24 to 48 hours</strong> of cancellation.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {refundModalOrder.paymentStatus !== 'refunded' ? (
                  <button
                    type="button"
                    disabled={isProcessingRefund}
                    onClick={() => handleMarkAsRefunded(refundModalOrder.id)}
                    className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessingRefund ? (
                      <span>Updating Status...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Mark Refund as Processed</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Refund Marked as Processed for this Order</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${refundModalOrder.customer.phone}`}
                    className="py-2.5 px-4 bg-white hover:bg-cream-100 border border-cream-300 text-espresso-900 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-banhmi-red" />
                    <span>Call Customer</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setRefundModalOrder(null)}
                    className="py-2.5 px-4 bg-cream-200 hover:bg-cream-300 text-espresso-900 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. BILL RECEIPT MODAL */}
      <BillModal
        order={activeBillOrder}
        isOpen={Boolean(activeBillOrder)}
        onClose={() => setActiveBillOrder(null)}
      />
    </div>
  );
}


