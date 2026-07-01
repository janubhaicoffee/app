const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) console.error("Products error:", error);
  else console.log("Supabase connection ok");

  // Let's check if we can query pg_proc or information_schema.routines
  // PostgREST only exposes schemas configured in settings. Usually public is exposed.
  // Can we run RPC or do we have another way?
  // Let's check if there is an RPC we can use. Let's try calling a common name like exec_sql
  const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { query: 'SELECT 1;' });
  console.log("exec_sql rpc:", { rpcData, rpcError });
}
run();
