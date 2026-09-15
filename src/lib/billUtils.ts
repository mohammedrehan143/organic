import { Order } from '@/types/cafe';
import { CAFE_METADATA } from '@/data/cafeData';

export interface ThermalReceiptData {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  orderId: string;
  tokenId: string;
  dateStr: string;
  timeStr: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryMethod: string;
  paymentMethod: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
    total: number;
    customizations?: string;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  grandTotal: number;
  otp: string;
  riderName?: string;
}

export function formatThermalReceiptData(order: Order): ThermalReceiptData {
  const d = new Date(order.createdAt);
  const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const items = (order.items || []).map((ci) => {
    const custOptions = Object.entries(ci.selectedOptions || {})
      .map(([_, v]) => v)
      .filter(Boolean)
      .join(', ');

    return {
      name: ci.menuItem.name,
      qty: ci.quantity,
      price: ci.menuItem.priceNumber,
      total: ci.itemTotal,
      customizations: custOptions || undefined,
    };
  });

  return {
    storeName: CAFE_METADATA.name,
    storeAddress: CAFE_METADATA.address,
    storePhone: CAFE_METADATA.phone,
    orderId: order.id,
    tokenId: order.tokenId,
    dateStr,
    timeStr,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    customerAddress: order.customer.address,
    deliveryMethod: order.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Studio Pickup',
    paymentMethod: order.paymentMethod,
    items,
    subtotal: order.subtotal,
    tax: order.tax,
    deliveryFee: order.deliveryFee,
    tip: order.tip,
    grandTotal: order.total,
    otp: order.deliveryOtp,
    riderName: order.riderName,
  };
}
