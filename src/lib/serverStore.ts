import { Order, MenuItem, DeliveryAgent, SosAlert, OrderStatus } from '@/types/cafe';
import { INITIAL_ORDERS, INITIAL_MENU_ITEMS, INITIAL_DELIVERY_AGENTS, INITIAL_SOS_ALERTS } from '@/data/cafeData';

// Global singleton in-memory state for local development when DB is not configured
declare global {
  // eslint-disable-next-line no-var
  var __zafiroo_server_store__: {
    orders: Order[];
    menu: MenuItem[];
    agents: DeliveryAgent[];
    sosAlerts: SosAlert[];
    kitchenPin: string;
  } | undefined;
}

if (!global.__zafiroo_server_store__) {
  global.__zafiroo_server_store__ = {
    orders: [...INITIAL_ORDERS],
    menu: [...INITIAL_MENU_ITEMS],
    agents: [...INITIAL_DELIVERY_AGENTS],
    sosAlerts: [...INITIAL_SOS_ALERTS],
    kitchenPin: '1234',
  };
}

export const serverStore = global.__zafiroo_server_store__;

export function getLocalOrders(): Order[] {
  return serverStore.orders;
}

export function findLocalOrder(identifier: string): Order | undefined {
  const query = identifier.trim().toLowerCase();
  return serverStore.orders.find(
    (o) =>
      o.id.toLowerCase() === query ||
      o.tokenId.toLowerCase() === query ||
      o.trackingCode.toLowerCase() === query ||
      o.customer.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''))
  );
}

export function addLocalOrder(order: Order): Order {
  // Prepend new order
  serverStore.orders.unshift(order);
  return order;
}

export function updateLocalOrderStatus(id: string, status: OrderStatus, extra?: Partial<Order>): Order | null {
  const index = serverStore.orders.findIndex((o) => o.id === id || o.tokenId === id);
  if (index === -1) return null;

  const current = serverStore.orders[index];
  const updated: Order = {
    ...current,
    status,
    ...extra,
    deliveredAt: status === 'completed' ? new Date().toISOString() : current.deliveredAt,
  };
  serverStore.orders[index] = updated;
  return updated;
}

export function getLocalSosAlerts(): SosAlert[] {
  return serverStore.sosAlerts;
}

export function addLocalSosAlert(alert: SosAlert): SosAlert {
  serverStore.sosAlerts.unshift(alert);
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
