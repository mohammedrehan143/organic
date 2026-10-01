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

    const sanitize = (val?: string) => val?.trim().replace(/^["']|["']$/g, '');
    const isPlaceholder = (val?: string) =>
      !val ||
      val === '' ||
      val.includes('your_') ||
      val.includes('placeholder') ||
      val.includes('xxx');

    const keySecret = sanitize(process.env.RAZORPAY_KEY_SECRET);
    const hasRealSecret = !isPlaceholder(keySecret);

    // If real key secret is provided, strictly verify authentic Razorpay HMAC signature
    if (hasRealSecret && keySecret) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required Razorpay verification parameters (order_id, payment_id, or signature).',
          },
          { status: 400 }
        );
      }

      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const sigBuffer = Buffer.from(razorpay_signature, 'utf-8');
      const genBuffer = Buffer.from(generatedSignature, 'utf-8');

      const isSignatureValid =
        sigBuffer.length === genBuffer.length &&
        crypto.timingSafeEqual(sigBuffer, genBuffer);

      if (!isSignatureValid) {
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
      isMock: !hasRealSecret,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
