const { supabase } = require('../../tests/db_helper');

async function test() {
  const { data, error } = await supabase.from('outlet_inventory').select('*');
  console.log("Rows in outlet_inventory:", data, error);
}

test();
