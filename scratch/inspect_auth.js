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

async function inspectAuth() {
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(10);
  console.log('profiles:', profiles, pErr);

  const { data: adminProfiles, error: aErr } = await supabase.from('admin_profiles').select('*').limit(10);
  console.log('admin_profiles:', adminProfiles, aErr);

  const { data: authUsers, error: uErr } = await supabase.auth.admin.listUsers();
  console.log('auth users count:', authUsers?.users?.length);
  console.log('auth users:', authUsers?.users?.map(u => ({ id: u.id, email: u.email, phone: u.phone, user_metadata: u.user_metadata })));
}

inspectAuth();
