"use client";
import "../legal.css";
import AIChatbot from "@/components/AIChatbot";

export default function ContactPage() {
  return (
    <main className="legal-page">
      <div className="container legal-container" style={{ maxWidth: '900px' }}>
        <h1>Contact Us</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginTop: '2rem' }}>
          <div>
            <h2>Get in Touch</h2>
            <p>We'd love to hear from you! Whether you have a question about our coffee, an order, or anything else, our team is ready to answer all your questions.</p>

            <h2 style={{ marginTop: '2rem' }}>Contact Information</h2>
            <ul>
              <li><strong>Email:</strong> hello@janubhai.com</li>
              <li><strong>Phone:</strong> +91 8527976791 (Mon-Fri, 9am - 6pm IST)</li>
            </ul>

            <h2 style={{ marginTop: '2rem' }}>Operating Address</h2>
            <p>Ground Floor, Shop 16, Building A1,<br/>
            Gafoor Nagar Dhalan, Jamia Nagar, 110025,<br/>
            South East Delhi, Delhi, India</p>
          </div>

          <div>
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Ask our AI Assistant</h2>
            <AIChatbot />
          </div>
        </div>
      </div>
    </main>
  );
}
