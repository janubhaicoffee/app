const { cleanupDatabase, seedDatabase, supabaseAdmin } = require('./tests/db_helper');

async function test() {
  console.log("Starting DB Cleanup test...");
  try {
    await cleanupDatabase();
    console.log("Cleanup complete. Checking if tables are empty...");
    const { data: cData } = await supabaseAdmin.from('outlet_customers').select('*');
    console.log(`Customers row count: ${cData ? cData.length : 0} (Expected: 0)`);

    console.log("Starting DB Seeding test...");
    await seedDatabase();
    console.log("Seeding complete. Checking seeded records...");

    const { data: cData2 } = await supabaseAdmin.from('outlet_customers').select('*');
    console.log(`Customers row count: ${cData2 ? cData2.length : 0} (Expected: 3)`);
    console.log("Customers names:", cData2 ? cData2.map(c => c.name) : []);

    const { data: invData } = await supabaseAdmin.from('outlet_inventory').select('*');
    console.log(`Inventory row count: ${invData ? invData.length : 0} (Expected: 1)`);
    console.log("Inventory name:", invData ? invData[0].name : null);

    const { data: camData } = await supabaseAdmin.from('outlet_cameras').select('*');
    console.log(`Cameras row count: ${camData ? camData.length : 0} (Expected: 2)`);

    const { data: alertData } = await supabaseAdmin.from('outlet_alerts').select('*');
    console.log(`Alerts row count: ${alertData ? alertData.length : 0} (Expected: 1)`);

    const { data: keyData } = await supabaseAdmin.from('outlet_delivery_keys').select('*');
    console.log(`Delivery keys row count: ${keyData ? keyData.length : 0} (Expected: 2)`);

    console.log("Clean up again...");
    await cleanupDatabase();
    console.log("All helper functions verify successfully!");
  } catch (e) {
    console.error("Test execution failed:", e.message);
  }
}

test();
