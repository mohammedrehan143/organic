import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '@/lib/supabase';
import { serverStore } from '@/lib/serverStore';

export async function GET() {
  try {
    const client = supabaseAdmin || supabase;

    if (isSupabaseConfigured && client) {
      const startTime = Date.now();
      const [ordersRes, customersRes, agentsRes, sosRes, memRes] = await Promise.all([
        client.from('orders').select('*', { count: 'exact', head: true }),
        client.from('customers').select('*', { count: 'exact', head: true }),
        client.from('delivery_agents').select('*', { count: 'exact', head: true }),
        client.from('sos_alerts').select('*', { count: 'exact', head: true }),
        client.from('memberships').select('*', { count: 'exact', head: true }),
      ]);
      const latencyMs = Date.now() - startTime;

      if (!ordersRes.error) {
        return NextResponse.json({
          status: 'connected',
          database: 'Supabase PostgreSQL (High-Concurrency Ready)',
          configured: true,
          latencyMs,
          tables: {
            orders: { count: ordersRes.count ?? 0, status: 'healthy' },
            customers: { count: customersRes.count ?? 0, status: customersRes.error ? 'table_missing_or_error' : 'healthy' },
            delivery_agents: { count: agentsRes.count ?? 0, status: agentsRes.error ? 'table_missing_or_error' : 'healthy' },
            sos_alerts: { count: sosRes.count ?? 0, status: sosRes.error ? 'table_missing_or_error' : 'healthy' },
            memberships: { count: memRes.count ?? 0, status: memRes.error ? 'table_missing_or_error' : 'healthy' },
          },
          concurrencyOptimized: true,
          realtimeConfigured: true,
        });
      }

      return NextResponse.json({
        status: 'error',
        database: 'Supabase PostgreSQL',
        configured: true,
        error: ordersRes.error.message,
        hint: 'Please ensure supabase_schema.sql has been executed in your Supabase SQL Editor.',
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'local_storage_mode',
      database: 'In-Memory & Local Storage (Offline first)',
      configured: false,
      message: 'App is running smoothly in local mode. Paste your Supabase URL & Anon Key in .env.local to connect live DB.',
      localOrdersCount: serverStore.orders.length,
      localMenuCount: serverStore.menu.length,
      localAgentsCount: serverStore.agents.length,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
    }, { status: 500 });
  }
}
