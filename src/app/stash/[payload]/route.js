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
    // Separate variant items vs base product items
    const variantSlugs = items.filter(i => i.variantSlug).map(i => i.variantSlug);
    const productIds = items.filter(i => !i.variantSlug).map(i => i.id);
    
    // Query Supabase in batch for variants
    let variantsMap = {};
    if (variantSlugs.length > 0) {
      const { data: variants, error } = await supabase
        .from('coffee_variants')
        .select('*, products:product_id (name, image_url)')
        .in('slug', variantSlugs);
        
      if (!error && variants) {
        variants.forEach(v => {
          variantsMap[v.slug] = v;
        });
      }
    }
    
    // Query Supabase in batch for products
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
    
    // Validate stock and rebuild cart
    for (const item of items) {
      if (item.variantSlug) {
        const dbVar = variantsMap[item.variantSlug];
        if (dbVar && dbVar.stock > 0) {
          const clampedQty = Math.min(item.quantity, dbVar.stock);
          hydratedCart.push({
            id: dbVar.id,
            name: `${dbVar.products?.name || 'Coffee'} (${dbVar.name})`,
            price: dbVar.price,
            image: dbVar.products?.image_url || "/product/100gram/100gramfront.png",
            quantity: clampedQty,
            variantSlug: dbVar.slug,
            isVariant: true,
            subscription: item.subscription || null,
            isGift: item.isGift || false
          });
        }
      } else {
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
    }
    
    if (hydratedCart.length === 0) {
      return NextResponse.redirect(new URL("/cart?error=out_of_stock", request.url));
    }
    
    // Save to session cookie (HTTP-only session cookie)
    const cookieStore = await cookies();
    cookieStore.set("janu_bhai_cart_session", JSON.stringify(hydratedCart), {
      path: "/",
      maxAge: 300, // 5 minutes
      secure: true,
      sameSite: "lax"
    });
    
    // Redirect directly to checkout
    return NextResponse.redirect(new URL("/checkout?hydrated=1", request.url));
  } catch (err) {
    console.error("Hydration route handler error:", err);
    return NextResponse.redirect(new URL("/cart?error=hydration_failed", request.url));
  }
}
