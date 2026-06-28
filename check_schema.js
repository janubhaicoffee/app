const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) console.error("Error products:", error);
  else console.log("Products schema:", Object.keys(data[0] || {}));
  
  const { data: cData, error: cError } = await supabase.from('customers').select('*').limit(1);
  if (cError) {
    if (cError.code === 'PGRST116' || cError.message.includes('does not exist')) {
      console.log("Customers table does not exist.");
    } else {
      console.error("Error customers:", cError);
    }
  } else {
    console.log("Customers schema:", Object.keys(cData[0] || {}));
  }

  const { data: oData, error: oError } = await supabase.from('orders').select('*').limit(1);
  if (oError) console.error("Error orders:", oError);
  else console.log("Orders schema:", Object.keys(oData[0] || {}));
}

checkSchema();
