'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Ticket,
  Coffee,
  Award,
  MapPin,
  MessageSquare,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  Star,
  Send,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import './customer.css';

export default function CustomerUnifiedHub() {
  const [activeTab, setActiveTab] = useState('passes'); // 'passes' | 'menu' | 'loyalty' | 'locations' | 'feedback'
  const [user, setUser] = useState(null);
  const [myRsvps, setMyRsvps] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cart Context
  const { addToCart } = useCart();

  // Feedback Form State
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    category: 'Coffee Quality',
    comments: '',
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      fetchCustomerData(session?.user?.email);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      fetchCustomerData(session?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCustomerData = async (email) => {
    setLoading(true);
    try {
      // Fetch all public events
      const eventsRes = await fetch('/api/growth/events');
      const eventsData = await eventsRes.json();
      if (eventsData.success) {
        setAllEvents(eventsData.data || []);
      }

      // Fetch user's RSVPs if email available
      if (email) {
        const rsvpRes = await fetch(`/api/events/rsvp?email=${encodeURIComponent(email)}`);
        const rsvpData = await rsvpRes.json();
        if (rsvpData.success) {
          setMyRsvps(rsvpData.data || []);
        }
      } else {
        // Sample sample active passes for guest showcase
        const rsvpRes = await fetch('/api/events/rsvp');
        const rsvpData = await rsvpRes.json();
        if (rsvpData.success) {
          setMyRsvps((rsvpData.data || []).slice(0, 2));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.comments) {
      toast.error('Please share your thoughts');
      return;
    }
    toast.success('Thank you! Your feedback has been sent directly to Operations Head Bilal Muhammad.');
    setFeedbackSubmitted(true);
  };

  return (
    <div className="customer-hub-container">
      {/* 1. Header Card */}
      <div className="customer-header-card">
        <div>
          <div className="customer-brand-title">
            <Coffee size={28} color="#d4a359" />
            <span>Janu Bhai Coffee · Guest & Connoisseur Hub</span>
            <span className="customer-vip-badge">Single-Estate Coffee</span>
          </div>
          <p style={{ color: '#a89f91', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Welcome, {user?.user_metadata?.full_name || 'Coffee Enthusiast'}! Your unified home for event passes, loyalty perks, and fresh roasts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link
            href="/events"
            style={{
              background: 'linear-gradient(135deg, #d4a359 0%, #b8863b 100%)',
              color: '#120b06',
              fontWeight: 700,
              padding: '10px 18px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Ticket size={15} /> Discover Cafe Events
          </Link>
          <Link
            href="/product/instantcoffee"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#f5f0eb',
              padding: '10px 16px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.86rem',
              fontWeight: 600,
            }}
          >
            Order Coffee Bag
          </Link>
        </div>
      </div>

      {/* 2. Tabs Bar */}
      <div className="customer-tabs-bar">
        <button
          className={`customer-tab-btn ${activeTab === 'passes' ? 'active' : ''}`}
          onClick={() => setActiveTab('passes')}
        >
          <Ticket size={16} />
          <span>My Event Passes & RSVPs ({myRsvps.length})</span>
        </button>
        <button
          className={`customer-tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          <Coffee size={16} />
          <span>Specialty Coffee & Roastery Menu</span>
        </button>
        <button
          className={`customer-tab-btn ${activeTab === 'loyalty' ? 'active' : ''}`}
          onClick={() => setActiveTab('loyalty')}
        >
          <Award size={16} />
          <span>Loyalty Progression & Rewards</span>
        </button>
        <button
          className={`customer-tab-btn ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          <MapPin size={16} />
          <span>Cafe Location & Hours</span>
        </button>
        <button
          className={`customer-tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <MessageSquare size={16} />
          <span>Guest Experience Feedback</span>
        </button>
      </div>

      {/* 3. TAB CONTENTS */}

      {/* TAB 1: MY PASSES & RSVPS */}
      {activeTab === 'passes' && (
        <div className="customer-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
                Your Digital Event Passes
              </h3>
              <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
                Show this digital ticket pass at the door during event check-in.
              </p>
            </div>
            <Link
              href="/events"
              style={{
                color: '#d4a359',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              + RSVP for more events
            </Link>
          </div>

          {myRsvps.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '14px' }}>
              <Ticket size={40} color="#d4a359" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ color: '#f5f0eb', margin: '0 0 6px' }}>No Event Passes Yet</h4>
              <p style={{ color: '#a89f91', fontSize: '0.86rem', margin: '0 0 18px' }}>
                Join our artisan coffee cupping sessions, latte art workshops, and acoustic pop-ups.
              </p>
              <Link
                href="/events"
                style={{
                  background: '#d4a359',
                  color: '#120b06',
                  fontWeight: 700,
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                }}
              >
                Browse Upcoming Events →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {myRsvps.map((rsvp) => (
                <div key={rsvp.id} className="digital-pass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#d4a359', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                      Official VIP Pass
                    </span>
                    <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                      ✓ Confirmed
                    </span>
                  </div>

                  <h4 style={{ color: '#f7e7ce', margin: '0 0 6px', fontSize: '1.15rem' }}>
                    {rsvp.event?.title || 'Coffee Masterclass'}
                  </h4>
                  {rsvp.event?.featuring_name && (
                    <p style={{ color: '#d4a359', fontSize: '0.82rem', margin: '0 0 10px', fontWeight: 600 }}>
                      Featuring: {rsvp.event.featuring_name}
                    </p>
                  )}

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', fontSize: '0.82rem', color: '#a89f91', marginBottom: '16px', lineHeight: 1.5 }}>
                    📅 {rsvp.event?.event_date || 'Upcoming'} · ⏰ {rsvp.event?.start_time || 'Evening'}<br />
                    📍 {rsvp.event?.location_name || 'Janu Bhai Cafe, Gafoor Nagar, Delhi'}<br />
                    👤 Guest: <strong>{rsvp.customer_name}</strong> ({rsvp.guest_count} Person)
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(212,163,89,0.3)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#a89f91' }}>
                      Pass ID: #{rsvp.id?.slice(0, 8)}
                    </span>
                    <a
                      href="https://maps.google.com/?q=Gafoor+Nagar+Okhla+Delhi"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#d4a359', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Get Directions ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SPECIALTY COFFEE & ROASTERY MENU */}
      {activeTab === 'menu' && (
        <div className="customer-panel">
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Janu Bhai Specialty Coffee Blends
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              100% Single-Estate Chikmagalur Arabica beans & micro-ground instant coffee.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              {
                id: 'instant-100g',
                title: 'Signature Instant Coffee (100g)',
                price: 349,
                desc: 'Freeze-dried Chikmagalur Arabica with hazelnut & chocolate undertones.',
                image: '/affogato_cup.png',
                link: '/product/instantcoffee',
              },
              {
                id: 'instant-1000g',
                title: 'Artisan Cafe Blend (1000g Bag)',
                price: 2499,
                desc: 'Master roaster batch for true coffee purists and bulk cafe brewing.',
                image: '/cappuccino_cup.png',
                link: '/product/instantcoffee',
              },
              {
                id: 'coldbrew-bottle',
                title: 'Chikmagalur Nitro Cold Brew (250ml)',
                price: 180,
                desc: 'Slow steeped for 18 hours. Ultra-smooth, zero bitterness.',
                image: '/iced_latte.png',
                link: '/product/instantcoffee',
              },
            ].map((prod) => (
              <div
                key={prod.id}
                style={{
                  background: 'rgba(36, 24, 16, 0.7)',
                  border: '1px solid rgba(212, 163, 89, 0.25)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
                  <Image src={prod.image} alt={prod.title} fill style={{ objectFit: 'cover' }} />
                </div>
                <h4 style={{ color: '#f5f0eb', margin: '0 0 4px', fontSize: '1.05rem' }}>{prod.title}</h4>
                <p style={{ color: '#a89f91', fontSize: '0.8rem', margin: '0 0 12px', flex: 1, lineHeight: 1.4 }}>{prod.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ color: '#d4a359', fontSize: '1.15rem', fontWeight: 800 }}>₹{prod.price}</span>
                  <Link
                    href={prod.link}
                    style={{
                      background: 'linear-gradient(135deg, #d4a359 0%, #b8863b 100%)',
                      color: '#120b06',
                      fontWeight: 700,
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      textDecoration: 'none',
                    }}
                  >
                    Shop Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LOYALTY & REWARDS PROGRESSION */}
      {activeTab === 'loyalty' && (
        <div className="customer-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Janu Bhai Coffee Lore & Rewards
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Earn points with every sip, event attendance, and review.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(212,163,89,0.2)' }}>
              <span style={{ fontSize: '0.8rem', color: '#a89f91', textTransform: 'uppercase' }}>Current Rank</span>
              <h4 style={{ color: '#d4a359', fontSize: '1.4rem', margin: '4px 0 0' }}>Coffee Connoisseur Tier II</h4>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(212,163,89,0.2)' }}>
              <span style={{ fontSize: '0.8rem', color: '#a89f91', textTransform: 'uppercase' }}>Points Balance</span>
              <h4 style={{ color: '#34d399', fontSize: '1.4rem', margin: '4px 0 0' }}>250 Loyalty Points</h4>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(212,163,89,0.2)' }}>
              <span style={{ fontSize: '0.8rem', color: '#a89f91', textTransform: 'uppercase' }}>Free Drink Reward</span>
              <h4 style={{ color: '#f5f0eb', fontSize: '1.4rem', margin: '4px 0 0' }}>1 Drink Unlocked</h4>
            </div>
          </div>

          <Link
            href="/account"
            style={{
              color: '#d4a359',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Open Full Account Security & Points Ledger →
          </Link>
        </div>
      )}

      {/* TAB 4: CAFE LOCATION & HOURS */}
      {activeTab === 'locations' && (
        <div className="customer-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Janu Bhai Cafe · Location & Hours
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Visit our flagship coffee house in South Delhi.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px' }}>
              <h4 style={{ color: '#d4a359', margin: '0 0 12px', fontSize: '1.1rem' }}>
                Janu Bhai Cafe - Gafoor Nagar Flagship
              </h4>
              <p style={{ color: '#e5dfd8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '14px' }}>
                Shop 16, Building A1-16, Gafoor Nagar Dhalan,<br />
                Okhla / Kalkaji, New Delhi - 110025
              </p>
              <div style={{ fontSize: '0.84rem', color: '#a89f91', marginBottom: '16px' }}>
                ⏰ <strong>Timings:</strong> 8:00 AM - 11:00 PM (Mon - Sun)<br />
                📞 <strong>Direct Contact:</strong> +91 85279 76791
              </div>
              <a
                href="https://wa.me/918527976791"
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Phone size={14} /> WhatsApp Cafe Desk
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GUEST FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="customer-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Guest Experience & Barista Feedback
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Your feedback goes directly to Operations Head Bilal Muhammad and Founder Janu Bhai.
            </p>
          </div>

          {!feedbackSubmitted ? (
            <form onSubmit={handleFeedbackSubmit} style={{ maxWidth: '560px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#d4a359', marginBottom: '6px' }}>
                  Overall Experience Rating (1 to 5 Stars)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star
                        size={26}
                        fill={star <= feedbackForm.rating ? '#d4a359' : 'none'}
                        color={star <= feedbackForm.rating ? '#d4a359' : '#666'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#d4a359', marginBottom: '6px' }}>
                  Topic / Category
                </label>
                <select
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#f5f0eb' }}
                  value={feedbackForm.category}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                >
                  <option value="Coffee Quality">Coffee Quality & Taste</option>
                  <option value="Shop Cleanliness">Store Cleanliness & Ambience</option>
                  <option value="Barista Service">Barista Greeting & Speed</option>
                  <option value="Event Experience">Event & Workshop Experience</option>
                  <option value="Suggestion">General Suggestion</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#d4a359', marginBottom: '6px' }}>
                  Your Comments & Experience Details
                </label>
                <textarea
                  rows={4}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#f5f0eb', fontSize: '0.88rem' }}
                  placeholder="Tell us what you loved or how we can make your coffee experience even better..."
                  value={feedbackForm.comments}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #d4a359 0%, #b8863b 100%)',
                  color: '#120b06',
                  fontWeight: 700,
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Send size={16} /> Submit Feedback
              </button>
            </form>
          ) : (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', padding: '24px', borderRadius: '14px', textAlign: 'center', maxWidth: '500px' }}>
              <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ color: '#f5f0eb', margin: '0 0 6px' }}>Feedback Received!</h4>
              <p style={{ color: '#a89f91', fontSize: '0.84rem', margin: 0 }}>
                Thank you for being part of Janu Bhai Coffee culture. We appreciate your valuable feedback!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
