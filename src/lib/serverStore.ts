import { Order, MenuItem, DeliveryAgent, SosAlert, OrderStatus, Membership } from '@/types/cafe';
import { INITIAL_ORDERS, INITIAL_MENU_ITEMS, INITIAL_DELIVERY_AGENTS, INITIAL_SOS_ALERTS } from '@/data/cafeData';

// Maximum in-memory order retention to prevent Node.js heap exhaustion under 10,000+ orders
const MAX_LOCAL_ORDERS = 1000;

// Global singleton in-memory state for local development / fallback when DB is not configured
declare global {
  // eslint-disable-next-line no-var
  var __zafiroo_server_store__: {
    orders: Order[];
    menu: MenuItem[];
    agents: DeliveryAgent[];
    sosAlerts: SosAlert[];
    memberships: Membership[];
    kitchenPin: string;
    // O(1) Index maps for instantaneous search under high order volume
    indexById: Map<string, Order>;
    indexByToken: Map<string, Order>;
    indexByPhone: Map<string, Order[]>;
  } | undefined;
}

function reindexAll(orders: Order[], store: typeof global.__zafiroo_server_store__) {
  if (!store) return;
  store.indexById.clear();
  store.indexByToken.clear();
  store.indexByPhone.clear();

  for (const o of orders) {
    if (o.id) store.indexById.set(o.id.toLowerCase(), o);
    if (o.tokenId) store.indexByToken.set(o.tokenId.toLowerCase(), o);
    if (o.trackingCode) store.indexByToken.set(o.trackingCode.toLowerCase(), o);

    const phone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
    if (phone) {
      const ten = phone.slice(-10);
      const list = store.indexByPhone.get(ten) || [];
      list.push(o);
      store.indexByPhone.set(ten, list);
    }
  }
}

const DEFAULT_SERVER_AGENTS: DeliveryAgent[] = [
  {
    id: "AGT-9876-01",
    name: "Aarav Sharma",
    phone: "9876543201",
    status: "active",
    vehicleType: "Electric Eco-Van",
    ordersDeliveredCount: 142,
  }
];

if (!global.__zafiroo_server_store__) {
  const initialOrders = [...INITIAL_ORDERS];
  const store = {
    orders: initialOrders,
    menu: [...INITIAL_MENU_ITEMS],
    agents: INITIAL_DELIVERY_AGENTS.length > 0 ? [...INITIAL_DELIVERY_AGENTS] : [...DEFAULT_SERVER_AGENTS],
    sosAlerts: [...INITIAL_SOS_ALERTS],
    memberships: [] as Membership[],
    kitchenPin: '1234',
    indexById: new Map<string, Order>(),
    indexByToken: new Map<string, Order>(),
    indexByPhone: new Map<string, Order[]>(),
  };
  reindexAll(initialOrders, store);
  global.__zafiroo_server_store__ = store;
}

export const serverStore = global.__zafiroo_server_store__!;

export interface GetLocalOrdersOptions {
  status?: string;
  limit?: number;
  offset?: number;
  phone?: string;
  query?: string;
}

export function getLocalOrders(options?: GetLocalOrdersOptions): Order[] {
  let list = serverStore.orders;

  if (options?.status) {
    if (options.status === 'active') {
      list = list.filter((o) => ['new', 'preparing', 'ready', 'delivering'].includes(o.status));
    } else {
      list = list.filter((o) => o.status === options.status);
    }
  }

  if (options?.phone) {
    const clean = options.phone.replace(/[^0-9]/g, '');
    const ten = clean.slice(-10);
    list = list.filter((o) => {
      const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
      return oPhone.includes(clean) || clean.includes(oPhone) || (ten && oPhone.includes(ten));
    });
  } else if (options?.query) {
    const q = options.query.trim().toLowerCase();
    const qDigits = q.replace(/[^0-9]/g, '');
    list = list.filter((o) => {
      if (o.id.toLowerCase().includes(q)) return true;
      if (o.tokenId.toLowerCase().includes(q)) return true;
      if (o.trackingCode.toLowerCase().includes(q)) return true;
      if (o.customer?.name?.toLowerCase().includes(q)) return true;
      if (qDigits.length >= 4 && (o.customer?.phone || '').replace(/[^0-9]/g, '').includes(qDigits)) {
        return true;
      }
      return false;
    });
  }

  const offset = options?.offset || 0;
  const limit = options?.limit || list.length;
  return list.slice(offset, offset + limit);
}

export function findLocalOrder(identifier: string): Order | undefined {
  if (!identifier) return undefined;
  const query = identifier.trim().toLowerCase();
  const cleanDigits = query.replace(/[^0-9]/g, '');

  // 1. Direct O(1) ID lookup
  if (serverStore.indexById.has(query)) {
    return serverStore.indexById.get(query);
  }

  // 2. Direct O(1) Token or Tracking Code lookup
  if (serverStore.indexByToken.has(query)) {
    return serverStore.indexByToken.get(query);
  }

  // 3. Direct Phone suffix lookup
  if (cleanDigits.length >= 10) {
    const ten = cleanDigits.slice(-10);
    const byPhone = serverStore.indexByPhone.get(ten);
    if (byPhone && byPhone.length > 0) {
      return byPhone[0];
    }
  }

  // 4. Linear scan fallback for partial matches
  return serverStore.orders.find(
    (o) =>
      o.id.toLowerCase() === query ||
      o.tokenId.toLowerCase() === query ||
      o.trackingCode.toLowerCase() === query ||
      (cleanDigits.length >= 4 && (o.customer?.phone || '').replace(/[^0-9]/g, '').includes(cleanDigits))
  );
}

export function addLocalOrder(order: Order): Order {
  // Prepend new order
  serverStore.orders.unshift(order);

  // Index in fast maps
  if (order.id) serverStore.indexById.set(order.id.toLowerCase(), order);
  if (order.tokenId) serverStore.indexByToken.set(order.tokenId.toLowerCase(), order);
  if (order.trackingCode) serverStore.indexByToken.set(order.trackingCode.toLowerCase(), order);

  const phone = (order.customer?.phone || '').replace(/[^0-9]/g, '');
  if (phone) {
    const ten = phone.slice(-10);
    const list = serverStore.indexByPhone.get(ten) || [];
    list.unshift(order);
    serverStore.indexByPhone.set(ten, list);
  }

  // Prevent memory leaks: evict oldest orders if exceeding capacity
  if (serverStore.orders.length > MAX_LOCAL_ORDERS) {
    const evicted = serverStore.orders.pop();
    if (evicted) {
      if (evicted.id) serverStore.indexById.delete(evicted.id.toLowerCase());
      if (evicted.tokenId) serverStore.indexByToken.delete(evicted.tokenId.toLowerCase());
      if (evicted.trackingCode) serverStore.indexByToken.delete(evicted.trackingCode.toLowerCase());
    }
  }

  return order;
}

export function updateLocalOrderStatus(id: string, status: OrderStatus, extra?: Partial<Order>): Order | null {
  const query = id.trim().toLowerCase();
  const existing = serverStore.indexById.get(query) || serverStore.indexByToken.get(query);
  const targetId = existing ? existing.id : id;

  const index = serverStore.orders.findIndex((o) => o.id === targetId || o.tokenId === id);
  if (index === -1) return null;

  const current = serverStore.orders[index];
  const updated: Order = {
    ...current,
    status,
    ...extra,
    deliveredAt: status === 'completed' ? (extra?.deliveredAt || new Date().toISOString()) : current.deliveredAt,
  };

  serverStore.orders[index] = updated;

  // Update indexes
  if (updated.id) serverStore.indexById.set(updated.id.toLowerCase(), updated);
  if (updated.tokenId) serverStore.indexByToken.set(updated.tokenId.toLowerCase(), updated);
  if (updated.trackingCode) serverStore.indexByToken.set(updated.trackingCode.toLowerCase(), updated);

  return updated;
}

export function getLocalSosAlerts(): SosAlert[] {
  return serverStore.sosAlerts;
}

export function addLocalSosAlert(alert: SosAlert): SosAlert {
  serverStore.sosAlerts.unshift(alert);
  if (serverStore.sosAlerts.length > 500) {
    serverStore.sosAlerts.pop();
  }
  return alert;
}

export function resolveLocalSosAlert(id: string, resolvedBy: string): SosAlert | null {
  const alert = serverStore.sosAlerts.find((a) => a.id === id);
  if (!alert) return null;
  alert.status = 'resolved';
  alert.resolvedAt = new Date().toISOString();
  alert.resolvedBy = resolvedBy;
  return alert;
}

export function getLocalAgents(): DeliveryAgent[] {
  return serverStore.agents;
}

export function getLocalMenu(): MenuItem[] {
  return serverStore.menu;
}

export function getLocalMemberships(phone?: string): Membership[] {
  const list = serverStore.memberships || [];
  if (!phone) return list;
  const clean = phone.replace(/[^0-9]/g, '');
  const ten = clean.slice(-10);
  return list.filter((m) => {
    const mPhone = m.phone.replace(/[^0-9]/g, '');
    return mPhone.includes(clean) || clean.includes(mPhone) || (ten && mPhone.includes(ten));
  });
}

export function saveLocalMembership(membership: Membership): Membership {
  if (!serverStore.memberships) {
    serverStore.memberships = [];
  }
  const currentList = serverStore.memberships;

  // If phone already has membership, replace or prepend
  const clean = membership.phone.replace(/[^0-9]/g, '').slice(-10);
  const idx = currentList.findIndex(
    (m) => m.id === membership.id || (clean.length === 10 && m.phone.replace(/[^0-9]/g, '').slice(-10) === clean)
  );
  if (idx > -1) {
    currentList[idx] = membership;
  } else {
    currentList.unshift(membership);
  }
  serverStore.memberships = currentList;
  return membership;
}
