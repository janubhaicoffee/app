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

async function checkStaff() {
  const { data, error } = await supabase.from('outlet_staff').select('*');
  console.log('outlet_staff count:', data?.length);
  console.log('staff records:', data);

  const { data: outlets } = await supabase.from('outlets').select('*');
  console.log('outlets:', outlets);
}

checkStaff();
