import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayConfig, verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Accept both standard Razorpay SDK callback names and generic names
    const orderId = body.razorpay_order_id || body.order_id;
    const paymentId = body.razorpay_payment_id || body.payment_id;
    const signature = body.razorpay_signature || body.signature;

    // Validate missing fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required payment verification parameters (order_id, payment_id, or signature)',
        },
        { status: 400 }
      );
    }

    const { keySecret, isConfigured } = getRazorpayConfig();

    if (!isConfigured || !keySecret) {
      return NextResponse.json(
        { success: false, error: 'Razorpay secret key not configured' },
        { status: 401 }
      );
    }

    // HMAC-SHA256 verification
    const isValid = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
      keySecret,
    });

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment signature. Verification failed.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment signature verified successfully',
      order_id: orderId,
      payment_id: paymentId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
