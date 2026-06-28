"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [interceptorItem, setInterceptorItem] = useState(null);
  const [sessionId, setSessionId] = useState("");

  // Load from local storage on mount and check for hydrated session cookie
  useEffect(() => {
    const savedCart = localStorage.getItem('janu_bhai_cart');
    let initialCart = [];
    if (savedCart) {
      try {
        initialCart = JSON.parse(savedCart);
        setCartItems(initialCart);
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }

    let sid = localStorage.getItem('janu_bhai_cart_session_id');
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('janu_bhai_cart_session_id', sid);
    }
    setSessionId(sid);

    // Hydration check from session cookie
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const cartCookie = getCookie('janu_bhai_cart_session');
    if (cartCookie) {
      try {
        const hydratedItems = JSON.parse(decodeURIComponent(cartCookie));
        if (Array.isArray(hydratedItems) && hydratedItems.length > 0) {
          setCartItems(hydratedItems);
          // Delete cookie by setting expiry
          document.cookie = "janu_bhai_cart_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        }
      } catch (e) {
        console.error("Failed to parse hydrated cart session cookie:", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('janu_bhai_cart', JSON.stringify(cartItems));
    
    if (sessionId) {
      // Secretly track abandoned cart
      fetch('/api/abandoned-carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          cart_payload: cartItems,
          email: localStorage.getItem('janu_bhai_email') // If we capture email early
        })
      }).catch(e => console.error("Tracking error", e));
    }
  }, [cartItems, sessionId]);

  const addToCart = (product) => {
    // Intercept if it's the high-intensity variant (thodi-hard-extreme) and not confirmed
    if (product.variantSlug === 'thodi-hard-extreme' && !product.confirmed) {
      setInterceptorItem(product);
      return; // Freeze the mutation event
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + product.quantity } : item
        );
      }
      return [...prev, product];
    });
  };

  const confirmInterceptor = () => {
    if (interceptorItem) {
      const itemToPush = { ...interceptorItem, confirmed: true };
      setCartItems(prev => {
        const existing = prev.find(item => item.id === itemToPush.id);
        if (existing) {
          return prev.map(item => 
            item.id === itemToPush.id ? { ...item, quantity: item.quantity + itemToPush.quantity } : item
          );
        }
        return [...prev, itemToPush];
      });
      setInterceptorItem(null);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      interceptorItem,
      setInterceptorItem,
      confirmInterceptor,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
