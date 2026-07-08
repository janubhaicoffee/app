import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let query = supabaseAdmin
      .from('pickup_requests')
      .select(
        '*, orders(id, order_number, total_amount, customer_name, customer_email, customer_phone, created_at, shipping_address)',
      )
      .order('created_at', { ascending: false });

    if (outletId) query = query.eq('outlet_id', outletId);
    if (status) query = query.eq('status', status);
    if (date) {
      const start = `${date}T00:00:00Z`;
      const end = `${date}T23:59:59Z`;
      query = query.gte('created_at', start).lte('created_at', end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Pickup GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status, notes, prepared_by } = body;
    if (!id) return NextResponse.json({ error: 'Missing pickup id' }, { status: 400 });

    const updates = {};
    if (status) {
      if (
        !['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled'].includes(status)
      ) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updates.status = status;
      if (status === 'ready') updates.ready_at = new Date().toISOString();
      if (status === 'picked_up') updates.picked_up_at = new Date().toISOString();
      if (status === 'confirmed' || status === 'preparing')
        updates.notified_at = new Date().toISOString();
    }
    if (notes !== undefined) updates.notes = notes;
    if (prepared_by) updates.prepared_by = prepared_by;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('pickup_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Pickup PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { order_id, outlet_id, order_number, customer_name, customer_phone, items_summary } =
      body;

    if (!order_id || !outlet_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('pickup_requests')
      .insert([
        {
          order_id,
          outlet_id,
          order_number: order_number || `ORD-${order_id.slice(0, 8)}`,
          customer_name: customer_name || null,
          customer_phone: customer_phone || null,
          items_summary: items_summary || [],
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Pickup POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
