import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt, notes } = await req.json();

    const amountInPaise = Math.round(Number(amount) * 100);
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If real keys are provided and not placeholders, call Razorpay Orders API
    if (keyId && keySecret && !keyId.includes('your_') && !keyId.includes('placeholder')) {
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
          receipt: receipt || `rcpt_${Date.now()}`,
          notes: notes || { store: 'Zafiroo Organic Store' },
        }),
      });

      const rzpData = await response.json();

      if (!response.ok) {
        console.error('Razorpay Orders API error:', rzpData);
        return NextResponse.json(
          {
            success: false,
            error: rzpData.error?.description || 'Failed to create Razorpay order',
          },
          { status: response.status }
        );
      }

      return NextResponse.json({
        success: true,
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
      receipt: receipt || `rcpt_${Date.now()}`,
      key: keyId || 'rzp_test_placeholder',
      isMock: true,
      message: 'Running in sandbox mode. Add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET to .env.local for live payments.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
