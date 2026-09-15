import { NextRequest, NextResponse } from 'next/server';
import { getLocalAgents, serverStore } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { DeliveryAgent } from '@/types/cafe';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('delivery_agents').select('*');
      if (!error && data && data.length > 0) {
        const agents: DeliveryAgent[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          phone: d.phone,
          status: d.status,
          vehicleType: d.vehicle_type,
          ordersDeliveredCount: d.orders_delivered_count || 0,
        }));
        return NextResponse.json({ success: true, agents });
      }
    }
    return NextResponse.json({ success: true, agents: getLocalAgents(), source: 'local' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newAgent: DeliveryAgent = {
      id: body.id || `AGT-${Math.floor(1000 + Math.random() * 9000)}-01`,
      name: body.name,
      phone: body.phone,
      status: body.status || 'active',
      vehicleType: body.vehicleType || 'Motorcycle',
      ordersDeliveredCount: 0,
    };

    serverStore.agents.push(newAgent);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('delivery_agents').insert({
        id: newAgent.id,
        name: newAgent.name,
        phone: newAgent.phone,
        status: newAgent.status,
        vehicle_type: newAgent.vehicleType,
        orders_delivered_count: 0,
      });
    }

    return NextResponse.json({ success: true, agent: newAgent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
