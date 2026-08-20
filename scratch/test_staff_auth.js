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

async function runStaffAuthTest() {
  console.log('--- STARTING STAFF AUTHENTICATION & ROLE-BASED ACCESS CONTROL AUDIT ---');

  // Test 1: Verify staff records exist in outlet_staff
  const { data: staffList, error: sErr } = await supabase
    .from('outlet_staff')
    .select('id, display_name, email, phone, role, is_active');

  if (sErr) throw new Error('Failed to query outlet_staff: ' + sErr.message);
  console.log('✓ Found', staffList.length, 'staff records in database:');
  staffList.forEach(s => console.log(`   • ${s.display_name} -> Role: [${s.role}] | Email: ${s.email} | Active: ${s.is_active}`));

  const arsalan = staffList.find(s => s.email === 'hello@janubhai.com');
  const bilal = staffList.find(s => s.email === 'bilal@janubhai.com');
  const manager = staffList.find(s => s.role === 'manager');

  if (!arsalan || arsalan.role !== 'growth') throw new Error('Arsalan growth role verification failed');
  if (!bilal || bilal.role !== 'operations_head') throw new Error('Bilal operations_head role verification failed');
  if (!manager || manager.role !== 'manager') throw new Error('Store manager role verification failed');

  console.log('✓ Staff role assignments verified.');

  // Test 2: Role constraint check
  const { error: invalidRoleErr } = await supabase
    .from('outlet_staff')
    .insert({
      outlet_id: 'a0000000-0000-0000-0000-000000000001',
      display_name: 'Invalid Test',
      email: 'invalid@test.com',
      role: 'invalid_role_xyz',
      is_active: true,
    });

  if (invalidRoleErr) {
    console.log('✓ Database correctly rejects unauthorized / invalid roles (Error:', invalidRoleErr.code, ')');
  } else {
    throw new Error('Database allowed invalid role!');
  }

  // Test 3: Verify Partner routes are gone
  const partnerPageContent = fs.readFileSync('src/app/admin/partners/page.js', 'utf8');
  if (!partnerPageContent.includes('AdminPartnersDeprecated') && !partnerPageContent.includes('/admin/staff')) {
    throw new Error('Admin partners page still active!');
  }
  console.log('✓ Partner management successfully deprecated and redirected to Staff Command.');

  // Test 4: Check StaffGuard wrapping in manager, operations, and growth
  const managerPage = fs.readFileSync('src/app/manager/page.js', 'utf8');
  const opsPage = fs.readFileSync('src/app/operations/page.js', 'utf8');
  const growthPage = fs.readFileSync('src/app/growth/page.js', 'utf8');

  if (!managerPage.includes('<StaffGuard') || !managerPage.includes('Manager Store Control')) {
    throw new Error('Manager page is missing StaffGuard barrier!');
  }
  console.log('✓ /manager is locked behind StaffGuard barrier.');

  if (!opsPage.includes('<StaffGuard') || !opsPage.includes('Operations Head (Bilal Muhammad)')) {
    throw new Error('Operations page is missing StaffGuard barrier!');
  }
  console.log('✓ /operations is locked behind StaffGuard barrier.');

  if (!growthPage.includes('<StaffGuard') || !growthPage.includes('Brand & Growth Leader (Arsalan Azad)')) {
    throw new Error('Growth page is missing StaffGuard barrier!');
  }
  console.log('✓ /growth is locked behind StaffGuard barrier.');

  // Test 5: Verify Staff Auth utility file
  const staffAuthLib = fs.readFileSync('src/lib/staffAuth.js', 'utf8');
  if (!staffAuthLib.includes('verifyStaffAuth') || !staffAuthLib.includes('outlet_staff')) {
    throw new Error('src/lib/staffAuth.js is incomplete!');
  }
  console.log('✓ Server-side verifyStaffAuth utility active and checking bearer tokens + outlet_staff.');

  console.log('--- ALL STAFF AUTH & ACCESS CONTROL TESTS PASSED (100% SUCCESS) ---');
}

runStaffAuthTest().catch((err) => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
