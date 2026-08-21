'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Share2,
  CheckCircle2,
  Ticket,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StaffGuard from '@/components/StaffGuard';

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEventRsvps, setSelectedEventRsvps] = useState(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [form, setForm] = useState({
    title: '',
    featuring_name: '',
    event_type: 'Workshop',
    description: '',
    location_name: 'Janu Bhai Cafe, Gafoor Nagar, Delhi',
    event_date: '',
    start_time: '05:00 PM',
    end_time: '07:30 PM',
    capacity: 30,
    price: 0,
    banner_url: '/affogato_cup.png',
    host_name: '',
    is_featured: true,
  });

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
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!form.title || !form.event_date || !form.start_time) {
      toast.error('Please fill in title, date, and start time');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/growth/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Event published successfully!');
        setShowNewEventModal(false);
        setForm({
          title: '',
          featuring_name: '',
          event_type: 'Workshop',
          description: '',
          location_name: 'Janu Bhai Cafe, Gafoor Nagar, Delhi',
          event_date: '',
          start_time: '05:00 PM',
          end_time: '07:30 PM',
          capacity: 30,
          price: 0,
          banner_url: '/affogato_cup.png',
          host_name: '',
          is_featured: true,
        });
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to save event');
      }
    } catch (err) {
      toast.error('Network error saving event');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    setLoading(true);
    try {
      const res = await fetch('/api/growth/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEvent),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Event updated successfully!');
        setShowNewEventModal(false);
        setEditingEvent(null);
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to update event');
      }
    } catch (err) {
      toast.error('Network error updating event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Are you sure you want to cancel and delete this event?')) return;
    try {
      const res = await fetch(`/api/growth/events?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Event removed');
        fetchEvents();
      }
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const copyEventLink = (slug) => {
    const url = `${window.location.origin}/events/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Public RSVP Link copied to clipboard!');
  };

  const filteredEvents = events.filter((e) =>
    (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.featuring_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StaffGuard
      allowedRoles={['superadmin', 'owner', 'operations_head', 'operations', 'operation_manager', 'growth', 'brand_leader', 'manager', 'store_manager']}
      title="Brand Events & RSVP Engine"
    >
      <div style={{ padding: '16px 20px 60px', color: '#f5f0eb' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#f7e7ce', margin: '0 0 4px', fontFamily: 'var(--font-playfair), serif' }}>
              Events & Activations Engine
            </h1>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Create and manage coffee masterclasses, pop-ups, tasting sessions, and live attendee RSVPs.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                setEditingEvent(null);
                setShowNewEventModal(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #d4a359 0%, #b8863b 100%)',
                color: '#120b06',
                fontWeight: 700,
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={16} /> Create New Event
            </button>
            <Link
              href="/events"
              target="_blank"
              style={{
                background: 'rgba(212, 163, 89, 0.15)',
                border: '1px solid rgba(212, 163, 89, 0.3)',
                color: '#f5f0eb',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ExternalLink size={14} /> Public Events Page
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#a89f91' }} />
            <input
              type="text"
              placeholder="Search events by title or featuring artist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: '#f5f0eb',
                fontSize: '0.88rem',
              }}
            />
          </div>
          <button
            onClick={fetchEvents}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#f5f0eb',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Events Table / Cards */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#a89f91' }}>
            Loading events and RSVPs...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(212,163,89,0.3)', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
            <Calendar size={48} color="#d4a359" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <h3 style={{ color: '#f7e7ce', margin: '0 0 6px' }}>No Events Created Yet</h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto 18px' }}>
              Publish your first coffee cupping masterclass, latte art workshop, or acoustic brew session.
            </p>
            <button
              onClick={() => {
                setEditingEvent(null);
                setShowNewEventModal(true);
              }}
              style={{
                background: '#d4a359',
                color: '#120b06',
                fontWeight: 700,
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              + Create First Event
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredEvents.map((evt) => {
              const rsvpList = evt.event_rsvps || [];
              const totalGuests = rsvpList.reduce((sum, r) => sum + (r.guest_count || 1), 0);

              return (
                <div
                  key={evt.id}
                  style={{
                    background: 'linear-gradient(135deg, rgba(38,26,18,0.8) 0%, rgba(20,14,10,0.95) 100%)',
                    border: '1px solid rgba(212,163,89,0.25)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ background: 'rgba(212,163,89,0.2)', color: '#d4a359', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        {evt.event_type}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setEditingEvent(evt);
                            setShowNewEventModal(true);
                          }}
                          style={{ background: 'none', border: 'none', color: '#d4a359', cursor: 'pointer', padding: '4px' }}
                          title="Edit Event"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                          title="Delete Event"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <h3 style={{ color: '#f7e7ce', fontSize: '1.15rem', margin: '0 0 6px' }}>
                      {evt.title}
                    </h3>
                    {evt.featuring_name && (
                      <p style={{ color: '#d4a359', fontSize: '0.84rem', margin: '0 0 10px', fontWeight: 600 }}>
                        Featuring: {evt.featuring_name}
                      </p>
                    )}

                    <div style={{ fontSize: '0.82rem', color: '#a89f91', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                      <div>📅 {evt.event_date} · ⏰ {evt.start_time}</div>
                      <div>📍 {evt.location_name}</div>
                      <div>👥 {totalGuests} / {evt.capacity || 30} Confirmed Attendees</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                    <button
                      onClick={() => setSelectedEventRsvps(evt)}
                      style={{
                        flex: 1,
                        background: 'rgba(212,163,89,0.15)',
                        border: '1px solid rgba(212,163,89,0.3)',
                        color: '#f7e7ce',
                        padding: '7px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Users size={14} /> View Roster ({totalGuests})
                    </button>
                    <button
                      onClick={() => copyEventLink(evt.slug)}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#e5dfd8',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                      title="Copy Public RSVP Link"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* RSVP Roster Modal */}
        {selectedEventRsvps && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '20px',
            }}
            onClick={() => setSelectedEventRsvps(null)}
          >
            <div
              style={{
                background: '#1a100c',
                border: '1px solid rgba(212,163,89,0.4)',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '650px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ color: '#f7e7ce', margin: '0 0 4px', fontSize: '1.2rem' }}>
                    Attendee Roster: {selectedEventRsvps.title}
                  </h3>
                  <span style={{ color: '#d4a359', fontSize: '0.82rem' }}>
                    Non-Editable Live Registrations ({selectedEventRsvps.event_rsvps?.length || 0} RSVPs)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEventRsvps(null)}
                  style={{ background: 'none', border: 'none', color: '#a89f91', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {(!selectedEventRsvps.event_rsvps || selectedEventRsvps.event_rsvps.length === 0) ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#a89f91', fontSize: '0.88rem' }}>
                  No attendees have RSVP'd yet for this event.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedEventRsvps.event_rsvps.map((rsvp, idx) => (
                    <div
                      key={rsvp.id || idx}
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#f7e7ce', fontSize: '0.9rem', display: 'block' }}>
                          {rsvp.customer_name}
                        </strong>
                        <span style={{ color: '#a89f91', fontSize: '0.78rem' }}>
                          {rsvp.customer_email} {rsvp.customer_phone ? `· ${rsvp.customer_phone}` : ''}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>
                          +{rsvp.guest_count} {rsvp.guest_count === 1 ? 'Guest' : 'Guests'}
                        </span>
                        <span style={{ color: '#a89f91', fontSize: '0.72rem' }}>
                          Confirmed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create / Edit Event Modal */}
        {showNewEventModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '20px',
            }}
            onClick={() => {
              setShowNewEventModal(false);
              setEditingEvent(null);
            }}
          >
            <div
              style={{
                background: '#1b120d',
                border: '1px solid rgba(212,163,89,0.4)',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#f7e7ce', margin: 0, fontSize: '1.25rem' }}>
                  {editingEvent ? 'Edit Event Details' : 'Create New Brand Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowNewEventModal(false);
                    setEditingEvent(null);
                  }}
                  style={{ background: 'none', border: 'none', color: '#a89f91', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Event Title *</label>
                    <input
                      type="text"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#f5f0eb' }}
                      value={editingEvent ? editingEvent.title : form.title}
                      onChange={(e) =>
                        editingEvent
                          ? setEditingEvent({ ...editingEvent, title: e.target.value })
                          : setForm({ ...form, title: e.target.value })
                      }
                      placeholder="e.g. Single-Estate Coffee Tasting Masterclass"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Featuring Name</label>
                      <input
                        type="text"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#f5f0eb' }}
                        value={editingEvent ? editingEvent.featuring_name || '' : form.featuring_name}
                        onChange={(e) =>
                          editingEvent
                            ? setEditingEvent({ ...editingEvent, featuring_name: e.target.value })
                            : setForm({ ...form, featuring_name: e.target.value })
                        }
                        placeholder="e.g. Master Roaster & Lead Barista"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Event Type</label>
                      <select
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#f5f0eb' }}
                        value={editingEvent ? editingEvent.event_type : form.event_type}
                        onChange={(e) =>
                          editingEvent
                            ? setEditingEvent({ ...editingEvent, event_type: e.target.value })
                            : setForm({ ...form, event_type: e.target.value })
                        }
                      >
                        <option value="Workshop">Workshop</option>
                        <option value="Tasting Session">Tasting Session</option>
                        <option value="Community">Community Gathering</option>
                        <option value="Pop-Up">Pop-Up</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Event Date *</label>
                      <input
                        type="date"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#f5f0eb' }}
                        value={editingEvent ? editingEvent.event_date : form.event_date}
                        onChange={(e) =>
                          editingEvent
                            ? setEditingEvent({ ...editingEvent, event_date: e.target.value })
                            : setForm({ ...form, event_date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Start Time *</label>
                      <input
                        type="text"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#f5f0eb' }}
                        value={editingEvent ? editingEvent.start_time : form.start_time}
                        onChange={(e) =>
                          editingEvent
                            ? setEditingEvent({ ...editingEvent, start_time: e.target.value })
                            : setForm({ ...form, start_time: e.target.value })
                        }
                        placeholder="05:00 PM"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Capacity (Max Guests)</label>
                      <input
                        type="number"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#f5f0eb' }}
                        value={editingEvent ? editingEvent.capacity : form.capacity}
                        onChange={(e) =>
                          editingEvent
                            ? setEditingEvent({ ...editingEvent, capacity: e.target.value })
                            : setForm({ ...form, capacity: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Location Name</label>
                      <input
                        type="text"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#f5f0eb' }}
                        value={editingEvent ? editingEvent.location_name : form.location_name}
                        onChange={(e) =>
                          editingEvent
                            ? setEditingEvent({ ...editingEvent, location_name: e.target.value })
                            : setForm({ ...form, location_name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Description</label>
                    <textarea
                      rows={3}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#f5f0eb' }}
                      value={editingEvent ? editingEvent.description || '' : form.description}
                      onChange={(e) =>
                        editingEvent
                          ? setEditingEvent({ ...editingEvent, description: e.target.value })
                          : setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Share details about what attendees will experience..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewEventModal(false);
                      setEditingEvent(null);
                    }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#f5f0eb', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ background: '#d4a359', color: '#120b06', fontWeight: 700, padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                    disabled={loading}
                  >
                    {editingEvent ? 'Save Changes' : 'Publish Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </StaffGuard>
  );
}
