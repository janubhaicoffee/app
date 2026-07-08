import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('outlet_cameras')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Cameras GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, url } = body;

    if (!name || !url) {
      return NextResponse.json({ error: 'Missing name or url' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (_) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Check for duplicate camera name
    const { data: existing } = await supabaseAdmin
      .from('outlet_cameras')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Duplicate name' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('outlet_cameras')
      .insert([{ name, url, active: true }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Cameras POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, active } = body;

    if (!id || active === undefined) {
      return NextResponse.json({ error: 'Missing id or active state' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('outlet_cameras')
      .update({ active })
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
