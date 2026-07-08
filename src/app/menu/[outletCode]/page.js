'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import './menu.css';

export default function MenuPage() {
  const { outletCode } = useParams();
  const router = useRouter();
  const { user, customerProfile } = useAuth();
  const { addToCart, cartItems, getCartTotal, getCartCount } = useCart();

  const [outlet, setOutlet] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [addedFeedback, setAddedFeedback] = useState({});

  useEffect(() => {
    if (!outletCode) return;
    setLoading(true);
    fetch(`/api/menu/${outletCode}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setOutlet(data.outlet);
        setCategories(data.categories);
        setProducts(data.products);
        if (data.categories.length > 0) setActiveCategory(data.categories[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [outletCode]);

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products;

  const handleQtyChange = (productId, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta),
    }));
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    if (qty <= 0) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.image_url,
      outletCode,
      outletName: outlet?.name,
    });
    setQuantities((prev) => ({ ...prev, [product.id]: 0 }));
    setAddedFeedback((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedFeedback((prev) => ({ ...prev, [product.id]: false })), 1500);
  };

  const handleCheckout = () => {
    router.push(`/menu/${outletCode}/checkout`);
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="menu-loading">Loading menu...</div>
      </div>
    );
  }

  if (error || !outlet) {
    return (
      <div className="menu-page">
        <div className="menu-error">
          <h2>Menu Unavailable</h2>
          <p>{error || 'Outlet not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1 className="menu-outlet-name">{outlet.name}</h1>
        <p className="menu-tagline">Scan. Order. Enjoy.</p>
      </div>

      <div className="menu-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`menu-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="menu-items">
        {filteredProducts.map((product) => (
          <div key={product.id} className="menu-item">
            <div className="menu-item-info">
              <h3 className="menu-item-name">{product.name}</h3>
              {product.description && <p className="menu-item-desc">{product.description}</p>}
              <span className="menu-item-price">₹{product.price}</span>
            </div>
            <div className="menu-item-actions">
              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange(product.id, -1)}
                  disabled={(quantities[product.id] || 0) <= 0}
                >
                  -
                </button>
                <span className="qty-value">{quantities[product.id] || 0}</span>
                <button className="qty-btn" onClick={() => handleQtyChange(product.id, 1)}>
                  +
                </button>
              </div>
              <button
                className={`menu-add-btn ${addedFeedback[product.id] ? 'added' : ''}`}
                onClick={() => handleAddToCart(product)}
                disabled={(quantities[product.id] || 0) <= 0}
              >
                {addedFeedback[product.id] ? '✓ Added' : 'Add'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {getCartCount() > 0 && !showCart && (
        <div className="menu-cart-fab" onClick={() => setShowCart(true)}>
          <span className="cart-fab-count">{getCartCount()}</span>
          <span className="cart-fab-total">₹{getCartTotal()}</span>
          <span className="cart-fab-action">View Cart →</span>
        </div>
      )}

      {showCart && (
        <div className="menu-cart-overlay" onClick={() => setShowCart(false)}>
          <div className="menu-cart-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cart-panel-header">
              <h2>Your Order</h2>
              <button className="cart-close-btn" onClick={() => setShowCart(false)}>
                ✕
              </button>
            </div>
            <div className="cart-panel-items">
              {cartItems.length === 0 ? (
                <p className="cart-empty">Your cart is empty</p>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={idx} className="cart-item-row">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-qty">x{item.quantity}</span>
                    <span className="cart-item-price">₹{item.price * item.quantity}</span>
                  </div>
                ))
              )}
            </div>
            <div className="cart-panel-footer">
              <div className="cart-total-row">
                <span>Total</span>
                <span>₹{getCartTotal()}</span>
              </div>
              <button className="btn-primary full-width" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
