import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { serverStore } from '@/lib/serverStore';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    let deletedCount = 0;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('delete_orders_older_than_10_days');
      if (!error && data !== null) {
        deletedCount = Number(data);
      }
    } else {
      // Local in-memory cleanup: purge completed or cancelled orders older than 10 days
      const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
      const initialLen = serverStore.orders.length;
      serverStore.orders = serverStore.orders.filter((o) => {
        const orderTime = new Date(o.createdAt).getTime();
        const isOld = orderTime < tenDaysAgo;
        const isFinished = o.status === 'completed' || o.status === 'cancelled';
        return !(isOld && isFinished);
      });
      deletedCount = initialLen - serverStore.orders.length;
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} orders older than 10 days`,
      deletedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
