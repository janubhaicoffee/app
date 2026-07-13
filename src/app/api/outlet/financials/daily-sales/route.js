import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabaseAdmin.from('daily_sales').select('*').order('date', { ascending: false });

    if (outletId) query = query.eq('outlet_id', outletId);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Daily Sales GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { outlet_id, date } = body;

    if (!outlet_id) {
      return NextResponse.json({ error: 'Missing required field: outlet_id' }, { status: 400 });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const since = `${targetDate}T00:00:00`;
    const until = `${targetDate}T23:59:59`;

    const { data: orders } = await supabaseAdmin
      .from('pos_orders')
      .select('id, total, subtotal, tax_total')
      .eq('outlet_id', outlet_id)
      .eq('payment_status', 'paid')
      .gte('created_at', since)
      .lte('created_at', until);

    const totalOrders = orders ? orders.length : 0;
    const totalRevenue = (orders || []).reduce(
      (sum, o) => sum + parseFloat(o.total || 0),
      0,
    );
    const totalTax = (orders || []).reduce((sum, o) => sum + parseFloat(o.tax_total || 0), 0);

    const { data: expenses } = await supabaseAdmin
      .from('outlet_expenses')
      .select('amount, category')
      .eq('outlet_id', outlet_id)
      .eq('status', 'paid')
      .gte('created_at', since)
      .lte('created_at', until);

    const totalExpenses = (expenses || []).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    const { data: inventoryTx } = await supabaseAdmin
      .from('inventory_transactions')
      .select('quantity, unit_cost, type')
      .eq('outlet_id', outlet_id)
      .eq('type', 'purchase')
      .gte('created_at', since)
      .lte('created_at', until);

    const totalCogs = (inventoryTx || []).reduce((sum, t) => {
      return sum + parseFloat(t.quantity || 0) * parseFloat(t.unit_cost || 0);
    }, 0);

    const { data: attendance } = await supabaseAdmin
      .from('staff_attendance')
      .select('staff_id, total_hours')
      .eq('outlet_id', outlet_id)
      .eq('date', targetDate);

    let totalLabor = 0;
    if (attendance && attendance.length > 0) {
      const [yearStr, monthStr] = targetDate.split('-');
      const yearNum = parseInt(yearStr);
      const monthNum = parseInt(monthStr);

      for (const a of attendance) {
        let rate = 150; // default hourly rate fallback
        const { data: payroll } = await supabaseAdmin
          .from('staff_payroll')
          .select('hourly_rate')
          .eq('staff_id', a.staff_id)
          .eq('month', monthNum)
          .eq('year', yearNum)
          .maybeSingle();
        if (payroll && payroll.hourly_rate) {
          rate = parseFloat(payroll.hourly_rate);
        }
        totalLabor += parseFloat(a.total_hours || 0) * rate;
      }
    }

    const snapshot = {
      outlet_id,
      date: targetDate,
      total_orders: totalOrders,
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      total_tax: parseFloat(totalTax.toFixed(2)),
      total_cogs: parseFloat(totalCogs.toFixed(2)),
      total_labor: parseFloat(totalLabor.toFixed(2)),
      total_expenses: parseFloat(totalExpenses.toFixed(2)),
      rent_allocated: 0,
    };

    const { data: existing } = await supabaseAdmin
      .from('daily_sales')
      .select('id')
      .eq('outlet_id', outlet_id)
      .eq('date', targetDate)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('daily_sales')
        .update(snapshot)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('daily_sales')
        .insert([snapshot])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('Daily Sales POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
