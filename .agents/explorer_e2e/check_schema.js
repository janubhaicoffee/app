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

// Query names of tables in public schema
supabase.rpc('get_tables').then(({ data, error }) => {
  if (error) {
    // If RPC doesn't exist, execute SQL query via a raw request or query information_schema if allowed
    // But since supabase client doesn't support raw SQL easily unless we run it, let's query some known tables:
    const tables = ['products', 'coffee_variants', 'mystery_drops', 'user_profiles', 'points_ledger', 'orders'];
    Promise.all(tables.map(t => 
      supabase.from(t).select('count', { count: 'exact', head: true }).then(r => ({ table: t, count: r.count, error: r.error }))
    )).then(results => {
      console.log("Tables check:", results);
    });
  } else {
    console.log("Tables:", data);
  }
});
