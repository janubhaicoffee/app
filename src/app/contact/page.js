"use client";
import { useState } from "react";
import "../legal.css";
import AIChatbot from "@/components/AIChatbot";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', message: "Thanks for reaching out! We'll get back to you soon." });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.error || "Failed to send message." });
      }
    } catch (err) {
      setStatus({ type: 'error', message: "An error occurred. Please try again." });
    }
    setLoading(false);
  };

  return (
    <main className="legal-page">
      <div className="container legal-container" style={{ maxWidth: '900px' }}>
        <h1>Contact Us</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginTop: '2rem' }}>
          <div>
            <h2>Get in Touch</h2>
            <p>We'd love to hear from you! Whether you have a question about our coffee, an order, or anything else, our team is ready to answer all your questions.</p>

            {status && (
              <div style={{ padding: '1rem', marginTop: '1rem', background: status.type === 'success' ? '#2ecc7133' : '#e74c3c33', color: status.type === 'success' ? '#2ecc71' : '#e74c3c', borderRadius: '4px' }}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Message</label>
                <textarea 
                  required 
                  rows="5"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
                ></textarea>
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? "SENDING..." : "SEND MESSAGE"}
              </button>
            </form>

            <h2 style={{ marginTop: '3rem' }}>Contact Information</h2>
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
