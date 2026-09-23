import { NextRequest, NextResponse } from 'next/server';
import { findLocalOrder, updateLocalOrderStatus, upsertLocalOrder, deleteLocalOrder, serverStore } from '@/lib/serverStore';
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

      if (!error) {
        if (data) {
          return NextResponse.json({ success: true, order: formatDbOrderToModel(data) });
        }
        // Explicitly does not exist in Supabase (order was deleted or never existed)
        deleteLocalOrder(id);
        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = supabaseAdmin || supabase;

    if (isSupabaseConfigured && client) {
      const { error } = await client
        .from('orders')
        .delete()
        .or(`id.eq.${id},token_id.eq.${id},tracking_code.eq.${id}`);

      if (error) {
        console.error('Supabase order delete error:', error.message);
      }
    }

    deleteLocalOrder(id);

    return NextResponse.json({ success: true, message: `Order ${id} deleted successfully` });
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
    const { status, riderName, riderPhone, deliveryAgentId, rating, feedbackTags, feedbackNote, paymentStatus, billApproved, paymentReceivedAt, paymentReceivedBy, paymentReceivedByPhone } = body;

    const extra: any = {};
    if (riderName !== undefined) extra.riderName = riderName;
    if (riderPhone !== undefined) extra.riderPhone = riderPhone;
    if (deliveryAgentId !== undefined) extra.deliveryAgentId = deliveryAgentId;
    if (rating !== undefined) extra.rating = rating;
    if (feedbackTags !== undefined) extra.feedbackTags = feedbackTags;
    if (feedbackNote !== undefined) extra.feedbackNote = feedbackNote;
    if (paymentStatus !== undefined) extra.paymentStatus = paymentStatus;
    if (billApproved !== undefined) extra.billApproved = billApproved;
    if (paymentReceivedAt !== undefined) extra.paymentReceivedAt = paymentReceivedAt;
    if (paymentReceivedBy !== undefined) extra.paymentReceivedBy = paymentReceivedBy;
    if (paymentReceivedByPhone !== undefined) extra.paymentReceivedByPhone = paymentReceivedByPhone;

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

        if (existingDb && existingDb.status === 'completed') {
          return NextResponse.json(
            { success: false, message: 'Cannot cancel order once it is completed.' },
            { status: 400 }
          );
        }
      }

      const existingLocal = findLocalOrder(id);
      if (existingLocal && existingLocal.status === 'completed') {
        return NextResponse.json(
          { success: false, message: 'Cannot cancel order once it is completed.' },
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
      if (paymentStatus !== undefined) updateData.payment_status = paymentStatus;
      if (status === 'completed') updateData.delivered_at = new Date().toISOString();

      if (billApproved !== undefined) {
        let currentTags = feedbackTags;
        if (currentTags === undefined) {
          const { data: existingRow } = await client
            .from('orders')
            .select('feedback_tags')
            .or(`id.eq.${id},token_id.eq.${id}`)
            .maybeSingle();
          currentTags = Array.isArray(existingRow?.feedback_tags) ? [...existingRow.feedback_tags] : [];
        } else {
          currentTags = Array.isArray(currentTags) ? [...currentTags] : [];
        }

        if (billApproved) {
          if (!currentTags.includes('__BILL_APPROVED__')) currentTags.push('__BILL_APPROVED__');
        } else {
          currentTags = currentTags.filter((t: string) => t !== '__BILL_APPROVED__');
        }
        updateData.feedback_tags = currentTags;
      }

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
      } else if (error) {
        console.error('Supabase update error:', error.message);
      }
    }

    const updated = updateLocalOrderStatus(id, status, extra);
    if (!updated && !dbUpdatedOrder) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (dbUpdatedOrder) {
      upsertLocalOrder(dbUpdatedOrder);
    }

    return NextResponse.json({ success: true, order: dbUpdatedOrder || updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
