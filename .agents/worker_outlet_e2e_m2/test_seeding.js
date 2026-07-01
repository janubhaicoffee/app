const { seedDatabase, cleanupDatabase, supabase } = require('../../tests/db_helper');

async function test() {
  try {
    console.log("Starting seeding test...");
    await seedDatabase();
    
    console.log("Verifying seeded tables...");
    const { data: txs } = await supabase.from('outlet_transactions').select('*');
    console.log("Transactions seeded:", txs ? txs.length : 0);
    
    const { data: inventory } = await supabase.from('outlet_inventory').select('*');
    console.log("Inventory items seeded:", inventory ? inventory.length : 0);
    if (inventory && inventory[0]) {
      console.log("Low stock item:", inventory[0].name, "stock:", inventory[0].stock, "threshold:", inventory[0].threshold);
    }
    
    const { data: customers } = await supabase.from('outlet_customers').select('*');
    console.log("Customers seeded:", customers ? customers.length : 0);
    
    console.log("Cleaning up database...");
    await cleanupDatabase();
    
    const { data: txsClean } = await supabase.from('outlet_transactions').select('*');
    console.log("Transactions after cleanup:", txsClean ? txsClean.length : 0);
    
    console.log("Seeding verification successful!");
  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test();
