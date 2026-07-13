import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const staffId = searchParams.get('staffId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabaseAdmin
      .from('outlet_staff_schedules')
      .select('*')
      .order('created_at', { ascending: false });

    if (outletId) query = query.eq('outlet_id', outletId);
    if (startDate) query = query.gte('created_at', `${startDate}T00:00:00Z`);
    if (endDate) query = query.lte('created_at', `${endDate}T23:59:59Z`);

    const { data, error } = await query;
    if (error) throw error;

    // Map rows to match what the frontend expects:
    // outlet_staff: { name: s.name, role: s.role }
    // start_time / end_time parsed from shift (e.g. "Morning (06:00 - 14:00)")
    const mapped = (data || []).map((s) => {
      let startTime = '-';
      let endTime = '-';
      const match = s.shift?.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      if (match) {
        startTime = match[1];
        endTime = match[2];
      }

      return {
        ...s,
        date: s.created_at,
        start_time: startTime,
        end_time: endTime,
        status: s.status?.toLowerCase() === 'active' ? 'confirmed' : (s.status?.toLowerCase() || 'confirmed'),
        outlet_staff: {
          name: s.name,
          role: s.role
        }
      };
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Staff Schedules GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { outlet_id, name, role, shift, status } = body;

    if (!outlet_id || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: outlet_id, name, role' },
        { status: 400 },
      );
    }

    const insertData = {
      outlet_id,
      name,
      role,
      shift: shift || 'General (09:00 - 17:00)',
      status: status || 'Active',
    };

    const { data, error } = await supabaseAdmin
      .from('outlet_staff_schedules')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Staff Schedules POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
