'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Ticket,
  CheckCircle2,
  X,
  Share2,
  Coffee,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './events.css';

export default function EventsDirectoryPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'Workshop' | 'Tasting Session' | 'Community' | 'Pop-Up'
  const [rsvpModalEvent, setRsvpModalEvent] = useState(null);
  const [rsvpSuccessData, setRsvpSuccessData] = useState(null);

  const [rsvpForm, setRsvpForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    guest_count: 1,
    notes: '',
  });
  const [submittingRsvp, setSubmittingRsvp] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/growth/events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (selectedFilter === 'all') return true;
    return e.event_type === selectedFilter;
  });

  const handleOpenRsvpModal = (event) => {
    setRsvpModalEvent(event);
    setRsvpSuccessData(null);
    setRsvpForm({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      guest_count: 1,
      notes: '',
    });
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!rsvpForm.customer_name || !rsvpForm.customer_email) {
      toast.error('Please enter your name and email');
      return;
    }

    setSubmittingRsvp(true);
    try {
      const res = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: rsvpModalEvent.id,
          ...rsvpForm,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('RSVP Confirmed! See you at Janu Bhai Cafe.');
        setRsvpSuccessData(data);
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to complete RSVP');
      }
    } catch (err) {
      toast.error('Network error submitting RSVP');
    } finally {
      setSubmittingRsvp(false);
    }
  };

  return (
    <div className="events-directory-container">
      {/* Hero Header */}
      <div className="events-hero-header">
        <span className="events-hero-badge">
          <Sparkles size={15} /> Coffee Culture & Activations
        </span>
        <h1 className="events-hero-title">
          Taste, Learn & Connect at Janu Bhai Cafe
        </h1>
        <p className="events-hero-desc">
          Join our masterclasses, single-estate tasting sessions, latte art workshops, and intimate acoustic brew evenings in New Delhi.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="events-filter-bar">
        {['all', 'Workshop', 'Tasting Session', 'Community', 'Pop-Up'].map((f) => (
          <button
            key={f}
            className={`filter-pill ${selectedFilter === f ? 'active' : ''}`}
            onClick={() => setSelectedFilter(f)}
          >
            {f === 'all' ? '✨ All Events' : f}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#a89f91' }}>
          Loading coffee masterclasses & events...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#a89f91' }}>
          No upcoming events matching this filter. Check back soon!
        </div>
      ) : (
        <div className="events-card-grid">
          {filteredEvents.map((event) => {
            const spotsRemaining = Math.max(0, Number(event.capacity || 30) - Number(event.rsvp_count || 0));
            const isSoldOut = spotsRemaining === 0;

            return (
              <div key={event.id} className="event-card">
                <div className="event-banner-wrap">
                  <Image
                    src={event.banner_url || '/affogato_cup.png'}
                    alt={event.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  {event.is_featured && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#d4a359',
                        color: '#120b06',
                        padding: '4px 10px',
                        borderRadius: '100px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      ★ Featured
                    </span>
                  )}
                </div>

                <div className="event-card-body">
                  <div>
                    <span className="event-type-badge">{event.event_type}</span>
                    <h3 className="event-card-title">{event.title}</h3>
                    {event.featuring_name && (
                      <p className="event-card-featuring">
                        Featuring: {event.featuring_name}
                      </p>
                    )}
                  </div>

                  <div className="event-meta-info">
                    <div className="event-meta-item">
                      <Calendar size={15} color="#d4a359" />
                      <span>{event.event_date}</span>
                    </div>
                    <div className="event-meta-item">
                      <Clock size={15} color="#d4a359" />
                      <span>{event.start_time} - {event.end_time || 'Late'}</span>
                    </div>
                    <div className="event-meta-item">
                      <MapPin size={15} color="#d4a359" />
                      <span>{event.location_name}</span>
                    </div>
                    <div className="event-meta-item">
                      <Users size={15} color={isSoldOut ? '#ef4444' : '#34d399'} />
                      <span>
                        {isSoldOut ? 'Sold Out / Waitlist' : `${spotsRemaining} Seats Left (Free RSVP)`}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: '#a89f91', fontSize: '0.84rem', margin: '0 0 16px', lineHeight: 1.5 }}>
                    {event.description}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <Link
                      href={`/events/${event.slug}`}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#f5f0eb',
                        borderRadius: '12px',
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      Details
                    </Link>

                    <button
                      className="event-rsvp-btn"
                      style={{ flex: 2 }}
                      onClick={() => handleOpenRsvpModal(event)}
                      disabled={isSoldOut}
                    >
                      <Ticket size={16} />
                      <span>{isSoldOut ? 'Event Full' : 'RSVP Now · Free'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive RSVP Registration Modal */}
      {rsvpModalEvent && (
        <div className="rsvp-modal-backdrop" onClick={() => setRsvpModalEvent(null)}>
          <div className="rsvp-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setRsvpModalEvent(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#a89f91',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            {!rsvpSuccessData ? (
              <>
                <span className="event-type-badge">{rsvpModalEvent.event_type}</span>
                <h3 style={{ color: '#f7e7ce', margin: '0 0 4px', fontSize: '1.4rem' }}>
                  RSVP for {rsvpModalEvent.title}
                </h3>
                {rsvpModalEvent.featuring_name && (
                  <p style={{ color: '#d4a359', fontSize: '0.88rem', margin: '0 0 16px', fontWeight: 600 }}>
                    Featuring: {rsvpModalEvent.featuring_name}
                  </p>
                )}

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', fontSize: '0.82rem', color: '#a89f91', marginBottom: '20px' }}>
                  📅 {rsvpModalEvent.event_date} · ⏰ {rsvpModalEvent.start_time}<br />
                  📍 {rsvpModalEvent.location_name}
                </div>

                <form onSubmit={handleRsvpSubmit}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      className="rsvp-input"
                      placeholder="e.g. Rahul Sharma"
                      value={rsvpForm.customer_name}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, customer_name: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="rsvp-input"
                        placeholder="rahul@example.com"
                        value={rsvpForm.customer_email}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, customer_email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                        WhatsApp / Mobile No.
                      </label>
                      <input
                        type="tel"
                        className="rsvp-input"
                        placeholder="+91 98765 43210"
                        value={rsvpForm.customer_phone}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, customer_phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                        Number of Guests
                      </label>
                      <select
                        className="rsvp-input"
                        value={rsvpForm.guest_count}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, guest_count: e.target.value })}
                      >
                        <option value={1}>1 Guest (Just Me)</option>
                        <option value={2}>2 Guests (+1 Friend)</option>
                        <option value={3}>3 Guests (+2 Friends)</option>
                        <option value={4}>4 Guests (Group)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                        Coffee Preference / Notes
                      </label>
                      <input
                        type="text"
                        className="rsvp-input"
                        placeholder="e.g. Love pour-over"
                        value={rsvpForm.notes}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="event-rsvp-btn"
                    style={{ marginTop: '10px' }}
                    disabled={submittingRsvp}
                  >
                    <CheckCircle2 size={18} />
                    <span>{submittingRsvp ? 'Confirming Spot...' : 'Confirm My RSVP (Free Entry)'}</span>
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ color: '#f7e7ce', margin: '0 0 6px', fontSize: '1.4rem' }}>
                  You&apos;re on the Guest List!
                </h3>
                <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: '0 0 20px' }}>
                  Confirmation sent to <strong style={{ color: '#d4a359' }}>{rsvpForm.customer_email}</strong>.
                </p>

                {/* Digital RSVP Pass */}
                <div className="digital-ticket-pass">
                  <span style={{ fontSize: '0.74rem', color: '#d4a359', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                    Official Janu Bhai Event Pass
                  </span>
                  <h4 style={{ color: '#f5f0eb', margin: '6px 0', fontSize: '1.15rem' }}>
                    {rsvpSuccessData.event?.title}
                  </h4>
                  <p style={{ color: '#e5dfd8', fontSize: '0.82rem', margin: '4px 0' }}>
                    Guest: <strong>{rsvpForm.customer_name}</strong> ({rsvpForm.guest_count} Person)
                  </p>
                  <p style={{ color: '#a89f91', fontSize: '0.8rem', margin: '4px 0' }}>
                    📅 {rsvpSuccessData.event?.event_date} · ⏰ {rsvpSuccessData.event?.start_time}
                  </p>
                  <p style={{ color: '#a89f91', fontSize: '0.78rem', margin: '4px 0' }}>
                    📍 {rsvpSuccessData.event?.location_name}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <Link
                    href="/customer"
                    style={{
                      flex: 1,
                      background: '#d4a359',
                      color: '#120b06',
                      fontWeight: 700,
                      padding: '10px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontSize: '0.86rem',
                    }}
                  >
                    View in Customer Hub →
                  </Link>
                  <button
                    onClick={() => setRsvpModalEvent(null)}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: '#f5f0eb',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.86rem',
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
