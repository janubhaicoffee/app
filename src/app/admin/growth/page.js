'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Users,
  Target,
  GitPullRequest,
  CheckSquare,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Share2,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import StaffGuard from '@/components/StaffGuard';
import './growth.css';

export default function GrowthDashboard() {
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'rsvps' | 'priorities' | 'pipeline' | 'tracker'
  const [loading, setLoading] = useState(false);

  // Events State
  const [events, setEvents] = useState([]);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEventForm, setNewEventForm] = useState({
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

  // Pipeline & Priorities State
  const [priorities, setPriorities] = useState([]);
  const [pipeline, setPipeline] = useState([]);

  const [newPriorityForm, setNewPriorityForm] = useState({
    priority_number: 1,
    priority_title: '',
    objective: '',
    key_actions: '',
    success_measure: '',
    target_date: '',
  });

  const [newOpportunityForm, setNewOpportunityForm] = useState({
    title: '',
    type: 'Partnership',
    potential_impact: 'High',
    next_step: '',
    owner: '',
    status: 'New',
    notes: '',
  });

  // Follow-through checklist state
  const [followThroughChecklist, setFollowThroughChecklist] = useState({
    commit: true,
    communicate: true,
    execute: true,
    follow_up: false,
    measure: false,
    improve: false,
  });

  useEffect(() => {
    fetchGrowthData();
  }, []);

  const fetchGrowthData = async () => {
    setLoading(true);
    try {
      const [eventsRes, pipeRes] = await Promise.all([
        fetch('/api/growth/events'),
        fetch('/api/growth/pipeline'),
      ]);

      const [eventsData, pipeData] = await Promise.all([
        eventsRes.json(),
        pipeRes.json(),
      ]);

      if (eventsData.success) setEvents(eventsData.data || []);
      if (pipeData.success) {
        setPriorities(pipeData.priorities || []);
        setPipeline(pipeData.pipeline || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create or Update Event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isEdit = Boolean(editingEvent?.id);
      const url = '/api/growth/events';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? editingEvent : newEventForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? 'Event updated!' : 'New event published!');
        setShowNewEventModal(false);
        setEditingEvent(null);
        setNewEventForm({
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
          host_name: 'Growth & Strategy Team',
          is_featured: true,
        });
        fetchGrowthData();
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
        fetchGrowthData();
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
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/growth/events?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Event removed');
        fetchGrowthData();
      }
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  // Submit Strategic Priority
  const handleAddPriority = async (e) => {
    e.preventDefault();
    if (!newPriorityForm.priority_title) return;
    try {
      const res = await fetch('/api/growth/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'priority',
          ...newPriorityForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Strategic priority added!');
        setNewPriorityForm({
          priority_number: priorities.length + 1,
          priority_title: '',
          objective: '',
          key_actions: '',
          success_measure: '',
          target_date: '',
        });
        fetchGrowthData();
      }
    } catch (err) {
      toast.error('Failed to add priority');
    }
  };

  // Submit Opportunity
  const handleAddOpportunity = async (e) => {
    e.preventDefault();
    if (!newOpportunityForm.title) return;
    try {
      const res = await fetch('/api/growth/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'opportunity',
          ...newOpportunityForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Opportunity logged in pipeline!');
        setNewOpportunityForm({
          title: '',
          type: 'Partnership',
          potential_impact: 'High',
          next_step: '',
          owner: '',
          status: 'New',
          notes: '',
        });
        fetchGrowthData();
      }
    } catch (err) {
      toast.error('Failed to add opportunity');
    }
  };

  return (
    <StaffGuard
      allowedRoles={['growth', 'brand_leader', 'operations_head', 'operations', 'superadmin', 'owner']}
      title="Brand & Growth Leader Hub"
    >
      <div className="growth-dashboard-container">
      {/* 1. Header Card */}
      <motion.div
        className="growth-header-card"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="growth-brand-title">
            <Sparkles size={30} color="#d4a359" />
            <span>Brand, Growth & Business Development Hub</span>
            <span className="growth-badge">Growth & Strategy</span>
          </div>
          <p style={{ color: '#a89f91', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Bring ideas · Create opportunities · Build the brand · Drive revenue.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setShowNewEventModal(true)}
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
            style={{
              background: 'rgba(212, 163, 89, 0.15)',
              border: '1px solid rgba(212, 163, 89, 0.4)',
              color: '#f7e7ce',
              padding: '10px 16px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.86rem',
              fontWeight: 600,
            }}
          >
            Public Events Directory ↗
          </Link>
        </div>
      </motion.div>

      {/* 2. Tabs Navigation Bar */}
      <div className="growth-tabs-bar">
        <button
          className={`growth-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={16} />
          <span>Events & Activations Engine ({events.length})</span>
        </button>
        <button
          className={`growth-tab-btn ${activeTab === 'rsvps' ? 'active' : ''}`}
          onClick={() => setActiveTab('rsvps')}
        >
          <Users size={16} />
          <span>Non-Editable RSVP Rosters</span>
        </button>
        <button
          className={`growth-tab-btn ${activeTab === 'priorities' ? 'active' : ''}`}
          onClick={() => setActiveTab('priorities')}
        >
          <Target size={16} />
          <span>Top Strategic Priorities ({priorities.length})</span>
        </button>
        <button
          className={`growth-tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          <GitPullRequest size={16} />
          <span>Opportunity Pipeline ({pipeline.length})</span>
        </button>
        <button
          className={`growth-tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
        >
          <CheckSquare size={16} />
          <span>Follow-Through Tracker</span>
        </button>
      </div>

      {/* 3. TAB CONTENTS */}

      {/* TAB 1: EVENTS & ACTIVATIONS ENGINE */}
      {activeTab === 'events' && (
        <div className="growth-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
                Events, Pop-Ups & Tasting Sessions
              </h3>
              <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
                Manage experiential events, workshops, coffee masterclasses, and community gatherings.
              </p>
            </div>
          </div>

          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(212,163,89,0.3)', borderRadius: '16px' }}>
              <Calendar size={44} color="#d4a359" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
              <h4 style={{ color: '#f7e7ce', margin: '0 0 6px', fontSize: '1.1rem' }}>No Events Published Yet</h4>
              <p style={{ color: '#a89f91', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 16px' }}>
                Create your first coffee tasting session, barista masterclass, or community gathering.
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
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                + Create First Event
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {events.map((event) => (
              <div
                key={event.id}
                style={{
                  background: 'rgba(36, 24, 16, 0.7)',
                  border: '1px solid rgba(212, 163, 89, 0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span
                    style={{
                      background: 'rgba(212, 163, 89, 0.2)',
                      color: '#d4a359',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {event.event_type}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Link
                      href={`/events/${event.slug}`}
                      target="_blank"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: '#f5f0eb',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'none',
                      }}
                    >
                      <ExternalLink size={12} /> View Page
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditingEvent(event)}
                      style={{
                        background: 'rgba(212,163,89,0.2)',
                        color: '#d4a359',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event.id)}
                      style={{
                        background: 'rgba(239,68,68,0.2)',
                        color: '#f87171',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <h4 style={{ color: '#f5f0eb', margin: '0 0 6px', fontSize: '1.1rem' }}>
                  {event.title}
                </h4>
                {event.featuring_name && (
                  <p style={{ color: '#d4a359', fontSize: '0.84rem', margin: '0 0 8px', fontWeight: 600 }}>
                    Featuring: {event.featuring_name}
                  </p>
                )}

                <div style={{ fontSize: '0.8rem', color: '#a89f91', marginBottom: '14px', lineHeight: 1.4 }}>
                  📅 {event.event_date} · ⏰ {event.start_time} - {event.end_time || 'Late'}<br />
                  📍 {event.location_name}<br />
                  👥 Capacity: <strong style={{ color: '#34d399' }}>{event.rsvp_count || 0}</strong> / {event.capacity} Confirmed
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/events/${event.slug}`);
                      toast.success('Public RSVP link copied to clipboard!');
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(212,163,89,0.15)',
                      border: '1px solid rgba(212,163,89,0.3)',
                      color: '#d4a359',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Share2 size={14} /> Copy RSVP Form Link
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* TAB 2: NON-EDITABLE RSVP ROSTER */}
      {activeTab === 'rsvps' && (
        <div className="growth-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Audience & Customer RSVP Registrations (Read-Only)
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Live registration list submitted through the public event forms. Non-editable to preserve authentic guest records.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  background: 'rgba(36, 24, 16, 0.7)',
                  border: '1px solid rgba(212, 163, 89, 0.25)',
                  borderRadius: '16px',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ color: '#f5f0eb', fontSize: '1.1rem', margin: '0 0 4px' }}>
                      {event.title}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#d4a359' }}>
                      📅 {event.event_date} · Total RSVPs: {event.event_rsvps?.length || 0} / {event.capacity}
                    </span>
                  </div>
                  <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>
                    Live Synchronized
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.4)', color: '#d4a359', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Guest Name</th>
                        <th style={{ padding: '10px' }}>Email</th>
                        <th style={{ padding: '10px' }}>Phone</th>
                        <th style={{ padding: '10px' }}>Party Size</th>
                        <th style={{ padding: '10px' }}>Dietary / Notes</th>
                        <th style={{ padding: '10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.event_rsvps && event.event_rsvps.length > 0 ? (
                        event.event_rsvps.map((rsvp) => (
                          <tr key={rsvp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '10px', fontWeight: 600, color: '#f5f0eb' }}>{rsvp.customer_name}</td>
                            <td style={{ padding: '10px', color: '#a89f91' }}>{rsvp.customer_email}</td>
                            <td style={{ padding: '10px', color: '#a89f91' }}>{rsvp.customer_phone || 'N/A'}</td>
                            <td style={{ padding: '10px', color: '#d4a359', fontWeight: 700 }}>{rsvp.guest_count} Person(s)</td>
                            <td style={{ padding: '10px', color: '#e5dfd8' }}>{rsvp.notes || '—'}</td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ color: '#34d399', fontWeight: 700 }}>✓ Confirmed</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '18px', color: '#a89f91' }}>
                            No RSVPs registered yet for this event.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TOP STRATEGIC PRIORITIES */}
      {activeTab === 'priorities' && (
        <div className="growth-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Strategic Priorities Register (Brand & Growth Manual)
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Top strategic priorities for the quarter. Focus on opportunities that move the brand forward.
            </p>
          </div>

          <form onSubmit={handleAddPriority} style={{ background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: '12px', marginBottom: '24px' }}>
            <h4 style={{ color: '#d4a359', margin: '0 0 12px', fontSize: '0.95rem' }}>Add Strategic Priority</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#d4a359', marginBottom: '4px' }}>Priority Title</label>
                <input
                  type="text"
                  placeholder="e.g. Artisanal Roastery Activation"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={newPriorityForm.priority_title}
                  onChange={(e) => setNewPriorityForm({ ...newPriorityForm, priority_title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#d4a359', marginBottom: '4px' }}>Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Establish single-origin authority"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={newPriorityForm.objective}
                  onChange={(e) => setNewPriorityForm({ ...newPriorityForm, objective: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#d4a359', marginBottom: '4px' }}>Success Measure</label>
                <input
                  type="text"
                  placeholder="e.g. 500 repeat connoisseurs"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={newPriorityForm.success_measure}
                  onChange={(e) => setNewPriorityForm({ ...newPriorityForm, success_measure: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#d4a359', marginBottom: '4px' }}>Target Date</label>
                <input
                  type="date"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={newPriorityForm.target_date}
                  onChange={(e) => setNewPriorityForm({ ...newPriorityForm, target_date: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="submit"
                style={{ background: '#d4a359', color: '#120b06', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Add Priority
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {priorities.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(36, 24, 16, 0.7)',
                  border: '1px solid rgba(212, 163, 89, 0.25)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ flex: '1 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ background: '#d4a359', color: '#120b06', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                      #{idx + 1}
                    </span>
                    <strong style={{ color: '#f5f0eb', fontSize: '1rem' }}>{item.priority_title}</strong>
                  </div>
                  <p style={{ color: '#a89f91', fontSize: '0.82rem', margin: '2px 0 0' }}>
                    <strong>Objective:</strong> {item.objective} · <strong>Measure:</strong> {item.success_measure || 'TBD'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#d4a359' }}>Target: {item.target_date || 'Q3 2026'}</span>
                  <span
                    style={{
                      background: item.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                      color: item.status === 'completed' ? '#34d399' : '#fbbf24',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                    }}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: OPPORTUNITY PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="growth-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Opportunity & Partnerships Pipeline
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Track partnerships, events, B2B tie-ups, and brand collaborations.
            </p>
          </div>

          <form onSubmit={handleAddOpportunity} style={{ background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: '12px', marginBottom: '24px' }}>
            <h4 style={{ color: '#d4a359', margin: '0 0 12px', fontSize: '0.95rem' }}>Log New Opportunity / Partnership</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#d4a359', marginBottom: '4px' }}>Opportunity Name</label>
                <input
                  type="text"
                  placeholder="e.g. South Delhi Co-Working Kiosk"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={newOpportunityForm.title}
                  onChange={(e) => setNewOpportunityForm({ ...newOpportunityForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#d4a359', marginBottom: '4px' }}>Type</label>
                <select
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={newOpportunityForm.type}
                  onChange={(e) => setNewOpportunityForm({ ...newOpportunityForm, type: e.target.value })}
                >
                  <option value="Partnership">Partnership</option>
                  <option value="Event">Event</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Product">Product</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#d4a359', marginBottom: '4px' }}>Potential Impact</label>
                <select
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={newOpportunityForm.potential_impact}
                  onChange={(e) => setNewOpportunityForm({ ...newOpportunityForm, potential_impact: e.target.value })}
                >
                  <option value="High">High Impact</option>
                  <option value="Medium">Medium Impact</option>
                  <option value="Low">Low Impact</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#d4a359', marginBottom: '4px' }}>Next Step</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule call with founder"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={newOpportunityForm.next_step}
                  onChange={(e) => setNewOpportunityForm({ ...newOpportunityForm, next_step: e.target.value })}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="submit"
                style={{ background: '#d4a359', color: '#120b06', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Log Opportunity
              </button>
            </div>
          </form>

          <div className="pipeline-grid">
            {pipeline.map((item) => (
              <div key={item.id} className="pipeline-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ background: 'rgba(212,163,89,0.2)', color: '#d4a359', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                    {item.type}
                  </span>
                  <span
                    style={{
                      color: item.potential_impact === 'High' ? '#f87171' : '#fbbf24',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    ★ {item.potential_impact} Impact
                  </span>
                </div>
                <h4 style={{ color: '#f5f0eb', margin: '0 0 6px', fontSize: '1rem' }}>
                  {item.title}
                </h4>
                <p style={{ color: '#a89f91', fontSize: '0.8rem', margin: '0 0 10px', lineHeight: 1.4 }}>
                  <strong>Next Step:</strong> {item.next_step}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#e5dfd8' }}>
                  <span>Owner: {item.owner}</span>
                  <span style={{ color: item.status === 'In Progress' ? '#34d399' : '#d4a359', fontWeight: 700 }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FOLLOW-THROUGH TRACKER */}
      {activeTab === 'tracker' && (
        <div className="growth-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Follow-Through Discipline Tracker
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              &ldquo;Great leaders don&rsquo;t do everything. They focus on what creates the biggest impact and build a team that makes it happen.&rdquo;
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { key: 'commit', label: 'Commit', sub: 'Plan it right from day one.' },
              { key: 'communicate', label: 'Communicate', sub: 'Align the right people & set expectations.' },
              { key: 'execute', label: 'Execute', sub: 'Take decisive action and maintain momentum.' },
              { key: 'follow_up', label: 'Follow Up', sub: 'Check, support, remove blockers for the outlet.' },
              { key: 'measure', label: 'Measure', sub: 'Review results, attendee feedback, and ROI.' },
              { key: 'improve', label: 'Improve', sub: 'Do better next time. Kill what doesn’t work.' },
            ].map((step) => (
              <div
                key={step.key}
                onClick={() =>
                  setFollowThroughChecklist({
                    ...followThroughChecklist,
                    [step.key]: !followThroughChecklist[step.key],
                  })
                }
                style={{
                  background: followThroughChecklist[step.key] ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.3)',
                  border: followThroughChecklist[step.key] ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: followThroughChecklist[step.key] ? '#10b981' : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {followThroughChecklist[step.key] && <CheckCircle2 size={16} color="#ffffff" />}
                </div>
                <div>
                  <strong style={{ color: '#f5f0eb', fontSize: '0.95rem' }}>{step.label}</strong>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#a89f91' }}>{step.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {(showNewEventModal || editingEvent) && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ color: '#f7e7ce', margin: '0 0 16px' }}>
              {editingEvent ? 'Edit Event Details' : 'Create Brand Event & Activation'}
            </h3>
            <form onSubmit={handleSaveEvent}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Event Title *</label>
                  <input
                    type="text"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                    value={editingEvent ? editingEvent.title : newEventForm.title}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, title: e.target.value })
                        : setNewEventForm({ ...newEventForm, title: e.target.value })
                    }
                    placeholder="e.g. Chikmagalur Coffee Tasting Masterclass"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Featuring Name (Artist / Roaster)</label>
                  <input
                    type="text"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                    value={editingEvent ? editingEvent.featuring_name || '' : newEventForm.featuring_name}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, featuring_name: e.target.value })
                        : setNewEventForm({ ...newEventForm, featuring_name: e.target.value })
                    }
                    placeholder="e.g. Master Roaster & Lead Barista"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Event Type</label>
                  <select
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                    value={editingEvent ? editingEvent.event_type : newEventForm.event_type}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, event_type: e.target.value })
                        : setNewEventForm({ ...newEventForm, event_type: e.target.value })
                    }
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Tasting Session">Tasting Session</option>
                    <option value="Pop-Up">Pop-Up</option>
                    <option value="Community">Community</option>
                    <option value="Brand Activation">Brand Activation</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Event Date *</label>
                  <input
                    type="date"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                    value={editingEvent ? editingEvent.event_date : newEventForm.event_date}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, event_date: e.target.value })
                        : setNewEventForm({ ...newEventForm, event_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Start Time *</label>
                  <input
                    type="text"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                    value={editingEvent ? editingEvent.start_time : newEventForm.start_time}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, start_time: e.target.value })
                        : setNewEventForm({ ...newEventForm, start_time: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Guest Capacity</label>
                  <input
                    type="number"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                    value={editingEvent ? editingEvent.capacity : newEventForm.capacity}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, capacity: e.target.value })
                        : setNewEventForm({ ...newEventForm, capacity: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Location Venue</label>
                  <input
                    type="text"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                    value={editingEvent ? editingEvent.location_name : newEventForm.location_name}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, location_name: e.target.value })
                        : setNewEventForm({ ...newEventForm, location_name: e.target.value })
                    }
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Description & Concept</label>
                  <textarea
                    rows={3}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                    value={editingEvent ? editingEvent.description : newEventForm.description}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, description: e.target.value })
                        : setNewEventForm({ ...newEventForm, description: e.target.value })
                    }
                    placeholder="Describe the experience, tasting notes, and what attendees will learn..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
