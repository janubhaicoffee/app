"use client";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import "./page.css";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const router = useRouter();

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="container text-center">
          <h1 className="cart-title">Your Cart is Empty</h1>
          <p className="cart-empty-text">Looks like you haven't added any premium coffee yet.</p>
          <Link href="/" className="btn-primary">START SHOPPING</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="container">
        <h1 className="cart-title">YOUR CART</h1>
        
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item vintage-border">
                <div className="cart-item-img-wrapper">
                  <Image src={item.image} alt={item.name} width={100} height={100} className="cart-item-img" />
                </div>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">₹ {item.price}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-selector small">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="item-total">
                  ₹ {item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary vintage-border">
            <h2>ORDER SUMMARY</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹ {getCartTotal()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <hr />
            <div className="summary-row total">
              <span>Total (Tax Incl.)</span>
              <span>₹ {getCartTotal()}</span>
            </div>
            <button className="btn-primary checkout-btn" onClick={() => router.push('/checkout')}>
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
