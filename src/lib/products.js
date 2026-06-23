import { supabase } from "@/lib/supabase";

export async function calculateOrderTotal(cartItems, shippingCost) {
  if (!cartItems || cartItems.length === 0) return shippingCost;

  // Fetch all product IDs in the cart
  const productIds = cartItems.map(item => item.id);
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, price, weight')
    .in('id', productIds);

  if (error) {
    console.error("Error fetching products for order total:", error);
    throw new Error("Failed to validate cart items");
  }

  // Create a map for quick lookup
  const productMap = {};
  for (const p of products) {
    productMap[p.id] = p;
  }

  let subtotal = 0;
  for (const item of cartItems) {
    const product = productMap[item.id];
    if (!product) {
      throw new Error(`Product not found or unavailable: ${item.id}`);
    }
    subtotal += product.price * item.quantity;
  }

  return subtotal + shippingCost;
}

export async function getProductCatalog() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("Error fetching product catalog:", error);
    return [];
  }
  return data || [];
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return null;
  return data;
}
