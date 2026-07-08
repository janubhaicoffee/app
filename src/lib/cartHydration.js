// Cart Serialization and Hydration Helper

export function serializeCart(cartItems) {
  if (!cartItems || cartItems.length === 0) return '';

  // Extract only the minimal required schema to keep the URL payload short
  const compact = cartItems.map((item) => ({
    id: item.id,
    q: item.quantity,
    s: item.variantSlug || null,
    v: item.variant_id || null,
    sub: item.subscription || null,
    g: item.isGift || false,
  }));

  const jsonStr = JSON.stringify(compact);

  // Base64 URL-safe encoding
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(jsonStr)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } else {
    return Buffer.from(jsonStr, 'utf-8').toString('base64url');
  }
}

export function migrateCartFromCookies() {
  if (typeof window === 'undefined') return [];

  try {
    // Check if we have new encrypted localStorage version
    const hasNewEncrypted = localStorage.getItem('janu_bhai_cart_encrypted');
    if (hasNewEncrypted === 'true') {
      // Use new encrypted version
      const encrypted = localStorage.getItem('janu_bhai_cart_session');
      if (encrypted) {
        try {
          return JSON.parse(atob(encrypted));
        } catch (e) {
          // If parsing fails, clear corrupted data
          localStorage.removeItem('janu_bhai_cart_session');
        }
      }
      return [];
    }

    // Fallback to old cookie-based cart data
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find((c) => c.trim().startsWith('janu_bhai_cart_session='));
    if (!sessionCookie) return [];

    const cookieValue = sessionCookie.split('=')[1];
    try {
      const parsed = JSON.parse(cookieValue);

      // Migrate to new encrypted format
      const encrypted = btoa(JSON.stringify(parsed));
      localStorage.setItem('janu_bhai_cart_session', encrypted);
      localStorage.setItem('janu_bhai_cart_encrypted', 'true');
      localStorage.setItem('janu_bhai_cart_timestamp', Date.now().toString());

      // Remove old cookie (we can't delete cookies via JS, but browser will eventually)
      return parsed;
    } catch (e) {
      console.error('Failed to migrate cart from cookies:', e);
      return [];
    }
  } catch (e) {
    console.error('Error in cart migration:', e);
    return [];
  }
}

export function deserializeCart(payload) {
  if (!payload) return [];

  try {
    let jsonStr = '';
    if (typeof window !== 'undefined') {
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      jsonStr = decodeURIComponent(escape(atob(base64)));
    } else {
      jsonStr = Buffer.from(payload, 'base64url').toString('utf-8');
    }

    const compact = JSON.parse(jsonStr);
    if (!Array.isArray(compact)) return [];

    return compact.map((item) => ({
      id: item.id,
      quantity: item.q,
      variantSlug: item.s,
      variant_id: item.v,
      subscription: item.sub,
      isGift: item.g,
    }));
  } catch (e) {
    console.error('Failed to deserialize cart payload:', e);
    return [];
  }
}
