"use client";
import Image from "next/image";
import "./page.css";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleBuy = async (productName, amount) => {
    try {
      // Create order on backend
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();

      if (!data.orderId) {
        alert("Failed to create order");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy", // Use actual key in production
        amount: amount * 100, // paise
        currency: "INR",
        name: "Janu Bhai Coffee",
        description: `Purchase of ${productName}`,
        order_id: data.orderId,
        handler: function (response) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        },
        prefill: {
          name: "Coffee Lover",
          email: "customer@example.com",
          contact: "9999999999"
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

  return (
    <main className="main-content">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-text vintage-border">
            <h1>FROM THE HILLS OF CHIKMAGALURU</h1>
            <p className="hindi-sub">चिकमगलुरु की ताज़ा कॉफ़ी</p>
            <p className="hero-desc">
              Our coffee comes from the lush hills of Chikmagaluru, Karnataka.
              One of India's most celebrated coffee growing regions, known for its rich soil, 
              perfect climate, and passion for quality.
            </p>
            <button className="btn-primary" onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}>
              SHOP NOW
            </button>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section" id="process">
        <div className="container">
          <h2 className="section-title"><span>FROM FARM TO CUP</span></h2>
          <div className="process-grid">
            <div className="process-step">
              <div className="process-img-wrapper">
                <Image src="/handpicked.png" alt="Handpicked Cherries" width={300} height={300} className="process-img"/>
              </div>
              <h3>HANDPICKED</h3>
              <p>Only ripe cherries are selected with care.</p>
            </div>
            <div className="process-step">
              <div className="process-img-wrapper">
                <Image src="/sun_dried.png" alt="Sun Dried Beans" width={300} height={300} className="process-img"/>
              </div>
              <h3>SUN DRIED</h3>
              <p>Naturally sun dried to lock in flavour.</p>
            </div>
            <div className="process-step">
              <div className="process-img-wrapper">
                <Image src="/expertly_roasted.png" alt="Expertly Roasted" width={300} height={300} className="process-img"/>
              </div>
              <h3>EXPERTLY ROASTED</h3>
              <p>Roasted in small batches to bring out the best aroma.</p>
            </div>
            <div className="process-step">
              <div className="process-img-wrapper">
                <Image src="/served_fresh.png" alt="Served Fresh" width={300} height={300} className="process-img"/>
              </div>
              <h3>SERVED FRESH</h3>
              <p>Sealed for freshness and served for the perfect cup every time.</p>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Janu Bhai Coffee. All rights reserved.</p>
        <p className="footer-sub">Born in Chikmagaluru, Loved everywhere.</p>
      </footer>
    </main>
  );
}
