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

async function seedStaff() {
  console.log('Seeding Janu Bhai Cafe staff roles...');

  const { data: outlets } = await supabase.from('outlets').select('id, name').limit(1);
  const outletId = outlets[0]?.id;

  const staffMembers = [
    {
      outlet_id: outletId,
      name: 'Arsalan Azad',
      email: 'hello@janubhai.com',
      phone: '9910778576',
      role: 'growth',
      status: 'active',
    },
    {
      outlet_id: outletId,
      name: 'Bilal Muhammad',
      email: 'bilal@janubhai.com',
      phone: '8527976791',
      role: 'operations_head',
      status: 'active',
    },
    {
      outlet_id: outletId,
      name: 'Store Manager',
      email: 'manager.okhla@janubhai.com',
      phone: '8527976790',
      role: 'manager',
      status: 'active',
    },
    {
      outlet_id: outletId,
      name: 'Janu Bhai Founder',
      email: 'help@janubhai.com',
      phone: '9910778500',
      role: 'superadmin',
      status: 'active',
    },
  ];

  for (const staff of staffMembers) {
    const { data: existing } = await supabase
      .from('outlet_staff')
      .select('id')
      .or(`email.eq.${staff.email},phone.eq.${staff.phone}`)
      .maybeSingle();

    if (existing) {
      const { error: updErr } = await supabase
        .from('outlet_staff')
        .update(staff)
        .eq('id', existing.id);
      if (updErr) console.error('Error updating staff:', staff.name, updErr);
      else console.log('Updated staff:', staff.name, `(${staff.role})`);
    } else {
      const { error: insErr } = await supabase
        .from('outlet_staff')
        .insert(staff);
      if (insErr) console.error('Error inserting staff:', staff.name, insErr);
      else console.log('Inserted staff:', staff.name, `(${staff.role})`);
    }
  }

  const { data: allStaff } = await supabase.from('outlet_staff').select('*');
  console.log('Total staff in database:', allStaff.length);
  console.log(allStaff.map(s => `${s.name}: ${s.role} (${s.email})`));
}

seedStaff().catch(console.error);
