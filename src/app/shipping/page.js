"use client";
import "../legal.css";

export default function ShippingPage() {
  return (
    <main className="legal-page">
      <div className="container legal-container">
        <h1>Shipping & Delivery Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Processing Time</h2>
        <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.</p>

        <h2>2. Shipping Rates & Delivery Estimates</h2>
        <p>Shipping charges for your order will be calculated and displayed at checkout. Delivery delays can occasionally occur.</p>
        <ul>
          <li>Standard Shipping: 3-5 business days</li>
          <li>Express Shipping: 1-2 business days (if applicable)</li>
        </ul>

        <h2>3. Shipment Confirmation & Order Tracking</h2>
        <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>

        <h2>4. Damages</h2>
        <p>Janu Bhai Coffee is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.</p>
      </div>
    </main>
  );
}
