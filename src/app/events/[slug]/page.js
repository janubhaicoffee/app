'use client';

import React, { useState, useEffect, use } from 'react';
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
  Share2,
  ArrowLeft,
  Coffee,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../events.css';

export default function EventDetailPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  const [rsvpForm, setRsvpForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    guest_count: 1,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [slug]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/growth/events?slug=${slug}`);
      const data = await res.json();
      if (data.success && data.data) {
        setEvent(data.data);
      } else {
        toast.error('Event not found');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!rsvpForm.customer_name || !rsvpForm.customer_email) {
      toast.error('Please provide your name and email');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          ...rsvpForm,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Your spot is confirmed! See you there.');
        setRsvpSubmitted(true);
        fetchEventDetails();
      } else {
        toast.error(data.error || 'Failed to submit RSVP');
      }
    } catch (err) {
      toast.error('Network error submitting RSVP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="events-directory-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#a89f91' }}>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="events-directory-container" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#f7e7ce' }}>Event Not Found</h2>
        <Link href="/events" style={{ color: '#d4a359', textDecoration: 'underline', marginTop: '12px', display: 'inline-block' }}>
          ← Back to all events
        </Link>
      </div>
    );
  }

  const spotsRemaining = Math.max(0, Number(event.capacity || 30) - Number(event.rsvp_count || 0));
  const isSoldOut = spotsRemaining === 0;

  return (
    <div className="events-directory-container">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Link
          href="/events"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#d4a359',
            fontSize: '0.88rem',
            fontWeight: 600,
            textDecoration: 'none',
            marginBottom: '24px',
          }}
        >
          <ArrowLeft size={16} /> Back to All Events
        </Link>

        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(38, 26, 18, 0.9) 0%, rgba(20, 14, 10, 0.95) 100%)',
            border: '1px solid rgba(212, 163, 89, 0.3)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            marginBottom: '40px',
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '320px' }}>
            <Image
              src={event.banner_url || '/affogato_cup.png'}
              alt={event.title}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(18,12,8,0.95) 0%, transparent 60%)',
              }}
            />
            <div style={{ position: 'absolute', bottom: '24px', left: '28px', right: '28px' }}>
              <span className="event-type-badge">{event.event_type}</span>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f7e7ce', margin: '0 0 6px' }}>
                {event.title}
              </h1>
              {event.featuring_name && (
                <p style={{ fontSize: '1.05rem', color: '#d4a359', margin: 0, fontWeight: 700 }}>
                  Featuring: {event.featuring_name}
                </p>
              )}
            </div>
          </div>

          {/* Details & Embedded Registration Form Grid */}
          <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px' }}>
            {/* Left Column: Event Context & Experience */}
            <div>
              <h3 style={{ color: '#f7e7ce', fontSize: '1.25rem', margin: '0 0 14px' }}>
                About this Experience
              </h3>
              <p style={{ color: '#e5dfd8', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: '24px' }}>
                {event.description}
              </p>

              <h4 style={{ color: '#d4a359', fontSize: '0.95rem', margin: '0 0 12px' }}>
                Event Schedule & Venue
              </h4>
              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={16} color="#d4a359" />
                  <span>{event.event_date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={16} color="#d4a359" />
                  <span>{event.start_time} - {event.end_time || 'Late'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={16} color="#d4a359" />
                  <span>{event.location_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={16} color={isSoldOut ? '#ef4444' : '#34d399'} />
                  <span>
                    {isSoldOut ? 'Sold Out' : `${spotsRemaining} Spots Available (${event.rsvp_count || 0} Registered)`}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Event link copied to clipboard!');
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(212,163,89,0.3)',
                    color: '#d4a359',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Share2 size={14} /> Share Event Link
                </button>
              </div>
            </div>

            {/* Right Column: Embedded RSVP Form or Digital Pass */}
            <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(212,163,89,0.25)', borderRadius: '18px', padding: '24px' }}>
              {!rsvpSubmitted ? (
                <>
                  <h3 style={{ color: '#f7e7ce', fontSize: '1.25rem', margin: '0 0 6px' }}>
                    Event RSVP Registration
                  </h3>
                  <p style={{ color: '#a89f91', fontSize: '0.84rem', margin: '0 0 18px' }}>
                    Free registration · Secure your pass before seats run out.
                  </p>

                  <form onSubmit={handleRsvpSubmit}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        className="rsvp-input"
                        placeholder="e.g. Vikram Malhotra"
                        value={rsvpForm.customer_name}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, customer_name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="rsvp-input"
                        placeholder="vikram@example.com"
                        value={rsvpForm.customer_email}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, customer_email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                        WhatsApp / Contact Number
                      </label>
                      <input
                        type="tel"
                        className="rsvp-input"
                        placeholder="+91 98112 33445"
                        value={rsvpForm.customer_phone}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, customer_phone: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                          Number of Guests
                        </label>
                        <select
                          className="rsvp-input"
                          value={rsvpForm.guest_count}
                          onChange={(e) => setRsvpForm({ ...rsvpForm, guest_count: e.target.value })}
                        >
                          <option value={1}>1 Guest (Solo)</option>
                          <option value={2}>2 Guests (Pair)</option>
                          <option value={3}>3 Guests (Trio)</option>
                          <option value={4}>4 Guests (Group)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                          Special Notes
                        </label>
                        <input
                          type="text"
                          className="rsvp-input"
                          placeholder="e.g. Almond milk"
                          value={rsvpForm.notes}
                          onChange={(e) => setRsvpForm({ ...rsvpForm, notes: e.target.value })}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="event-rsvp-btn"
                      disabled={submitting || isSoldOut}
                    >
                      <Ticket size={16} />
                      <span>{isSoldOut ? 'Event Full' : submitting ? 'Reserving...' : 'Confirm RSVP · Free'}</span>
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 10px' }} />
                  <h3 style={{ color: '#f7e7ce', margin: '0 0 6px', fontSize: '1.3rem' }}>
                    RSVP Confirmed!
                  </h3>
                  <p style={{ color: '#a89f91', fontSize: '0.84rem', margin: '0 0 16px' }}>
                    Your spot is booked for <strong>{event.title}</strong>.
                  </p>

                  <div className="digital-ticket-pass">
                    <span style={{ fontSize: '0.72rem', color: '#d4a359', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                      Janu Bhai Cafe Pass
                    </span>
                    <h4 style={{ color: '#f5f0eb', margin: '6px 0', fontSize: '1.1rem' }}>
                      {event.title}
                    </h4>
                    <p style={{ color: '#e5dfd8', fontSize: '0.82rem', margin: '4px 0' }}>
                      Guest: <strong>{rsvpForm.customer_name}</strong> ({rsvpForm.guest_count} Person)
                    </p>
                    <p style={{ color: '#a89f91', fontSize: '0.78rem', margin: '4px 0' }}>
                      📅 {event.event_date} · ⏰ {event.start_time}
                    </p>
                  </div>

                  <Link
                    href="/customer"
                    style={{
                      display: 'inline-block',
                      marginTop: '20px',
                      background: '#d4a359',
                      color: '#120b06',
                      fontWeight: 700,
                      padding: '10px 20px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontSize: '0.86rem',
                    }}
                  >
                    View in Customer Hub →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
