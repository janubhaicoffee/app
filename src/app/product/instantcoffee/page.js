"use client";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import "../product.css";

const variants = {
  "100g": {
    id: "instantcoffee-100g",
    name: "THODI HARD COFFEE (100g)",
    price: 300,
    frontImage: "/product/100gram/100gramfront.png",
    backImage: "/product/100gram/100gramback.png"
  },
  "1000g": {
    id: "instantcoffee-1000g",
    name: "THODI HARD COFFEE (1000g)",
    price: 3000,
    frontImage: "/product/1000gram/1000gramfront.png",
    backImage: "/product/1000gram/1000gramback.png"
  }
};

export default function ProductPage() {
  const [subFrequency, setSubFrequency] = useState("weekly");
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  const [variant, setVariant] = useState("100g");
  const [activeTab, setActiveTab] = useState("buy");
  const [showAddMoreHint, setShowAddMoreHint] = useState(false);

  const handleVariantChange = (newVariant) => {
    setVariant(newVariant);
  };

  const currentProduct = {
    id: variants[variant].id,
    name: variants[variant].name,
    price: variants[variant].price,
    image: variants[variant].frontImage
  };

  const handleAddToCart = () => {
    addToCart({ ...currentProduct, quantity: 1 });
    setShowAddMoreHint(true);
    setTimeout(() => {
      setShowAddMoreHint(false);
    }, 3000);
  };

  const handleBuyNow = () => {
    clearCart();
    addToCart({ ...currentProduct, quantity: 1 });
    router.push("/checkout?mode=standard");
  };

  const handleSubscribe = () => {
    clearCart();
    addToCart({ ...currentProduct, quantity: 1, subscription: subFrequency });
    router.push(`/checkout?mode=subscription&frequency=${subFrequency}`);
  };

  const handleGift = () => {
    clearCart();
    addToCart({ ...currentProduct, quantity: 1, isGift: true });
    router.push("/checkout?mode=gift");
  };

  return (
    <main className="product-page">
      <div className="container product-container">
        
        {/* Product Image Gallery */}
        <div className="product-image-section">
          <div className="premium-image-container">
            <ImageGallery 
              frontImage={variants[variant].frontImage} 
              backImage={variants[variant].backImage} 
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="product-details-section">
          <h1 className="product-title">THODI HARD COFFEE</h1>
          <p className="product-subtitle">Pure South Indian Chicory & Coffee Blend (70-30)</p>
          
          <div className="price-tag">₹ {variants[variant].price} <span className="mrp-text">(Incl. of all taxes)</span></div>
          
          <div className="variant-selector" style={{ display: 'flex', gap: '15px', marginTop: '5px', marginBottom: '15px' }}>
            <button 
              onClick={() => handleVariantChange("100g")}
              className={variant === "100g" ? "btn-primary" : "btn-secondary"}
              style={{ padding: '10px 20px', fontSize: '1rem', flex: 1 }}
            >
              100 Grams
            </button>
            <button 
              onClick={() => handleVariantChange("1000g")}
              className={variant === "1000g" ? "btn-primary" : "btn-secondary"}
              style={{ padding: '10px 20px', fontSize: '1rem', flex: 1 }}
            >
              1000 Grams
            </button>
          </div>



          {/* PURCHASE MODULES - Tabbed Interface */}
          <div className="purchase-modules">
            <div className="purchase-tabs-container">
              <div className="tabs-header">
                <button 
                  className={`tab-btn ${activeTab === "buy" ? "active" : ""}`}
                  onClick={() => setActiveTab("buy")}
                >
                  Buy Once
                </button>
                <button 
                  className={`tab-btn ${activeTab === "subscribe" ? "active" : ""}`}
                  onClick={() => setActiveTab("subscribe")}
                >
                  Subscribe Now
                </button>
                <button 
                  className={`tab-btn ${activeTab === "gift" ? "active" : ""}`}
                  onClick={() => setActiveTab("gift")}
                >
                  Gift
                </button>
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
                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary-color)', display: 'flex', justifyContent: 'space-between' }}>
                      Subscribe Now
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Never run out of coffee again. Auto-delivered to your door.</p>
                    
                    <div className="actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <select 
                        value={subFrequency} 
                        onChange={(e) => setSubFrequency(e.target.value)}
                        style={{ padding: '0.8rem', background: '#fff', color: 'var(--text-primary)', border: '2px solid var(--text-primary)', borderRadius: '4px', flex: 1 }}
                      >
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
