import { NextRequest, NextResponse } from 'next/server';
import { getLocalOrders, addLocalOrder } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, formatDbOrderToModel, formatModelToDbOrder } from '@/lib/supabase';
import { Order } from '@/types/cafe';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json({ success: true, orders: data.map(formatDbOrderToModel) });
      }
    }

    // Local in-memory fallback
    const orders = getLocalOrders();
    return NextResponse.json({ success: true, orders, source: 'local' });
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
