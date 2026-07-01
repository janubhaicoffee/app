import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request, context) {
  try {
    const { outletCode } = await context.params;

    const { data: outlet, error: outletErr } = await supabaseAdmin
      .from('outlets')
      .select('*')
      .eq('code', outletCode)
      .maybeSingle();

    if (outletErr || !outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 });
    }

    const [categories, products] = await Promise.all([
      supabaseAdmin
        .from('pos_categories')
        .select('*')
        .eq('outlet_id', outlet.id)
        .eq('is_active', true)
        .order('sort_order'),
      supabaseAdmin
        .from('pos_products')
        .select('*')
        .eq('outlet_id', outlet.id)
        .eq('is_available', true)
        .order('sort_order'),
    ]);

    return NextResponse.json({
      outlet,
      categories: categories.data || [],
      products: products.data || [],
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
