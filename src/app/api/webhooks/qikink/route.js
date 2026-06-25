import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const payload = await request.json();
    console.log("Received Qikink Webhook Payload:", JSON.stringify(payload, null, 2));

    // Qikink payload might vary. Let's try to extract standard product fields.
    // E.g., it might send { sku: "...", name: "...", price: "...", ... }
    const id = payload.sku || payload.id || payload.product_id;
    const name = payload.name || payload.title || "Qikink Merch Product";
    const description = payload.description || payload.body_html || "";
    const price = parseFloat(payload.price || payload.regular_price) || 0;
    const weight = parseFloat(payload.weight) || 500;
    const stock = parseInt(payload.stock || payload.inventory_quantity) || 100;
    
    let imageUrl = "";
    if (payload.image_url) {
      imageUrl = payload.image_url;
    } else if (payload.images && payload.images.length > 0) {
      imageUrl = payload.images[0].src || payload.images[0];
    } else if (payload.image && payload.image.src) {
      imageUrl = payload.image.src;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing product identifier (id or sku) in payload" }, { status: 400 });
    }

    // Upsert into Supabase products table
    const { data, error } = await supabase
      .from('products')
      .upsert({
        id: id.toString(),
        name: name,
        description: description,
        price: price,
        weight: weight,
        stock: stock > 0 ? stock : 100, // Default to 100 if missing
        image_url: imageUrl,
        category: 'merch' // Categorize as merch to distinguish from coffee
      }, { onConflict: 'id' });

    if (error) {
      console.error("Error upserting Qikink product:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Product synced successfully" });

  } catch (error) {
    console.error("Qikink Webhook Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
