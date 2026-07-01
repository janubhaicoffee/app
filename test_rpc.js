const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRPCs() {
  const rpcNames = ['exec_sql', 'execute_sql', 'run_sql', 'sql', 'postgres_query'];
  for (const name of rpcNames) {
    try {
      console.log(`Checking RPC '${name}'...`);
      const { data, error } = await supabase.rpc(name, { query: 'SELECT 1;' });
      if (!error) {
        console.log(`RPC '${name}' query arg works:`, data);
        continue;
      }
      const { data: data2, error: error2 } = await supabase.rpc(name, { sql: 'SELECT 1;' });
      if (!error2) {
        console.log(`RPC '${name}' sql arg works:`, data2);
        continue;
      }
      console.log(`RPC '${name}' failed:`, error.message || error, error2.message || error2);
    } catch (e) {
      console.log(`RPC '${name}' exception:`, e.message);
    }
  }
}

checkRPCs();
