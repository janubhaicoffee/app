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

const tables = [
  'outlet_transactions',
  'outlet_cameras',
  'outlet_alerts',
  'outlet_inventory',
  'outlet_staff_schedules',
  'outlet_delivery_keys',
  'outlet_delivery_orders',
  'outlet_customers'
];

async function check() {
  console.log("Checking tables...");
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table '${table}': ERROR - ${error.message} (code: ${error.code})`);
    } else {
      console.log(`Table '${table}': EXISTS (columns: ${Object.keys(data[0] || {}).join(', ') || 'no rows yet'})`);
    }
  }
}

check();
