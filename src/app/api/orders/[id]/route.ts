import { NextRequest, NextResponse } from 'next/server';
import { findLocalOrder, updateLocalOrderStatus } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, formatDbOrderToModel } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (isSupabaseConfigured && supabase) {
      // Check by id or token_id or tracking_code
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.eq.${id},token_id.eq.${id},tracking_code.eq.${id},customer_phone.eq.${id}`)
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

    if (isSupabaseConfigured && supabase) {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (riderName) updateData.rider_name = riderName;
      if (riderPhone) updateData.rider_phone = riderPhone;
      if (deliveryAgentId) updateData.delivery_agent_id = deliveryAgentId;
      if (rating) updateData.rating = rating;
      if (feedbackTags) updateData.feedback_tags = feedbackTags;
      if (feedbackNote) updateData.feedback_note = feedbackNote;
      if (status === 'completed') updateData.delivered_at = new Date().toISOString();

      await supabase
        .from('orders')
        .update(updateData)
        .or(`id.eq.${id},token_id.eq.${id}`);
    }

    const updated = updateLocalOrderStatus(id, status, extra);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
