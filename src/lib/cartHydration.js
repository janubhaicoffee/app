// Cart Serialization and Hydration Helper

export function serializeCart(cartItems) {
  if (!cartItems || cartItems.length === 0) return "";
  
  // Extract only the minimal required schema to keep the URL payload short
  const compact = cartItems.map(item => ({
    id: item.id,
    q: item.quantity,
    s: item.variantSlug || null,
    v: item.variant_id || null,
    sub: item.subscription || null,
    g: item.isGift || false
  }));
  
  const jsonStr = JSON.stringify(compact);
  
  // Base64 URL-safe encoding
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(jsonStr)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } else {
    return Buffer.from(jsonStr, 'utf-8')
      .toString('base64url');
  }
}

export function deserializeCart(payload) {
  if (!payload) return [];
  
  try {
    let jsonStr = "";
    if (typeof window !== 'undefined') {
      const base64 = payload
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      jsonStr = decodeURIComponent(escape(atob(base64)));
    } else {
      jsonStr = Buffer.from(payload, 'base64url').toString('utf-8');
    }
    
    const compact = JSON.parse(jsonStr);
    if (!Array.isArray(compact)) return [];
    
    return compact.map(item => ({
      id: item.id,
      quantity: item.q,
      variantSlug: item.s,
      variant_id: item.v,
      subscription: item.sub,
      isGift: item.g
    }));
  } catch (e) {
    console.error("Failed to deserialize cart payload:", e);
    return [];
  }
}
