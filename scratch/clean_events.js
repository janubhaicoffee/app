const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
    acc[key] = value;
  }
  return acc;
}, {});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanEvents() {
  console.log('Querying events...');
  const { data: events, error } = await supabase.from('events').select('*');
  console.log('Current events count:', events?.length);
  events?.forEach((e) => console.log(`- [${e.id}] ${e.title} (${e.event_date})`));

  // Delete all dummy/mock events
  const { error: delErr } = await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) {
    console.error('Error deleting events:', delErr);
  } else {
    console.log('✓ Successfully deleted all dummy events from events table.');
  }

  // Also clean event_rsvps
  const { error: rErr } = await supabase.from('event_rsvps').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (rErr) {
    console.error('Error deleting RSVPs:', rErr);
  } else {
    console.log('✓ Successfully deleted all dummy RSVPs.');
  }
}

cleanEvents();
