const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  console.log("Profiles:", profiles, pError);

  const { data: userProfiles, error: upError } = await supabase.from('user_profiles').select('*');
  console.log("User Profiles:", userProfiles, upError);

  const { data: adminProfiles, error: apError } = await supabase.from('admin_profiles').select('*');
  console.log("Admin Profiles:", adminProfiles, apError);
}

check();
