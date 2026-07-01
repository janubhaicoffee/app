const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../../.env.local');
const envVars = fs.readFileSync(envPath, 'utf-8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

const rpcs = [
  'create_tables', 'migrate', 'setup_db', 'init_schema', 'run_migrations',
  'setup_tables', 'init_db', 'create_schema', 'deploy_schema'
];

async function run() {
  for (const rpc of rpcs) {
    try {
      const { data, error } = await supabase.rpc(rpc, {});
      console.log(`RPC '${rpc}':`, { data, error: error ? error.message : null });
    } catch (e) {
      console.log(`RPC '${rpc}' exception:`, e.message);
    }
  }
}

run();
