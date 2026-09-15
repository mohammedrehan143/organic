import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await req.json();

    const orderId = `order_${Math.random().toString(36).substring(2, 12)}`;

    return NextResponse.json({
      success: true,
      id: orderId,
      amount: Math.round(Number(amount) * 100), // in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: 'created',
      mode: 'mock_sandbox',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
