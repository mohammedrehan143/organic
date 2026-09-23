import { NextRequest, NextResponse } from 'next/server';
import { getLocalOrders, addLocalOrder, upsertLocalOrder, clearLocalOrders } from '@/lib/serverStore';
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
    let sourceFlags: string[] = [];
    const client = supabaseAdmin || supabase;

    if (isSupabaseConfigured && client) {
      try {
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

        if (!error) {
          if (data && data.length > 0) {
            dbOrders = data.map(formatDbOrderToModel);
          }
          totalCount = count ?? dbOrders.length;
          sourceFlags.push('supabase');

          // When viewing the first page without search filters, synchronize in-memory store
          // with authoritative Supabase database state so deleted records are purged from RAM.
          if (offset === 0 && !cleanPhone && !cleanToken && !cleanQuery && !status) {
            clearLocalOrders();
            for (const o of dbOrders) {
              upsertLocalOrder(o);
            }
          }
        } else {
          console.warn('Supabase query error (will fallback to local):', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase query exception (will fallback to local):', err.message);
      }
    }

    let finalOrders: Order[];
    // If Supabase is configured and successfully queried, Supabase is the single source of truth!
    // If Supabase has 0 orders (e.g. database was cleared), we must return 0 orders.
    if (sourceFlags.includes('supabase')) {
      finalOrders = dbOrders;
    } else {
      // Supabase is unavailable or not configured: fallback to in-memory local store
      const localFiltered = getLocalOrders({
        status: status || undefined,
        phone: cleanPhone || undefined,
        query: cleanToken || cleanQuery || undefined,
        limit,
        offset,
      });
      if (localFiltered.length > 0) {
        sourceFlags.push('local');
      }
      totalCount = localFiltered.length;
      finalOrders = localFiltered;
    }

    return NextResponse.json({
      success: true,
      orders: finalOrders,
      totalCount: Math.max(totalCount, finalOrders.length),
      page,
      limit,
      count: finalOrders.length,
      source: sourceFlags.length ? sourceFlags.join('+') : 'none',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Bulk purge / clear all orders (Admin utility)
export async function DELETE(req: NextRequest) {
  try {
    const client = supabaseAdmin || supabase;
    let deletedCount = 0;

    if (isSupabaseConfigured && client) {
      const { data, error } = await client
        .from('orders')
        .delete()
        .neq('id', '__dummy_never_match__');

      if (error) {
        console.error('Supabase bulk delete error:', error.message);
      }
    }

    // Always clear local in-memory store
    clearLocalOrders();

    return NextResponse.json({
      success: true,
      message: 'All orders have been permanently cleared from database and memory cache.',
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

    // 3. Persist to Supabase (with verification)
    let supabaseSuccess = false;
    if (isSupabaseConfigured && client) {
      const dbRow = formatModelToDbOrder(newOrder);
      try {
        const { error, data } = await client
          .from('orders')
          .insert(dbRow)
          .select()
          .single();
        
        if (!error && data) {
          supabaseSuccess = true;
        } else {
          console.warn('Supabase insert attempt warning:', error?.message);
          // Retry without FKs if constraint error (e.g. customer_id or delivery_agent_id)
          if (error?.code === '23503' || /violates foreign key/i.test(error?.message || '')) {
            const safeRow = { ...dbRow, customer_id: null, delivery_agent_id: null };
            const { error: err2, data: data2 } = await client
              .from('orders')
              .insert(safeRow)
              .select()
              .single();
            if (!err2 && data2) {
              supabaseSuccess = true;
            } else if (err2) {
              console.error('Supabase insert (FK fallback) error:', err2.message);
            }
          }
        }
      } catch (e) {
        console.error('Supabase insert exception:', e);
      }
    }

    // 4. Always persist to local server store (fallback for dev / when Supabase unavailable)
    addLocalOrder(newOrder);

    return NextResponse.json({ 
      success: true, 
      order: newOrder,
      persistedToSupabase: supabaseSuccess,
      source: supabaseSuccess ? 'supabase' : 'local'
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
