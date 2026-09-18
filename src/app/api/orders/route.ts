import { NextRequest, NextResponse } from 'next/server';
import { getLocalOrders, addLocalOrder } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, formatDbOrderToModel, formatModelToDbOrder } from '@/lib/supabase';
import { Order } from '@/types/cafe';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const token = searchParams.get('token');
    const query = searchParams.get('query');

    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const cleanToken = token ? token.trim().toLowerCase() : '';
    const cleanQuery = query ? query.trim().toLowerCase() : '';

    let dbOrders: Order[] = [];

    const tenDigitPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;

    if (isSupabaseConfigured && supabase) {
      let sbQuery = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (cleanPhone && cleanPhone.length >= 4) {
        sbQuery = sbQuery.or(`customer_phone.ilike.%${cleanPhone}%,customer_phone.ilike.%${tenDigitPhone}%`);
      } else if (cleanToken) {
        sbQuery = sbQuery.or(`token_id.ilike.%${cleanToken}%,id.ilike.%${cleanToken}%,tracking_code.ilike.%${cleanToken}%`);
      }

      const { data, error } = await sbQuery;

      if (!error && data) {
        dbOrders = data.map(formatDbOrderToModel);
      }
    }

    // Local in-memory store
    const localOrders = getLocalOrders();

    // Merge DB orders and local orders, prioritizing DB or local newest, deduplicating by ID/TokenId
    const orderMap = new Map<string, Order>();

    // Add local orders first
    for (const o of localOrders) {
      orderMap.set(o.tokenId || o.id, o);
    }
    // Overlay/merge DB orders
    for (const o of dbOrders) {
      orderMap.set(o.tokenId || o.id, o);
    }

    let allOrders = Array.from(orderMap.values());

    // Filter if search criteria is present
    if (cleanPhone && cleanPhone.length >= 4) {
      allOrders = allOrders.filter((o) => {
        const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
        const oTen = oPhone.length >= 10 ? oPhone.slice(-10) : oPhone;
        return (
          oPhone.includes(cleanPhone) ||
          cleanPhone.includes(oPhone) ||
          oPhone.includes(tenDigitPhone) ||
          tenDigitPhone.includes(oPhone) ||
          oTen === tenDigitPhone
        );
      });
    } else if (cleanToken) {
      allOrders = allOrders.filter(
        (o) =>
          o.tokenId.toLowerCase().includes(cleanToken) ||
          o.id.toLowerCase().includes(cleanToken) ||
          o.trackingCode.toLowerCase().includes(cleanToken)
      );
    } else if (cleanQuery) {
      const qDigits = cleanQuery.replace(/[^0-9]/g, '');
      allOrders = allOrders.filter((o) => {
        if (o.tokenId.toLowerCase().includes(cleanQuery)) return true;
        if (o.id.toLowerCase().includes(cleanQuery)) return true;
        if (o.trackingCode.toLowerCase().includes(cleanQuery)) return true;
        if (o.customer?.name?.toLowerCase().includes(cleanQuery)) return true;
        if (qDigits.length >= 4 && (o.customer?.phone || '').replace(/[^0-9]/g, '').includes(qDigits)) {
          return true;
        }
        return false;
      });
    }

    // Sort newest first
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, orders: allOrders, count: allOrders.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = body.id || `ZF-${randomNum}-${randomSuffix}`;
    const tokenId = body.tokenId || `TOK-${randomNum}-${randomSuffix}`;
    const trackingCode = body.trackingCode || `TRK-${randomNum}`;
    const deliveryOtp = body.deliveryOtp || Math.floor(1000 + Math.random() * 9000).toString();

    const newOrder: Order = {
      ...body,
      id: orderId,
      tokenId,
      trackingCode,
      deliveryOtp,
      status: body.status || 'new',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const dbRow = formatModelToDbOrder(newOrder);
      const { error } = await supabase.from('orders').insert(dbRow);
      if (error) {
        console.warn('Supabase insert failed, persisting to local store:', error.message);
      }
    }

    addLocalOrder(newOrder);
    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
