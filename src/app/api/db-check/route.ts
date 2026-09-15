import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { serverStore } from '@/lib/serverStore';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (!error) {
        return NextResponse.json({
          status: 'connected',
          database: 'Supabase PostgreSQL',
          totalOrders: count,
          configured: true,
        });
      }

      return NextResponse.json({
        status: 'error',
        database: 'Supabase PostgreSQL',
        configured: true,
        error: error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'local_storage_mode',
      database: 'In-Memory / Local Storage (Offline first)',
      configured: false,
      message: 'Local data persistence active. No external database configured yet.',
      localOrdersCount: serverStore.orders.length,
      localMenuCount: serverStore.menu.length,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
    }, { status: 500 });
  }
}
