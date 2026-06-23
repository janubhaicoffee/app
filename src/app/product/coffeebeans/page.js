"use client";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import "../product.css";

const productData = {
  id: "coffeebeans",
  name: "AAA Grade Coffee Beans",
  price: 899,
  image: "/beans.png" // User will place beans.png in public folder if needed
};

export default function CoffeeBeansProductPage() {
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [subQuantity, setSubQuantity] = useState(1);
  const [subFrequency, setSubFrequency] = useState("weekly");
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    addToCart({ ...productData, quantity: buyQuantity });
    alert("Added to cart!");
  };

  const handleBuyNow = () => {
    clearCart();
    addToCart({ ...productData, quantity: buyQuantity });
    router.push("/checkout?mode=standard");
  };

  const handleSubscribe = () => {
    clearCart();
    addToCart({ ...productData, quantity: subQuantity, subscription: subFrequency });
    router.push(`/checkout?mode=subscription&frequency=${subFrequency}`);
  };

  const handleGift = () => {
    clearCart();
    addToCart({ ...productData, quantity: buyQuantity, isGift: true });
    router.push("/checkout?mode=gift");
  };

  return (
    <main className="product-page">
      <div className="container product-container">
        
        {/* Product Image Gallery */}
        <div className="product-image-section">
          <div className="main-image-wrapper">
            {/* The user will drop beans.png in public */}
            <div style={{width: 500, height: 500, backgroundColor: "#f9f6f0", display: "flex", alignItems: "center", justifyContent: "center"}}>
               <h3>AAA Beans</h3>
               {/* <Image src="/beans.png" alt="AAA Grade Coffee Beans" width={500} height={500} className="product-img" /> */}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="product-details-section">
          <h1 className="product-title">AAA Grade Coffee Beans</h1>
          <p className="product-subtitle">Premium Whole Beans - Expertly Sorted & Roasted</p>
          
          <div className="price-tag">₹ {productData.price} <span className="mrp-text">(Incl. of all taxes)</span></div>
          <p className="net-weight">Net Weight: 250g</p>

          <div className="slogan-box">
            <p>"For The Perfect Fresh Brew"</p>
            <p><strong>Carefully sorted, highest quality beans.</strong></p>
          </div>

          {/* PURCHASE MODULES */}
          <div className="purchase-modules">
            
            {/* 1. Direct Purchase */}
            <div className="purchase-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--primary-color)' }}>One-Time Purchase</h3>
              <div className="actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="quantity-selector" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  <button onClick={() => setBuyQuantity(q => Math.max(1, q - 1))} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', padding: '0 10px' }}>-</button>
                  <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold' }}>{buyQuantity}</span>
                  <button onClick={() => setBuyQuantity(q => q + 1)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', padding: '0 10px' }}>+</button>
                </div>
                
                <button className="btn-secondary" onClick={handleAddToCart} style={{ flex: 1 }}>ADD TO CART</button>
                <button className="btn-primary buy-btn" onClick={handleBuyNow} style={{ flex: 1 }}>BUY NOW</button>
              </div>
            </div>

            {/* 2. Subscribe & Save */}
            <div className="purchase-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(183, 28, 28, 0.1)', border: '1px solid var(--primary-color)', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary-color)', display: 'flex', justifyContent: 'space-between' }}>
                Subscribe & Save <span>10% OFF</span>
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '1rem' }}>Never run out of coffee again. Auto-delivered to your door.</p>
              
              <div className="actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select 
                  value={subFrequency} 
                  onChange={(e) => setSubFrequency(e.target.value)}
                  style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', flex: 1 }}
                >
                  <option value="weekly">Deliver Weekly</option>
                  <option value="monthly">Deliver Monthly</option>
                </select>

                <div className="quantity-selector" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  <button onClick={() => setSubQuantity(q => Math.max(1, q - 1))} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', padding: '0 10px' }}>-</button>
                  <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold' }}>{subQuantity}</span>
                  <button onClick={() => setSubQuantity(q => q + 1)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', padding: '0 10px' }}>+</button>
                </div>
                
                <button className="btn-primary" onClick={handleSubscribe} style={{ width: '100%', marginTop: '0.5rem' }}>SUBSCRIBE NOW</button>
              </div>
            </div>

            {/* 3. Gift */}
            <div className="purchase-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.3)', textAlign: 'center', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#fff' }}>Send as a Gift 🎁</h3>
              <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '1rem' }}>Ship directly to a friend with a personalized message.</p>
              <button className="btn-secondary" onClick={handleGift} style={{ width: '100%' }}>GIFT NOW</button>
            </div>

          </div>

          <div className="nutrition-table">
            <h3>Coffee Info</h3>
            <table>
              <tbody>
                <tr><td>Roast Level</td><td>Medium-Dark</td></tr>
                <tr><td>Origin</td><td>Chikmagalur, India</td></tr>
                <tr><td>Altitude</td><td>1200m - 1500m</td></tr>
                <tr><td>Processing</td><td>Washed</td></tr>
                <tr><td>Tasting Notes</td><td>Dark Chocolate, Caramel, Nuts</td></tr>
              </tbody>
            </table>
            <p className="nutrition-footer">100% Pure Arabica - Handpicked</p>
          </div>
        </div>
      </div>
    </main>
  );
}
