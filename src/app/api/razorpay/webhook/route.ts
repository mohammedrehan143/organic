import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { serverStore, saveLocalMembership } from '@/lib/serverStore';

/**
 * Razorpay Webhook Endpoint
 * 
 * Configured in Razorpay Dashboard -> Settings -> Webhooks
 * Webhook URL: https://<your-domain>/api/razorpay/webhook
 * Secret: Set RAZORPAY_WEBHOOK_SECRET in .env (falls back to RAZORPAY_KEY_SECRET)
 * 
 * Subscribed Events:
 * - payment.captured
 * - payment.failed
 * - order.paid
 * - refund.processed
 */

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/razorpay/webhook',
    message: 'Razorpay webhook endpoint is live and listening for events.',
    supportedEvents: ['payment.captured', 'payment.failed', 'order.paid', 'refund.processed'],
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET?.trim() ||
      process.env.RAZORPAY_KEY_SECRET?.trim();

    // Verify webhook signature if secret and signature are provided
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
      const sigBuf = Buffer.from(signature, 'utf-8');

      if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
        console.error('[Razorpay Webhook] Invalid signature verification');
        return NextResponse.json(
          { success: false, error: 'Invalid webhook signature' },
          { status: 400 }
        );
      }
    } else if (!webhookSecret) {
      console.warn('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not set. Proceeding without signature verification (dev mode).');
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload' },
        { status: 400 }
      );
    }

    const event = payload.event;
    const client = supabaseAdmin || supabase;
    const now = new Date().toISOString();

    console.log(`[Razorpay Webhook] Received event: ${event}`);

    // Handle payment.captured or order.paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const orderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || orderEntity?.notes || {};

      // 1. Check if event is for a Membership Scheme
      if (notes.type === 'membership_bill_settlement' || notes.membershipId) {
        const memId = notes.membershipId;
        const phone = notes.phone ? notes.phone.replace(/[^0-9]/g, '').slice(-10) : '';

        if (isSupabaseConfigured && client) {
          try {
            await client
              .from('memberships')
              .update({
                payment_status: 'paid',
                status: 'active',
                updated_at: now,
              })
              .or(`id.eq.${memId || 'NONE'},phone.ilike.%${phone}%`);
          } catch (dbErr) {
            console.error('[Razorpay Webhook] Membership update error:', dbErr);
          }
        }

        const local = serverStore.memberships.find(
          (m) => m.id === memId || (phone && m.phone.includes(phone))
        );
        if (local) {
          local.paymentStatus = 'paid';
          local.status = 'active';
          local.updatedAt = now;
          saveLocalMembership(local);
        }
      } else if (notes.type === 'vip_membership_6_months') {
        const phone = notes.phone ? notes.phone.replace(/[^0-9]/g, '').slice(-10) : '';
        if (isSupabaseConfigured && client) {
          try {
            await client
              .from('memberships')
              .update({
                payment_status: 'paid',
                status: 'active',
                updated_at: now,
              })
              .ilike('phone', `%${phone}%`);
          } catch (dbErr) {
            console.error('[Razorpay Webhook] VIP Membership update error:', dbErr);
          }
        }
      }

      // 2. Also attempt to update standard customer orders by orderId or paymentId
      if (orderId && isSupabaseConfigured && client) {
        try {
          await client
            .from('orders')
            .update({
              payment_status: 'paid',
              payment_method: 'Razorpay UPI/Cards',
              payment_received_at: now,
              updated_at: now,
            })
            .or(`id.eq.${orderId},token_id.eq.${orderId}`);
        } catch (dbErr) {
          console.warn('[Razorpay Webhook] Order update warning:', dbErr);
        }
      }

      // Update in local memory store if present
      const localOrder = serverStore.orders.find(
        (o) => o.id === orderId || o.tokenId === orderId || o.paymentOrderId === orderId
      );
      if (localOrder) {
        localOrder.paymentStatus = 'paid';
        localOrder.paymentMethod = 'Razorpay UPI/Cards';
        localOrder.paymentReceivedAt = now;
        if (paymentId) localOrder.paymentId = paymentId;
      }
    }

    // Handle refund.processed
    if (event === 'refund.processed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId && isSupabaseConfigured && client) {
        try {
          await client
            .from('orders')
            .update({
              payment_status: 'refunded',
              updated_at: now,
            })
            .or(`id.eq.${orderId},token_id.eq.${orderId}`);
        } catch (dbErr) {
          console.warn('[Razorpay Webhook] Refund update warning:', dbErr);
        }
      }

      const localOrder = serverStore.orders.find(
        (o) => o.id === orderId || o.tokenId === orderId || o.paymentOrderId === orderId
      );
      if (localOrder) {
        localOrder.paymentStatus = 'refunded';
      }
    }

    return NextResponse.json({
      success: true,
      status: 'ok',
      message: 'Razorpay webhook event received and processed',
      event,
      timestamp: now,
    });
  } catch (error: any) {
    console.error('[Razorpay Webhook] Handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal webhook error' },
      { status: 500 }
    );
  }
}
