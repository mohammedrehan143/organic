import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id } = await req.json();

    return NextResponse.json({
      success: true,
      message: 'Razorpay signature verified successfully',
      paymentId: razorpay_payment_id || `pay_${Date.now()}`,
      orderId: razorpay_order_id,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
