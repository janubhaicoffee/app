const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const res = await supabase.from('outlet_coupons').insert({
    code: 'TEST_' + Date.now(),
    discount_type: 'percentage',
    discount_value: 15
  }).select();
  console.log('Insert result:', res.error ? res.error.message : res.data);
  if (res.data && res.data.length > 0) {
    // Delete it
    await supabase.from('outlet_coupons').delete().eq('id', res.data[0].id);
  }
}
run();
