import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { data, error } = await supabaseAdmin
      .from('pos_orders')
      .select('*, pos_order_items(*), pos_tables!inner(number)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('POS Order GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, payment_status, items, notes } = body;

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (payment_status !== undefined) updates.payment_status = payment_status;
    if (notes !== undefined) updates.notes = notes;

    let order = null;

    if (Object.keys(updates).length > 0) {
      const { data: updatedOrder, error: orderError } = await supabaseAdmin
        .from('pos_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (orderError) {
        if (orderError.code === 'PGRST116') {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        throw orderError;
      }
      order = updatedOrder;
    }

    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const { id: itemId, status: itemStatus } = item;
        if (itemId && itemStatus) {
          const { error: itemError } = await supabaseAdmin
            .from('pos_order_items')
            .update({ status: itemStatus })
            .eq('id', itemId);
          if (itemError) console.error('Failed to update item status:', itemError);
        }
      }
    }

    if (!order) {
      const { data: fetchedOrder } = await supabaseAdmin
        .from('pos_orders')
        .select('*, pos_order_items(*)')
        .eq('id', id)
        .single();
      order = fetchedOrder;
    }

    const { data: orderItems } = await supabaseAdmin
      .from('pos_order_items')
      .select('*')
      .eq('order_id', id);

    return NextResponse.json({
      success: true,
      data: { ...order, pos_order_items: orderItems || [] },
    });
  } catch (error) {
    console.error('POS Order PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('pos_orders')
      .select('id, table_id, order_type, status')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      throw fetchError;
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('pos_orders')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateError) throw updateError;

    if (order.table_id && order.order_type === 'dine-in') {
      const { error: tableError } = await supabaseAdmin
        .from('pos_tables')
        .update({ status: 'available' })
        .eq('id', order.table_id);

      if (tableError) console.error('Failed to restore table status:', tableError);
    }

    return NextResponse.json({ success: true, data: { id, status: 'cancelled' } });
  } catch (error) {
    console.error('POS Order DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
