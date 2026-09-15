import { NextRequest, NextResponse } from 'next/server';
import { getLocalOrders } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, formatDbOrderToModel } from '@/lib/supabase';
import { Order } from '@/types/cafe';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');
    const agentPhone = searchParams.get('phone');

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (agentId) {
        query = query.eq('delivery_agent_id', agentId);
      } else if (agentPhone) {
        query = query.eq('rider_phone', agentPhone);
      }
      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ success: true, orders: data.map(formatDbOrderToModel) });
      }
    }

    const localOrders = getLocalOrders();
    let filtered = localOrders;
    if (agentId) {
      filtered = localOrders.filter((o) => o.deliveryAgentId === agentId);
    } else if (agentPhone) {
      const clean = agentPhone.replace(/[^0-9]/g, '');
      filtered = localOrders.filter((o) => (o.riderPhone || '').replace(/[^0-9]/g, '').includes(clean));
    }

    return NextResponse.json({ success: true, orders: filtered, source: 'local' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
