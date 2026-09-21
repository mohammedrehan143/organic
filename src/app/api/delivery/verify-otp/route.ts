import { NextRequest, NextResponse } from 'next/server';
import { findLocalOrder, updateLocalOrderStatus } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin, formatDbOrderToModel } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { orderId, tokenId, otp } = await req.json();

    if (!otp || (!orderId && !tokenId)) {
      return NextResponse.json(
        { success: false, message: 'Order reference and 4-digit OTP are required' },
        { status: 400 }
      );
    }

    const cleanOtp = String(otp).trim();
    const identifier = (orderId || tokenId || '').trim();
    const client = supabaseAdmin || supabase;

    if (isSupabaseConfigured && client) {
      const { data: order, error } = await client
        .from('orders')
        .select('*')
        .or(`id.eq.${identifier},token_id.eq.${identifier}`)
        .maybeSingle();

      if (!error && order) {
        if (order.delivery_otp !== cleanOtp) {
          return NextResponse.json(
            { success: false, message: 'Invalid 4-digit OTP. Delivery cannot be completed.' },
            { status: 400 }
          );
        }

        const deliveredAt = new Date().toISOString();

        // Mark as completed in Supabase
        const { data: updatedDb, error: updateErr } = await client
          .from('orders')
          .update({
            status: 'completed',
            delivered_at: deliveredAt,
            updated_at: deliveredAt,
          })
          .eq('id', order.id)
          .select('*')
          .maybeSingle();

        // Sync with local memory store
        updateLocalOrderStatus(order.id, 'completed', { deliveredAt });

        const modelOrder = updatedDb ? formatDbOrderToModel(updatedDb) : undefined;

        return NextResponse.json({
          success: true,
          message: 'Doorstep OTP verified successfully! Order marked as completed.',
          orderId: order.id,
          order: modelOrder,
        });
      }
    }

    // Local in-memory verification
    const localOrder = findLocalOrder(identifier);
    if (!localOrder) {
      return NextResponse.json(
        { success: false, message: 'Order reference not found' },
        { status: 404 }
      );
    }

    if (localOrder.deliveryOtp !== cleanOtp) {
      return NextResponse.json(
        { success: false, message: 'Invalid 4-digit OTP. Delivery cannot be completed.' },
        { status: 400 }
      );
    }

    const updated = updateLocalOrderStatus(localOrder.id, 'completed');

    return NextResponse.json({
      success: true,
      message: 'Doorstep OTP verified successfully! Order marked as completed.',
      orderId: localOrder.id,
      order: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
