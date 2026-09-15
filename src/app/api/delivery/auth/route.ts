import { NextRequest, NextResponse } from 'next/server';
import { getLocalAgents } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { DeliveryAgent } from '@/types/cafe';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 });
    }

    const cleanInput = phone.replace(/[^0-9]/g, '');

    // Search in DB if configured
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('delivery_agents')
        .select('*');

      if (data) {
        const found = data.find((a: any) =>
          a.phone.replace(/[^0-9]/g, '').includes(cleanInput) ||
          cleanInput.includes(a.phone.replace(/[^0-9]/g, ''))
        );
        if (found) {
          const agent: DeliveryAgent = {
            id: found.id,
            name: found.name,
            phone: found.phone,
            status: found.status,
            vehicleType: found.vehicle_type,
            ordersDeliveredCount: found.orders_delivered_count || 0,
          };
          return NextResponse.json({ success: true, agent });
        }
      }
    }

    // Local in-memory search
    const localAgents = getLocalAgents();
    const foundLocal = localAgents.find((a) =>
      a.phone.replace(/[^0-9]/g, '').includes(cleanInput) ||
      cleanInput.includes(a.phone.replace(/[^0-9]/g, ''))
    );

    if (foundLocal) {
      return NextResponse.json({ success: true, agent: foundLocal });
    }

    // If phone is valid 10 digits and not found, register on-the-fly for seamless testing
    if (cleanInput.length >= 10) {
      const autoAgent: DeliveryAgent = {
        id: `AGT-${cleanInput.slice(-4)}-01`,
        name: `Courier Partner (${cleanInput.slice(-4)})`,
        phone: `+91 ${cleanInput.slice(-10)}`,
        status: 'active',
        vehicleType: 'Delivery Vehicle',
        ordersDeliveredCount: 0,
      };
      localAgents.push(autoAgent);
      return NextResponse.json({ success: true, agent: autoAgent, note: 'New rider registered' });
    }

    return NextResponse.json({ success: false, message: 'No delivery agent found with this phone number' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
