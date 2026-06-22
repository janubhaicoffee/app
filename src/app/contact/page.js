"use client";
import "../legal.css";

export default function ContactPage() {
  return (
    <main className="legal-page">
      <div className="container legal-container">
        <h1>Contact Us</h1>
        
        <h2>Get in Touch</h2>
        <p>We'd love to hear from you! Whether you have a question about our coffee, an order, or anything else, our team is ready to answer all your questions.</p>

        <h2>Contact Information</h2>
        <ul>
          <li><strong>Email:</strong> support@janubhai.com</li>
          <li><strong>Phone:</strong> +91 98765 43210 (Mon-Fri, 9am - 6pm IST)</li>
        </ul>

        <h2>Operating Address</h2>
        <p>Janu Bhai Coffee Estate,<br/>
        Chikmagaluru, Karnataka - 577101<br/>
        India</p>
      </div>
    </main>
  );
}
