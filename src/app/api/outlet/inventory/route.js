import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get('lowStock');
    const outletId = searchParams.get('outletId');

    let query = supabaseAdmin
      .from('outlet_inventory')
      .select('*, outlets(name, code)')
      .order('created_at', { ascending: true });

    if (outletId) {
      query = query.eq('outlet_id', outletId);
    }

    const { data, error } = await query;
    if (error) {
      // Fallback without join
      let fbQuery = supabaseAdmin
        .from('outlet_inventory')
        .select('*')
        .order('created_at', { ascending: true });
      if (outletId) fbQuery = fbQuery.eq('outlet_id', outletId);
      const { data: raw, error: rawErr } = await fbQuery;
      if (rawErr) throw rawErr;

      let result = raw || [];
      if (lowStock === 'true') {
        result = result.filter((item) => (item.stock || 0) <= (item.threshold || 10));
      }
      return NextResponse.json({ success: true, data: result });
    }

    let result = data || [];
    if (lowStock === 'true') {
      result = result.filter((item) => (item.stock || 0) <= (item.threshold || 10));
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { outlet_id, name, category, stock, threshold, auto_reorder } = body;

    if (!name) {
      return NextResponse.json({ error: 'Missing item name' }, { status: 400 });
    }

    const insertData = {
      outlet_id: outlet_id || null,
      name,
      category: category || 'General Supplies',
      stock: parseInt(stock) || 0,
      threshold: parseInt(threshold) || 10,
      auto_reorder: !!auto_reorder,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('outlet_inventory')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Inventory POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, name, category, threshold, stock, auto_reorder } = body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (threshold !== undefined) updates.threshold = parseInt(threshold);
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (auto_reorder !== undefined) updates.auto_reorder = !!auto_reorder;

    // If no specific item ID is passed, update all items (useful for bulk config settings in E2E tests)
    let query = supabaseAdmin.from('outlet_inventory').update(updates);
    if (id) {
      query = query.eq('id', id);
    } else {
      // Update all records
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { data, error } = await query.select();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Inventory PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing inventory id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('outlet_inventory').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Inventory DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
