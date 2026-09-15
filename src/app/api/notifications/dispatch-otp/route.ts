import { NextRequest, NextResponse } from 'next/server';
import { dispatchOtpNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, tokenId, total, customerName } = body;

    if (!phone || !otp || !tokenId) {
      return NextResponse.json(
        { success: false, message: 'Missing phone, otp, or tokenId' },
        { status: 400 }
      );
    }

    const result = await dispatchOtpNotification({
      phone,
      otp,
      tokenId,
      total: Number(total) || 0,
      customerName,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
