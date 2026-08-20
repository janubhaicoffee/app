import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'withdrawals'; // 'withdrawals' | 'staff_consumption' | 'daily_sales'
    const outletId = searchParams.get('outlet_id');

    let finalOutletId = outletId;
    if (!finalOutletId) {
      const { data: outlet } = await supabaseAdmin.from('outlets').select('id').limit(1).maybeSingle();
      finalOutletId = outlet?.id || 'a0000000-0000-0000-0000-000000000001';
    }

    if (type === 'withdrawals') {
      const { data, error } = await supabaseAdmin
        .from('cash_withdrawals')
        .select('*')
        .eq('outlet_id', finalOutletId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (type === 'staff_consumption') {
      const { data, error } = await supabaseAdmin
        .from('staff_consumptions')
        .select('*')
        .eq('outlet_id', finalOutletId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (type === 'daily_sales') {
      const { data, error } = await supabaseAdmin
        .from('daily_sales')
        .select('*')
        .eq('outlet_id', finalOutletId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    return NextResponse.json({ error: 'Invalid register type' }, { status: 400 });
  } catch (err) {
    console.error('Error fetching cash register data:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch register data' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, outlet_id, ...payload } = body;

    let finalOutletId = outlet_id;
    if (!finalOutletId) {
      const { data: outlet } = await supabaseAdmin.from('outlets').select('id').limit(1).maybeSingle();
      finalOutletId = outlet?.id || 'a0000000-0000-0000-0000-000000000001';
    }

    if (type === 'withdrawal') {
      const { data, error } = await supabaseAdmin
        .from('cash_withdrawals')
        .insert({
          outlet_id: finalOutletId,
          withdrawal_date: payload.withdrawal_date || new Date().toISOString().split('T')[0],
          opening_cash: Number(payload.opening_cash || 0),
          reason: payload.reason,
          amount: Number(payload.amount || 0),
          paid_to: payload.paid_to,
          cash_given_by: payload.cash_given_by,
          receipt_url: payload.receipt_url || null,
          employee_sign: payload.employee_sign || '',
          manager_sign: payload.manager_sign || 'Arsalan',
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (type === 'staff_consumption') {
      const { data, error } = await supabaseAdmin
        .from('staff_consumptions')
        .insert({
          outlet_id: finalOutletId,
          consumption_date: payload.consumption_date || new Date().toISOString().split('T')[0],
          item_name: payload.item_name,
          amount_worth: Number(payload.amount_worth || 0),
          consumed_by: payload.consumed_by,
          designation: payload.designation || 'Staff / Barista',
          purpose: payload.purpose || 'Shift drink / meal allowance',
          employee_sign: payload.employee_sign || '',
          manager_sign: payload.manager_sign || 'Arsalan',
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (type === 'daily_sales') {
      const { data, error } = await supabaseAdmin
        .from('daily_sales')
        .insert({
          outlet_id: finalOutletId,
          date: payload.date || new Date().toISOString().split('T')[0],
          opening_cash: Number(payload.opening_cash || 0),
          closing_cash: Number(payload.closing_cash || 0),
          cash_sales: Number(payload.cash_sales || 0),
          upi_sales: Number(payload.upi_sales || 0),
          card_sales: Number(payload.card_sales || 0),
          total_sales: Number(payload.total_sales || 0),
          total_orders: Number(payload.total_orders || 0),
          notes: payload.notes || '',
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Invalid register entry type' }, { status: 400 });
  } catch (err) {
    console.error('Error recording register entry:', err);
    return NextResponse.json({ error: err.message || 'Failed to save register entry' }, { status: 500 });
  }
}
