import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get('outlet_id');

    let query = supabaseAdmin
      .from('monthly_operations_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (outletId) {
      query = query.eq('outlet_id', outletId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Error fetching monthly operations reviews:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch monthly reviews' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      outlet_id,
      month_year = new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      reviewed_by = 'Bilal Muhammad (Operations Head)',
      total_sales = 0,
      avg_daily_sales = 0,
      total_transactions = 0,
      top_selling_item = 'Chikmagalur Signature Espresso',
      customer_feedback_rating = 4.9,
      total_expenses = 0,
      net_result = 0,
      what_went_well = '',
      challenges = '',
      key_learnings = '',
      improvement_plans = [],
      monthly_summary_answers = {},
    } = body;

    let finalOutletId = outlet_id;
    if (!finalOutletId) {
      const { data: outlet } = await supabaseAdmin.from('outlets').select('id').limit(1).maybeSingle();
      finalOutletId = outlet?.id || 'a0000000-0000-0000-0000-000000000001';
    }

    const { data, error } = await supabaseAdmin
      .from('monthly_operations_reviews')
      .insert({
        outlet_id: finalOutletId,
        month_year,
        reviewed_by,
        total_sales: Number(total_sales),
        avg_daily_sales: Number(avg_daily_sales),
        total_transactions: Number(total_transactions),
        top_selling_item,
        customer_feedback_rating: Number(customer_feedback_rating),
        total_expenses: Number(total_expenses),
        net_result: Number(net_result),
        what_went_well,
        challenges,
        key_learnings,
        improvement_plans,
        monthly_summary_answers,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error recording monthly operations review:', err);
    return NextResponse.json({ error: err.message || 'Failed to save monthly review' }, { status: 500 });
  }
}
