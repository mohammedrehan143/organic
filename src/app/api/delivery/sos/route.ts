import { NextRequest, NextResponse } from 'next/server';
import { getLocalSosAlerts, addLocalSosAlert, resolveLocalSosAlert, serverStore } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { SosAlert } from '@/types/cafe';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const alerts: SosAlert[] = data.map((d: any) => ({
          id: d.id,
          agentId: d.agent_id,
          agentName: d.agent_name,
          agentPhone: d.agent_phone,
          orderId: d.order_id,
          tokenId: d.token_id,
          reason: d.reason,
          notes: d.notes,
          lat: d.lat,
          lng: d.lng,
          locationAddress: d.location_address,
          status: d.status,
          resolvedAt: d.resolved_at,
          resolvedBy: d.resolved_by,
          createdAt: d.created_at,
        }));
        return NextResponse.json({ success: true, alerts });
      }
    }

    return NextResponse.json({ success: true, alerts: getLocalSosAlerts(), source: 'local' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sosId = `SOS-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

    const newAlert: SosAlert = {
      id: sosId,
      agentId: body.agentId || 'UNKNOWN',
      agentName: body.agentName || 'Rider',
      agentPhone: body.agentPhone || '',
      orderId: body.orderId,
      tokenId: body.tokenId,
      reason: body.reason || 'other',
      notes: body.notes,
      lat: body.lat,
      lng: body.lng,
      locationAddress: body.locationAddress,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('sos_alerts').insert({
        id: newAlert.id,
        agent_id: newAlert.agentId,
        agent_name: newAlert.agentName,
        agent_phone: newAlert.agentPhone,
        order_id: newAlert.orderId || null,
        token_id: newAlert.tokenId || null,
        reason: newAlert.reason,
        notes: newAlert.notes || null,
        lat: newAlert.lat || null,
        lng: newAlert.lng || null,
        location_address: newAlert.locationAddress || null,
        status: 'active',
      });
    }

    addLocalSosAlert(newAlert);

    return NextResponse.json({ success: true, alert: newAlert }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, resolvedBy } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'SOS Alert ID is required' }, { status: 400 });
    }

    const resolver = resolvedBy || 'Admin';

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('sos_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: resolver,
        })
        .eq('id', id);
    }

    const resolved = resolveLocalSosAlert(id, resolver);

    return NextResponse.json({ success: true, alert: resolved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
