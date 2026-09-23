import { NextRequest, NextResponse } from 'next/server';
import { getLocalOrders, addLocalOrder } from '@/lib/serverStore';
import {
  isSupabaseConfigured,
  supabase,
  supabaseAdmin,
  formatDbOrderToModel,
  formatModelToDbOrder,
  generateCollisionSafeOrderId,
  generateCollisionSafeTokenId,
  generateCollisionSafeTrackingCode,
  upsertCustomerInDb,
} from '@/lib/supabase';
import { Order } from '@/types/cafe';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const token = searchParams.get('token');
    const query = searchParams.get('query');
    const status = searchParams.get('status'); // e.g. 'active', 'new', 'completed'
    
    // Pagination parameters (prevents memory exhaustion under 10,000+ orders)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const offset = (page - 1) * limit;

    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const cleanToken = token ? token.trim().toLowerCase() : '';
    const cleanQuery = query ? query.trim().toLowerCase() : '';

    let dbOrders: Order[] = [];
    let totalCount = 0;
    const client = supabaseAdmin || supabase;

    if (isSupabaseConfigured && client) {
      let sbQuery = client
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // High-performance filter application
      if (status === 'active') {
        sbQuery = sbQuery.in('status', ['new', 'preparing', 'ready', 'delivering']);
      } else if (status) {
        sbQuery = sbQuery.eq('status', status);
      }

      if (cleanPhone && cleanPhone.length >= 4) {
        const tenDigitPhone = cleanPhone.slice(-10);
        sbQuery = sbQuery.or(`customer_phone.ilike.%${cleanPhone}%,customer_phone.ilike.%${tenDigitPhone}%`);
      } else if (cleanToken) {
        sbQuery = sbQuery.or(`token_id.ilike.%${cleanToken}%,id.ilike.%${cleanToken}%,tracking_code.ilike.%${cleanToken}%`);
      } else if (cleanQuery) {
        sbQuery = sbQuery.or(
          `token_id.ilike.%${cleanQuery}%,id.ilike.%${cleanQuery}%,tracking_code.ilike.%${cleanQuery}%,customer_name.ilike.%${cleanQuery}%`
        );
      }

      // Safe range pagination: transfers only requested window over HTTP
      sbQuery = sbQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await sbQuery;

      if (!error && data && data.length > 0) {
        dbOrders = data.map(formatDbOrderToModel);
        totalCount = count || dbOrders.length;
        return NextResponse.json({
          success: true,
          orders: dbOrders,
          totalCount,
          page,
          limit,
          count: dbOrders.length,
        });
      }

      // Supabase configured but returned no data — fall back to local store
      console.warn('Supabase returned no orders, falling back to local store');
    }

    // Local in-memory fallback
    const localFiltered = getLocalOrders({
      status: status || undefined,
      phone: cleanPhone || undefined,
      query: cleanToken || cleanQuery || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      orders: localFiltered,
      totalCount: localFiltered.length,
      page,
      limit,
      count: localFiltered.length,
      source: 'local',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Generate collision-proof IDs
    const orderId = body.id || generateCollisionSafeOrderId();
    const tokenId = body.tokenId || generateCollisionSafeTokenId();
    const trackingCode = body.trackingCode || generateCollisionSafeTrackingCode();
    // 4-digit numeric OTP strictly formatted
    const deliveryOtp = body.deliveryOtp || String(Math.floor(1000 + Math.random() * 9000));

    let customerId = body.customerId;
    const client = supabaseAdmin || supabase;

    // 2. Link Customer in Supabase if configured
    if (isSupabaseConfigured && client && body.customer) {
      try {
        const linkedCustId = await upsertCustomerInDb(client, body.customer, body.total || 0);
        if (linkedCustId) {
          customerId = linkedCustId;
        }
      } catch (custErr) {
        console.warn('Customer link warning (continuing order):', custErr);
      }
    }

    const newOrder: Order = {
      ...body,
      id: orderId,
      tokenId,
      trackingCode,
      customerId: customerId || undefined,
      deliveryOtp,
      status: body.status || 'new',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    // 3. Persist to Supabase
    if (isSupabaseConfigured && client) {
      const dbRow = formatModelToDbOrder(newOrder);
      const { error } = await client.from('orders').insert(dbRow);

      if (error) {
        console.warn('Supabase insert warning, trying fallback with unlinked FKs:', error.message);
        // If FK constraint caused failure, retry without customer_id or delivery_agent_id
        if (error.code === '23503') {
          const safeRow = { ...dbRow, customer_id: null, delivery_agent_id: null };
          await client.from('orders').insert(safeRow);
        }
      }
    }

    // 4. Persist to local server store
    addLocalOrder(newOrder);

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
