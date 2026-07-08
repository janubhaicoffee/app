'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, X, Mail, Building2, Percent, Shield, Search } from 'lucide-react';

const roleBadgeColors = {
  superadmin: { bg: '#cce5ff', color: '#004085' },
  owner: { bg: '#e8d5f5', color: '#6a1b9a' },
  manager: { bg: '#bbdefb', color: '#1565c0' },
  cashier: { bg: '#c8e6c9', color: '#2e7d32' },
  barista: { bg: '#ffe0b2', color: '#e65100' },
  kitchen: { bg: '#fff9c4', color: '#f57f17' },
  staff: { bg: '#e2e3e5', color: '#383d41' },
};

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    email: '',
    name: '',
    outlet_id: '',
    role: 'owner',
    stake: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const [staffRes, outletsRes] = await Promise.all([
        fetch('/api/admin/staff', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/admin/outlets', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (staffRes.ok) {
        const json = await staffRes.json();
        const allStaff = json.data || [];
        setStaff(allStaff);
        setPartners(allStaff.filter((m) => m.role === 'owner'));
      }

      if (outletsRes.ok) {
        const json = await outletsRes.json();
        setOutlets(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load partners', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPartner(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          outlet_id: form.outlet_id,
          email: form.email,
          name: form.name,
          role: form.role,
          notes: form.stake ? JSON.stringify({ stake_percentage: parseFloat(form.stake) }) : null,
        }),
      });

      if (res.ok) {
        showToast('Partner added successfully');
        setShowModal(false);
        loadData();
        setForm({ email: '', name: '', outlet_id: '', role: 'owner', stake: '' });
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add partner', 'error');
      }
    } catch (err) {
      showToast('Failed to add partner', 'error');
    } finally {
      setSaving(false);
    }
  }

  function getOutletName(outletId) {
    const outlet = outlets.find((o) => o.id === outletId);
    return outlet ? outlet.name : outletId;
  }

  const filteredPartners = partners.filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" /> Loading partners...
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <div className={`admin-toast ${toast.type === 'error' ? 'admin-toast-error' : ''}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1>Partner Management</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Manage business stakeholders and their outlet ownership
          </p>
        </div>
        <button className="admin-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Partner
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} color="var(--text-secondary)" />
          <input
            placeholder="Search partners by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {partners.length} partner{partners.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredPartners.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>{search ? 'No partners match your search' : 'No partners yet'}</h3>
          <p>
            {search
              ? 'Try a different search term'
              : 'Add business partners to manage outlet ownership'}
          </p>
          {!search && (
            <button className="admin-btn" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add Partner
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredPartners.map((partner) => {
            const badge = roleBadgeColors.owner;
            const partnerOutlets = staff
              .filter((s) => s.email === partner.email && s.role === 'owner')
              .map((s) => s.outlet_id);
            const uniqueOutlets = [...new Set(partnerOutlets)];

            let stake = 0;
            try {
              if (partner.notes) {
                const parsed =
                  typeof partner.notes === 'string' ? JSON.parse(partner.notes) : partner.notes;
                stake = parsed.stake_percentage || 0;
              }
            } catch (e) {}

            return (
              <div key={partner.id} className="admin-card">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: badge.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: badge.color,
                    }}
                  >
                    {partner.name?.charAt(0) || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {partner.name || 'Unnamed'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Mail size={12} /> {partner.email || 'No email'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      className="status-badge"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      Owner
                    </span>
                    {stake > 0 && (
                      <div
                        style={{
                          marginTop: '0.25rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: stake >= 50 ? '#2e7d32' : 'var(--text-secondary)',
                        }}
                      >
                        <Percent size={12} style={{ display: 'inline', marginRight: 2 }} />
                        {stake}% stake
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.5rem 0',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Outlets Managed:
                  </div>
                  {uniqueOutlets.length === 0 ? (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      Not assigned to any outlet
                    </span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {uniqueOutlets.map((oid) => (
                        <span
                          key={oid}
                          className="status-badge"
                          style={{
                            background: '#f0f0f0',
                            color: 'var(--primary-color)',
                            fontWeight: 600,
                          }}
                        >
                          <Building2 size={10} style={{ display: 'inline', marginRight: 3 }} />
                          {getOutletName(oid)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span>
                    Created:{' '}
                    {partner.created_at ? new Date(partner.created_at).toLocaleDateString() : '—'}
                  </span>
                  {stake >= 50 && (
                    <span style={{ color: '#2e7d32', fontWeight: 700 }}>
                      <Shield size={12} style={{ display: 'inline', marginRight: 2 }} /> Full Access
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 500 }}
          >
            <div className="modal-header">
              <h2>Add Partner</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddPartner}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="partner@example.com"
                  />
                  <span className="form-hint">Must exist in auth system</span>
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Rahul Sharma"
                  />
                </div>
                <div className="form-group">
                  <label>Assign to Outlet *</label>
                  <select
                    required
                    value={form.outlet_id}
                    onChange={(e) => setForm({ ...form, outlet_id: e.target.value })}
                  >
                    <option value="">Select outlet...</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Stake Percentage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.stake}
                      onChange={(e) => setForm({ ...form, stake: e.target.value })}
                      placeholder="50"
                    />
                  </div>
                </div>
                {parseFloat(form.stake) >= 50 && (
                  <div
                    style={{
                      padding: '0.75rem',
                      background: '#e8f5e9',
                      borderRadius: 6,
                      border: '1px solid #c8e6c9',
                      fontSize: '0.85rem',
                      color: '#2e7d32',
                      fontWeight: 600,
                    }}
                  >
                    <Shield size={14} style={{ display: 'inline', marginRight: 4 }} />
                    Partners with 50% or higher stake get full access permissions.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
