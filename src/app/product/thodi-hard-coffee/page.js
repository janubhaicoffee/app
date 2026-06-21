"use client";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import "./page.css";

const productData = {
  id: "thodi-hard-coffee",
  name: "THODI HARD COFFEE",
  price: 300,
  image: "/product.png"
};

export default function ProductPage() {
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
            {/* The user will drop product.png in public */}
            <Image src="/product.png" alt="THODI HARD COFFEE" width={500} height={500} className="product-img" />
          </div>
        </div>

        {/* Product Details */}
        <div className="product-details-section">
          <h1 className="product-title">THODI HARD COFFEE</h1>
          <p className="product-subtitle">Pure South Indian Chicory & Coffee Blend (70-30)</p>
          
          <div className="price-tag">₹ {productData.price} <span className="mrp-text">(Incl. of all taxes)</span></div>
          <p className="net-weight">Net Weight: 100g</p>

          <div className="slogan-box">
            <p>"For The Ones Who Refuse To Conform"</p>
            <p><strong>Locally Roasted. Globally Bold.</strong></p>
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
