import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PRODUCT_CATALOG = {
  "instantcoffee-100g": { name: "THODI HARD COFFEE (100g)", price: 300, weight: 100 },
  "instantcoffee-1000g": { name: "THODI HARD COFFEE (1000g)", price: 3000, weight: 1000 },
  "coffeebeans": { name: "AAA Grade Coffee Beans", price: 899, weight: 250 }
};

async function seed() {
  const products = Object.entries(PRODUCT_CATALOG).map(([id, p]) => ({
    id: id,
    name: p.name,
    price: p.price,
    stock: 100,
    description: `Delicious ${p.name}`,
    image_url: ''
  }));

  const { data, error } = await supabase.from('products').upsert(products);
  if (error) console.error("Error seeding:", error);
  else console.log("Seeded successfully!");
}

seed();
