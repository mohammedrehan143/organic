import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentId } = await req.json();

    return NextResponse.json({
      success: true,
      orderId,
      paymentId: paymentId || `cf_pay_${Date.now()}`,
      status: 'SUCCESS',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
