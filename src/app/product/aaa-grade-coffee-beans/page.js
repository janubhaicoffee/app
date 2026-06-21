"use client";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import "../product.css";

const productData = {
  id: "aaa-grade-coffee-beans",
  name: "AAA Grade Coffee Beans",
  price: 899,
  image: "/beans.png" // User will place beans.png in public folder if needed
};

export default function CoffeeBeansProductPage() {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    addToCart({ ...productData, quantity });
    alert("Added to cart!");
  };

  const handleBuyNow = () => {
    addToCart({ ...productData, quantity });
    router.push("/cart");
  };

  return (
    <main className="product-page">
      <div className="container product-container">
        
        {/* Product Image Gallery */}
        <div className="product-image-section">
          <div className="main-image-wrapper vintage-border">
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

          <div className="actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            
            <button className="btn-secondary" onClick={handleAddToCart}>ADD TO CART</button>
            <button className="btn-primary buy-btn" onClick={handleBuyNow}>BUY NOW</button>
          </div>

          <div className="nutrition-table vintage-border">
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
