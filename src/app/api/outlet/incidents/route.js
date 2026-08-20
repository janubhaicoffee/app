import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('outlet_incident_logs')
      .select('*, outlets(name, code)')
      .order('created_at', { ascending: false });

    if (outletId) query = query.eq('outlet_id', outletId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      // Fallback
      const { data: raw, error: rawErr } = await supabaseAdmin
        .from('outlet_incident_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (rawErr) throw rawErr;
      return NextResponse.json({ success: true, data: raw || [] });
    }
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Incident Logs GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { outlet_id, title, description, severity, dispatched, status, reported_by } = body;

    if (!description && !title) {
      return NextResponse.json({ error: 'Missing required field: title or description' }, { status: 400 });
    }

    const insertData = {
      outlet_id: outlet_id || null,
      title: title || (description ? description.slice(0, 50) : 'Incident Report'),
      description: description || title,
      severity: severity || 'medium',
      status: status || 'open',
      reported_by: reported_by || 'Staff',
      dispatched: dispatched !== undefined ? !!dispatched : false,
      dispatched_at: dispatched ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('outlet_incident_logs')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Incident Logs POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, title, description, severity, status, resolution_notes, dispatched } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing incident log id' }, { status: 400 });
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (severity !== undefined) updates.severity = severity;
    if (status !== undefined) updates.status = status;
    if (resolution_notes !== undefined) updates.resolution_notes = resolution_notes;
    if (dispatched !== undefined) {
      updates.dispatched = !!dispatched;
      updates.dispatched_at = dispatched ? new Date().toISOString() : null;
    }

    const { data, error } = await supabaseAdmin
      .from('outlet_incident_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Incident Logs PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing incident log id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('outlet_incident_logs').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Incident Logs DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
