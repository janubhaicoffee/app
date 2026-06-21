"use client";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import "../category.css";

export default function CoffeeBeansPage() {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleBuy = () => {
    addToCart({
      id: "coffee-beans-aaa",
      name: "AAA Grade Coffee Beans",
      price: 899,
      quantity: 1,
      image: "/beans.png" // placeholder image path
    });
    router.push('/cart');
  };

  return (
    <main className="category-page">
      <div className="container">
        <h2 className="category-title"><span>Coffee Beans</span></h2>
        
        <div className="products-grid">
          <div className="product-card vintage-border">
            <h3>AAA Grade Coffee Beans</h3>
            <p className="product-desc">Carefully sorted, highest quality beans for the perfect fresh brew.</p>
            <div className="product-price">₹ 899</div>
            <button className="btn-primary" onClick={handleBuy}>BUY NOW</button>
          </div>
        </div>
      </div>
    </main>
  );
}
