import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('outlet_purchase_orders')
      .select(`
        *,
        outlets(name, code),
        outlet_vendors(name, category, phone)
      `)
      .order('created_at', { ascending: false });

    if (outletId) query = query.eq('outlet_id', outletId);
    if (status) query = query.eq('status', status);

    const { data: pos, error } = await query;
    if (error) {
      // Fallback
      const { data: rawPos, error: rawErr } = await supabaseAdmin
        .from('outlet_purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (rawErr) throw rawErr;

      const [outletsRes, vendorsRes] = await Promise.all([
        supabaseAdmin.from('outlets').select('id, name, code'),
        supabaseAdmin.from('outlet_vendors').select('id, name, category, phone')
      ]);

      const outletMap = (outletsRes.data || []).reduce((acc, o) => { acc[o.id] = o; return acc; }, {});
      const vendorMap = (vendorsRes.data || []).reduce((acc, v) => { acc[v.id] = v; return acc; }, {});

      const enriched = (rawPos || []).map((p) => ({
        ...p,
        outlets: outletMap[p.outlet_id] || { name: 'Main Cafe', code: 'JBC' },
        outlet_vendors: vendorMap[p.vendor_id] || { name: 'Coffee Supplier', category: 'Raw Materials' }
      }));

      return NextResponse.json({ success: true, data: enriched });
    }

    return NextResponse.json({ success: true, data: pos || [] });
  } catch (error) {
    console.error('Purchase Orders GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      outlet_id,
      vendor_id,
      po_number,
      order_date,
      expected_date,
      items,
      subtotal,
      tax,
      total,
      notes,
    } = body;

    if (!outlet_id) {
      return NextResponse.json({ error: 'Missing outlet_id' }, { status: 400 });
    }

    const generatedPo = po_number || `PO-${Date.now().toString().slice(-6)}`;
    const lineItems = Array.isArray(items) ? items : [];

    const computedSubtotal = subtotal !== undefined ? parseFloat(subtotal) : lineItems.reduce((s, i) => s + ((parseFloat(i.quantity) || 1) * (parseFloat(i.unit_price) || 0)), 0);
    const computedTax = tax !== undefined ? parseFloat(tax) : computedSubtotal * 0.05; // 5% GST
    const computedTotal = total !== undefined ? parseFloat(total) : (computedSubtotal + computedTax);

    const { data: newPo, error: poError } = await supabaseAdmin
      .from('outlet_purchase_orders')
      .insert([{
        outlet_id,
        vendor_id: vendor_id || null,
        po_number: generatedPo,
        status: 'draft',
        order_date: order_date || new Date().toISOString().split('T')[0],
        expected_date: expected_date || null,
        subtotal: computedSubtotal,
        tax: computedTax,
        total: computedTotal,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (poError) throw poError;

    // Insert line items if provided
    if (lineItems.length > 0) {
      const itemsToInsert = lineItems.map((item) => ({
        po_id: newPo.id,
        item_name: item.item_name || item.name,
        quantity: parseFloat(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        total_price: (parseFloat(item.quantity) || 1) * (parseFloat(item.unit_price) || 0)
      }));

      try {
        await supabaseAdmin.from('outlet_purchase_order_items').insert(itemsToInsert);
      } catch (err) {
        console.error('Error inserting PO items:', err);
      }
    }

    return NextResponse.json({ success: true, data: newPo }, { status: 201 });
  } catch (error) {
    console.error('Purchase Orders POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status, expected_date, received_date, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing PO id' }, { status: 400 });
    }

    const { data: currentPo, error: fetchErr } = await supabaseAdmin
      .from('outlet_purchase_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !currentPo) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    const updates = {
      updated_at: new Date().toISOString()
    };
    if (status !== undefined) updates.status = status;
    if (expected_date !== undefined) updates.expected_date = expected_date;
    if (received_date !== undefined) updates.received_date = received_date;
    if (notes !== undefined) updates.notes = notes;

    // If marked received, update received_date and replenish inventory stock
    if (status === 'received' && currentPo.status !== 'received') {
      updates.received_date = new Date().toISOString().split('T')[0];

      // Fetch items in this PO
      const { data: poItems } = await supabaseAdmin
        .from('outlet_purchase_order_items')
        .select('*')
        .eq('po_id', id);

      if (poItems && poItems.length > 0) {
        for (const item of poItems) {
          const { data: existingInv } = await supabaseAdmin
            .from('outlet_inventory')
            .select('*')
            .eq('outlet_id', currentPo.outlet_id)
            .ilike('name', item.item_name)
            .maybeSingle();

          if (existingInv) {
            await supabaseAdmin
              .from('outlet_inventory')
              .update({ stock: (existingInv.stock || 0) + (item.quantity || 0) })
              .eq('id', existingInv.id);
          } else {
            await supabaseAdmin
              .from('outlet_inventory')
              .insert([{
                outlet_id: currentPo.outlet_id,
                name: item.item_name,
                category: 'Supplies',
                stock: item.quantity || 0,
                threshold: 10,
                auto_reorder: false
              }]);
          }
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('outlet_purchase_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Purchase Orders PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing PO id' }, { status: 400 });
    }

    await supabaseAdmin.from('outlet_purchase_order_items').delete().eq('po_id', id);
    const { error } = await supabaseAdmin.from('outlet_purchase_orders').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Purchase Orders DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
