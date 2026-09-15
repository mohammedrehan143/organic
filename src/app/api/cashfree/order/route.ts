import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount, customerPhone, customerName } = await req.json();

    // Mock Cashfree PG payment session
    const paymentSessionId = `session_${Math.random().toString(36).substring(2, 12)}`;
    
    return NextResponse.json({
      success: true,
      paymentSessionId,
      orderId,
      amount,
      mode: 'mock_sandbox',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
