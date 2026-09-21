import { NextRequest, NextResponse } from 'next/server';
import { findLocalOrder, updateLocalOrderStatus, serverStore } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin, formatDbOrderToModel } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = supabaseAdmin || supabase;
    
    if (isSupabaseConfigured && client) {
      // Check by id or token_id or tracking_code
      const { data, error } = await client
        .from('orders')
        .select('*')
        .or(`id.eq.${id},token_id.eq.${id},tracking_code.eq.${id}`)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ success: true, order: formatDbOrderToModel(data) });
      }
    }

    const order = findLocalOrder(id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order, source: 'local' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, riderName, riderPhone, deliveryAgentId, rating, feedbackTags, feedbackNote } = body;

    const extra: any = {};
    if (riderName !== undefined) extra.riderName = riderName;
    if (riderPhone !== undefined) extra.riderPhone = riderPhone;
    if (deliveryAgentId !== undefined) extra.deliveryAgentId = deliveryAgentId;
    if (rating !== undefined) extra.rating = rating;
    if (feedbackTags !== undefined) extra.feedbackTags = feedbackTags;
    if (feedbackNote !== undefined) extra.feedbackNote = feedbackNote;

    const client = supabaseAdmin || supabase;
    let dbUpdatedOrder: any = null;

    // Strict validation: Cancellation is only permitted before Out for Delivery
    if (status === 'cancelled') {
      if (isSupabaseConfigured && client) {
        const { data: existingDb } = await client
          .from('orders')
          .select('status')
          .or(`id.eq.${id},token_id.eq.${id}`)
          .maybeSingle();

        if (existingDb && (existingDb.status === 'delivering' || existingDb.status === 'completed')) {
          return NextResponse.json(
            { success: false, message: 'Cannot cancel order once it is out for delivery or completed.' },
            { status: 400 }
          );
        }
      }

      const existingLocal = findLocalOrder(id);
      if (existingLocal && (existingLocal.status === 'delivering' || existingLocal.status === 'completed')) {
        return NextResponse.json(
          { success: false, message: 'Cannot cancel order once it is out for delivery or completed.' },
          { status: 400 }
        );
      }
    }

    if (isSupabaseConfigured && client) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (status) updateData.status = status;
      if (riderName !== undefined) updateData.rider_name = riderName;
      if (riderPhone !== undefined) updateData.rider_phone = riderPhone;
      if (deliveryAgentId !== undefined) updateData.delivery_agent_id = deliveryAgentId;
      if (rating !== undefined) updateData.rating = rating;
      if (feedbackTags !== undefined) updateData.feedback_tags = feedbackTags;
      if (feedbackNote !== undefined) updateData.feedback_note = feedbackNote;
      if (status === 'completed') updateData.delivered_at = new Date().toISOString();

      const { data, error } = await client
        .from('orders')
        .update(updateData)
        .or(`id.eq.${id},token_id.eq.${id}`)
        .select('*')
        .maybeSingle();

      if (!error && data) {
        dbUpdatedOrder = formatDbOrderToModel(data);

        // If marked completed and delivery agent assigned, increment rider count
        if (status === 'completed' && data.delivery_agent_id) {
          try {
            await client.rpc('increment_agent_delivery_count', { agent_id: data.delivery_agent_id });
          } catch {
            // Ignore RPC failure if function not yet defined
          }
        }
      }
    }

    const updated = updateLocalOrderStatus(id, status, extra);
    if (!updated && !dbUpdatedOrder) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: dbUpdatedOrder || updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
