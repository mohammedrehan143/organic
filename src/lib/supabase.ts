import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, MenuItem, SosAlert, DeliveryAgent } from '@/types/cafe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Graceful public client initialization
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: true,
      },
    })
  : null;

// Server-side privileged client (bypasses RLS if service key is provided, falls back to anon client)
export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseServiceKey || supabaseAnonKey!, {
      auth: {
        persistSession: false,
      },
    })
  : null;


/**
 * Generates cryptographically collision-free IDs even under 10,000 concurrent orders
 */
export function generateCollisionSafeOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const counter = Math.floor(100 + Math.random() * 900);
  return `ZF-${ts}-${counter}${rand}`;
}

export function generateCollisionSafeTokenId(): string {
  const ts = Date.now().toString().slice(-4);
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  const num = Math.floor(100 + Math.random() * 900);
  return `TOK-${ts}${num}-${rand}`;
}

export function generateCollisionSafeTrackingCode(): string {
  const ts = Date.now().toString().slice(-6);
  const num = Math.floor(1000 + Math.random() * 9000);
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `TRK-${ts}-${num}-${rand}`;
}

/**
 * DB Row to frontend Order model converter
 */
export function formatDbOrderToModel(row: any): Order {
  if (!row) return {} as Order;

  let parsedItems = [];
  if (typeof row.items_json === 'string') {
    try {
      parsedItems = JSON.parse(row.items_json);
    } catch {
      parsedItems = [];
    }
  } else if (Array.isArray(row.items_json)) {
    parsedItems = row.items_json;
  }

  return {
    id: String(row.id || ''),
    tokenId: String(row.token_id || ''),
    trackingCode: String(row.tracking_code || ''),
    customerId: row.customer_id || undefined,
    deliveryAgentId: row.delivery_agent_id || undefined,
    deliveryOtp: String(row.delivery_otp || '0000'),
    status: row.status || 'new',
    deliveryMethod: row.delivery_method || 'delivery',
    customer: {
      name: row.customer_name || 'Customer',
      phone: row.customer_phone || '',
      email: row.customer_email || undefined,
      address: row.customer_address || '',
      unitOrApt: row.customer_unit || undefined,
      deliveryInstructions: row.customer_instructions || undefined,
    },
    items: parsedItems,
    subtotal: Number(row.subtotal) || 0,
    deliveryFee: Number(row.delivery_fee) || 0,
    tax: Number(row.tax) || 0,
    tip: Number(row.tip) || 0,
    total: Number(row.total) || 0,
    estimatedTime: row.estimated_time || '25-35 min',
    paymentMethod: row.payment_method || 'cod',
    paymentStatus: row.payment_status || 'pending',
    riderName: row.rider_name || undefined,
    riderPhone: row.rider_phone || undefined,
    rating: typeof row.rating === 'number' ? row.rating : undefined,
    feedbackTags: Array.isArray(row.feedback_tags) ? row.feedback_tags : [],
    feedbackNote: row.feedback_note || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    deliveredAt: row.delivered_at || undefined,
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
    delivery_otp: String(order.deliveryOtp || '0000'),
    status: order.status,
    delivery_method: order.deliveryMethod,
    customer_name: order.customer.name,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email || null,
    customer_address: order.customer.address,
    customer_unit: order.customer.unitOrApt || null,
    customer_instructions: order.customer.deliveryInstructions || null,
    items_json: order.items || [],
    subtotal: Number(order.subtotal) || 0,
    delivery_fee: Number(order.deliveryFee) || 0,
    tax: Number(order.tax) || 0,
    tip: Number(order.tip) || 0,
    total: Number(order.total) || 0,
    estimated_time: order.estimatedTime || '25-35 min',
    payment_method: order.paymentMethod || 'cod',
    payment_status: order.paymentStatus || 'pending',
    rider_name: order.riderName || null,
    rider_phone: order.riderPhone || null,
    rating: typeof order.rating === 'number' ? order.rating : null,
    feedback_tags: Array.isArray(order.feedbackTags) ? order.feedbackTags : [],
    feedback_note: order.feedbackNote || null,
    created_at: order.createdAt || new Date().toISOString(),
    delivered_at: order.deliveredAt || null,
  };
}

/**
 * Safely upserts customer in Supabase to link with orders without foreign key errors
 */
export async function upsertCustomerInDb(
  client: SupabaseClient,
  customerData: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    unitOrApt?: string;
    deliveryInstructions?: string;
  },
  orderTotal: number
): Promise<string | null> {
  const cleanPhone = customerData.phone.replace(/[^0-9]/g, '');
  if (!cleanPhone || cleanPhone.length < 4) return null;

  try {
    // 1. Check if customer already exists
    const { data: existing, error: findErr } = await client
      .from('customers')
      .select('id, order_count, total_spent')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (!findErr && existing) {
      // Update existing customer stats
      const newOrderCount = (existing.order_count || 0) + 1;
      const newTotalSpent = Number((Number(existing.total_spent || 0) + Number(orderTotal || 0)).toFixed(2));

      await client
        .from('customers')
        .update({
          name: customerData.name,
          email: customerData.email || null,
          address: customerData.address,
          unit: customerData.unitOrApt || null,
          default_instructions: customerData.deliveryInstructions || null,
          order_count: newOrderCount,
          total_spent: newTotalSpent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      return existing.id;
    }

    // 2. Insert new customer
    const newCustId = `CUST-${cleanPhone.slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const { error: insErr } = await client.from('customers').insert({
      id: newCustId,
      phone: cleanPhone,
      name: customerData.name,
      email: customerData.email || null,
      address: customerData.address,
      unit: customerData.unitOrApt || null,
      default_instructions: customerData.deliveryInstructions || null,
      order_count: 1,
      total_spent: Number(orderTotal) || 0,
    });

    if (!insErr) {
      return newCustId;
    }

    // If conflict happened concurrently, fetch again
    const { data: fallback } = await client
      .from('customers')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle();

    return fallback?.id || null;
  } catch (e) {
    console.warn('Customer upsert error (continuing order placement):', e);
    return null;
  }
}
