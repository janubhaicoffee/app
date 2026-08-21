'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Star,
  FileCheck,
  TrendingUp,
  DollarSign,
  Calendar,
  Phone,
  MessageSquare,
  Edit3,
  Trash2,
  Plus,
  Send,
  Camera,
  X,
  Building,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './operations.css';

const DEFAULT_14_AREAS = [
  { id: 'outlet_status', num: 1, name: 'Outlet Status', desc: 'Shop is open and functioning normally. All key systems are working.', status: 'ok', notes: '' },
  { id: 'manager_checks', num: 2, name: 'Manager', desc: 'Manager is doing checks, leading the team and reporting on time.', status: 'ok', notes: '' },
  { id: 'staff_discipline', num: 3, name: 'Staff', desc: 'Attendance, hygiene, discipline, uniform, grooming and customer handling.', status: 'ok', notes: '' },
  { id: 'food_menu', num: 4, name: 'Food & Menu', desc: 'All required ingredients and menu items are available.', status: 'ok', notes: '' },
  { id: 'quality_hygiene', num: 5, name: 'Quality & Hygiene', desc: 'Kitchen, machines, fridge/freezer, cleanliness and hygiene standards.', status: 'ok', notes: '' },
  { id: 'cash_sales', num: 6, name: 'Cash & Sales', desc: 'Registers checked. Sales recorded. Discrepancies identified.', status: 'ok', notes: '' },
  { id: 'staff_consumption_wastage', num: 7, name: 'Staff Consumption / Wastage', desc: 'Staff consumption and wastage recorded and within limits.', status: 'ok', notes: '' },
  { id: 'maintenance_repairs', num: 8, name: 'Maintenance', desc: 'Shop, electricity, leakage, equipment and repairs - all working fine.', status: 'ok', notes: '' },
  { id: 'vendors_work', num: 9, name: 'Vendors', desc: 'Approved vendors. Work completed. Payments and receipts in place.', status: 'ok', notes: '' },
  { id: 'compliance_licenses', num: 10, name: 'Compliance', desc: 'FSSAI, GST, required documents and displays are in place.', status: 'ok', notes: '' },
  { id: 'customer_experience', num: 11, name: 'Customer Experience', desc: 'Service, speed, music, ambience. Complaints are handled.', status: 'ok', notes: '' },
  { id: 'marketing_support', num: 12, name: 'Marketing Support', desc: 'Useful photos/videos captured when required.', status: 'ok', notes: '' },
  { id: 'pending_issues', num: 13, name: 'Pending Issues', desc: 'Open issues identified and follow-up assigned.', status: 'ok', notes: '' },
  { id: 'growth_opportunity', num: 14, name: 'Growth Opportunity', desc: 'Anything worth improving, optimising or scaling.', status: 'ok', notes: '' },
];

export default function OperationsHeadDashboard() {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'audit' | 'manager_review' | 'expenses' | 'monthly' | 'events'
  const [loading, setLoading] = useState(false);

  // Observations from managers
  const [observations, setObservations] = useState([]);
  const [selectedPhotoProof, setSelectedPhotoProof] = useState(null);
  const [ohReviewNotesMap, setOhReviewNotesMap] = useState({});

  // 14 Areas Audit State
  const [auditAreas, setAuditAreas] = useState(DEFAULT_14_AREAS);
  const [auditHistory, setAuditHistory] = useState([]);

  // Manager Coordination & 5-Pillar Review State
  const [managerReviews, setManagerReviews] = useState([]);
  const [newReviewForm, setNewReviewForm] = useState({
    manager_name: '',
    daily_updates_received: true,
    prompt_whatsapp_response: true,
    problems_escalated_on_time: true,
    follows_instructions: true,
    comments_notes: '',
    rating_leadership: 5,
    rating_operations: 5,
    rating_team_management: 5,
    rating_sales_targets: 5,
    rating_quality_service: 5,
    overall_performance_comments: '',
  });

  // Expenses State
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({ totalPaid: 0, totalPending: 0, totalMonth: 0 });
  const [newExpenseForm, setNewExpenseForm] = useState({
    category: 'Electricity Bill',
    description: '',
    vendor: 'BSES Rajdhani',
    amount: '',
    payment_status: 'Pending',
    notes: '',
  });

  // Monthly Review State
  const [monthlyReviews, setMonthlyReviews] = useState([]);
  const [monthlyForm, setMonthlyForm] = useState({
    month_year: 'August 2026',
    total_sales: 345000,
    avg_daily_sales: 11500,
    total_transactions: 1240,
    top_selling_item: 'Classic Chikmagalur Espresso Single',
    customer_feedback_rating: 4.9,
    total_expenses: 128000,
    net_result: 217000,
    what_went_well: 'Strong cold brew demand during weekend afternoons, zero equipment downtime.',
    challenges: 'Minor sink drainage flow delay during peak rush hour.',
    key_learnings: 'Stocking extra single-estate beans on Fridays prevents stockout.',
  });

  // Events State (Editable by Operations Head)
  const [eventsList, setEventsList] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [obsRes, audRes, revRes, expRes, monRes, eveRes] = await Promise.all([
        fetch('/api/manager/observations'),
        fetch('/api/operations/audits'),
        fetch('/api/operations/manager-reviews'),
        fetch('/api/operations/expenses'),
        fetch('/api/operations/monthly-reviews'),
        fetch('/api/growth/events'),
      ]);

      const [obsData, audData, revData, expData, monData, eveData] = await Promise.all([
        obsRes.json(),
        audRes.json(),
        revRes.json(),
        expRes.json(),
        monRes.json(),
        eveRes.json(),
      ]);

      if (obsData.success) setObservations(obsData.data || []);
      if (audData.success) setAuditHistory(audData.data || []);
      if (revData.success) setManagerReviews(revData.data || []);
      if (expData.success) {
        setExpenses(expData.data || []);
        if (expData.summary) setExpenseSummary(expData.summary);
      }
      if (monData.success) setMonthlyReviews(monData.data || []);
      if (eveData.success) setEventsList(eveData.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Submit Operations Head 14-Area Audit
  const handleSubmitAudit = async () => {
    setLoading(true);
    try {
      const okCount = auditAreas.filter((a) => a.status === 'ok').length;
      const rating = Math.round((okCount / auditAreas.length) * 100);

      const res = await fetch('/api/operations/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist_14_areas: auditAreas,
          overall_rating: rating,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('14-Area Operations Control Audit saved!');
        fetchAllData();
      } else {
        toast.error(data.error || 'Failed to submit audit');
      }
    } catch (e) {
      toast.error('Network error submitting audit');
    } finally {
      setLoading(false);
    }
  };

  // Submit Manager Coordination & Performance Review
  const handleSubmitManagerReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/operations/manager-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReviewForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Manager 5-Pillar Performance Review logged!');
        fetchAllData();
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (e) {
      toast.error('Network error submitting review');
    } finally {
      setLoading(false);
    }
  };

  // Submit Operational Expense
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!newExpenseForm.category || !newExpenseForm.amount) {
      toast.error('Category and amount required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/operations/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpenseForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Operational expense recorded!');
        setNewExpenseForm({
          category: 'Electricity Bill',
          description: '',
          vendor: '',
          amount: '',
          payment_status: 'Pending',
          notes: '',
        });
        fetchAllData();
      } else {
        toast.error(data.error || 'Failed to save expense');
      }
    } catch (e) {
      toast.error('Failed to submit expense');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Expense Status
  const handleToggleExpenseStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    try {
      const res = await fetch('/api/operations/expenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Expense marked as ${nextStatus.toUpperCase()}`);
        fetchAllData();
      }
    } catch (e) {
      toast.error('Failed to update expense');
    }
  };

  // Submit Monthly Operations Review
  const handleSubmitMonthly = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/operations/monthly-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(monthlyForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Monthly Operations Review saved!');
        fetchAllData();
      } else {
        toast.error(data.error || 'Failed to save review');
      }
    } catch (e) {
      toast.error('Failed to submit monthly review');
    } finally {
      setLoading(false);
    }
  };

  // Operations Head Event Editing
  const handleSaveEventEdit = async (e) => {
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
        toast.success('Event updated successfully by Operations Head!');
        setEditingEvent(null);
        fetchAllData();
      } else {
        toast.error(data.error || 'Failed to update event');
      }
    } catch (e) {
      toast.error('Network error updating event');
    } finally {
      setLoading(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/growth/events?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Event deleted');
        fetchAllData();
      }
    } catch (e) {
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="operations-dashboard-container">
      {/* 1. Header Card */}
      <motion.div
        className="operations-header-card"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="operations-brand-title">
            <ShieldCheck size={32} color="#d4a359" />
            <span>Operations Head · Control Book</span>
            <span className="operations-head-badge">Operations Command</span>
          </div>
          <p style={{ color: '#a89f91', fontSize: '0.9rem', margin: '4px 0 0' }}>
            One standard. Every outlet. Every day. Quality · Consistency · Discipline.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchAllData}
            style={{
              background: 'rgba(212, 163, 89, 0.15)',
              border: '1px solid rgba(212, 163, 89, 0.3)',
              color: '#f5f0eb',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={14} /> Refresh Stream
          </button>
          <Link
            href="/admin/growth"
            style={{
              background: 'linear-gradient(135deg, #d4a359 0%, #b8863b 100%)',
              color: '#120b06',
              padding: '10px 18px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.86rem',
              fontWeight: 700,
            }}
          >
            Growth & Strategy Hub →
          </Link>
        </div>
      </motion.div>

      {/* 2. KPI Overview */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Audited Checklists</div>
          <div className="kpi-value">{observations.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Monthly Expenses (₹)</div>
          <div className="kpi-value" style={{ color: '#fbbf24' }}>
            ₹{expenseSummary.totalMonth.toLocaleString()}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Active Events</div>
          <div className="kpi-value" style={{ color: '#34d399' }}>
            {eventsList.length}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Manager Compliance</div>
          <div className="kpi-value" style={{ color: '#d4a359' }}>
            98.4%
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="operations-tabs-bar">
        <button
          className={`operations-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <Camera size={16} />
          <span>Manager Submissions & Photo Proofs ({observations.length})</span>
        </button>
        <button
          className={`operations-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <FileCheck size={16} />
          <span>14-Area Operations Control Checklist</span>
        </button>
        <button
          className={`operations-tab-btn ${activeTab === 'manager_review' ? 'active' : ''}`}
          onClick={() => setActiveTab('manager_review')}
        >
          <Star size={16} />
          <span>Manager Coordination & 5-Pillar Rating</span>
        </button>
        <button
          className={`operations-tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <DollarSign size={16} />
          <span>Expenses & Vendor Control (₹{expenseSummary.totalPending} Pending)</span>
        </button>
        <button
          className={`operations-tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          <TrendingUp size={16} />
          <span>Monthly Operations Review</span>
        </button>
        <button
          className={`operations-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={16} />
          <span>Events & Logistics (Full Edit Power)</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: MANAGER SUBMISSIONS & PHOTO PROOF FEED */}
      {activeTab === 'feed' && (
        <div className="operations-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Real-Time Store Observations & Photo Proof Inspector
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Thoroughly digested AI observations, handwritten checklist logs, and original unmodified photo proofs submitted by outlet managers.
            </p>
          </div>

          {observations.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#a89f91', background: 'rgba(0,0,0,0.3)', borderRadius: '14px' }}>
              No manager checklists submitted today yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {observations.map((obs) => (
                <div
                  key={obs.id}
                  style={{
                    background: 'rgba(36, 24, 16, 0.7)',
                    border: '1px solid rgba(212, 163, 89, 0.25)',
                    borderRadius: '16px',
                    padding: '24px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                    <div>
                      <h4 style={{ color: '#f5f0eb', fontSize: '1.15rem', margin: '0 0 4px' }}>
                        {obs.outlet_name} · Observation Audit
                      </h4>
                      <span style={{ fontSize: '0.82rem', color: '#a89f91' }}>
                        Submitted by: <strong style={{ color: '#d4a359' }}>{obs.manager_name}</strong> · {obs.observation_date} {obs.observation_time}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '100px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background:
                            obs.overall_score >= 90
                              ? 'rgba(16,185,129,0.2)'
                              : obs.overall_score >= 75
                              ? 'rgba(245,158,11,0.2)'
                              : 'rgba(239,68,68,0.2)',
                          color:
                            obs.overall_score >= 90
                              ? '#34d399'
                              : obs.overall_score >= 75
                              ? '#fbbf24'
                              : '#f87171',
                          border: '1px solid currentColor',
                        }}
                      >
                        Score: {obs.overall_score}%
                      </span>

                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background:
                            obs.priority === 'high'
                              ? 'rgba(239,68,68,0.25)'
                              : obs.priority === 'medium'
                              ? 'rgba(245,158,11,0.25)'
                              : 'rgba(16,185,129,0.25)',
                          color:
                            obs.priority === 'high'
                              ? '#f87171'
                              : obs.priority === 'medium'
                              ? '#fbbf24'
                              : '#34d399',
                        }}
                      >
                        {obs.priority} Priority
                      </span>
                    </div>
                  </div>

                  {/* Scanned Register Image + Attached Photos Strip */}
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', margin: '16px 0', alignItems: 'center' }}>
                    {obs.scanned_image_url && (
                      <div
                        onClick={() => setSelectedPhotoProof(obs.scanned_image_url)}
                        style={{
                          cursor: 'pointer',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid #d4a359',
                          borderRadius: '10px',
                          padding: '8px',
                          width: '130px',
                        }}
                      >
                        <div style={{ position: 'relative', width: '100%', height: '80px', borderRadius: '6px', overflow: 'hidden' }}>
                          <Image src={obs.scanned_image_url} alt="Paper Register" fill style={{ objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#d4a359', display: 'block', textAlign: 'center', marginTop: '4px', fontWeight: 600 }}>
                          🔍 Paper Register Log
                        </span>
                      </div>
                    )}

                    {obs.observation_photos &&
                      obs.observation_photos.map((photo) => (
                        <div
                          key={photo.id}
                          onClick={() => setSelectedPhotoProof(photo.photo_url)}
                          style={{
                            cursor: 'pointer',
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '10px',
                            padding: '8px',
                            width: '130px',
                          }}
                        >
                          <div style={{ position: 'relative', width: '100%', height: '80px', borderRadius: '6px', overflow: 'hidden' }}>
                            <Image src={photo.photo_url} alt="Defect Proof" fill style={{ objectFit: 'cover' }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#f87171', display: 'block', textAlign: 'center', marginTop: '4px', fontWeight: 700 }}>
                            📸 Defect Proof
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* 13 Checkpoints Pill Matrix */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px', marginTop: '12px' }}>
                    {obs.checklist_items &&
                      obs.checklist_items.map((cp) => (
                        <div
                          key={cp.id}
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border:
                              cp.status === 'not_ok'
                                ? '1px solid rgba(239,68,68,0.5)'
                                : cp.status === 'needs_attention'
                                ? '1px solid rgba(245,158,11,0.5)'
                                : '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <span style={{ color: '#e5dfd8' }}>{cp.name}</span>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              color:
                                cp.status === 'ok'
                                ? '#34d399'
                                : cp.status === 'needs_attention'
                                ? '#fbbf24'
                                : '#f87171',
                            }}
                          >
                            {cp.status === 'ok' ? '✓ OK' : cp.status === 'needs_attention' ? '⚠ Attention' : '✕ Not OK'}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Operations Head Verification Box */}
                  <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#a89f91' }}>
                      Status: {obs.reviewed_by_oh ? <strong style={{ color: '#34d399' }}>✓ Verified by Operations Head</strong> : <span style={{ color: '#fbbf24' }}>Pending OH Review</span>}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Add OH instructions / note..."
                        value={ohReviewNotesMap[obs.id] || ''}
                        onChange={(e) => setOhReviewNotesMap({ ...ohReviewNotesMap, [obs.id]: e.target.value })}
                        style={{
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          color: '#f5f0eb',
                          fontSize: '0.8rem',
                          width: '240px',
                        }}
                      />
                      <button
                        onClick={async () => {
                          const note = ohReviewNotesMap[obs.id] || 'Verified and approved by Operations Head';
                          await fetch('/api/operations/audits', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              observation_id_reviewed: obs.id,
                              oh_review_notes: note,
                            }),
                          });
                          toast.success('Observation marked verified by Operations Head!');
                          fetchAllData();
                        }}
                        style={{
                          background: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Mark Verified
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 14-AREA OPERATIONS CONTROL AUDIT */}
      {activeTab === 'audit' && (
        <div className="operations-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Operations Control Checklist (14 Core Areas)
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Review daily during visit or remotely. Mark honestly. Convert &ldquo;Action Required&rdquo; into a task and close it.
            </p>
          </div>

          <div style={{ margin: '20px 0' }}>
            {auditAreas.map((area) => (
              <div
                key={area.id}
                className={`audit-area-row ${
                  area.status === 'needs_attention'
                    ? 'attention'
                    : area.status === 'action_required'
                    ? 'action-required'
                    : ''
                }`}
              >
                <div style={{ flex: '1 1 300px' }}>
                  <strong style={{ color: '#f5f0eb', fontSize: '0.95rem' }}>
                    #{area.num}. {area.name}
                  </strong>
                  <p style={{ color: '#a89f91', fontSize: '0.8rem', margin: '2px 0 0' }}>
                    {area.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setAuditAreas((prev) =>
                        prev.map((a) => (a.id === area.id ? { ...a, status: 'ok' } : a))
                      )
                    }
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      background: area.status === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(0,0,0,0.3)',
                      color: area.status === 'ok' ? '#34d399' : '#a89f91',
                      borderColor: area.status === 'ok' ? '#10b981' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    ✓ OK (All Good)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAuditAreas((prev) =>
                        prev.map((a) => (a.id === area.id ? { ...a, status: 'needs_attention' } : a))
                      )
                    }
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      background: area.status === 'needs_attention' ? 'rgba(245,158,11,0.3)' : 'rgba(0,0,0,0.3)',
                      color: area.status === 'needs_attention' ? '#fbbf24' : '#a89f91',
                      borderColor: area.status === 'needs_attention' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    ⚠ Attention (Needs Check)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAuditAreas((prev) =>
                        prev.map((a) => (a.id === area.id ? { ...a, status: 'action_required' } : a))
                      )
                    }
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      background: area.status === 'action_required' ? 'rgba(239,68,68,0.3)' : 'rgba(0,0,0,0.3)',
                      color: area.status === 'action_required' ? '#f87171' : '#a89f91',
                      borderColor: area.status === 'action_required' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    ✕ Action Required
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Remarks / Action Taken..."
                  value={area.notes || ''}
                  onChange={(e) =>
                    setAuditAreas((prev) =>
                      prev.map((a) => (a.id === area.id ? { ...a, notes: e.target.value } : a))
                    )
                  }
                  style={{
                    flex: '1 1 200px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#f5f0eb',
                    fontSize: '0.82rem',
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              onClick={handleSubmitAudit}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #d4a359 0%, #b8863b 100%)',
                color: '#120b06',
                fontWeight: 700,
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Save 14-Area Operations Audit</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGER COORDINATION & 5-PILLAR PERFORMANCE REVIEW */}
      {activeTab === 'manager_review' && (
        <div className="operations-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Manager Coordination & Performance Review
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Guide the manager today, the outlet will perform better tomorrow. 5-Pillar leadership evaluation.
            </p>
          </div>

          <form onSubmit={handleSubmitManagerReview}>
            {/* 1. Communication Checks */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', marginBottom: '24px' }}>
              <h4 style={{ color: '#d4a359', margin: '0 0 14px', fontSize: '1rem' }}>
                1. Communication with Manager
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#e5dfd8' }}>
                  <input
                    type="checkbox"
                    checked={newReviewForm.daily_updates_received}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, daily_updates_received: e.target.checked })}
                  />
                  Daily updates received on time
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#e5dfd8' }}>
                  <input
                    type="checkbox"
                    checked={newReviewForm.prompt_whatsapp_response}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, prompt_whatsapp_response: e.target.checked })}
                  />
                  Prompt response on WhatsApp / Calls
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#e5dfd8' }}>
                  <input
                    type="checkbox"
                    checked={newReviewForm.problems_escalated_on_time}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, problems_escalated_on_time: e.target.checked })}
                  />
                  Problems & issues escalated on time
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#e5dfd8' }}>
                  <input
                    type="checkbox"
                    checked={newReviewForm.follows_instructions}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, follows_instructions: e.target.checked })}
                  />
                  Follows instructions & action points
                </label>
              </div>
            </div>

            {/* 2. 5-Pillar Star Rating */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', marginBottom: '24px' }}>
              <h4 style={{ color: '#d4a359', margin: '0 0 14px', fontSize: '1rem' }}>
                2. Manager Performance Rating (1 to 5 Stars)
              </h4>

              {[
                { key: 'rating_leadership', label: 'Leadership & Ownership', sub: 'Takes responsibility and leads the team' },
                { key: 'rating_operations', label: 'Operations Control', sub: 'Manages daily operations smoothly' },
                { key: 'rating_team_management', label: 'Team Management', sub: 'Handles staff, builds discipline & motivation' },
                { key: 'rating_sales_targets', label: 'Sales & Targets', sub: 'Focus on sales growth and meets targets' },
                { key: 'rating_quality_service', label: 'Quality & Customer Service', sub: 'Maintains quality and ensures customer satisfaction' },
              ].map((item) => (
                <div key={item.key} className="star-rating-row">
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#f5f0eb' }}>{item.label}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#a89f91', display: 'block' }}>{item.sub}</span>
                  </div>
                  <div className="stars-group">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        className="star-btn"
                        onClick={() => setNewReviewForm({ ...newReviewForm, [item.key]: starVal })}
                      >
                        <Star
                          size={20}
                          fill={starVal <= newReviewForm[item.key] ? '#d4a359' : 'none'}
                          color={starVal <= newReviewForm[item.key] ? '#d4a359' : '#666'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Comments */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', color: '#d4a359', fontWeight: 600, marginBottom: '6px' }}>
                Overall Performance Comments & Action Directives for Manager:
              </label>
              <textarea
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#f5f0eb',
                  fontSize: '0.88rem',
                }}
                placeholder="Commend leadership on rush hours, ensure packaging box restocking happens before 4 PM..."
                value={newReviewForm.overall_performance_comments}
                onChange={(e) => setNewReviewForm({ ...newReviewForm, overall_performance_comments: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #d4a359 0%, #b8863b 100%)',
                  color: '#120b06',
                  fontWeight: 700,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                disabled={loading}
              >
                <Star size={16} />
                <span>Submit 5-Pillar Manager Review</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: EXPENSES & VENDOR CONTROL */}
      {activeTab === 'expenses' && (
        <div className="operations-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Operational Expenses & Vendor Control
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Track. Verify. Control. Save. Make payments only if approved by Operations Head and keep proof for every payment.
            </p>
          </div>

          {/* New Expense Form */}
          <form onSubmit={handleCreateExpense} style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', marginBottom: '28px' }}>
            <h4 style={{ color: '#d4a359', margin: '0 0 14px', fontSize: '1rem' }}>
              Log Store Expense / Vendor Payment Request
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Expense Category *</label>
                <select
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={newExpenseForm.category}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, category: e.target.value })}
                >
                  {[
                    'Rent',
                    'Electricity Bill',
                    'Maintenance / Repair',
                    'Water / Municipal Charges',
                    'Raw Material / Supplies',
                    'Packaging / Disposables',
                    'Marketing / Promotional',
                    'Internet / DTH / Software',
                    'Compliance / License Renewal',
                    'Transport / Delivery',
                    'Staff Related Expenses',
                    'Other Expenses',
                  ].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Vendor / Service Provider</label>
                <input
                  type="text"
                  placeholder="e.g. BSES / Milk Vendor"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={newExpenseForm.vendor}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, vendor: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="0"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={newExpenseForm.amount}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Payment Status</label>
                <select
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={newExpenseForm.payment_status}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, payment_status: e.target.value })}
                >
                  <option value="Pending">Pending Approval</option>
                  <option value="Paid">Paid & Settled</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #d4a359 0%, #b8863b 100%)',
                  color: '#120b06',
                  fontWeight: 700,
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={16} /> Save Expense Record
              </button>
            </div>
          </form>

          {/* Expenses Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.4)', color: '#d4a359', textAlign: 'left', fontSize: '0.8rem' }}>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Type of Expense</th>
                  <th style={{ padding: '12px' }}>Vendor / Provider</th>
                  <th style={{ padding: '12px' }}>Amount (₹)</th>
                  <th style={{ padding: '12px' }}>Payment Status</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#a89f91' }}>
                      No expenses logged yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.86rem' }}>
                      <td style={{ padding: '12px' }}>{exp.expense_date || exp.created_at?.split('T')[0]}</td>
                      <td style={{ padding: '12px' }}><strong>{exp.category}</strong></td>
                      <td style={{ padding: '12px' }}>{exp.vendor || 'N/A'}</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#f5f0eb' }}>₹{Number(exp.amount).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleExpenseStatus(exp.id, exp.status)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: exp.status === 'paid' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                            color: exp.status === 'paid' ? '#34d399' : '#fbbf24',
                          }}
                        >
                          {exp.status === 'paid' ? '✓ PAID' : '⏳ PENDING'}
                        </button>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 600 }}>
                          Verified by Operations Head
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: MONTHLY OPERATIONS REVIEW */}
      {activeTab === 'monthly' && (
        <div className="operations-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Business Growth & Monthly Operations Review
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Review monthly performance, note key learnings, and plan improvements. Review. Improve. Grow. Repeat.
            </p>
          </div>

          <form onSubmit={handleSubmitMonthly}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Review Month</label>
                <input
                  type="text"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={monthlyForm.month_year}
                  onChange={(e) => setMonthlyForm({ ...monthlyForm, month_year: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Total Sales (₹)</label>
                <input
                  type="number"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={monthlyForm.total_sales}
                  onChange={(e) => setMonthlyForm({ ...monthlyForm, total_sales: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Total Expenses (₹)</label>
                <input
                  type="number"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={monthlyForm.total_expenses}
                  onChange={(e) => setMonthlyForm({ ...monthlyForm, total_expenses: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Top Selling Item</label>
                <input
                  type="text"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                  value={monthlyForm.top_selling_item}
                  onChange={(e) => setMonthlyForm({ ...monthlyForm, top_selling_item: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>What went well?</label>
                <textarea
                  rows={3}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#f5f0eb', fontSize: '0.85rem' }}
                  value={monthlyForm.what_went_well}
                  onChange={(e) => setMonthlyForm({ ...monthlyForm, what_went_well: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#f87171', fontWeight: 600, marginBottom: '4px' }}>What challenges did we face?</label>
                <textarea
                  rows={3}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#f5f0eb', fontSize: '0.85rem' }}
                  value={monthlyForm.challenges}
                  onChange={(e) => setMonthlyForm({ ...monthlyForm, challenges: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #d4a359 0%, #b8863b 100%)',
                  color: '#120b06',
                  fontWeight: 700,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <TrendingUp size={16} /> Save Monthly Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: EVENTS MANAGER (EDIT POWER FOR OPERATIONS HEAD) */}
      {activeTab === 'events' && (
        <div className="operations-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
                Events Logistics & Brand Activations (Operations Head Edit Power)
              </h3>
              <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
                Operations Head has full editing control over timing, venue setup, barista allocation, and capacity limits.
              </p>
            </div>
            <span className="operations-head-badge">Full Edit Permissions</span>
          </div>

          {eventsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(212,163,89,0.3)', borderRadius: '16px' }}>
              <Calendar size={40} color="#d4a359" style={{ margin: '0 auto 10px', opacity: 0.6 }} />
              <h4 style={{ color: '#f7e7ce', margin: '0 0 4px', fontSize: '1.05rem' }}>No Active Events Found</h4>
              <p style={{ color: '#a89f91', fontSize: '0.84rem', margin: 0 }}>
                When Brand & Growth schedules coffee tastings or workshops, they will appear here with full operational edit controls.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {eventsList.map((event) => (
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Edit3 size={12} /> Edit
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
                  <p style={{ color: '#d4a359', fontSize: '0.82rem', margin: '0 0 8px', fontWeight: 600 }}>
                    Featuring: {event.featuring_name}
                  </p>
                )}

                <div style={{ fontSize: '0.8rem', color: '#a89f91', marginBottom: '12px' }}>
                  📅 {event.event_date} · ⏰ {event.start_time} - {event.end_time || 'Late'}<br />
                  📍 {event.location_name}<br />
                  👥 Capacity: {event.rsvp_count || 0} / {event.capacity} RSVPs
                </div>

                {/* RSVP Roster (Non-editable view) */}
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#d4a359', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    Confirmed Guest Roster ({event.event_rsvps?.length || 0}):
                  </span>
                  {event.event_rsvps && event.event_rsvps.length > 0 ? (
                    <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      {event.event_rsvps.map((rsvp) => (
                        <div key={rsvp.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#e5dfd8', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span>{rsvp.customer_name} ({rsvp.guest_count} guests)</span>
                          <span style={{ color: '#34d399' }}>{rsvp.customer_phone || 'Confirmed'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#a89f91' }}>No RSVPs yet.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Edit Event Modal */}
          {editingEvent && (
            <div className="modal-backdrop">
              <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: '#f7e7ce', margin: 0 }}>Edit Event (Operations Head)</h3>
                  <button onClick={() => setEditingEvent(null)} style={{ background: 'none', border: 'none', color: '#a89f91', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveEventEdit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Event Title</label>
                      <input
                        type="text"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                        value={editingEvent.title}
                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Featuring Name</label>
                      <input
                        type="text"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                        value={editingEvent.featuring_name || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, featuring_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Event Type</label>
                      <select
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                        value={editingEvent.event_type}
                        onChange={(e) => setEditingEvent({ ...editingEvent, event_type: e.target.value })}
                      >
                        <option value="Workshop">Workshop</option>
                        <option value="Tasting Session">Tasting Session</option>
                        <option value="Pop-Up">Pop-Up</option>
                        <option value="Community">Community</option>
                        <option value="Brand Activation">Brand Activation</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Event Date</label>
                      <input
                        type="date"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                        value={editingEvent.event_date}
                        onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Start Time</label>
                      <input
                        type="text"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                        value={editingEvent.start_time}
                        onChange={(e) => setEditingEvent({ ...editingEvent, start_time: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Capacity (Seats)</label>
                      <input
                        type="number"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                        value={editingEvent.capacity}
                        onChange={(e) => setEditingEvent({ ...editingEvent, capacity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Location / Venue</label>
                      <input
                        type="text"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                        value={editingEvent.location_name}
                        onChange={(e) => setEditingEvent({ ...editingEvent, location_name: e.target.value })}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>Description / Logistics Notes</label>
                      <textarea
                        rows={3}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f5f0eb' }}
                        value={editingEvent.description}
                        onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#f5f0eb', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ background: '#d4a359', color: '#120b06', fontWeight: 700, padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* High-Resolution Photo Zoom Modal */}
      {selectedPhotoProof && (
        <div className="modal-backdrop" onClick={() => setSelectedPhotoProof(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ color: '#f7e7ce', margin: 0 }}>High-Resolution Photo Proof Inspector</h4>
              <button onClick={() => setSelectedPhotoProof(null)} style={{ background: 'none', border: 'none', color: '#a89f91', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', height: '520px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(212,163,89,0.4)' }}>
              <Image src={selectedPhotoProof} alt="Full Proof" fill style={{ objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
