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

async function check() {
  console.log("Querying RPC definition for rls_auto_enable...");
  try {
    // Try to get routines from information_schema if exposed
    const { data: d1, error: e1 } = await supabase.from('information_schema.routines').select('*');
    console.log("information_schema.routines:", { d1: d1 ? d1.length : null, e1 });
  } catch (e) {
    console.log("Exception 1:", e.message);
  }
}

check();
