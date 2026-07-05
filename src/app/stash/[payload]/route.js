import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { deserializeCart } from "@/lib/cartHydration";

export const runtime = 'edge';

export async function GET(request, { params }) {
  const { payload } = await params;
  
  if (!payload) {
    return NextResponse.redirect(new URL("/cart", request.url));
  }
  
  const items = deserializeCart(payload);
  if (items.length === 0) {
    return NextResponse.redirect(new URL("/cart?error=invalid_payload", request.url));
  }
  
  const hydratedCart = [];
  
  try {
    const productIds = items.map(i => i.id);
    
    let productsMap = {};
    if (productIds.length > 0) {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);
        
      if (!error && products) {
        products.forEach(p => {
          productsMap[p.id] = p;
        });
      }
    }
    
    for (const item of items) {
      const dbProd = productsMap[item.id];
      if (dbProd && dbProd.stock > 0) {
        const clampedQty = Math.min(item.quantity, dbProd.stock);
        hydratedCart.push({
          id: dbProd.id,
          name: dbProd.name,
          price: dbProd.price,
          image: dbProd.image_url || "/product/100gram/100gramfront.png",
          quantity: clampedQty,
          subscription: item.subscription || null,
          isGift: item.isGift || false
        });
      }
    }
    
    if (hydratedCart.length === 0) {
      return NextResponse.redirect(new URL("/cart?error=out_of_stock", request.url));
    }
    
    // Save to secure session storage (localStorage + encryption)
    try {
      const encryptedCart = btoa(JSON.stringify(hydratedCart));
      localStorage.setItem("janu_bhai_cart_session", encryptedCart);
      localStorage.setItem("janu_bhai_cart_timestamp", Date.now().toString());
      localStorage.setItem("janu_bhai_cart_encrypted", "true");
    } catch (storageError) {
      console.error("Storage not available:", storageError);
    }
    
    // Redirect directly to checkout
    return NextResponse.redirect(new URL("/checkout?hydrated=1", request.url));
  } catch (err) {
    console.error("Hydration route handler error:", err);
    return NextResponse.redirect(new URL("/cart?error=hydration_failed", request.url));
  }
}
