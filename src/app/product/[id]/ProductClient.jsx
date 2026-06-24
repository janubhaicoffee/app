"use client";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";

export default function ProductClient({ initialProduct }) {
  const [product] = useState(initialProduct);
  const [subFrequency, setSubFrequency] = useState("weekly");
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("buy");
  const [showAddMoreHint, setShowAddMoreHint] = useState(false);

  if (!product) {
    return (
      <main className="product-page">
        <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h1>Product Not Found</h1>
          <p>The coffee you are looking for is currently unavailable or doesn't exist.</p>
          <button className="btn-primary" onClick={() => router.push('/')} style={{ marginTop: '1rem' }}>Return Home</button>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url, quantity: 1 });
    setShowAddMoreHint(true);
    setTimeout(() => setShowAddMoreHint(false), 3000);
  };

  const handleBuyNow = () => {
    clearCart();
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url, quantity: 1 });
    router.push("/checkout?mode=standard");
  };

  const handleSubscribe = () => {
    clearCart();
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url, quantity: 1, subscription: subFrequency });
    router.push(`/checkout?mode=subscription&frequency=${subFrequency}`);
  };

  const handleGift = () => {
    clearCart();
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url, quantity: 1, isGift: true });
    router.push("/checkout?mode=gift");
  };

  const frontImage = product.image_url || "/product/100gram/100gramfront.png";
  const backImage = "/product/100gram/100gramback.png";

  return (
    <main className="product-page">
      <div className="container product-container">
        {/* Gallery */}
        <div className="product-image-section">
          <div className="premium-image-container">
            <ImageGallery frontImage={frontImage} backImage={backImage} />
          </div>
        </div>

        {/* Details */}
        <div className="product-details-section">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-subtitle">{product.description || "Premium Coffee Blend"}</p>
          
          <div className="price-tag">₹ {product.price} <span className="mrp-text">(Incl. of all taxes)</span></div>

          <div style={{ margin: '15px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : <span style={{color:'red'}}>Out of Stock</span>}
            <br/>
            <strong>Weight:</strong> {product.weight}g
          </div>

          <div className="purchase-modules" style={{ opacity: product.stock > 0 ? 1 : 0.5, pointerEvents: product.stock > 0 ? 'auto' : 'none' }}>
            <div className="purchase-tabs-container">
              <div className="tabs-header">
                <button className={`tab-btn ${activeTab === "buy" ? "active" : ""}`} onClick={() => setActiveTab("buy")}>Buy Once</button>
                <button className={`tab-btn ${activeTab === "subscribe" ? "active" : ""}`} onClick={() => setActiveTab("subscribe")}>Subscribe Now</button>
                <button className={`tab-btn ${activeTab === "gift" ? "active" : ""}`} onClick={() => setActiveTab("gift")}>Gift</button>
              </div>
              
              <div className="tab-content">
                {activeTab === "buy" && (
                  <div className="tab-pane">
                    <div className="actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button className="btn-secondary" onClick={handleAddToCart} style={{ flex: 1, position: 'relative' }}>
                        ADD TO CART
                        {showAddMoreHint && (
                          <span style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'var(--bg-color)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap', opacity: 1, transition: 'opacity 0.3s' }}>
                            Tap again to add more packets!
                          </span>
                        )}
                      </button>
                      <button className="btn-primary buy-btn" onClick={handleBuyNow} style={{ flex: 1 }}>BUY NOW</button>
                    </div>
                  </div>
                )}

                {activeTab === "subscribe" && (
                  <div className="tab-pane">
                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary-color)', display: 'flex', justifyContent: 'space-between' }}>Subscribe Now</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Never run out of coffee again. Auto-delivered to your door.</p>
                    <div className="actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <select value={subFrequency} onChange={(e) => setSubFrequency(e.target.value)} style={{ padding: '0.8rem', background: '#fff', color: 'var(--text-primary)', border: '2px solid var(--text-primary)', borderRadius: '4px', flex: 1 }}>
                        <option value="weekly">Deliver Weekly</option>
                        <option value="monthly">Deliver Monthly</option>
                      </select>
                      <button className="btn-primary" onClick={handleSubscribe} style={{ width: '100%', marginTop: '0.5rem' }}>SUBSCRIBE NOW</button>
                    </div>
                  </div>
                )}

                {activeTab === "gift" && (
                  <div className="tab-pane" style={{ textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Send as a Gift 🎁</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Ship directly to a friend with a personalized message.</p>
                    <button className="btn-secondary" onClick={handleGift} style={{ width: '100%' }}>GIFT NOW</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="nutrition-table">
            <h3>Nutritional Facts (Per 100g)</h3>
            <table>
              <tbody>
                <tr><td>Energy</td><td>354 kcal</td></tr>
                <tr><td>Protein</td><td>9 g</td></tr>
                <tr><td>Fat</td><td>14.4 g</td></tr>
                <tr><td>Carbohydrate</td><td>58.7 g</td></tr>
                <tr><td>Sugar</td><td>0 g</td></tr>
              </tbody>
            </table>
            <p className="nutrition-footer">No Artificial Colors - No Artificial Flavours - 100% Indian</p>
          </div>
        </div>
      </div>
    </main>
  );
}
