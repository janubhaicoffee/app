"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import "./page.css";

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: ""
  });

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: getCartTotal() })
      });
      const data = await res.json();

      if (!data.orderId) {
        alert("Failed to create order");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
        amount: getCartTotal() * 100,
        currency: "INR",
        name: "Janu Bhai Coffee",
        description: "Order Checkout",
        order_id: data.orderId,
        handler: function (response) {
          // In a real app, verify the signature on the backend and save the order
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          clearCart();
          router.push('/account');
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#B71C1C"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Payment failed to initialize");
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page text-center">
        <div className="container">
          <h2>Your cart is empty. Please add items before checking out.</h2>
          <button className="btn-primary" onClick={() => router.push('/')} style={{marginTop: '20px'}}>Go Back</button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">CHECKOUT</h1>
        <div className="checkout-layout">
          <div className="checkout-form-section vintage-border">
            <h2>Shipping Details</h2>
            <form onSubmit={handlePayment} className="checkout-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea name="address" rows="3" required value={formData.address} onChange={handleInputChange}></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>PIN Code</label>
                  <input type="text" name="pincode" required value={formData.pincode} onChange={handleInputChange} />
                </div>
              </div>
              <button type="submit" className="btn-primary full-width mt-20">PAY ₹ {getCartTotal()}</button>
            </form>
          </div>

          <div className="checkout-summary vintage-border">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.quantity}x {item.name}</span>
                  <span>₹ {item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <hr />
            <div className="summary-row total">
              <span>Total to Pay</span>
              <span>₹ {getCartTotal()}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
