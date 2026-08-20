import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');

    let query = supabaseAdmin
      .from('outlet_cameras')
      .select('*, outlets(name, code)')
      .order('created_at', { ascending: true });

    if (outletId) query = query.eq('outlet_id', outletId);

    const { data, error } = await query;
    if (error) {
      // Fallback
      const { data: raw, error: rawErr } = await supabaseAdmin
        .from('outlet_cameras')
        .select('*')
        .order('created_at', { ascending: true });
      if (rawErr) throw rawErr;
      return NextResponse.json({ success: true, data: raw || [] });
    }
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Cameras GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, url, outlet_id } = body;

    if (!name || !url) {
      return NextResponse.json({ error: 'Missing name or url' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (_) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Check for duplicate camera name in same outlet
    let existingQuery = supabaseAdmin
      .from('outlet_cameras')
      .select('id')
      .eq('name', name);
    if (outlet_id) existingQuery = existingQuery.eq('outlet_id', outlet_id);

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Duplicate camera name in this outlet' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('outlet_cameras')
      .insert([{ name, url, outlet_id: outlet_id || null, active: true }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Cameras POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, active, name, url, outlet_id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing camera id' }, { status: 400 });
    }

    const updates = {};
    if (active !== undefined) updates.active = !!active;
    if (name !== undefined) updates.name = name;
    if (url !== undefined) updates.url = url;
    if (outlet_id !== undefined) updates.outlet_id = outlet_id;

    const { data, error } = await supabaseAdmin
      .from('outlet_cameras')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Cameras PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing camera id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('outlet_cameras').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cameras DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
