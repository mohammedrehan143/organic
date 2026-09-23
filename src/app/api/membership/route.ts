import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '@/lib/supabase';
import { getLocalMemberships, saveLocalMembership, updateLocalMembershipBillApproved } from '@/lib/serverStore';
import { Membership, MembershipPlanType, MembershipBillingType } from '@/types/cafe';

// Cache whether the remote Supabase project has the memberships table created
let supabaseTableAvailable = true;

function formatDbRowToMembership(row: any): Membership {
  const now = new Date();
  const endDate = new Date(row.end_date);
  const diffMs = endDate.getTime() - now.getTime();
  const isExpired = diffMs <= 0;

  const rawStatus = row.payment_status || '';
  const billApproved = Boolean(row.bill_approved) || rawStatus.includes('__BILL_APPROVED__');
  const cleanPaymentStatus = rawStatus.replace('__BILL_APPROVED__', '').trim() || (row.billing_type === 'prepaid' ? 'paid' : 'postpaid_cycle');

  return {
    id: row.id,
    phone: row.phone,
    customerName: row.customer_name,
    customerEmail: row.customer_email || undefined,
    address: row.address || undefined,
    planType: row.plan_type,
    planName: row.plan_name,
    billingType: row.billing_type,
    price: Number(row.price) || 0,
    status: isExpired ? 'expired' : row.status || 'active',
    paymentStatus: cleanPaymentStatus,
    billApproved,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      // Admin query: return all memberships from database or local store
      const client = supabaseAdmin || supabase;
      let allMemberships: Membership[] = [];

      if (isSupabaseConfigured && client && supabaseTableAvailable) {
        try {
          const { data, error } = await client
            .from('memberships')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            if (error.code === 'PGRST205') {
              supabaseTableAvailable = false;
            }
          } else if (data) {
            allMemberships = data.map(formatDbRowToMembership);
          }
        } catch (dbErr) {
          console.warn('[Membership API] Error fetching all from db:', dbErr);
        }
      }

      // When Supabase table is not available, fall back to in-memory store
      if (!supabaseTableAvailable || !isSupabaseConfigured || !client) {
        const localAll = getLocalMemberships();
        for (const loc of localAll) {
          if (!allMemberships.some((m) => m.id === loc.id || m.phone.replace(/[^0-9]/g, '').slice(-10) === loc.phone.replace(/[^0-9]/g, '').slice(-10))) {
            allMemberships.push(loc);
          }
        }
      }

      allMemberships.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({
        success: true,
        memberships: allMemberships,
        count: allMemberships.length,
      });
    }

    const cleanInput = phone.replace(/[^0-9]/g, '');
    if (cleanInput.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const tenDigit = cleanInput.slice(-10);
    const client = supabaseAdmin || supabase;

    // 1. Try querying Supabase Database
    if (isSupabaseConfigured && client && supabaseTableAvailable) {
      try {
        const { data, error } = await client
          .from('memberships')
          .select('*')
          .or(`phone.ilike.%${cleanInput}%,phone.ilike.%${tenDigit}%`)
          .order('created_at', { ascending: false });

        if (error) {
          if (error.code === 'PGRST205') {
            supabaseTableAvailable = false;
          }
        } else if (data && data.length > 0) {
          const now = new Date();
          const allMemberships: Membership[] = data.map(formatDbRowToMembership);

          // Primary: most recently created active/valid membership
          const primary = allMemberships.find(m => m.status === 'active') || allMemberships[0];
          const primaryEnd = new Date(primary.endDate);
          const primaryDiff = primaryEnd.getTime() - now.getTime();
          const daysRemaining = Math.max(0, Math.ceil(primaryDiff / (1000 * 60 * 60 * 24)));
          const isExpired = primaryDiff <= 0;

          return NextResponse.json({
            success: true,
            membership: primary,
            memberships: allMemberships,
            daysRemaining,
            isExpired,
            source: 'database',
          });
        }
      } catch (dbErr) {
        console.warn('[Membership API] Supabase query notice:', dbErr);
      }
    }

    // 2. Fallback to serverStore in-memory records (when Supabase table unavailable)
    const localMatches = getLocalMemberships(cleanInput);
    if (localMatches.length > 0) {
      const now = new Date();
      const primary = localMatches.find(m => m.status === 'active') || localMatches[0];
      const endDate = new Date(primary.endDate);
      const diffMs = endDate.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      return NextResponse.json({
        success: true,
        membership: primary,
        memberships: localMatches,
        daysRemaining,
        isExpired: diffMs <= 0,
        source: 'local_store',
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: `No active membership found for phone number +91 ${tenDigit}. You can subscribe below to enjoy 100% free daily deliveries!`,
      },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, customerName, customerEmail, address, planType } = body;

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone number is required.' }, { status: 400 });
    }

    const cleanInput = phone.replace(/[^0-9]/g, '');
    if (cleanInput.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ success: false, message: 'Customer name is required.' }, { status: 400 });
    }

    const cleanName = customerName.trim();
    const selectedPlan: MembershipPlanType = planType === '6_months' ? '6_months' : '1_month';
    const isSixMonths = selectedPlan === '6_months';

    const planName = isSixMonths
      ? '6 Months VIP Club (Prepaid)'
      : '1 Month Organic Pass (Postpaid)';
    const billingType: MembershipBillingType = isSixMonths ? 'prepaid' : 'postpaid';
    const price = isSixMonths ? 12600 : 2160;
    const durationDays = isSixMonths ? 180 : 30;

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const membershipId = `MEM-${cleanInput.slice(-4)}-${Date.now().toString(36).toUpperCase()}`;

    const newMembership: Membership = {
      id: membershipId,
      phone: `+91 ${cleanInput.slice(-10)}`,
      customerName: cleanName,
      customerEmail: customerEmail ? customerEmail.trim() : undefined,
      address: address ? address.trim() : undefined,
      planType: selectedPlan,
      planName,
      billingType,
      price,
      status: 'active',
      paymentStatus: isSixMonths ? 'paid' : 'postpaid_cycle',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      createdAt: startDate.toISOString(),
      updatedAt: startDate.toISOString(),
    };

    // 1. Save to Supabase database if configured and table is available
    const client = supabaseAdmin || supabase;
    let dbSaved = false;

    if (isSupabaseConfigured && client && supabaseTableAvailable) {
      try {
        const { error: insertErr } = await client
          .from('memberships')
          .insert({
            id: newMembership.id,
            phone: newMembership.phone,
            customer_name: newMembership.customerName,
            customer_email: newMembership.customerEmail || null,
            address: newMembership.address || null,
            plan_type: newMembership.planType,
            plan_name: newMembership.planName,
            billing_type: newMembership.billingType,
            price: newMembership.price,
            status: newMembership.status,
            payment_status: newMembership.paymentStatus,
            start_date: newMembership.startDate,
            end_date: newMembership.endDate,
            created_at: newMembership.createdAt,
            updated_at: newMembership.updatedAt,
          });

        if (!insertErr) {
          dbSaved = true;
        } else {
          console.warn('[Membership API] DB insert notice:', insertErr.message);
          if (insertErr.code === 'PGRST205') {
            supabaseTableAvailable = false;
          }
        }
      } catch (dbErr) {
        console.warn('[Membership API] DB write failed:', dbErr);
      }
    }

    // 2. When Supabase table is not available, save to in-memory store
    if (!dbSaved) {
      saveLocalMembership(newMembership);
    }

    return NextResponse.json(
      {
        success: true,
        message: isSixMonths
          ? 'Congratulations! 6-Month VIP Membership activated with Prepaid billing.'
          : 'Congratulations! 1-Month Membership activated with Postpaid billing (settle at month-end).',
        membership: newMembership,
        dbSaved,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, phone, action, paymentStatus, paymentMethod, paymentId } = body;

    const client = supabaseAdmin || supabase;
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : '';

    // Action: Approve or toggle official Membership Bill (Admin permission)
    if (action === 'toggle_bill_approval' || body.billApproved !== undefined) {
      let isApproved: boolean;
      if (body.billApproved !== undefined) {
        isApproved = Boolean(body.billApproved);
      } else {
        const local = getLocalMemberships(cleanPhone);
        const currentApproved = local.length > 0 ? Boolean(local[0].billApproved) : false;
        isApproved = !currentApproved;
      }

      const now = new Date().toISOString();

      if (isSupabaseConfigured && client && supabaseTableAvailable) {
        try {
          const { data: existingRows } = await client
            .from('memberships')
            .select('*')
            .or(`id.eq.${id || 'NONE'},phone.ilike.%${cleanPhone}%`)
            .limit(1);

          if (existingRows && existingRows.length > 0) {
            const row = existingRows[0];
            const baseStatus = (row.payment_status || '').replace('__BILL_APPROVED__', '').trim() || (row.billing_type === 'prepaid' ? 'paid' : 'postpaid_cycle');
            const newPaymentStatus = isApproved ? `${baseStatus}__BILL_APPROVED__` : baseStatus;
            
            await client
              .from('memberships')
              .update({
                payment_status: newPaymentStatus,
                updated_at: now,
              })
              .eq('id', row.id);
          }
        } catch (dbErr) {
          console.warn('[Membership PATCH] bill approval error:', dbErr);
        }
      }

      // Update in-memory local store
      const updatedLocal = updateLocalMembershipBillApproved(id || cleanPhone, isApproved);
      if (!updatedLocal) {
        const local = getLocalMemberships(cleanPhone);
        if (local.length > 0) {
          local[0].billApproved = isApproved;
          saveLocalMembership(local[0]);
        }
      }

      return NextResponse.json({
        success: true,
        billApproved: isApproved,
        message: isApproved
          ? 'Membership Tax Invoice & Bill approved! Customer can now download receipt.'
          : 'Membership bill locked. Customer permission revoked.',
      });
    }

    // Action 1: Skip to Month-End payment due (Simulate 30 days completed)
    if (action === 'skip_to_due') {
      const now = new Date();
      // Set end date to yesterday to simulate 30 days completed and due
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const updateData: any = {
        end_date: pastDate,
        status: 'expired',
        payment_status: 'due',
        updated_at: now.toISOString(),
      };

      if (isSupabaseConfigured && client && supabaseTableAvailable) {
        try {
          await client
            .from('memberships')
            .update(updateData)
            .or(`id.eq.${id || 'NONE'},phone.ilike.%${cleanPhone}%`);
        } catch (dbErr) {
          console.warn('[Membership PATCH] db error:', dbErr);
        }
      }

      // Update local store
      const local = getLocalMemberships(cleanPhone);
      if (local.length > 0) {
        local[0].endDate = pastDate;
        local[0].status = 'expired';
        local[0].paymentStatus = 'due';
        saveLocalMembership(local[0]);
      }

      return NextResponse.json({
        success: true,
        message: 'Fast-forwarded 30 days. Month-end bill of ₹2,160 is now due for settlement.',
      });
    }

    // Action 2: Settle month-end postpaid bill or record payment
    if (action === 'mark_paid' || paymentStatus === 'paid') {
      const now = new Date();
      const nextEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const updateData: any = {
        status: 'active',
        payment_status: 'paid',
        start_date: now.toISOString(),
        end_date: nextEndDate,
        updated_at: now.toISOString(),
      };

      if (isSupabaseConfigured && client && supabaseTableAvailable) {
        try {
          await client
            .from('memberships')
            .update(updateData)
            .or(`id.eq.${id || 'NONE'},phone.ilike.%${cleanPhone}%`);
        } catch (dbErr) {
          console.warn('[Membership PATCH] db error:', dbErr);
        }
      }

      const local = getLocalMemberships(cleanPhone);
      if (local.length > 0) {
        local[0].status = 'active';
        local[0].paymentStatus = 'paid';
        local[0].startDate = now.toISOString();
        local[0].endDate = nextEndDate;
        saveLocalMembership(local[0]);
      }

      return NextResponse.json({
        success: true,
        message: 'Month-end bill of ₹2,160 paid successfully! Membership renewed for next 30 days.',
      });
    }

    // Action 3: Extend membership by 30 days
    if (action === 'extend_30') {
      const now = new Date();
      const local = getLocalMemberships(cleanPhone);
      let currentEnd = now;
      if (local.length > 0 && new Date(local[0].endDate).getTime() > now.getTime()) {
        currentEnd = new Date(local[0].endDate);
      }
      const newEndDate = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const updateData: any = {
        status: 'active',
        end_date: newEndDate,
        updated_at: now.toISOString(),
      };

      if (isSupabaseConfigured && client && supabaseTableAvailable) {
        try {
          await client
            .from('memberships')
            .update(updateData)
            .or(`id.eq.${id || 'NONE'},phone.ilike.%${cleanPhone}%`);
        } catch (dbErr) {
          console.warn('[Membership PATCH] db error:', dbErr);
        }
      }

      if (local.length > 0) {
        local[0].status = 'active';
        local[0].endDate = newEndDate;
        saveLocalMembership(local[0]);
      }

      return NextResponse.json({
        success: true,
        message: 'Membership extended by 30 days successfully.',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
