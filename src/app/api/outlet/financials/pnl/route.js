import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!outletId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required query params: outletId, startDate, endDate' },
        { status: 400 },
      );
    }

    const since = `${startDate}T00:00:00`;
    const until = `${endDate}T23:59:59`;

    const [{ data: orders }, { data: expenses }, { data: dailySales }] = await Promise.all([
      supabaseAdmin
        .from('pos_orders')
        .select('total, subtotal, tax_total, created_at')
        .eq('outlet_id', outletId)
        .eq('payment_status', 'paid')
        .gte('created_at', since)
        .lte('created_at', until),
      supabaseAdmin
        .from('outlet_expenses')
        .select('amount, category, created_at')
        .eq('outlet_id', outletId)
        .eq('status', 'paid')
        .gte('created_at', since)
        .lte('created_at', until),
      supabaseAdmin
        .from('daily_sales')
        .select('total_revenue, total_cogs, total_labor, total_expenses, rent_allocated')
        .eq('outlet_id', outletId)
        .gte('date', startDate)
        .lte('date', endDate),
    ]);

    const totalRevenue = (orders || []).reduce(
      (sum, o) => sum + parseFloat(o.total || 0),
      0,
    );
    const totalTax = (orders || []).reduce((sum, o) => sum + parseFloat(o.tax_total || 0), 0);

    let cogs = 0;
    let laborCost = 0;
    let rentAllocated = 0;
    let dailyTotalExpenses = 0;

    (dailySales || []).forEach((d) => {
      cogs += parseFloat(d.total_cogs || 0);
      laborCost += parseFloat(d.total_labor || 0);
      dailyTotalExpenses += parseFloat(d.total_expenses || 0);
      rentAllocated += parseFloat(d.rent_allocated || 0);
    });

    const totalExpenses = (expenses || []).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalOpEx = totalExpenses + laborCost + rentAllocated;
    const grossProfit = parseFloat((totalRevenue - cogs).toFixed(2));
    const netProfit = parseFloat(
      (grossProfit - totalOpEx).toFixed(2),
    );

    return NextResponse.json({
      success: true,
      data: {
        startDate,
        endDate,
        outletId,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalTax: parseFloat(totalTax.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        cogs: parseFloat(cogs.toFixed(2)),
        laborCost: parseFloat(laborCost.toFixed(2)),
        rentAllocated: parseFloat(rentAllocated.toFixed(2)),
        grossProfit,
        netProfit,
        profitMargin:
          totalRevenue > 0 ? parseFloat(((netProfit / totalRevenue) * 100).toFixed(2)) : 0,
      },
    });
  } catch (error) {
    console.error('PNL GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
