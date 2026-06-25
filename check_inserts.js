const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  const key = parts[0];
  const value = parts.slice(1).join('=');
  if (key && value) acc[key.trim()] = value.trim().replace(/^"|"$/g, '');
  return acc;
}, {});
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('mystery_drops').insert({
    physical_token: 'TEST-TOKEN-123',
    name: 'Test Drop',
    origin_masked: 'Test Origin',
    roast_level: 'Light',
    tasting_notes: 'Test notes'
  }).select();
  console.log("Insert mystery_drops result:", { data, error });
  
  if (error) {
    console.log("Insert failed. This confirms RLS or permissions are active and we cannot write directly with anon key.");
  } else {
    console.log("Insert succeeded!");
    // Clean up
    await supabase.from('mystery_drops').delete().eq('physical_token', 'TEST-TOKEN-123');
  }
}
check();
