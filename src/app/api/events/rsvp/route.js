import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('event_id');
    const email = searchParams.get('email');

    let query = supabaseAdmin.from('event_rsvps').select('*, event:events(*)').order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (email) {
      query = query.eq('customer_email', email);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Error fetching RSVPs:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch RSVPs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      event_id,
      customer_name,
      customer_email,
      customer_phone = '',
      guest_count = 1,
      notes = '',
    } = body;

    if (!event_id || !customer_name || !customer_email) {
      return NextResponse.json({ error: 'Event, full name, and email are required to RSVP' }, { status: 400 });
    }

    // 1. Fetch Event details & check capacity
    const { data: event, error: eventErr } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventErr || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const requestedGuests = Number(guest_count || 1);
    const currentRsvps = Number(event.rsvp_count || 0);
    const maxCapacity = Number(event.capacity || 30);

    if (currentRsvps + requestedGuests > maxCapacity) {
      return NextResponse.json(
        {
          error: `Sorry, this event only has ${Math.max(0, maxCapacity - currentRsvps)} spots remaining.`,
          remaining: Math.max(0, maxCapacity - currentRsvps),
        },
        { status: 400 }
      );
    }

    // 2. Check if already RSVP'd
    const { data: existingRsvp } = await supabaseAdmin
      .from('event_rsvps')
      .select('id')
      .eq('event_id', event_id)
      .eq('customer_email', customer_email.trim().toLowerCase())
      .maybeSingle();

    if (existingRsvp) {
      return NextResponse.json(
        { error: 'You are already registered for this event with this email!' },
        { status: 400 }
      );
    }

    // 3. Create RSVP Record
    const { data: rsvp, error: rsvpErr } = await supabaseAdmin
      .from('event_rsvps')
      .insert({
        event_id,
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim().toLowerCase(),
        customer_phone: customer_phone.trim(),
        guest_count: requestedGuests,
        notes: notes.trim(),
        status: 'confirmed',
      })
      .select()
      .single();

    if (rsvpErr) throw rsvpErr;

    // 4. Increment Event rsvp_count
    await supabaseAdmin
      .from('events')
      .update({ rsvp_count: currentRsvps + requestedGuests })
      .eq('id', event_id);

    return NextResponse.json({
      success: true,
      data: rsvp,
      event: {
        title: event.title,
        featuring_name: event.featuring_name,
        event_date: event.event_date,
        start_time: event.start_time,
        location_name: event.location_name,
      },
    });
  } catch (err) {
    console.error('Error submitting event RSVP:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit RSVP' }, { status: 500 });
  }
}
