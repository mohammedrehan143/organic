import { NextRequest, NextResponse } from 'next/server';
import { getLocalOrders, upsertLocalOrder } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin, formatDbOrderToModel } from '@/lib/supabase';
import { Order } from '@/types/cafe';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');
    const agentPhone = searchParams.get('phone');
    const showReadyUnassigned = searchParams.get('ready') === 'true';
    const client = supabaseAdmin || supabase;

    let dbOrders: Order[] = [];
    if (isSupabaseConfigured && client) {
      try {
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
        if (!error && data && data.length > 0) {
          dbOrders = data.map(formatDbOrderToModel);
        } else if (error) {
          console.warn('Rider orders Supabase query error:', error.message);
        }
      } catch (err: any) {
        console.warn('Rider orders Supabase exception:', err.message);
      }
    }

    const localOrders = getLocalOrders({ limit: 100 });
    let filtered = [...dbOrders];
    const localFiltered = localOrders.filter((o) => {
      if (showReadyUnassigned) return o.status === 'ready' && !o.deliveryAgentId;
      if (agentId) return o.deliveryAgentId === agentId;
      if (agentPhone) {
        const clean = agentPhone.replace(/[^0-9]/g, '');
        const ten = clean.slice(-10);
        const rPhone = (o.riderPhone || '').replace(/[^0-9]/g, '');
        return rPhone.includes(clean) || (ten && rPhone.includes(ten));
      }
      return true;
    });

    // Merge local + DB: DB orders take precedence over local store fallback
    const map = new Map<string, Order>();
    for (const o of localFiltered) map.set(o.id, o);
    for (const o of filtered) {
      map.set(o.id, o);
      upsertLocalOrder(o);
    }
    filtered = Array.from(map.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, orders: filtered, source: filtered.length ? 'merged' : 'none' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
