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

async function cleanStaffData() {
  console.log('Fetching staff records from outlet_staff...');
  const { data: staffList, error } = await supabase.from('outlet_staff').select('*');
  if (error) {
    console.error('Error querying outlet_staff:', error);
    return;
  }
  console.log('Current staff records count:', staffList?.length);
  staffList?.forEach((s) => {
    console.log(`- ${s.display_name} (${s.email || s.phone}) [Role: ${s.role}]`);
  });

  // Remove test accounts so Super Admin can add real accounts manually
  const { error: delError } = await supabase
    .from('outlet_staff')
    .delete()
    .neq('role', 'superadmin'); // preserve only superadmin if any, or remove all test accounts

  if (delError) {
    console.error('Error deleting test staff accounts:', delError);
  } else {
    console.log('✓ Successfully cleared test staff accounts so Super Admin can enter them manually.');
  }
}

cleanStaffData();
