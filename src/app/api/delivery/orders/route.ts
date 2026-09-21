import { NextRequest, NextResponse } from 'next/server';
import { getLocalOrders } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin, formatDbOrderToModel } from '@/lib/supabase';
import { Order } from '@/types/cafe';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');
    const agentPhone = searchParams.get('phone');
    const showReadyUnassigned = searchParams.get('ready') === 'true';
    const client = supabaseAdmin || supabase;

    if (isSupabaseConfigured && client) {
      let query = client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (showReadyUnassigned) {
        query = query.eq('status', 'ready').is('delivery_agent_id', null);
      } else if (agentId) {
        query = query.eq('delivery_agent_id', agentId);
      } else if (agentPhone) {
        const clean = agentPhone.replace(/[^0-9]/g, '');
        const ten = clean.slice(-10);
        query = query.or(`rider_phone.ilike.%${clean}%,rider_phone.ilike.%${ten}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ success: true, orders: data.map(formatDbOrderToModel) });
      }
    }

    const localOrders = getLocalOrders({ limit: 100 });
    let filtered = localOrders;

    if (showReadyUnassigned) {
      filtered = localOrders.filter((o) => o.status === 'ready' && !o.deliveryAgentId);
    } else if (agentId) {
      filtered = localOrders.filter((o) => o.deliveryAgentId === agentId);
    } else if (agentPhone) {
      const clean = agentPhone.replace(/[^0-9]/g, '');
      const ten = clean.slice(-10);
      filtered = localOrders.filter((o) => {
        const rPhone = (o.riderPhone || '').replace(/[^0-9]/g, '');
        return rPhone.includes(clean) || (ten && rPhone.includes(ten));
      });
    }

    return NextResponse.json({ success: true, orders: filtered, source: 'local' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
