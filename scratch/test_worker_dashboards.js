const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function runVerification() {
  console.log('--- STARTING WORKER DASHBOARDS INTEGRATION TESTS ---');

  // Test 1: Outlets table check
  const { data: outlets, error: outletErr } = await supabase.from('outlets').select('*').limit(1);
  if (outletErr) throw new Error('Outlets fetch failed: ' + outletErr.message);
  console.log('✓ Outlet verified:', outlets[0]?.name);
  const outletId = outlets[0]?.id;

  // Test 2: Manager Observation & Photo Proof
  const sampleCheckpoints = [
    { id: 'shop_cleanliness', num: 1, name: 'Shop Cleanliness', status: 'ok', remarks: 'Sparkling clean' },
    { id: 'kitchen_cleanliness', num: 2, name: 'Kitchen Cleanliness', status: 'ok', remarks: 'Sanitized' },
    { id: 'drainage_outside', num: 5, name: 'Drainage & Outside Area', status: 'needs_attention', remarks: 'Debris near drain' }
  ];

  const { data: obs, error: obsErr } = await supabase
    .from('manager_observations')
    .insert({
      outlet_id: outletId,
      outlet_name: outlets[0]?.name,
      manager_name: 'Arsalan Azad',
      observation_date: '2026-08-21',
      visit_type: 'daily',
      checklist_items: sampleCheckpoints,
      overall_score: 93,
      priority: 'medium',
      manager_signature: 'Arsalan',
    })
    .select()
    .single();

  if (obsErr) throw new Error('Observation insert failed: ' + obsErr.message);
  console.log('✓ Manager observation recorded (ID:', obs.id, ')');

  // Attach photo proof for defect
  const { data: photo, error: photoErr } = await supabase
    .from('observation_photos')
    .insert({
      observation_id: obs.id,
      outlet_id: outletId,
      category: 'drainage_outside',
      photo_url: '/affogato_cup.png',
      caption: 'Debris near outside patio drain before sweeping',
      severity: 'medium',
    })
    .select()
    .single();

  if (photoErr) throw new Error('Photo proof insert failed: ' + photoErr.message);
  console.log('✓ High-res photo proof attached (ID:', photo.id, ')');

  // Test 3: Manager Issue Record
  const { data: issue, error: issueErr } = await supabase
    .from('manager_issue_records')
    .insert({
      outlet_id: outletId,
      outlet_name: outlets[0]?.name,
      manager_name: 'Arsalan Azad',
      record_date: '2026-08-21',
      issue_description: 'Water filter pressure valve vibrating',
      action_taken: 'Contacted approved vendor Anis',
      vendor_contacted: 'Anis (Electrician / Maintenance)',
      vendor_contact_phone: '+91 99533 77152',
      approved_vendor_used: true,
      resolution_status: 'pending',
      whatsapp_sent_to_oh: true,
      oh_informed: true,
    })
    .select()
    .single();

  if (issueErr) throw new Error('Issue record failed: ' + issueErr.message);
  console.log('✓ Manager issue & action record saved (ID:', issue.id, ')');

  // Test 4: Operations Head 14-Area Audit
  const { data: audit, error: auditErr } = await supabase
    .from('operations_control_audits')
    .insert({
      outlet_id: outletId,
      audit_date: '2026-08-21',
      reviewed_by: 'Bilal Muhammad (Operations Head)',
      checklist_14_areas: [
        { num: 1, name: 'Outlet Status', status: 'ok', notes: 'All good' },
        { num: 5, name: 'Quality & Hygiene', status: 'ok', notes: 'Impeccable standards' }
      ],
      overall_rating: 98,
    })
    .select()
    .single();

  if (auditErr) throw new Error('Operations audit failed: ' + auditErr.message);
  console.log('✓ Operations Head 14-area audit logged (ID:', audit.id, ')');

  // Test 5: Operations Head 5-Pillar Manager Review
  const { data: review, error: revErr } = await supabase
    .from('manager_coordination_reviews')
    .insert({
      outlet_id: outletId,
      reviewed_by: 'Bilal Muhammad',
      manager_name: 'Arsalan Azad',
      rating_leadership: 5,
      rating_operations: 5,
      rating_team_management: 5,
      rating_sales_targets: 4,
      rating_quality_service: 5,
      overall_performance_comments: 'Exemplary shift leadership and fast issue reporting.',
    })
    .select()
    .single();

  if (revErr) throw new Error('Manager review failed: ' + revErr.message);
  console.log('✓ Operations Head 5-pillar review logged (Rating:', review.rating_leadership, 'Stars)');

  // Test 6: Growth Event Creation & Operations Head Edit
  const eventSlug = 'test-barista-championship-' + Date.now();
  const { data: event, error: eventErr } = await supabase
    .from('events')
    .insert({
      title: 'Janu Bhai Barista Throwdown 2026',
      slug: eventSlug,
      featuring_name: 'Top 8 Delhi Baristas',
      event_type: 'Workshop',
      event_date: '2026-09-25',
      start_time: '04:00 PM',
      capacity: 35,
      rsvp_count: 0,
      host_name: 'Arsalan & Bilal',
    })
    .select()
    .single();

  if (eventErr) throw new Error('Event creation failed: ' + eventErr.message);
  console.log('✓ Growth event created (ID:', event.id, ', Title:', event.title, ')');

  // Operations Head Edits Event
  const { data: editedEvent, error: editErr } = await supabase
    .from('events')
    .update({ description: 'Updated by Operations Head Bilal with sound system setup notes.' })
    .eq('id', event.id)
    .select()
    .single();

  if (editErr) throw new Error('Event edit failed: ' + editErr.message);
  console.log('✓ Operations Head successfully edited event (Desc:', editedEvent.description.slice(0, 40), '...)');

  // Test 7: Public RSVP Registration
  const { data: rsvp, error: rsvpErr } = await supabase
    .from('event_rsvps')
    .insert({
      event_id: event.id,
      customer_name: 'Sameer Qureshi',
      customer_email: 'sameer.q@example.com',
      customer_phone: '+91 98119 88776',
      guest_count: 2,
      notes: 'Huge fan of Janu Bhai espresso',
      status: 'confirmed',
    })
    .select()
    .single();

  if (rsvpErr) throw new Error('RSVP insert failed: ' + rsvpErr.message);
  console.log('✓ Customer RSVP registered (ID:', rsvp.id, ', Guest:', rsvp.customer_name, ')');

  // Clean up test event and records
  await supabase.from('event_rsvps').delete().eq('id', rsvp.id);
  await supabase.from('events').delete().eq('id', event.id);
  await supabase.from('observation_photos').delete().eq('id', photo.id);
  await supabase.from('manager_observations').delete().eq('id', obs.id);
  await supabase.from('manager_issue_records').delete().eq('id', issue.id);
  await supabase.from('operations_control_audits').delete().eq('id', audit.id);
  await supabase.from('manager_coordination_reviews').delete().eq('id', review.id);

  console.log('--- ALL INTEGRATION & DASHBOARD TESTS PASSED WITH 100% SUCCESS ---');
}

runVerification().catch((e) => {
  console.error('TEST FAILURE:', e);
  process.exit(1);
});
