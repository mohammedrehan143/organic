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
import { isSupabaseConfigured, supabase, formatDbOrderToModel } from '@/lib/supabase';
import { getCurrentLocationAddress } from '@/lib/location';

// Local storage keys
const CART_STORAGE_KEY = 'atelier_lambre_cart_v1';
const ORDERS_STORAGE_KEY = 'atelier_lambre_orders_v1';
const SOS_STORAGE_KEY = 'zafiroo_sos_alerts_v1';
const KITCHEN_PIN_KEY = 'zafiroo_kitchen_pin_v1';
const USER_LOCATION_KEY = 'zafiroo_user_location_v1';

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
  verifyDeliveryOtp: (orderIdOrToken: string, enteredOtp: string) => { success: boolean; message: string };

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
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(loc));
      } catch (e) {
        console.warn('Error saving user location:', e);
      }
    }
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

      // Warble pitch for 3.5 seconds
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

  // Load from localStorage on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // 1. Cart
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      // 2. Orders
      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
          setActiveTrackingOrder(parsed[0]);
        }
      } else {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
        setActiveTrackingOrder(INITIAL_ORDERS[0]);
      }

      // 3. SOS Alerts
      const savedSos = localStorage.getItem(SOS_STORAGE_KEY);
      if (savedSos) {
        setSosAlerts(JSON.parse(savedSos));
      } else {
        localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(INITIAL_SOS_ALERTS));
      }

      // 4. Kitchen PIN
      const savedPin = localStorage.getItem(KITCHEN_PIN_KEY);
      if (savedPin) {
        setKitchenPin(savedPin);
      }

      // 5. Delivery Location
      const savedLocation = localStorage.getItem(USER_LOCATION_KEY);
      if (savedLocation) {
        try {
          setUserLocationState(JSON.parse(savedLocation));
        } catch (e) {
          console.warn('Error parsing saved location:', e);
        }
      } else {
        // Default initial hub location
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
        localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(defaultLoc));
      }
    } catch (err) {
      console.warn('Error reading from local storage:', err);
    }
  }, []);

  // Persist cart changes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Error saving cart:', e);
    }
  }, [cart]);

  // Persist orders changes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Error saving orders:', e);
    }
  }, [orders]);

  // Persist SOS alerts changes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(sosAlerts));
    } catch (e) {
      console.warn('Error saving sos alerts:', e);
    }
  }, [sosAlerts]);

  // Supabase Realtime Listener (graceful fallback if not configured)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const ordersChannel = supabase
        .channel('realtime_orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newOrder = formatDbOrderToModel(payload.new);
              setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
              playOrderChime();
            } else if (payload.eventType === 'UPDATE') {
              const updated = formatDbOrderToModel(payload.new);
              setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
              setActiveTrackingOrder((current) => (current?.id === updated.id ? updated : current));
            }
          }
        )
        .subscribe();

      const sosChannel = supabase
        .channel('realtime_sos')
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
        supabase?.removeChannel(ordersChannel);
        supabase?.removeChannel(sosChannel);
      };
    } catch (e) {
      console.warn('Supabase subscription error:', e);
    }
  }, [playOrderChime, playSosSiren]);

  // Cart operations
  const addToCart = (item: MenuItem, quantity = 1, selectedOptions: Record<string, string> = {}) => {
    setCart((prev) => {
      // Check if item with exact same options already exists
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
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ZF-${randomNum}-${randomSuffix}`;
    const tokenId = `TOK-${randomNum}-${randomSuffix}`;
    const trackingCode = `TRK-${randomNum}`;
    // Strict 4-digit OTP for doorstep verification
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      tokenId,
      trackingCode,
      deliveryOtp,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    // Update local state
    setOrders((prev) => [newOrder, ...prev]);
    setActiveTrackingOrder(newOrder);
    clearCart();
    playOrderChime();

    // Persist to server API & DB
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch((e) => console.warn('Order sync background error:', e));
    } catch (e) {
      console.warn('Order sync error:', e);
    }

    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    extra?: Partial<Order>
  ): Promise<Order | null> => {
    let updatedOrder: Order | null = null;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId || o.tokenId === orderId) {
          updatedOrder = {
            ...o,
            status,
            ...extra,
            deliveredAt: status === 'completed' ? new Date().toISOString() : o.deliveredAt,
          };
          return updatedOrder;
        }
        return o;
      })
    );

    if (updatedOrder && activeTrackingOrder && (activeTrackingOrder.id === orderId || activeTrackingOrder.tokenId === orderId)) {
      setActiveTrackingOrder(updatedOrder);
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
    return true;
  };

  const assignDeliveryAgent = async (orderId: string, agentId: string): Promise<boolean> => {
    const agent = deliveryAgents.find((a) => a.id === agentId);
    if (!agent) return false;

    await updateOrderStatus(orderId, 'delivering', {
      deliveryAgentId: agent.id,
      riderName: agent.name,
      riderPhone: agent.phone,
    });
    return true;
  };

  const verifyDeliveryOtp = (
    orderIdOrToken: string,
    enteredOtp: string
  ): { success: boolean; message: string } => {
    const target = orders.find(
      (o) => o.id === orderIdOrToken || o.tokenId === orderIdOrToken
    );

    if (!target) {
      return { success: false, message: 'Order not found.' };
    }

    const cleanEntered = (enteredOtp || '').trim();
    if (cleanEntered !== target.deliveryOtp) {
      return { success: false, message: 'Invalid 4-digit OTP. Delivery cannot be completed.' };
    }

    // Complete order
    updateOrderStatus(target.id, 'completed');
    return { success: true, message: 'OTP verified successfully! Order marked as Delivered.' };
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

    setSosAlerts((prev) => [newAlert, ...prev]);
    playSosSiren();
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
    return true;
  };

  const refreshMenu = async () => {
    setLoadingMenu(true);
    setTimeout(() => setLoadingMenu(false), 200);
  };

  const refreshDeliveryAgents = async () => {};
  const refreshSosAlerts = async () => {};

  const updateKitchenPin = (newPin: string) => {
    const clean = newPin.trim();
    if (clean.length >= 4) {
      setKitchenPin(clean);
      if (typeof window !== 'undefined') {
        localStorage.setItem(KITCHEN_PIN_KEY, clean);
      }
    }
  };

  // Most recent active SOS alert (if any)
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
