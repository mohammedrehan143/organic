import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPin, isMasterKey } from '@/lib/adminAuth';
import { serverStore } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { pin, action, newPin } = await req.json();

    const activeKitchenPin = serverStore.kitchenPin;
    const verifyResult = verifyAdminPin(pin, activeKitchenPin);

    if (!verifyResult.valid) {
      return NextResponse.json(
        { success: false, message: verifyResult.message },
        { status: 401 }
      );
    }

    // Action: update PIN (requires master key or current valid kitchen PIN)
    if (action === 'update_pin' && newPin) {
      const cleanNewPin = String(newPin).trim();
      if (cleanNewPin.length < 4) {
        return NextResponse.json(
          { success: false, message: 'New PIN must be at least 4 digits' },
          { status: 400 }
        );
      }

      serverStore.kitchenPin = cleanNewPin;

      if (isSupabaseConfigured && supabase) {
        await supabase.from('admin_keys').upsert({
          id: 'custom',
          key_name: 'kitchen_pin',
          key_value: cleanNewPin,
          is_universal: false,
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Kitchen PIN updated successfully',
        kitchenPin: cleanNewPin,
      });
    }

    return NextResponse.json({
      success: true,
      role: verifyResult.role,
      isMaster: isMasterKey(pin),
      message: verifyResult.message,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
