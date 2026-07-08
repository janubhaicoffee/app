import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const staffId = searchParams.get('staffId');
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabaseAdmin
        .from('pos_shifts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
        }
        throw error;
      }
      return NextResponse.json({ success: true, data });
    }

    let query = supabaseAdmin
      .from('pos_shifts')
      .select('*')
      .order('opened_at', { ascending: false });

    if (outletId) query = query.eq('outlet_id', outletId);
    if (staffId) query = query.eq('staff_id', staffId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('POS Shifts GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { staff_id, outlet_id, opening_cash, notes } = body;

    if (!staff_id || !outlet_id) {
      return NextResponse.json(
        { error: 'Missing required fields: staff_id, outlet_id' },
        { status: 400 },
      );
    }

    const openingCash = opening_cash !== undefined ? parseFloat(opening_cash) : 0;
    if (isNaN(openingCash) || openingCash < 0) {
      return NextResponse.json({ error: 'Invalid opening cash amount' }, { status: 400 });
    }

    const { data: openShift } = await supabaseAdmin
      .from('pos_shifts')
      .select('id')
      .eq('staff_id', staff_id)
      .eq('outlet_id', outlet_id)
      .is('closed_at', null)
      .maybeSingle();

    if (openShift) {
      return NextResponse.json(
        { error: 'Staff member already has an open shift' },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from('pos_shifts')
      .insert([
        {
          staff_id,
          outlet_id,
          opening_cash: openingCash,
          notes: notes || null,
          total_sales: 0,
          total_cash: 0,
          total_card: 0,
          total_upi: 0,
          status: 'open',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('POS Shifts POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, closing_cash, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing shift id' }, { status: 400 });
    }

    const { data: shift, error: fetchError } = await supabaseAdmin
      .from('pos_shifts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
      }
      throw fetchError;
    }

    if (shift.status === 'closed') {
      return NextResponse.json({ error: 'Shift is already closed' }, { status: 400 });
    }

    const closingCash = closing_cash !== undefined ? parseFloat(closing_cash) : null;

    const totalSales = parseFloat(shift.total_sales) || 0;
    const totalCash = parseFloat(shift.total_cash) || 0;
    const openingCash = parseFloat(shift.opening_cash) || 0;

    const expectedCash = openingCash + totalCash;
    const cashDifference =
      closingCash !== null ? parseFloat((closingCash - expectedCash).toFixed(2)) : null;

    const updates = {
      closed_at: new Date().toISOString(),
      status: 'closed',
      closing_cash: closingCash,
      expected_cash: parseFloat(expectedCash.toFixed(2)),
      cash_difference: cashDifference,
    };

    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin
      .from('pos_shifts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('POS Shifts PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
