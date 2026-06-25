const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('c:\\Users\\hudav\\Documents\\GitHub\\app\\.env.local', 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  const key = parts[0];
  const value = parts.slice(1).join('=');
  if (key && value) acc[key.trim()] = value.trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

supabase.from('mystery_drops').select('*').then(({ data, error }) => {
  if (error) {
    console.error("Error reading mystery_drops:", error);
  } else {
    console.log("Mystery Drops count:", data ? data.length : 0);
    console.log(JSON.stringify(data, null, 2));
  }
});
