'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  MenuItem,
  CartItem,
  Order,
  OrderStatus,
  DeliveryAgent,
  SosAlert,
  SosReason,
  UserLocation,
} from '@/types/cafe';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_DELIVERY_AGENTS,
  INITIAL_SOS_ALERTS,
  CAFE_METADATA,
} from '@/data/cafeData';
import {
  isSupabaseConfigured,
  supabase,
  formatDbOrderToModel,
  generateCollisionSafeOrderId,
  generateCollisionSafeTokenId,
  generateCollisionSafeTrackingCode,
} from '@/lib/supabase';
import { getCurrentLocationAddress } from '@/lib/location';

// Local storage keys
const CART_STORAGE_KEY = 'atelier_lambre_cart_v1';
const ORDERS_STORAGE_KEY = 'atelier_lambre_orders_v1';
const SOS_STORAGE_KEY = 'zafiroo_sos_alerts_v1';
const USER_LOCATION_KEY = 'zafiroo_user_location_v1';

// Max orders retained in client memory & localStorage to prevent browser crashes under 10,000 orders
const MAX_CLIENT_ORDERS = 200;
const MAX_SAVED_LOCAL_ORDERS = 25;

/**
 * Safe local storage setter to guard against DOMException: QuotaExceededError
 */
function safeSetStorage(key: string, data: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err: any) {
    console.warn(`[Zafiroo Storage] LocalStorage write failed for ${key}:`, err?.message);
    // If quota exceeded, clear stale keys or trim
    try {
      if (Array.isArray(data)) {
        localStorage.setItem(key, JSON.stringify(data.slice(0, 10)));
      }
    } catch {
      // Ignore fallback failure
    }
  }
}

export interface OrderContextType {
  // Location Auto-Setter
  userLocation: UserLocation | null;
  isDetectingLocation: boolean;
  locationModalOpen: boolean;
  setLocationModalOpen: (open: boolean) => void;
  setUserLocation: (loc: UserLocation) => void;
  autoDetectLocation: () => Promise<UserLocation | null>;

  // Menu
  menuItems: MenuItem[];
  loadingMenu: boolean;
  refreshMenu: () => Promise<void>;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, selectedOptions?: Record<string, string>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  
  // Modals
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (open: boolean) => void;
  trackingModalOpen: boolean;
  setTrackingModalOpen: (open: boolean) => void;
  selectedMenuDetail: MenuItem | null;
  setSelectedMenuDetail: (item: MenuItem | null) => void;

  // Order Placement & Tracking
  orders: Order[];
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
  findOrderByIdOrPhone: (query: string) => Order | null;
  placeOrder: (orderData: Omit<Order, 'id' | 'tokenId' | 'trackingCode' | 'createdAt' | 'status' | 'deliveryOtp'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, extra?: Partial<Order>) => Promise<Order | null>;
  submitOrderFeedback: (orderId: string, rating: number, tags: string[], note?: string) => Promise<boolean>;

  // Delivery & Verification
  deliveryAgents: DeliveryAgent[];
  refreshDeliveryAgents: () => Promise<void>;
  assignDeliveryAgent: (orderId: string, agentId: string) => Promise<boolean>;
  verifyDeliveryOtp: (orderIdOrToken: string, enteredOtp: string) => Promise<{ success: boolean; message: string; order?: Order }>;

  // Rider SOS Disaster Alerts
  sosAlerts: SosAlert[];
  latestActiveSos: SosAlert | null;
  refreshSosAlerts: () => Promise<void>;
  triggerRiderSos: (params: {
    agentId: string;
    agentName: string;
    agentPhone: string;
    orderId?: string;
    tokenId?: string;
    reason: SosReason;
    notes?: string;
    lat?: number;
    lng?: number;
    locationAddress?: string;
  }) => Promise<SosAlert>;
  resolveSosAlert: (alertId: string, resolvedBy: string) => Promise<boolean>;

  // Audio Alerts
  playOrderChime: () => void;
  playSosSiren: () => void;

  // Custom Kitchen PIN
  kitchenPin: string;
  updateKitchenPin: (newPin: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  // Location Auto-Setter state
  const [userLocation, setUserLocationState] = useState<UserLocation | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const setUserLocation = useCallback((loc: UserLocation) => {
    setUserLocationState(loc);
    safeSetStorage(USER_LOCATION_KEY, loc);
  }, []);

  const autoDetectLocation = useCallback(async (): Promise<UserLocation | null> => {
    setIsDetectingLocation(true);
    try {
      const loc = await getCurrentLocationAddress();
      const short =
        loc.suburb || loc.road || loc.building || loc.city || 'Detected Location';
      const cityPart = loc.city ? `, ${loc.city}` : '';
      const shortFormatted = `${short}${cityPart}`;

      const newLoc: UserLocation = {
        formattedAddress: loc.formattedAddress,
        shortAddress: shortFormatted,
        road: loc.road,
        houseNumber: loc.houseNumber,
        building: loc.building,
        suburb: loc.suburb,
        city: loc.city,
        state: loc.state,
        postcode: loc.postcode,
        lat: loc.lat,
        lng: loc.lng,
      };
      setUserLocation(newLoc);
      return newLoc;
    } catch (e) {
      console.warn('Auto-detect location error:', e);
      return null;
    } finally {
      setIsDetectingLocation(false);
    }
  }, [setUserLocation]);

  // Menu state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [loadingMenu, setLoadingMenu] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals state
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedMenuDetail, setSelectedMenuDetail] = useState<MenuItem | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Delivery agents
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>(INITIAL_DELIVERY_AGENTS);

  // SOS Alerts
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>(INITIAL_SOS_ALERTS);

  // Kitchen PIN
  const [kitchenPin, setKitchenPin] = useState('1234');

  const audioCtxRef = useRef<AudioContext | null>(null);

  // High-concurrency realtime event buffer refs
  const orderEventQueueRef = useRef<Order[]>([]);
  const batchFlushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio Context initializer
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // Polyphonic gentle order chime
  const playOrderChime = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Tone 1: 523.25 Hz (C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Tone 2: 783.99 Hz (G5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.15);
      gain2.gain.setValueAtTime(0, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.25, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 1.2);
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  }, [getAudioContext]);

  // Urgent dual-tone siren for SOS Disaster Alerts
  const playSosSiren = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.3, now);

      for (let i = 0; i < 7; i++) {
        const time = now + i * 0.45;
        osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 587.33, time);
      }

      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.5);
    } catch (e) {
      console.warn('SOS Siren error:', e);
    }
  }, [getAudioContext]);

  const refreshDeliveryAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/delivery/agents');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.agents)) {
          setDeliveryAgents(data.agents);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const refreshSosAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/delivery/sos');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.alerts)) {
          setSosAlerts(data.alerts);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Load from localStorage on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // 1. Cart
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      // 2. Orders (purges legacy demo orders and initializes clean)
      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const realOrders = parsed.filter(
            (o) => o.id !== 'ZF-9421-XK7' && o.id !== 'ZF-3829-MR2'
          );
          setOrders(realOrders.slice(0, MAX_CLIENT_ORDERS));
          setActiveTrackingOrder(realOrders[0] || null);
          safeSetStorage(ORDERS_STORAGE_KEY, realOrders.slice(0, MAX_SAVED_LOCAL_ORDERS));
        } else {
          setOrders([]);
          setActiveTrackingOrder(null);
        }
      } else {
        setOrders([]);
        setActiveTrackingOrder(null);
      }

      // 3. SOS Alerts (purges legacy demo alerts)
      const savedSos = localStorage.getItem(SOS_STORAGE_KEY);
      if (savedSos) {
        const parsedSos = JSON.parse(savedSos);
        if (Array.isArray(parsedSos)) {
          const realSos = parsedSos.filter((s) => s.id !== 'SOS-9421-1718');
          setSosAlerts(realSos);
          safeSetStorage(SOS_STORAGE_KEY, realSos.slice(0, 50));
        } else {
          setSosAlerts([]);
        }
      } else {
        setSosAlerts([]);
      }

      // 4. Purge legacy confidential data from browser local storage
      try {
        localStorage.removeItem('zafiroo_kitchen_pin_v1');
      } catch {}

      // 5. Fetch fresh database courier agents and active SOS alerts
      refreshDeliveryAgents();
      refreshSosAlerts();

      // 6. Delivery Location
      const savedLocation = localStorage.getItem(USER_LOCATION_KEY);
      if (savedLocation) {
        try {
          setUserLocationState(JSON.parse(savedLocation));
        } catch (e) {
          console.warn('Error parsing saved location:', e);
        }
      } else {
        const defaultLoc: UserLocation = {
          formattedAddress: 'Zafiroo Organic Farm, Bylanarasapura, Hoskote Taluk, Bangalore - 562122',
          shortAddress: 'Bylanarasapura, Hoskote',
          suburb: 'Bylanarasapura',
          city: 'Bangalore',
          state: 'Karnataka',
          postcode: '562122',
          lat: 13.0716,
          lng: 77.7981,
        };
        setUserLocationState(defaultLoc);
        safeSetStorage(USER_LOCATION_KEY, defaultLoc);
      }
    } catch (err) {
      console.warn('Error reading from local storage:', err);
    }
  }, [refreshDeliveryAgents, refreshSosAlerts]);

  // Persist cart changes
  useEffect(() => {
    safeSetStorage(CART_STORAGE_KEY, cart);
  }, [cart]);

  // Persist bounded orders (never saves more than MAX_SAVED_LOCAL_ORDERS to prevent 5MB storage quota crash)
  useEffect(() => {
    if (orders.length > 0) {
      safeSetStorage(ORDERS_STORAGE_KEY, orders.slice(0, MAX_SAVED_LOCAL_ORDERS));
    }
  }, [orders]);

  // Persist SOS alerts
  useEffect(() => {
    safeSetStorage(SOS_STORAGE_KEY, sosAlerts.slice(0, 50));
  }, [sosAlerts]);

  // Flush batched realtime orders to avoid React render queue starvation under mass traffic
  const flushOrderQueue = useCallback(() => {
    if (orderEventQueueRef.current.length === 0) return;

    const incoming = [...orderEventQueueRef.current];
    orderEventQueueRef.current = [];

    setOrders((prev) => {
      const map = new Map<string, Order>();
      // Put incoming first
      for (const o of incoming) {
        map.set(o.id, o);
      }
      // Add existing if not present
      for (const o of prev) {
        if (!map.has(o.id)) {
          map.set(o.id, o);
        }
      }
      const combined = Array.from(map.values());
      // Sort newest first and cap to MAX_CLIENT_ORDERS to keep DOM 60fps
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return combined.slice(0, MAX_CLIENT_ORDERS);
    });

    // Update active tracking order if affected
    setActiveTrackingOrder((current) => {
      if (!current) return incoming[0] || null;
      const updated = incoming.find((o) => o.id === current.id || o.tokenId === current.tokenId);
      return updated || current;
    });

    playOrderChime();
  }, [playOrderChime]);

  // Supabase Realtime Listener (with event batching)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const ordersChannel = supabase
        .channel('realtime_orders_v2')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const model = formatDbOrderToModel(payload.new);
              orderEventQueueRef.current.push(model);

              // Debounce flush every 250ms
              if (batchFlushTimeoutRef.current) clearTimeout(batchFlushTimeoutRef.current);
              batchFlushTimeoutRef.current = setTimeout(flushOrderQueue, 250);
            }
          }
        )
        .subscribe();

      const sosChannel = supabase
        .channel('realtime_sos_v2')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'sos_alerts' },
          (payload) => {
            const newAlert = payload.new as SosAlert;
            setSosAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== newAlert.id)]);
            if (newAlert.status === 'active') {
              playSosSiren();
            }
          }
        )
        .subscribe();

      return () => {
        if (batchFlushTimeoutRef.current) clearTimeout(batchFlushTimeoutRef.current);
        supabase?.removeChannel(ordersChannel);
        supabase?.removeChannel(sosChannel);
      };
    } catch (e) {
      console.warn('Supabase subscription warning:', e);
    }
  }, [flushOrderQueue, playSosSiren]);

  // Smart Background Sync (Polls active orders every 5 seconds to guarantee 100% real-time sync with zero client exposure)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/orders?status=active&limit=60');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const activeList: Order[] = data.orders;
          setOrders((prev) => {
            const map = new Map<string, Order>();
            for (const o of activeList) {
              map.set(o.id, o);
            }
            for (const o of prev) {
              if (!map.has(o.id)) {
                map.set(o.id, o);
              }
            }
            const combined = Array.from(map.values());
            combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return combined.slice(0, MAX_CLIENT_ORDERS);
          });

          setActiveTrackingOrder((current) => {
            if (!current) return current;
            const updated = activeList.find((o) => o.id === current.id || o.tokenId === current.tokenId);
            return updated || current;
          });
        }
      } catch {
        // Network silent fallback
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  // Cart operations
  const addToCart = (item: MenuItem, quantity = 1, selectedOptions: Record<string, string> = {}) => {
    setCart((prev) => {
      const optionsKey = JSON.stringify(selectedOptions);
      const existingIndex = prev.findIndex(
        (ci) => ci.menuItem.id === item.id && JSON.stringify(ci.selectedOptions) === optionsKey
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          itemTotal: newQty * item.priceNumber,
        };
        return updated;
      }

      const cartId = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newCartItem: CartItem = {
        id: cartId,
        menuItem: item,
        quantity,
        selectedOptions,
        itemTotal: quantity * item.priceNumber,
      };
      return [...prev, newCartItem];
    });
    setCartDrawerOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) =>
        ci.id === cartItemId
          ? {
              ...ci,
              quantity: newQty,
              itemTotal: newQty * ci.menuItem.priceNumber,
            }
          : ci
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, ci) => acc + ci.quantity, 0);
  const cartSubtotal = cart.reduce((acc, ci) => acc + ci.itemTotal, 0);

  // Orders operations
  const findOrderByIdOrPhone = (query: string): Order | null => {
    if (!query) return null;
    const q = query.trim().toLowerCase();
    const cleanDigits = q.replace(/[^0-9]/g, '');

    return (
      orders.find((o) => {
        if (o.id.toLowerCase() === q) return true;
        if (o.tokenId.toLowerCase() === q) return true;
        if (o.trackingCode.toLowerCase() === q) return true;
        if (cleanDigits.length >= 4 && o.customer.phone.replace(/[^0-9]/g, '').includes(cleanDigits)) {
          return true;
        }
        return false;
      }) || null
    );
  };

  const placeOrder = async (
    orderData: Omit<Order, 'id' | 'tokenId' | 'trackingCode' | 'createdAt' | 'status' | 'deliveryOtp'>
  ): Promise<Order> => {
    const orderId = generateCollisionSafeOrderId();
    const tokenId = generateCollisionSafeTokenId();
    const trackingCode = generateCollisionSafeTrackingCode();
    // Strict 4-digit OTP for doorstep delivery verification
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      tokenId,
      trackingCode,
      deliveryOtp,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    // Optimistic local update
    setOrders((prev) => [newOrder, ...prev.slice(0, MAX_CLIENT_ORDERS - 1)]);
    setActiveTrackingOrder(newOrder);
    clearCart();
    playOrderChime();

    // Persist to server API & DB
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          // Merge confirmed server response
          setOrders((prev) => prev.map((o) => (o.id === newOrder.id ? data.order : o)));
          setActiveTrackingOrder(data.order);
          return data.order;
        }
      }
    } catch (e) {
      console.warn('Order sync network warning (order saved locally):', e);
    }

    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    extra?: Partial<Order>
  ): Promise<Order | null> => {
    let updatedOrder: Order | null = null;

    // Optimistic local state update
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId || o.tokenId === orderId) {
          updatedOrder = {
            ...o,
            status,
            ...extra,
            deliveredAt: status === 'completed' ? (extra?.deliveredAt || new Date().toISOString()) : o.deliveredAt,
          };
          return updatedOrder;
        }
        return o;
      })
    );

    if (updatedOrder && activeTrackingOrder && (activeTrackingOrder.id === orderId || activeTrackingOrder.tokenId === orderId)) {
      setActiveTrackingOrder(updatedOrder);
    }

    // Persist to backend and Supabase
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          updatedOrder = data.order;
          setOrders((prev) => prev.map((o) => (o.id === orderId || o.tokenId === orderId ? data.order : o)));
          if (activeTrackingOrder && (activeTrackingOrder.id === orderId || activeTrackingOrder.tokenId === orderId)) {
            setActiveTrackingOrder(data.order);
          }
        }
      }
    } catch (e) {
      console.warn('Update order status server sync error:', e);
    }

    return updatedOrder;
  };

  const submitOrderFeedback = async (
    orderId: string,
    rating: number,
    tags: string[],
    note?: string
  ): Promise<boolean> => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId || o.tokenId === orderId) {
          return {
            ...o,
            rating,
            feedbackTags: tags,
            feedbackNote: note,
          };
        }
        return o;
      })
    );

    try {
      await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedbackTags: tags, feedbackNote: note }),
      });
    } catch (e) {
      console.warn('Feedback sync error:', e);
    }

    return true;
  };

  const assignDeliveryAgent = async (orderId: string, agentId: string): Promise<boolean> => {
    const agent = deliveryAgents.find((a) => a.id === agentId);
    if (!agent) return false;

    const result = await updateOrderStatus(orderId, 'delivering', {
      deliveryAgentId: agent.id,
      riderName: agent.name,
      riderPhone: agent.phone,
    });

    return Boolean(result);
  };

  const verifyDeliveryOtp = async (
    orderIdOrToken: string,
    enteredOtp: string
  ): Promise<{ success: boolean; message: string; order?: Order }> => {
    const cleanEntered = (enteredOtp || '').trim();
    if (!cleanEntered) {
      return { success: false, message: 'Please enter the 4-digit doorstep OTP.' };
    }

    try {
      const res = await fetch('/api/delivery/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderIdOrToken,
          otp: cleanEntered,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update local status to completed
        const completedOrder = data.order;
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id === orderIdOrToken || o.tokenId === orderIdOrToken) {
              return completedOrder || { ...o, status: 'completed', deliveredAt: new Date().toISOString() };
            }
            return o;
          })
        );

        if (activeTrackingOrder && (activeTrackingOrder.id === orderIdOrToken || activeTrackingOrder.tokenId === orderIdOrToken)) {
          setActiveTrackingOrder(completedOrder || { ...activeTrackingOrder, status: 'completed', deliveredAt: new Date().toISOString() });
        }

        return {
          success: true,
          message: data.message || 'OTP verified successfully! Order marked as Delivered.',
          order: completedOrder,
        };
      }

      return {
        success: false,
        message: data.message || 'Invalid 4-digit OTP. Delivery cannot be completed.',
      };
    } catch (e: any) {
      return {
        success: false,
        message: 'Could not connect to OTP verification service. Please check your internet connection.',
      };
    }
  };

  // SOS alerts operations
  const triggerRiderSos = async (params: {
    agentId: string;
    agentName: string;
    agentPhone: string;
    orderId?: string;
    tokenId?: string;
    reason: SosReason;
    notes?: string;
    lat?: number;
    lng?: number;
    locationAddress?: string;
  }): Promise<SosAlert> => {
    const sosId = `SOS-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    const newAlert: SosAlert = {
      id: sosId,
      agentId: params.agentId,
      agentName: params.agentName,
      agentPhone: params.agentPhone,
      orderId: params.orderId,
      tokenId: params.tokenId,
      reason: params.reason,
      notes: params.notes,
      lat: params.lat,
      lng: params.lng,
      locationAddress: params.locationAddress,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setSosAlerts((prev) => [newAlert, ...prev.slice(0, 50)]);
    playSosSiren();

    try {
      fetch('/api/delivery/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert),
      }).catch(() => {});
    } catch (e) {
      console.warn('SOS sync error:', e);
    }

    return newAlert;
  };

  const resolveSosAlert = async (alertId: string, resolvedBy: string): Promise<boolean> => {
    setSosAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              resolvedBy,
            }
          : a
      )
    );

    try {
      fetch('/api/delivery/sos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, resolvedBy }),
      }).catch(() => {});
    } catch (e) {
      console.warn('Resolve SOS sync error:', e);
    }

    return true;
  };

  const refreshMenu = async () => {
    setLoadingMenu(true);
    setTimeout(() => setLoadingMenu(false), 200);
  };

  const updateKitchenPin = async (newPin: string) => {
    const clean = newPin.trim();
    if (clean.length >= 4) {
      setKitchenPin(clean);
      try {
        await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_pin', newPin: clean }),
        });
      } catch (err) {
        console.warn('Failed to sync updated PIN to server:', err);
      }
    }
  };

  const latestActiveSos = sosAlerts.find((a) => a.status === 'active') || null;

  return (
    <OrderContext.Provider
      value={{
        userLocation,
        isDetectingLocation,
        locationModalOpen,
        setLocationModalOpen,
        setUserLocation,
        autoDetectLocation,
        menuItems,
        loadingMenu,
        refreshMenu,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartDrawerOpen,
        setCartDrawerOpen,
        checkoutModalOpen,
        setCheckoutModalOpen,
        trackingModalOpen,
        setTrackingModalOpen,
        selectedMenuDetail,
        setSelectedMenuDetail,
        orders,
        activeTrackingOrder,
        setActiveTrackingOrder,
        findOrderByIdOrPhone,
        placeOrder,
        updateOrderStatus,
        submitOrderFeedback,
        deliveryAgents,
        refreshDeliveryAgents,
        assignDeliveryAgent,
        verifyDeliveryOtp,
        sosAlerts,
        latestActiveSos,
        refreshSosAlerts,
        triggerRiderSos,
        resolveSosAlert,
        playOrderChime,
        playSosSiren,
        kitchenPin,
        updateKitchenPin,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder(): OrderContextType {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
