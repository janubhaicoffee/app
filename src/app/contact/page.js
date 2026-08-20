'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import '../legal.css';
import AIChatbot from '@/components/AIChatbot';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Customer Inquiry', message: '' });
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
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({
          type: 'success',
          message: 'Thank you for reaching out to Janu Bhai Coffee. Our roastery concierge will respond within 24 hours.',
        });
        setFormData({ name: '', email: '', subject: 'Customer Inquiry', message: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to dispatch message.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An error occurred. Please try again or reach out on WhatsApp.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="legal-page">
      <div className="container legal-container" style={{ maxWidth: '1080px' }}>
        
        {/* Header Badge & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(216, 154, 30, 0.15)',
              border: '1px solid rgba(216, 154, 30, 0.3)',
              color: 'var(--accent-gold, #d89a1e)',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '30px',
              marginBottom: '12px',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={14} /> Roastery Concierge & Support
          </div>
          <h1 style={{ border: 'none', paddingBottom: 0, marginBottom: '0.5rem' }}>Contact Janu Bhai Coffee</h1>
          <p style={{ color: 'var(--text-secondary, #cbb9a8)', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
            Have a question about our Chikmagalur single-estate coffee, an active order, or wholesale partnering? We're here for you.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '2.5rem',
          }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(245, 240, 234, 0.08)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(216, 154, 30, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                color: 'var(--accent-gold, #d89a1e)',
              }}
            >
              <Mail size={20} />
            </div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>Email Us</h4>
            <a href="mailto:care@janubhai.com" style={{ fontSize: '0.85rem' }}>care@janubhai.com</a>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(245, 240, 234, 0.08)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(37, 211, 102, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                color: '#25d366',
              }}
            >
              <MessageCircle size={20} />
            </div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>WhatsApp Concierge</h4>
            <a
              href="https://wa.me/919999999999?text=Hi%20Janu%20Bhai%20Coffee%2C%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.85rem', color: '#25d366' }}
            >
              +91 99999 99999
            </a>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(245, 240, 234, 0.08)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(216, 154, 30, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                color: 'var(--accent-gold, #d89a1e)',
              }}
            >
              <MapPin size={20} />
            </div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>Estate Roastery</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Chikmagalur, Karnataka, India
            </span>
          </div>
        </div>

        {/* Main Grid: Form on Left, AI Sommelier on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Inquiry Form */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(245, 240, 234, 0.08)',
              borderRadius: '20px',
              padding: '28px',
            }}
          >
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontFamily: 'var(--font-playfair)' }}>
              Send an Inquiry
            </h3>

            {status && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: status.type === 'success' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(198, 40, 40, 0.2)',
                  border: `1px solid ${status.type === 'success' ? '#2e7d32' : '#c62828'}`,
                  color: status.type === 'success' ? '#a5d6a7' : '#ff8a80',
                }}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Your Name *</label>
                <input
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label>Email Address *</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label>Inquiry Topic</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Customer Inquiry">Customer Inquiry</option>
                  <option value="Order & Delivery Tracking">Order & Delivery Tracking</option>
                  <option value="Wholesale & Roastery Supply">Wholesale & Roastery Supply</option>
                  <option value="Franchise & Outlet Partnering">Franchise & Outlet Partnering</option>
                  <option value="Feedback & Press">Feedback & Press</option>
                </select>
              </div>

              <div>
                <label>Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we assist your coffee journey today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'var(--accent-gold, #d89a1e)',
                  color: '#1a0f0c',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 24px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  boxShadow: '0 8px 24px rgba(216, 154, 30, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Send size={16} />
                <span>{loading ? 'Dispatching...' : 'Send Message'}</span>
              </button>
            </form>
          </div>

          {/* Sommelier & FAQ Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(245, 240, 234, 0.08)',
                borderRadius: '20px',
                padding: '24px',
              }}
            >
              <h4 style={{ margin: '0 0 12px', fontSize: '1.05rem', color: 'var(--accent-gold, #d89a1e)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Instant AI Coffee Sommelier
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                Looking for recommendations on brewing hot vs iced, pack sizes, or pairing ratios? Our AI Sommelier is online 24/7.
              </p>
              <AIChatbot />
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(245, 240, 234, 0.08)',
                borderRadius: '20px',
                padding: '24px',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 700 }}>
                <Clock size={16} color="var(--accent-gold, #d89a1e)" /> Support Hours
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Monday to Saturday: 9:00 AM – 7:00 PM IST.<br />
                Orders placed online dispatch within 24 hours with pan-India express courier.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
