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

async function inspectColumns() {
  const { data, error } = await supabase.rpc('execute_sql_query', {
    sql_string: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'outlet_staff';`
  });
  console.log('rpc columns:', data, error);

  if (error) {
    // Try simple select empty object
    const { data: sData, error: sErr } = await supabase.from('outlet_staff').select('*').limit(0);
    console.log('select error/keys:', sData, sErr);
  }
}

inspectColumns();
