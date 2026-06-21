"use client";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import "../category.css";

export default function InstantCoffeePage() {
  const router = useRouter();

  return (
    <main className="category-page">
      <div className="container">
        <h2 className="category-title"><span>Instant Coffee</span></h2>
        
        <div className="products-grid">
          <div className="product-card vintage-border">
            <div className="product-badge">BESTSELLER</div>
            <h3>THODI HARD COFFEE</h3>
            <p className="product-desc">Pure South Indian Chicory & Coffee Blend (70-30). Locally roasted, globally bold.</p>
            <div className="product-price">₹ 300</div>
            <button className="btn-primary" onClick={() => router.push('/product/thodi-hard-coffee')}>VIEW PRODUCT</button>
          </div>
        </div>
      </div>
    </main>
  );
}
