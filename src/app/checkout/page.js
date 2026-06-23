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
    pincode: "",
    giftMessage: ""
  });

  const [userId, setUserId] = useState(null);
  const [shippingRate, setShippingRate] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  
  const [checkoutMode, setCheckoutMode] = useState("standard");
  const [subFrequency, setSubFrequency] = useState(null);

  const finalTotal = getCartTotal() + (shippingRate ? shippingRate.shipping_cost : 0);

  useEffect(() => {
    // Parse URL params
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get("mode");
    if (mode) setCheckoutMode(mode);
    const freq = searchParams.get("frequency");
    if (freq) setSubFrequency(freq);
    // Check if user is logged in
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUserId(session.user.id);
          setFormData(prev => ({
            ...prev,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || prev.name
          }));
        }
      });
    });

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (formData.pincode.length === 6) {
      fetchShippingRates();
    } else {
      setShippingRate(null);
      setShippingError("");
    }
  }, [formData.pincode]);

  const fetchShippingRates = async () => {
    setShippingLoading(true);
    setShippingError("");
    try {
      // Rough estimate: 500g per item
      const weight = cartItems.reduce((acc, item) => acc + (500 * item.quantity), 0) || 500;
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: formData.pincode,
          weight,
          order_amount: getCartTotal()
        })
      });
      const data = await res.json();
      if (data.success) {
        setShippingRate(data);
      } else {
        setShippingError(data.error || "Delivery unavailable for this pincode.");
      }
    } catch (err) {
      setShippingError("Failed to fetch shipping rates.");
    } finally {
      setShippingLoading(false);
    }
  };



  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      let rzpOrderId = null;
      let subId = null;

      if (checkoutMode === "subscription") {
        const res = await fetch('/api/razorpay/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: finalTotal, frequency: subFrequency })
        });
        const data = await res.json();
        if (!data.subscriptionId) {
          alert("Failed to create subscription: " + (data.error || ""));
          return;
        }
        subId = data.subscriptionId;
      } else {
        const res = await fetch('/api/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: finalTotal })
        });
        const data = await res.json();
        if (!data.orderId) {
          alert("Failed to create order");
          return;
        }
        rzpOrderId = data.orderId;
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      
      const completeOrder = async (paymentId, orderId, signature) => {
        try {
          const res = await fetch('/api/order/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cartItems,
              shippingRate,
              finalTotal,
              paymentId,
              razorpayOrderId: orderId,
              razorpaySignature: signature,
              userId,
              isGift: checkoutMode === "gift",
              giftMessage: formData.giftMessage,
              isSubscription: checkoutMode === "subscription",
              subscriptionId: subId,
              subscriptionFrequency: subFrequency
            })
          });
          const data = await res.json();
          if (data.success) {
            alert(`Order Placed! AWB Tracking: ${data.awb}`);
            clearCart();
            router.push('/account');
          } else {
            alert("Order completion failed: " + data.error);
          }
        } catch (e) {
          console.error(e);
          alert("Error finalizing order.");
        }
      };

      if (!keyId) {
        alert("Razorpay Key is missing");
        return;
      }

      const options = {
        key: keyId,
        amount: checkoutMode === "subscription" ? undefined : finalTotal * 100, // subscriptions dont pass amount here
        currency: "INR",
        name: "Janu Bhai Coffee",
        description: checkoutMode === "subscription" ? `Coffee Subscription (${subFrequency})` : "Order Checkout",
        order_id: rzpOrderId || undefined,
        subscription_id: subId || undefined,
        handler: async function (response) {
          await completeOrder(
            response.razorpay_payment_id,
            checkoutMode === "subscription" ? response.razorpay_subscription_id : response.razorpay_order_id,
            response.razorpay_signature
          );
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
            <h2>{checkoutMode === "gift" ? "Recipient's Shipping Details" : "Shipping Details"}</h2>
            <form onSubmit={handlePayment} className="checkout-form">
              <div className="form-group">
                <label>{checkoutMode === "gift" ? "Recipient's Full Name" : "Full Name"}</label>
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
              {checkoutMode === "gift" && (
                <div className="form-group">
                  <label>Gift Message (Optional)</label>
                  <textarea name="giftMessage" rows="2" value={formData.giftMessage} onChange={handleInputChange} placeholder="Write a nice message..."></textarea>
                </div>
              )}
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
              
              {shippingLoading && <p style={{ color: '#FBC02D', marginTop: '10px' }}>Calculating shipping...</p>}
              {shippingError && <p style={{ color: '#D32F2F', marginTop: '10px' }}>{shippingError}</p>}
              {shippingRate && (
                <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderLeft: '3px solid #FBC02D' }}>
                  <p style={{ margin: 0 }}><strong>Delivery via {shippingRate.courier_name}</strong></p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>Estimated: {shippingRate.estimated_delivery_days} Days</p>
                </div>
              )}

              <button type="submit" className="btn-primary full-width mt-20" disabled={shippingLoading || !!shippingError || formData.pincode.length !== 6}>
                PAY ₹ {finalTotal}
              </button>
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
            {shippingRate && (
              <div className="summary-row">
                <span>Shipping</span>
                <span>₹ {shippingRate.shipping_cost}</span>
              </div>
            )}
            <hr />
            <div className="summary-row total">
              <span>Total to Pay</span>
              <span>₹ {finalTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
