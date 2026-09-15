import { NextRequest, NextResponse } from 'next/server';
import { findLocalOrder, updateLocalOrderStatus } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

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
    const identifier = orderId || tokenId;

    if (isSupabaseConfigured && supabase) {
      const { data: order, error } = await supabase
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

        // Mark as completed
        await supabase
          .from('orders')
          .update({
            status: 'completed',
            delivered_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        return NextResponse.json({
          success: true,
          message: 'Doorstep OTP verified successfully! Order marked as completed.',
          orderId: order.id,
        });
      }
    }

    // Local in-memory verification
    const localOrder = findLocalOrder(identifier);
    if (!localOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (localOrder.deliveryOtp !== cleanOtp) {
      return NextResponse.json(
        { success: false, message: 'Invalid 4-digit OTP. Delivery cannot be completed.' },
        { status: 400 }
      );
    }

    updateLocalOrderStatus(localOrder.id, 'completed');

    return NextResponse.json({
      success: true,
      message: 'Doorstep OTP verified successfully! Order marked as completed.',
      orderId: localOrder.id,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
