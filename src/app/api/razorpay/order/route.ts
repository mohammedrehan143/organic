// SECURITY: All Razorpay credentials are stored in .env.local (server-side only)
// RAZORPAY_KEY_ID — Your Razorpay Key ID (test: rzp_test_xxx, live: rzp_live_xxx)
// RAZORPAY_KEY_SECRET — Your Razorpay Key Secret (NEVER expose this to the frontend)
// The KEY_ID is safe to return to the client for the Razorpay checkout SDK.
// The KEY_SECRET is only used server-side for HMAC signature verification.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt, notes } = await req.json();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order amount. Amount must be greater than zero.' },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    if (amountInPaise < 100) {
      return NextResponse.json(
        { success: false, error: 'Order amount must be at least ₹1.00 for payment processing.' },
        { status: 400 }
      );
    }

    // Sanitize and detect credentials
    const sanitize = (val?: string) => val?.trim().replace(/^["']|["']$/g, '');
    const isPlaceholder = (val?: string) =>
      !val ||
      val === '' ||
      val.includes('your_') ||
      val.includes('placeholder') ||
      val.includes('xxx');

    let keyId = sanitize(process.env.RAZORPAY_KEY_ID);
    if (isPlaceholder(keyId)) {
      keyId = sanitize(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    }
    const keySecret = sanitize(process.env.RAZORPAY_KEY_SECRET);

    const hasRealKeys = !isPlaceholder(keyId) && !isPlaceholder(keySecret);

    // If real keys are provided and not placeholders, call Razorpay Orders API
    if (hasRealKeys && keyId && keySecret) {
      const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: String(receipt || `rcpt_${Date.now()}`).slice(0, 40),
          notes: typeof notes === 'object' && notes !== null ? notes : { store: 'Zafiroo Dairy' },
        }),
      });

      const rzpData = await response.json();

      if (!response.ok) {
        console.error('Razorpay Orders API error:', rzpData);
        return NextResponse.json(
          {
            success: false,
            error: rzpData.error?.description || rzpData.error?.message || 'Failed to create Razorpay order',
          },
          { status: response.status }
        );
      }

      return NextResponse.json({
        success: true,
        order_id: rzpData.id,
        id: rzpData.id,
        amount: rzpData.amount,
        currency: rzpData.currency,
        key: keyId,
        isMock: false,
      });
    }

    // Sandbox fallback mode if credentials are not yet configured in .env.local
    const fallbackId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return NextResponse.json({
      success: true,
      id: fallbackId,
      amount: amountInPaise,
      currency,
      receipt: String(receipt || `rcpt_${Date.now()}`).slice(0, 40),
      key: keyId || 'rzp_test_placeholder',
      isMock: true,
      message: 'Running in sandbox mode. Add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET to .env.local for live payments.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
