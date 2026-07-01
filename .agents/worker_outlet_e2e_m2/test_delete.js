const { supabase } = require('../../tests/db_helper');

async function test() {
  const { data, error, count } = await supabase
    .from('outlet_inventory')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Delete result:", { data, error, count });
}

test();
