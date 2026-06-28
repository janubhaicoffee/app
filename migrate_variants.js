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

async function migrate() {
  console.log("Starting migration...");

  const { data: p100, error: e1 } = await supabase.from('products').select('*').eq('id', 'instantcoffee-100g').single();
  const { data: p1000, error: e2 } = await supabase.from('products').select('*').eq('id', 'instantcoffee-1000g').single();

  if (e1 && e1.code !== 'PGRST116') {
    console.error("Error fetching 100g:", e1);
  }

  // Create the unified product
  const variants = [
    {
      id: "v_thoda_100",
      name: "Thoda Hard (100g)",
      weight: 100,
      roast: "Thoda Hard",
      price: p100 ? p100.price : 300,
      stock: p100 ? p100.stock : 100,
      image_url: p100 ? p100.image_url : "/product/100gram/100gramfront.png",
      arabica_pct: 100,
      chicory_pct: 0,
      robusta_pct: 0,
      nutrition: { energy: "354", protein: "9", fat: "14.4", carbs: "58.7", sugar: "0" }
    },
    {
      id: "v_thoda_1000",
      name: "Thoda Hard (1000g)",
      weight: 1000,
      roast: "Thoda Hard",
      price: p1000 ? p1000.price : 3000,
      stock: p1000 ? p1000.stock : 50,
      image_url: p1000 ? p1000.image_url : "/product/1kg/1kgfront.png",
      arabica_pct: 100,
      chicory_pct: 0,
      robusta_pct: 0,
      nutrition: { energy: "354", protein: "9", fat: "14.4", carbs: "58.7", sugar: "0" }
    },
    {
      id: "v_bohot_100",
      name: "Bohot Hard (100g)",
      weight: 100,
      roast: "Bohot Hard",
      price: 250,
      stock: 100,
      image_url: "/product/100gram/100gramfront.png",
      arabica_pct: 60,
      chicory_pct: 40,
      robusta_pct: 0,
      nutrition: { energy: "320", protein: "7", fat: "10", carbs: "65", sugar: "2" }
    },
    {
      id: "v_bohot_1000",
      name: "Bohot Hard (1000g)",
      weight: 1000,
      roast: "Bohot Hard",
      price: 2500,
      stock: 50,
      image_url: "/product/1kg/1kgfront.png",
      arabica_pct: 60,
      chicory_pct: 40,
      robusta_pct: 0,
      nutrition: { energy: "320", protein: "7", fat: "10", carbs: "65", sugar: "2" }
    }
  ];

  const unifiedProduct = {
    id: "instantcoffee",
    name: "Janu Bhai Instant Coffee",
    description: "Our signature instant coffee. Choose your preferred strength (Roast) and size.",
    price: variants[0].price,
    weight: variants[0].weight,
    stock: variants[0].stock,
    image_url: "/product/100gram/100gramfront.png",
    category: "",
    seo_title: "Janu Bhai Premium Instant Coffee",
    seo_description: "Buy Janu Bhai Instant Coffee online. Choose from Thoda Hard and Bohot Hard blends.",
    status: "published",
    variants: variants,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { error: upsertError } = await supabase.from('products').upsert(unifiedProduct);
  if (upsertError) {
    console.error("Error creating unified product:", upsertError);
    return;
  }
  console.log("Unified product 'instantcoffee' created/updated successfully.");

  if (p100) {
    await supabase.from('products').update({ status: 'archived' }).eq('id', 'instantcoffee-100g');
    console.log("Archived instantcoffee-100g");
  }
  if (p1000) {
    await supabase.from('products').update({ status: 'archived' }).eq('id', 'instantcoffee-1000g');
    console.log("Archived instantcoffee-1000g");
  }

  console.log("Migration complete!");
}

migrate();
