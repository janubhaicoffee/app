import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('stock_transfers')
      .select(`
        *,
        source_outlet:outlets!stock_transfers_source_outlet_id_fkey(name, code),
        destination_outlet:outlets!stock_transfers_destination_outlet_id_fkey(name, code)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (outletId) {
      query = query.or(`source_outlet_id.eq.${outletId},destination_outlet_id.eq.${outletId}`);
    }

    const { data, error } = await query;
    if (error) {
      // Fallback if foreign key naming differs in PostgREST
      const fallbackQuery = supabaseAdmin
        .from('stock_transfers')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: rawTransfers, error: rawError } = await fallbackQuery;
      if (rawError) throw rawError;

      const { data: allOutlets } = await supabaseAdmin.from('outlets').select('id, name, code');
      const outletMap = (allOutlets || []).reduce((acc, o) => {
        acc[o.id] = o;
        return acc;
      }, {});

      const enriched = (rawTransfers || []).map((t) => ({
        ...t,
        source_outlet: outletMap[t.source_outlet_id] || { name: 'Central Warehouse', code: 'MAIN' },
        destination_outlet: outletMap[t.destination_outlet_id] || { name: 'Outlet', code: 'OUT' }
      }));

      return NextResponse.json({ success: true, data: enriched });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Stock Transfers GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      source_outlet_id,
      destination_outlet_id,
      item_name,
      quantity,
      unit,
      requested_by,
      notes
    } = body;

    if (!item_name || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: item_name, quantity' },
        { status: 400 }
      );
    }

    const insertData = {
      source_outlet_id: source_outlet_id || null,
      destination_outlet_id: destination_outlet_id || null,
      item_name,
      quantity: parseFloat(quantity),
      unit: unit || 'units',
      status: 'pending',
      requested_by: requested_by || 'Operations Manager',
      notes: notes || null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('stock_transfers')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Stock Transfers POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status, approved_by, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing transfer id' }, { status: 400 });
    }

    // 1. Fetch current transfer
    const { data: currentTransfer, error: fetchErr } = await supabaseAdmin
      .from('stock_transfers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !currentTransfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (approved_by !== undefined) updates.approved_by = approved_by;
    if (notes !== undefined) updates.notes = notes;

    if (status === 'completed' && currentTransfer.status !== 'completed') {
      updates.completed_at = new Date().toISOString();

      // Adjust inventory balances if applicable
      const qty = parseFloat(currentTransfer.quantity) || 0;
      const itemName = currentTransfer.item_name;

      // Source outlet deduction
      if (currentTransfer.source_outlet_id) {
        const { data: srcItem } = await supabaseAdmin
          .from('outlet_inventory')
          .select('*')
          .eq('outlet_id', currentTransfer.source_outlet_id)
          .ilike('name', itemName)
          .maybeSingle();

        if (srcItem) {
          const newStock = Math.max(0, (srcItem.stock || 0) - qty);
          await supabaseAdmin
            .from('outlet_inventory')
            .update({ stock: newStock })
            .eq('id', srcItem.id);
        }
      }

      // Destination outlet addition
      if (currentTransfer.destination_outlet_id) {
        const { data: destItem } = await supabaseAdmin
          .from('outlet_inventory')
          .select('*')
          .eq('outlet_id', currentTransfer.destination_outlet_id)
          .ilike('name', itemName)
          .maybeSingle();

        if (destItem) {
          const newStock = (destItem.stock || 0) + qty;
          await supabaseAdmin
            .from('outlet_inventory')
            .update({ stock: newStock })
            .eq('id', destItem.id);
        } else {
          // Create inventory entry in destination outlet
          await supabaseAdmin
            .from('outlet_inventory')
            .insert([{
              outlet_id: currentTransfer.destination_outlet_id,
              name: itemName,
              category: 'Transferred Supply',
              stock: qty,
              threshold: 10,
              auto_reorder: false
            }]);
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('stock_transfers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Stock Transfers PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing transfer id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('stock_transfers').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stock Transfers DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
