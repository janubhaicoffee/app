import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('outlet_incident_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Incident Logs GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { description, severity, dispatched } = body;

    if (!description) {
      return NextResponse.json({ error: 'Missing required field: description' }, { status: 400 });
    }

    const insertData = {
      description,
      severity: severity || 'medium',
      dispatched: dispatched !== undefined ? !!dispatched : false,
      dispatched_at: dispatched ? new Date().toISOString() : null,
    };

    const { data, error } = await supabaseAdmin
      .from('outlet_incident_logs')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Incident Logs POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, description, severity, dispatched } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing incident log id' }, { status: 400 });
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (description !== undefined) updates.description = description;
    if (severity !== undefined) updates.severity = severity;
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
