import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const inventoryId = searchParams.get('inventoryId');
    const limit = searchParams.get('limit');

    let query = supabaseAdmin
      .from('inventory_transactions')
      .select('*, outlet_inventory(name, sku, unit)')
      .order('created_at', { ascending: false });

    if (outletId) query = query.eq('outlet_id', outletId);
    if (inventoryId) query = query.eq('inventory_id', inventoryId);
    if (limit) query = query.limit(parseInt(limit));

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Inventory Transactions GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { inventory_id, quantity, type, unit_cost, notes } = body;

    if (!inventory_id || quantity === undefined) {
      return NextResponse.json({ error: 'Missing inventory_id or quantity' }, { status: 400 });
    }

    // Fetch current stock
    const { data: item, error: fetchErr } = await supabaseAdmin
      .from('outlet_inventory')
      .select('stock, outlet_id, unit_cost')
      .eq('id', inventory_id)
      .single();

    if (fetchErr || !item) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    const newStock = (item.stock || 0) + parseInt(quantity);

    // Update stock
    const { data: updatedItem, error } = await supabaseAdmin
      .from('outlet_inventory')
      .update({ stock: newStock })
      .eq('id', inventory_id)
      .select()
      .single();

    if (error) throw error;

    // Log the transaction in the inventory_transactions table
    const txnType = type || (parseInt(quantity) >= 0 ? 'purchase' : 'discard');
    const uCost = unit_cost !== undefined && unit_cost !== '' ? parseFloat(unit_cost) : (parseFloat(item.unit_cost) || 0);
    const qtyVal = Math.abs(parseInt(quantity));
    const tCost = qtyVal * uCost;

    const { error: txnError } = await supabaseAdmin
      .from('inventory_transactions')
      .insert({
        outlet_id: item.outlet_id,
        inventory_id,
        type: txnType,
        quantity: qtyVal,
        unit_cost: uCost,
        total_cost: tCost,
        notes: notes || `Stock update: ${quantity}`,
      });

    if (txnError) {
      console.error('Failed to log inventory transaction:', txnError);
    }

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Inventory Transactions POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
