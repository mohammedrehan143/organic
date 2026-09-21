import { NextRequest, NextResponse } from 'next/server';
import { isMasterKey } from '@/lib/adminAuth';
import { serverStore } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { pin, action, newPin } = await req.json();
    const cleanPin = String(pin || '').trim();

    if (!cleanPin && action !== 'update_pin') {
      return NextResponse.json(
        { success: false, message: 'PIN cannot be empty' },
        { status: 400 }
      );
    }

    const client = supabaseAdmin || supabase;
    let isAuthorized = false;
    let role: 'master' | 'kitchen' = 'kitchen';
    let dbKitchenPin: string | null = null;
    let dbMasterPin: string | null = null;

    // 1. Fetch keys from Supabase database if configured
    if (isSupabaseConfigured && client) {
      try {
        const { data: keys, error } = await client
          .from('admin_keys')
          .select('*');

        if (!error && keys && keys.length > 0) {
          for (const k of keys) {
            if (k.is_universal || k.key_name?.toLowerCase().includes('master')) {
              dbMasterPin = k.key_value;
            } else if (k.key_name === 'kitchen_pin' || k.id === 'kitchen_pin') {
              dbKitchenPin = k.key_value;
            }
          }

          // Check if cleanPin matches any key in DB
          const matchedKey = keys.find((k: any) => k.key_value === cleanPin);
          if (matchedKey) {
            isAuthorized = true;
            role = matchedKey.is_universal || matchedKey.key_name?.toLowerCase().includes('master')
              ? 'master'
              : 'kitchen';
          }
        }
      } catch (dbErr) {
        console.warn('[Admin Auth] Error fetching admin_keys from database:', dbErr);
      }
    }

    // 2. Check Server-Side Environment Master Key (process.env.ADMIN_MASTER_KEY)
    const envMaster = (process.env.ADMIN_MASTER_KEY || '').trim();
    if (envMaster && cleanPin === envMaster) {
      isAuthorized = true;
      role = 'master';
    }

    // 3. Check Server Memory Store / Default Fallback
    const memoryKitchenPin = (dbKitchenPin || serverStore.kitchenPin || '1234').trim();
    if (!isAuthorized && cleanPin === memoryKitchenPin) {
      isAuthorized = true;
      role = 'kitchen';
    }

    // Handle Action: Update PIN in the Database
    if (action === 'update_pin') {
      const cleanNewPin = String(newPin || '').trim();
      if (cleanNewPin.length < 4) {
        return NextResponse.json(
          { success: false, message: 'New PIN must be at least 4 digits' },
          { status: 400 }
        );
      }

      // Update in Server Memory
      serverStore.kitchenPin = cleanNewPin;

      // Update in Supabase admin_keys table
      let dbUpdated = false;
      if (isSupabaseConfigured && client) {
        try {
          const { error: upsertErr } = await client
            .from('admin_keys')
            .upsert(
              {
                id: 'kitchen_pin',
                key_name: 'kitchen_pin',
                key_value: cleanNewPin,
                is_universal: false,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            );

          if (!upsertErr) {
            dbUpdated = true;
          } else {
            console.warn('[Admin Auth] DB upsert notice:', upsertErr.message);
          }
        } catch (dbErr) {
          console.warn('[Admin Auth] DB upsert failed:', dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: dbUpdated
          ? 'Admin PIN updated successfully in database'
          : 'Admin PIN updated successfully for current session',
      });
    }

    // If verification failed
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: 'Invalid Admin PIN or Master Key' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      role,
      isMaster: role === 'master',
      message: role === 'master' ? 'Authenticated with Universal Master Key' : 'Admin PIN verified',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
