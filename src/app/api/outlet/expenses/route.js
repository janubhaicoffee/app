import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const month = searchParams.get('month');

    let query = supabaseAdmin
      .from('outlet_expenses')
      .select('*')
      .order('bill_date', { ascending: false });

    if (outletId) query = query.eq('outlet_id', outletId);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (month) {
      const [year, mon] = month.split('-');
      const start = `${year}-${mon}-01`;
      const lastDay = new Date(parseInt(year), parseInt(mon), 0).getDate();
      const end = `${year}-${mon}-${String(lastDay).padStart(2, '0')}`;
      query = query.gte('bill_date', start).lte('bill_date', end);
    }

    const { data, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map((e) => ({
      ...e,
      date: e.bill_date,
      recurring: e.is_recurring,
    }));
    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Expenses GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { outlet_id, category, amount, description, date, vendor, recurring } =
      body;

    if (!outlet_id || !category || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: outlet_id, category, amount' },
        { status: 400 },
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('outlet_expenses')
      .insert([
        {
          outlet_id,
          category,
          amount: parsedAmount,
          description: description || null,
          bill_date: date || new Date().toISOString().split('T')[0],
          vendor: vendor || null,
          is_recurring: !!recurring,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    const mapped = data ? { ...data, date: data.bill_date, recurring: data.is_recurring } : null;
    return NextResponse.json({ success: true, data: mapped }, { status: 201 });
  } catch (error) {
    console.error('Expenses POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status, category, amount, description, date, vendor, recurring } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing expense id' }, { status: 400 });
    }

    if (status !== undefined && !['pending', 'paid', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, paid, cancelled' },
        { status: 400 },
      );
    }

    const updates = {};
    if (status !== undefined) {
      updates.status = status;
      if (status === 'paid') {
        updates.paid_date = new Date().toISOString().split('T')[0];
      }
    }
    if (category !== undefined) updates.category = category;
    if (amount !== undefined) {
      const p = parseFloat(amount);
      if (isNaN(p) || p <= 0)
        return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
      updates.amount = p;
    }
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.bill_date = date;
    if (vendor !== undefined) updates.vendor = vendor;
    if (recurring !== undefined) updates.is_recurring = !!recurring;

    const { data, error } = await supabaseAdmin
      .from('outlet_expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const mapped = data ? { ...data, date: data.bill_date, recurring: data.is_recurring } : null;
    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Expenses PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing expense id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('outlet_expenses').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Expenses DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
