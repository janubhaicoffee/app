const fs = require('fs');

const envFile = fs.readFileSync('c:\\Users\\hudav\\Documents\\GitHub\\app\\.env.local', 'utf-8');
const envVars = {};
envFile.split(/\r?\n/).forEach(line => {
  const parts = line.split('=');
  const key = parts[0]?.trim();
  const value = parts.slice(1).join('=')?.trim();
  if (key && value) {
    envVars[key] = value.replace(/^"|"$/g, '');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing config:", { supabaseUrl: !!supabaseUrl, serviceKey: !!serviceKey });
  process.exit(1);
}

fetch(`${supabaseUrl}/rest/v1/`, {
  headers: {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`
  }
})
  .then(res => res.json())
  .then(schema => {
    if (schema.message) {
      console.log("Raw Response message:", schema);
    } else {
      console.log("Tables in OpenAPI schema:", Object.keys(schema.definitions || {}));
      console.log("Mystery Drops columns:", schema.definitions.mystery_drops.properties);
      console.log("User Profiles columns:", schema.definitions.user_profiles.properties);
      console.log("Points Ledger columns:", schema.definitions.points_ledger.properties);
    }
  })
  .catch(err => console.error(err));
