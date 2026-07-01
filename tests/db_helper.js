const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to parse .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error(`.env.local not found at ${envPath}`);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  return envContent.split('\n').reduce((acc, line) => {
    const parts = line.split('=');
    const key = parts[0];
    const value = parts.slice(1).join('=');
    if (key && value) {
      acc[key.trim()] = value.trim().replace(/^"|"$/g, '');
    }
    return acc;
  }, {});
}

const envVars = loadEnv();
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Role Key missing in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Seed data corresponding to E2E test expectations
async function seedDatabase() {
  console.log('Seeding database for E2E tests...');

  // 1. Clean up first to prevent unique constraint / primary key conflicts
  await cleanupDatabase();

  // 2. Seed outlet_transactions
  const transactions = [
    {
      date: new Date().toISOString().split('T')[0],
      type: 'revenue',
      amount: 24500.75,
      category: 'Sales',
      description: 'Daily sales aggregated seed data'
    }
  ];
  const { error: txErr } = await supabase.from('outlet_transactions').insert(transactions);
  if (txErr) console.error('Error seeding transactions:', txErr.message);

  // 3. Seed outlet_cameras
  const cameras = [
    { name: 'Main Entrance', url: 'https://stream.janubhai.com/cam-main', active: true },
    { name: 'Kitchen Camera', url: 'https://stream.janubhai.com/cam-kitchen', active: true }
  ];
  const { error: camErr } = await supabase.from('outlet_cameras').insert(cameras);
  if (camErr) console.error('Error seeding cameras:', camErr.message);

  // 4. Seed outlet_alerts
  const alerts = [
    {
      time: new Date().toISOString(),
      message: 'Unexpected temperature shift in cold room',
      severity: 'medium',
      resolved: false
    }
  ];
  const { error: alertErr } = await supabase.from('outlet_alerts').insert(alerts);
  if (alertErr) console.error('Error seeding alerts:', alertErr.message);

  // 5. Seed outlet_inventory
  const inventory = [
    {
      name: 'Premium Espresso Beans',
      category: 'Coffee Beans',
      stock: 3,
      threshold: 10,
      auto_reorder: true
    }
  ];
  const { error: invErr } = await supabase.from('outlet_inventory').insert(inventory);
  if (invErr) console.error('Error seeding inventory:', invErr.message);

  // 6. Seed outlet_staff_schedules
  const schedules = [
    { name: 'Arsalan Azad', role: 'Head Barista', shift: 'Morning (06:00 - 14:00)', status: 'Active' },
    { name: 'Dawood Ahmad', role: 'Roaster', shift: 'General (09:00 - 17:00)', status: 'Active' }
  ];
  const { error: staffErr } = await supabase.from('outlet_staff_schedules').insert(schedules);
  if (staffErr) console.error('Error seeding staff schedules:', staffErr.message);

  // 7. Seed outlet_delivery_keys
  const deliveryKeys = [
    { id: 'swiggy', client_id: 'swiggy-client-id', client_secret: 'swiggy-secret', api_key: 'swiggy-key', active: true },
    { id: 'zomato', client_id: 'zomato-client-id', client_secret: 'zomato-secret', api_key: 'zomato-key', active: true }
  ];
  const { error: delKeysErr } = await supabase.from('outlet_delivery_keys').insert(deliveryKeys);
  if (delKeysErr) console.error('Error seeding delivery keys:', delKeysErr.message);

  // 8. Seed outlet_delivery_orders
  const deliveryOrders = [
    {
      partner: 'swiggy',
      items: JSON.stringify([{ name: 'Espresso', quantity: 2 }]),
      total: 45.5,
      status: 'pending',
      customer_name: 'Walk-in Customer'
    }
  ];
  const { error: delOrdErr } = await supabase.from('outlet_delivery_orders').insert(deliveryOrders);
  if (delOrdErr) console.error('Error seeding delivery orders:', delOrdErr.message);

  // 9. Seed outlet_customers
  const customers = [
    { name: 'Ramesh Kumar', email: 'ramesh@gmail.com', phone: '9876543210', visits: 8, spend: 3200, tier: 'Gold' },
    { name: 'Suresh Patel', email: 'suresh@yahoo.com', phone: '9876543211', visits: 4, spend: 1500, tier: 'Silver' },
    { name: 'Priya Sharma', email: 'priya@gmail.com', phone: '9876543212', visits: 12, spend: 6000, tier: 'Platinum' }
  ];
  const { error: custErr } = await supabase.from('outlet_customers').insert(customers);
  if (custErr) console.error('Error seeding customers:', custErr.message);

  console.log('Seeding complete.');
}

// Cleanup function to delete test data to ensure isolation
async function cleanupDatabase() {
  console.log('Cleaning up database...');
  
  // We can delete all records from the tables. PostgREST allows delete matching all.
  // Note: Since tables are independent in our simple E2E design or have CASCADE behavior, 
  // we delete from all 8 tables.
  const tables = [
    'outlet_transactions',
    'outlet_cameras',
    'outlet_alerts',
    'outlet_inventory',
    'outlet_staff_schedules',
    'outlet_delivery_keys',
    'outlet_delivery_orders',
    'outlet_customers',
    'outlet_coupons',
    'outlet_incident_logs',
    'outlet_reorder_requests'
  ];

  for (const table of tables) {
    let query = supabase.from(table).delete();
    if (table === 'outlet_delivery_keys') {
      query = query.like('id', '%');
    } else {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }
    const { error } = await query;
    if (error) {
      console.error(`Error cleaning up table '${table}':`, error.message);
    }
  }
  
  console.log('Cleanup complete.');
}

module.exports = {
  supabase,
  seedDatabase,
  cleanupDatabase
};
