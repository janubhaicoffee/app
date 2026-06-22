"use client";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import "../product.css";

const variants = {
  "100g": {
    id: "instantcoffee-100g",
    name: "THODI HARD COFFEE (100g)",
    price: 300,
    frontImage: "/product/100gram/100gramfront-nobg.png",
    backImage: "/product/100gram/100gramback-nobg.png"
  },
  "1000g": {
    id: "instantcoffee-1000g",
    name: "THODI HARD COFFEE (1000g)",
    price: 3000,
    frontImage: "/product/1000gram/1000gramfront-nobg.png",
    backImage: "/product/1000gram/1000gramback-nobg.png"
  }
};

export default function ProductPage() {
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [subQuantity, setSubQuantity] = useState(1);
  const [subFrequency, setSubFrequency] = useState("weekly");
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  const [variant, setVariant] = useState("100g");
  const [activeImage, setActiveImage] = useState(variants["100g"].frontImage);

  const handleVariantChange = (newVariant) => {
    setVariant(newVariant);
    setActiveImage(variants[newVariant].frontImage);
  };

  const currentProduct = {
    id: variants[variant].id,
    name: variants[variant].name,
    price: variants[variant].price,
    image: variants[variant].frontImage
  };

  const handleAddToCart = () => {
    addToCart({ ...currentProduct, quantity: buyQuantity });
    alert("Added to cart!");
  };

  const handleBuyNow = () => {
    clearCart();
    addToCart({ ...currentProduct, quantity: buyQuantity });
    router.push("/checkout?mode=standard");
  };

  const handleSubscribe = () => {
    clearCart();
    addToCart({ ...currentProduct, quantity: subQuantity, subscription: subFrequency });
    router.push(`/checkout?mode=subscription&frequency=${subFrequency}`);
  };

  const handleGift = () => {
    clearCart();
    addToCart({ ...currentProduct, quantity: buyQuantity, isGift: true });
    router.push("/checkout?mode=gift");
  };

  return (
    <main className="product-page">
      <div className="container product-container">
        
        {/* Product Image Gallery */}
        <div className="product-image-section">
          <div className="main-image-wrapper vintage-border premium-image-container">
            <div className="floating-product">
              <Image 
                src={activeImage} 
                alt="THODI HARD COFFEE" 
                width={500} 
                height={500} 
                className="product-img" 
                priority
              />
            </div>
            <p className="interactive-hint">Hover to explore the premium quality</p>
            
            <div className="product-thumbnails">
              <button 
                className={`thumbnail-btn ${activeImage === variants[variant].frontImage ? "active" : ""}`}
                onClick={() => setActiveImage(variants[variant].frontImage)}
                aria-label="View front of the pack"
              >
                <Image src={variants[variant].frontImage} alt="Front View" width={80} height={80} className="thumbnail-img" />
              </button>
              <button 
                className={`thumbnail-btn ${activeImage === variants[variant].backImage ? "active" : ""}`}
                onClick={() => setActiveImage(variants[variant].backImage)}
                aria-label="View back of the pack"
              >
                <Image src={variants[variant].backImage} alt="Back View" width={80} height={80} className="thumbnail-img" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="product-details-section">
          <h1 className="product-title">THODI HARD COFFEE</h1>
          <p className="product-subtitle">Pure South Indian Chicory & Coffee Blend (70-30)</p>
          
          <div className="price-tag">₹ {variants[variant].price} <span className="mrp-text">(Incl. of all taxes)</span></div>
          
          <div className="variant-selector" style={{ display: 'flex', gap: '15px', marginTop: '10px', marginBottom: '10px' }}>
            <button 
              onClick={() => handleVariantChange("100g")}
              className={variant === "100g" ? "btn-primary" : "btn-secondary"}
              style={{ padding: '10px 20px', fontSize: '1rem', flex: 1 }}
            >
              100g
            </button>
            <button 
              onClick={() => handleVariantChange("1000g")}
              className={variant === "1000g" ? "btn-primary" : "btn-secondary"}
              style={{ padding: '10px 20px', fontSize: '1rem', flex: 1 }}
            >
              1000g
            </button>
          </div>
          
          <p className="net-weight">Net Weight: {variant}</p>

          <div className="slogan-box">
            <p>"For The Ones Who Refuse To Conform"</p>
            <p><strong>Locally Roasted. Globally Bold.</strong></p>
          </div>

          {/* PURCHASE MODULES */}
          <div className="purchase-modules">
            
            {/* 1. Direct Purchase */}
            <div className="purchase-card vintage-border" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)' }}>
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
            <div className="purchase-card vintage-border" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(183, 28, 28, 0.1)', borderColor: 'var(--primary-color)' }}>
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
            <div className="purchase-card vintage-border" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#fff' }}>Send as a Gift 🎁</h3>
              <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '1rem' }}>Ship directly to a friend with a personalized message.</p>
              <button className="btn-secondary" onClick={handleGift} style={{ width: '100%' }}>GIFT NOW</button>
            </div>

          </div>

          <div className="nutrition-table vintage-border">
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
