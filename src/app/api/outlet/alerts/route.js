import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('outlet_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Alerts GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, severity } = body;

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('outlet_alerts')
      .insert([
        {
          message,
          severity: severity || 'medium',
          time: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Alerts POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, resolved } = body;

    if (!id || resolved === undefined) {
      return NextResponse.json({ error: 'Missing id or resolved state' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('outlet_alerts')
      .update({ resolved })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Alerts PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Support DELETE method for resolving/deleting alerts
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Instead of deleting, E2E test says "clearing/resolving an alert removes it or updates its status"
    // Let's resolve it (resolved = true) or delete it.
    // The query in Surveillance.jsx fetches alerts and filters `!a.resolved`.
    // So setting resolved = true is perfect. Let's do resolved = true, or delete.
    // Wait! Let's delete it so it's completely removed, or set resolved = true.
    // Let's delete it to match the standard HTTP DELETE semantic!
    const { error } = await supabaseAdmin.from('outlet_alerts').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Alerts DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
