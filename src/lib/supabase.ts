import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, MenuItem, SosAlert, DeliveryAgent } from '@/types/cafe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Graceful client initialization: only instantiate when environment variables are configured
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

if (!isSupabaseConfigured) {
  if (typeof window !== 'undefined') {
    // Client-side info notice
    console.info('%c[Zafiroo]%c Running in Local Storage Mode (Offline first, no database configured yet)', 'color: #D4A373; font-weight: bold;', 'color: #806050;');
  }
}

/**
 * DB Row to frontend Order model converter
 */
export function formatDbOrderToModel(row: any): Order {
  return {
    id: row.id,
    tokenId: row.token_id,
    trackingCode: row.tracking_code,
    customerId: row.customer_id,
    deliveryAgentId: row.delivery_agent_id,
    deliveryOtp: row.delivery_otp,
    status: row.status,
    deliveryMethod: row.delivery_method,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email,
      address: row.customer_address,
      unitOrApt: row.customer_unit,
      deliveryInstructions: row.customer_instructions,
    },
    items: typeof row.items_json === 'string' ? JSON.parse(row.items_json) : (row.items_json || []),
    subtotal: Number(row.subtotal) || 0,
    deliveryFee: Number(row.delivery_fee) || 0,
    tax: Number(row.tax) || 0,
    tip: Number(row.tip) || 0,
    total: Number(row.total) || 0,
    estimatedTime: row.estimated_time || '20-30 min',
    paymentMethod: row.payment_method || 'cod',
    paymentStatus: row.payment_status || 'pending',
    riderName: row.rider_name,
    riderPhone: row.rider_phone,
    rating: row.rating,
    feedbackTags: row.feedback_tags,
    feedbackNote: row.feedback_note,
    createdAt: row.created_at,
    deliveredAt: row.delivered_at,
  };
}

/**
 * Frontend Order model to DB Row converter
 */
export function formatModelToDbOrder(order: Order): any {
  return {
    id: order.id,
    token_id: order.tokenId,
    tracking_code: order.trackingCode,
    customer_id: order.customerId || null,
    delivery_agent_id: order.deliveryAgentId || null,
    delivery_otp: order.deliveryOtp,
    status: order.status,
    delivery_method: order.deliveryMethod,
    customer_name: order.customer.name,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email || null,
    customer_address: order.customer.address,
    customer_unit: order.customer.unitOrApt || null,
    customer_instructions: order.customer.deliveryInstructions || null,
    items_json: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    tax: order.tax,
    tip: order.tip,
    total: order.total,
    estimated_time: order.estimatedTime,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    rider_name: order.riderName || null,
    rider_phone: order.riderPhone || null,
    rating: order.rating || null,
    feedback_tags: order.feedbackTags || [],
    feedback_note: order.feedbackNote || null,
    created_at: order.createdAt,
    delivered_at: order.deliveredAt || null,
  };
}
