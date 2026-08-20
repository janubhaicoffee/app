'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Store,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';

export default function AdminChecklists() {
  const [checklists, setChecklists] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedType, setSelectedType] = useState('opening');
  const [activeItems, setActiveItems] = useState([]);
  const [completedBy, setCompletedBy] = useState('Shift Supervisor');
  const [verifiedBy, setVerifiedBy] = useState('Operations Manager');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (templates[selectedType]) {
      // Check if existing checklist matches selected outlet, date, and type
      const existing = checklists.find(
        (c) => c.outlet_id === selectedOutlet && c.date === selectedDate && c.checklist_type === selectedType
      );
      if (existing && Array.isArray(existing.items)) {
        setActiveItems(existing.items);
        setCompletedBy(existing.completed_by || 'Staff');
        setVerifiedBy(existing.verified_by || 'Operations Manager');
        setNotes(existing.notes || '');
      } else {
        // Load default template
        setActiveItems(templates[selectedType].map((item) => ({ ...item, checked: false })));
        setNotes('');
      }
    }
  }, [selectedOutlet, selectedDate, selectedType, templates, checklists]);

  async function loadInitial() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const [chkRes, outletsRes] = await Promise.all([
        fetch('/api/outlet/checklists', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/admin/outlets', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (chkRes.ok) {
        const json = await chkRes.json();
        setChecklists(json.data || []);
        setTemplates(json.templates || {});
      }

      if (outletsRes.ok) {
        const json = await outletsRes.json();
        const list = json.data || [];
        setOutlets(list);
        if (list.length > 0 && !selectedOutlet) {
          setSelectedOutlet(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load checklists:', err);
    } finally {
      setLoading(false);
    }
  }

  const toggleItemCheck = (id) => {
    setActiveItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const updateItemNotes = (id, noteText) => {
    setActiveItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes: noteText } : item))
    );
  };

  const checkedCount = activeItems.filter((i) => i.checked).length;
  const currentScore = activeItems.length > 0 ? Math.round((checkedCount / activeItems.length) * 100) : 100;

  async function handleSubmitChecklist(e) {
    e.preventDefault();
    if (!selectedOutlet) {
      showToast('Please select an outlet', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/outlet/checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          outlet_id: selectedOutlet,
          date: selectedDate,
          checklist_type: selectedType,
          shift_type: selectedType === 'closing' ? 'night' : 'morning',
          items: activeItems,
          score: currentScore,
          completed_by: completedBy,
          verified_by: verifiedBy,
          notes,
        }),
      });

      if (res.ok) {
        showToast('Operations checklist logged & verified!');
        loadInitial();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to submit checklist', 'error');
      }
    } catch (err) {
      showToast('Error saving checklist', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const todayChecklists = checklists.filter(
    (c) => c.date === new Date().toISOString().split('T')[0]
  );
  const avgScore =
    checklists.length > 0
      ? Math.round(checklists.reduce((s, c) => s + (parseFloat(c.score) || 100), 0) / checklists.length)
      : 100;

  return (
    <div>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            background: toast.type === 'error' ? '#c62828' : '#2e7d32',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
          }}
        >
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/admin/outlets/operations" style={{ color: 'var(--text-secondary)' }}>
              Operations Hub
            </Link>
            <span style={{ color: 'var(--text-secondary)' }}>/</span>
            <h1 style={{ margin: 0 }}>Daily SOP Checklists & Audits</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Ensure strict barista calibration, milk temperature compliance, register settlement, and hygiene across cafes.
          </p>
        </div>
        <button className="admin-btn-outline admin-btn-sm" onClick={loadInitial}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card green">
          <h3>
            <ClipboardCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Submitted Today
          </h3>
          <p className="stat-value">{todayChecklists.length}</p>
          <p className="stat-sub">Across active cafes</p>
        </div>
        <div className="stat-card gold">
          <h3>
            <ShieldCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Average SOP Score
          </h3>
          <p className="stat-value">{avgScore}%</p>
          <p className="stat-sub">Compliance rating</p>
        </div>
        <div className="stat-card blue">
          <h3>
            <Clock size={14} style={{ display: 'inline', marginRight: 4 }} /> Morning Opening Logs
          </h3>
          <p className="stat-value">
            {checklists.filter((c) => c.checklist_type === 'opening').length}
          </p>
          <p className="stat-sub">Machine & milk calibration</p>
        </div>
        <div className="stat-card">
          <h3>
            <CheckCircle2 size={14} style={{ display: 'inline', marginRight: 4 }} /> Night Closing Logs
          </h3>
          <p className="stat-value">
            {checklists.filter((c) => c.checklist_type === 'closing').length}
          </p>
          <p className="stat-sub">Backflush & EOD settlement</p>
        </div>
      </div>

      {/* Checklist Audit Runner Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        
        {/* Left Column: Interactive Checklist */}
        <div className="admin-card">
          <form onSubmit={handleSubmitChecklist}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              
              {/* Outlet Selector */}
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Target Outlet:
                </label>
                <select
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-color)' }}
                >
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Shift / Type Selector */}
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  SOP Checklist Type:
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-color)' }}
                >
                  <option value="opening">Morning Opening SOP</option>
                  <option value="midday">Midday Hygiene & Food Safety</option>
                  <option value="closing">Night Closing & Cash Settlement</option>
                </select>
              </div>

              {/* Date */}
              <div style={{ flex: 1, minWidth: 130 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: 6, border: '1px solid var(--border-color)' }}
                />
              </div>

              {/* Live Score Dial */}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Score:</span>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: currentScore >= 90 ? '#2e7d32' : currentScore >= 70 ? '#856404' : '#c62828',
                  }}
                >
                  {currentScore}% ({checkedCount}/{activeItems.length})
                </span>
              </div>
            </div>

            {/* Checklist Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {activeItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.75rem',
                    borderRadius: 8,
                    background: item.checked ? 'rgba(46, 125, 50, 0.06)' : 'var(--bg-secondary)',
                    border: item.checked ? '1px solid #c8e6c9' : '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', margin: 0, fontWeight: item.checked ? 600 : 400 }}>
                      <input
                        type="checkbox"
                        checked={!!item.checked}
                        onChange={() => toggleItemCheck(item.id)}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <span>{item.title}</span>
                    </label>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.4rem',
                        borderRadius: 4,
                        background: 'rgba(0,0,0,0.06)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {item.category}
                    </span>
                  </div>

                  {item.checked && (
                    <input
                      placeholder="Add observation note (optional, e.g. dialled at 28s, milk at 3.2°C)"
                      value={item.notes || ''}
                      onChange={(e) => updateItemNotes(item.id, e.target.value)}
                      style={{
                        marginTop: '0.4rem',
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.8rem',
                        borderRadius: 4,
                        border: '1px solid var(--border-color)',
                        background: '#fff',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Sign-off & Verification Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div className="form-group">
                <label>Completed By (Barista / Lead) *</label>
                <input
                  required
                  value={completedBy}
                  onChange={(e) => setCompletedBy(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Verified By (Operations Manager / Auditor)</label>
                <input
                  value={verifiedBy}
                  onChange={(e) => setVerifiedBy(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Shift Operations Summary / Audit Remarks</label>
              <textarea
                rows={2}
                placeholder="e.g. All machine calibrations passed. Peak rush handled smoothly. Refrigerator temp log signed off."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="admin-btn" disabled={submitting}>
                {submitting ? 'Saving Audit...' : '✓ Log & Sign Off Checklist'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Historical Audit Submissions */}
        <div className="admin-card">
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={16} /> Recent Audit Submissions
          </h3>

          {checklists.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              No audit logs recorded yet. Fill and submit the checklist on the left.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {checklists.slice(0, 8).map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 6,
                    background: 'var(--bg-secondary)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>{c.outlets?.name || 'Cafe Outlet'}</span>
                    <span
                      style={{
                        color: (c.score || 100) >= 90 ? '#2e7d32' : '#856404',
                        fontWeight: 700,
                      }}
                    >
                      {c.score || 100}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    <span style={{ textTransform: 'capitalize' }}>{c.checklist_type} SOP</span>
                    <span>{c.date}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    By: {c.completed_by || 'Staff'} {c.verified_by ? `· Verified: ${c.verified_by}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
