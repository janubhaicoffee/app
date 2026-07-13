import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const staffId = searchParams.get('staffId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabaseAdmin
      .from('staff_attendance')
      .select('*, outlet_staff(display_name, role)')
      .order('created_at', { ascending: false });

    if (outletId) query = query.eq('outlet_id', outletId);
    if (staffId) query = query.eq('staff_id', staffId);
    if (date) query = query.eq('date', date);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Staff Attendance GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { outlet_id, staff_id, date, clock_in, clock_out, total_hours, status, notes, action } = body;

    if (!outlet_id || !staff_id) {
      return NextResponse.json(
        { error: 'Missing required fields: outlet_id, staff_id' },
        { status: 400 },
      );
    }

    if (action) {
      if (action === 'clock_in') {
        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await supabaseAdmin
          .from('staff_attendance')
          .select('*')
          .eq('staff_id', staff_id)
          .eq('date', today)
          .is('clock_out', null)
          .maybeSingle();

        if (existing) {
          return NextResponse.json({ error: 'Already clocked in' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
          .from('staff_attendance')
          .insert({
            outlet_id,
            staff_id,
            date: today,
            clock_in: new Date().toISOString(),
            status: 'present'
          })
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data }, { status: 201 });
      } else if (action === 'clock_out') {
        const { data: active } = await supabaseAdmin
          .from('staff_attendance')
          .select('*')
          .eq('staff_id', staff_id)
          .is('clock_out', null)
          .order('clock_in', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!active) {
          return NextResponse.json({ error: 'No active clock-in found' }, { status: 400 });
        }

        const clockOutTime = new Date();
        const clockInTime = new Date(active.clock_in);
        const diffMs = clockOutTime.getTime() - clockInTime.getTime();
        const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

        const { data, error } = await supabaseAdmin
          .from('staff_attendance')
          .update({
            clock_out: clockOutTime.toISOString(),
            total_hours: hours > 0 ? hours : 0
          })
          .eq('id', active.id)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Missing required field: date' },
        { status: 400 },
      );
    }

    const insertData = {
      outlet_id,
      staff_id,
      date,
      clock_in: clock_in || null,
      clock_out: clock_out || null,
      total_hours: total_hours !== undefined ? parseFloat(total_hours) : null,
      status: status || 'present',
      notes: notes || null,
    };

    const { data, error } = await supabaseAdmin
      .from('staff_attendance')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Staff Attendance POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, clock_out, total_hours, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing attendance id' }, { status: 400 });
    }

    const updates = {};
    if (clock_out !== undefined) updates.clock_out = clock_out;
    if (total_hours !== undefined) updates.total_hours = parseFloat(total_hours);
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin
      .from('staff_attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Staff Attendance PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
