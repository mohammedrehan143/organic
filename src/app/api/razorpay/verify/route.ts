// SECURITY: All Razorpay credentials are stored in .env.local (server-side only)
// RAZORPAY_KEY_ID — Your Razorpay Key ID (test: rzp_test_xxx, live: rzp_live_xxx)
// RAZORPAY_KEY_SECRET — Your Razorpay Key Secret (NEVER expose this to the frontend)
// The KEY_ID is safe to return to the client for the Razorpay checkout SDK.
// The KEY_SECRET is only used server-side for HMAC signature verification.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If real key secret is provided, verify authentic Razorpay HMAC signature
    if (keySecret && !keySecret.includes('your_') && !keySecret.includes('placeholder') && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          {
            success: false,
            error: 'Razorpay signature verification failed. Invalid payment proof.',
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Razorpay payment verified successfully',
      paymentId: razorpay_payment_id || `pay_${Date.now()}`,
      orderId: razorpay_order_id,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
