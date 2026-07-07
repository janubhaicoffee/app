const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProduct() {
  const { data: product, error } = await supabase.from('products').select('*').eq('id', 'instantcoffee').single();
  if (error) {
    console.error("Error product:", error);
  } else {
    console.log("Product:", product);
  }
}

checkProduct();
