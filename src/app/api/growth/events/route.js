import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyStaffAuth } from '@/lib/staffAuth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('events')
      .select('*, event_rsvps(*)')
      .order('event_date', { ascending: true });

    if (slug) {
      query = query.eq('slug', slug);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (id) {
      query = query.eq('id', id);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Error fetching events:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await verifyStaffAuth(req, ['growth', 'brand_leader', 'operations_head', 'operations', 'superadmin', 'owner']);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const body = await req.json();
    const {
      title,
      slug,
      featuring_name = '',
      event_type = 'Workshop',
      description = '',
      outlet_id = null,
      location_name = 'Janu Bhai Cafe, Gafoor Nagar, Delhi',
      event_date,
      start_time,
      end_time = '',
      capacity = 30,
      price = 0,
      status = 'published',
      banner_url = '/affogato_cup.png',
      host_name = 'Host / Roaster',
      is_featured = false,
      created_by = 'Growth & Brand Leader',
    } = body;

    if (!title || !event_date || !start_time) {
      return NextResponse.json({ error: 'Title, event date, and start time are required' }, { status: 400 });
    }

    const cleanSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({
        title,
        slug: cleanSlug,
        featuring_name,
        event_type,
        description,
        outlet_id,
        location_name,
        event_date,
        start_time,
        end_time,
        capacity: Number(capacity || 30),
        price: Number(price || 0),
        status,
        banner_url: banner_url || '/affogato_cup.png',
        host_name,
        is_featured: Boolean(is_featured),
        created_by,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error creating event:', err);
    return NextResponse.json({ error: err.message || 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const auth = await verifyStaffAuth(req, ['operations_head', 'operations', 'operation_manager', 'growth', 'brand_leader', 'superadmin', 'owner']);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error updating event:', err);
    return NextResponse.json({ error: err.message || 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await verifyStaffAuth(req, ['growth', 'brand_leader', 'operations_head', 'operations', 'superadmin', 'owner']);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting event:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete event' }, { status: 500 });
  }
}
