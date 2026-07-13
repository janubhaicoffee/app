import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');

    let query = supabaseAdmin.from('pos_tables').select('*').order('name', { ascending: true });

    if (outletId) query = query.eq('outlet_id', outletId);

    const { data, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map((t) => ({
      ...t,
      number: isNaN(parseInt(t.name)) ? t.name : parseInt(t.name),
      qr_code: t.qr_code_url
    }));
    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('POS Tables GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { outlet_id, number, capacity, section, qr_code } = body;

    if (!outlet_id || number === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: outlet_id, number' },
        { status: 400 },
      );
    }

    const { data: existing } = await supabaseAdmin
      .from('pos_tables')
      .select('id')
      .eq('outlet_id', outlet_id)
      .eq('name', String(number))
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Table number already exists in this outlet' },
        { status: 409 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from('pos_tables')
      .insert([
        {
          outlet_id,
          name: String(number),
          capacity: capacity !== undefined ? parseInt(capacity) : 4,
          section: section || null,
          qr_code_url: qr_code || null,
          status: 'available',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    const mapped = data ? {
      ...data,
      number: isNaN(parseInt(data.name)) ? data.name : parseInt(data.name),
      qr_code: data.qr_code_url
    } : null;
    return NextResponse.json({ success: true, data: mapped }, { status: 201 });
  } catch (error) {
    console.error('POS Tables POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, number, capacity, section, status, qr_code } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing table id' }, { status: 400 });
    }

    if (
      status !== undefined &&
      !['available', 'occupied', 'reserved', 'cleaning'].includes(status)
    ) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updates = {};
    if (number !== undefined) updates.name = String(number);
    if (capacity !== undefined) updates.capacity = parseInt(capacity);
    if (section !== undefined) updates.section = section;
    if (status !== undefined) updates.status = status;
    if (qr_code !== undefined) updates.qr_code_url = qr_code;

    const { data, error } = await supabaseAdmin
      .from('pos_tables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const mapped = data ? {
      ...data,
      number: isNaN(parseInt(data.name)) ? data.name : parseInt(data.name),
      qr_code: data.qr_code_url
    } : null;
    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('POS Tables PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
