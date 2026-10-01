import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayConfig, getRazorpayClient } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { currency = 'INR', receipt, notes } = body;
    const rawAmount = Number(body.amount);

    if (isNaN(rawAmount) || rawAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount is required and must be a positive number' },
        { status: 400 }
      );
    }

    // Determine amount in paise:
    // If rawAmount < 100, caller passed rupees (e.g. 72 -> 7200 paise)
    // If rawAmount >= 100, caller passed paise directly (e.g. 50000 paise or 100 paise)
    let amountInPaise = rawAmount < 100 ? Math.round(rawAmount * 100) : Math.round(rawAmount);

    // Validate minimum amount is at least 100 paise (₹1.00)
    if (amountInPaise < 100) {
      return NextResponse.json(
        { success: false, error: 'Amount must be at least 100 paise (₹1.00)' },
        { status: 400 }
      );
    }

    const { keyId, keySecret, isConfigured } = getRazorpayConfig();

    if (!isConfigured) {
      return NextResponse.json(
        { success: false, error: 'Razorpay API credentials not configured or unauthorized' },
        { status: 401 }
      );
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return NextResponse.json(
        { success: false, error: 'Failed to initialize Razorpay client' },
        { status: 401 }
      );
    }

    try {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt: String(receipt || `rcpt_${Date.now()}`).slice(0, 40),
        notes: typeof notes === 'object' && notes !== null ? notes : { store: 'Zafiroo Dairy' },
      });

      return NextResponse.json({
        success: true,
        order_id: order.id,
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: keyId,
      });
    } catch (rzpErr: any) {
      console.error('Razorpay API order creation failed:', rzpErr);
      const statusCode = rzpErr.statusCode === 401 ? 401 : 500;
      return NextResponse.json(
        {
          success: false,
          error: rzpErr.error?.description || rzpErr.message || 'Razorpay order creation failed',
        },
        { status: statusCode }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
