'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  Store,
  Plus,
  Search,
  Edit3,
  Power,
  PowerOff,
  Trash2,
  MapPin,
  Users,
  DollarSign,
  X,
  Building2,
} from 'lucide-react';
import '@/app/admin/admin.css';
import '@/components/outlet/outlet.css';

const statusColors = {
  active: { bg: '#d4edda', color: '#155724' },
  inactive: { bg: '#e2e3e5', color: '#383d41' },
  closed: { bg: '#f8d7da', color: '#721c24' },
};

export default function OutletManagementPortal() {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editOutlet, setEditOutlet] = useState(null);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [saving, setSaving] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [form, setForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    gstin: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    rent: '',
    electricity: '',
    water: '',
    internet: '',
    cogs: '',
  });

  useEffect(() => {
    loadOutlets();
  }, []);

  async function loadOutlets() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const outletsRes = await fetch('/api/admin/outlets', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (outletsRes.ok) {
        const json = await outletsRes.json();
        const data = json.data || [];
        setOutlets(data);
        setStats({
          total: data.length,
          active: data.filter((o) => o.status === 'active').length,
        });
      }
    } catch (err) {
      console.error('Failed to load outlets', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditOutlet(null);
    setForm({
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
      gstin: '',
      manager_name: '',
      manager_phone: '',
      manager_email: '',
      rent: '',
      electricity: '',
      water: '',
      internet: '',
      cogs: '',
    });
    setShowModal(true);
  }

  function openEditModal(outlet) {
    setEditOutlet(outlet);
    const settings = outlet.settings || {};
    setForm({
      name: outlet.name || '',
      code: outlet.code || '',
      address: outlet.address || '',
      city: outlet.city || '',
      state: outlet.state || '',
      pincode: outlet.pincode || '',
      phone: outlet.phone || '',
      email: outlet.email || '',
      gstin: settings.gstin || '',
      manager_name: settings.manager_name || '',
      manager_phone: settings.manager_phone || '',
      manager_email: settings.manager_email || '',
      rent: settings.rent || '',
      electricity: settings.electricity || '',
      water: settings.water || '',
      internet: settings.internet || '',
      cogs: settings.cogs || '',
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const settings = {
        gstin: form.gstin,
        manager_name: form.manager_name,
        manager_phone: form.manager_phone,
        manager_email: form.manager_email,
        rent: form.rent ? parseFloat(form.rent) : 0,
        electricity: form.electricity ? parseFloat(form.electricity) : 0,
        water: form.water ? parseFloat(form.water) : 0,
        internet: form.internet ? parseFloat(form.internet) : 0,
        cogs: form.cogs ? parseFloat(form.cogs) : 35,
      };

      const body = {
        name: form.name,
        code: form.code,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone,
        email: form.email,
        settings,
      };

      let res;
      if (editOutlet) {
        res = await fetch('/api/admin/outlets', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ id: editOutlet.id, ...body }),
        });
      } else {
        res = await fetch('/api/admin/outlets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        showToast(editOutlet ? 'Outlet updated successfully' : 'Outlet created successfully');
        setShowModal(false);
        loadOutlets();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save outlet', 'error');
      }
    } catch (err) {
      showToast('Failed to save outlet', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(outlet) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const newStatus = outlet.status === 'active' ? 'inactive' : 'active';
      const res = await fetch('/api/admin/outlets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: outlet.id, status: newStatus }),
      });

      if (res.ok) {
        showToast(`Outlet ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        loadOutlets();
      }
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  }

  async function handleDeleteOutlet(id) {
    if (!confirm('Are you sure you want to delete this outlet? All associated staff, schedules, transactions, and POS data will be deleted.')) {
      return;
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/admin/outlets?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        showToast('Outlet deleted successfully');
        loadOutlets();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to delete outlet', 'error');
      }
    } catch (err) {
      showToast('Failed to delete outlet', 'error');
    }
  }

  const filtered = outlets.filter(
    (o) =>
      !search ||
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.city?.toLowerCase().includes(search.toLowerCase()) ||
      o.code?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" /> Loading outlets...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      {toast && (
        <div className={`admin-toast ${toast.type === 'error' ? 'admin-toast-error' : ''}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1 style={{ color: 'var(--primary-color, #3E2723)' }}>Outlet Management</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary, #5D4037)', fontSize: '0.85rem' }}>
            Manage all {stats.total} outlets ({stats.active} active)
          </p>
        </div>
        <button className="admin-btn" onClick={openCreateModal} style={{ background: 'var(--primary-color, #3E2723)', color: '#fff' }}>
          <Plus size={16} /> Create Outlet
        </button>
      </div>

      <div className="admin-toolbar" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-search">
          <Search size={16} color="var(--text-secondary)" />
          <input
            placeholder="Search by name, city or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Store size={48} />
          <h3>No outlets found</h3>
          <p>
            {search ? 'Try a different search term' : 'Create your first outlet to get started'}
          </p>
          {!search && (
            <button className="admin-btn" onClick={openCreateModal}>
              <Plus size={16} /> Create Outlet
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filtered.map((outlet) => {
            const s = outlet.settings || {};
            const staffCount = 0;
            return (
              <div
                key={outlet.id}
                className="admin-card"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  position: 'relative',
                  padding: '1.25rem',
                  borderRadius: 12,
                  border: '1px solid var(--border-color, #e0d5c1)',
                  background: '#fff',
                }}
              >
                <Link
                  href={`/outlet/outlets/${outlet.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: 'var(--primary-color, #3E2723)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Building2 size={20} color="#fff" />
                      </div>
                      <div>
                        <div
                          style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-color, #3E2723)' }}
                        >
                          {outlet.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary, #5D4037)',
                            fontFamily: 'monospace',
                          }}
                        >
                          {outlet.code}
                        </div>
                      </div>
                    </div>
                    <span
                      className="status-badge"
                      style={{
                        background: (statusColors[outlet.status] || statusColors.inactive).bg,
                        color: (statusColors[outlet.status] || statusColors.inactive).color,
                      }}
                    >
                      {outlet.status}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary, #5D4037)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} /> {outlet.city || outlet.address || 'No address'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <DollarSign size={14} /> Rent: ₹{Number(s.rent || 0).toLocaleString('en-IN')}
                      <span style={{ marginLeft: '0.5rem' }}>
                        Electricity: ₹{Number(s.electricity || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </Link>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-color, #e0d5c1)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary, #5D4037)',
                    }}
                  >
                    <Users size={14} /> {staffCount} staff
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '0.25rem',
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditModal(outlet);
                      }}
                      style={{
                        padding: '0.3rem',
                        background: 'none',
                        border: '1px solid var(--border-color, #e0d5c1)',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                      title="Edit Outlet"
                    >
                      <Edit3 size={14} color="var(--text-secondary)" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleStatus(outlet);
                      }}
                      style={{
                        padding: '0.3rem',
                        background: 'none',
                        border: '1px solid var(--border-color, #e0d5c1)',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                      title={outlet.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {outlet.status === 'active' ? (
                        <PowerOff size={14} color="#c62828" />
                      ) : (
                        <Power size={14} color="#2e7d32" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteOutlet(outlet.id);
                      }}
                      style={{
                        padding: '0.3rem',
                        background: 'none',
                        border: '1px solid var(--border-color, #e0d5c1)',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                      title="Delete Outlet"
                    >
                      <Trash2 size={14} color="#c62828" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editOutlet ? 'Edit Outlet' : 'Create New Outlet'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <h3
                  style={{
                    margin: '0 0 0.75rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Basic Information
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Outlet Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Janu Bhai Coffee - Indira Nagar"
                    />
                  </div>
                  <div className="form-group">
                    <label>Outlet Code *</label>
                    <input
                      required
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      placeholder="JBC-IND"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="123, Main Road"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Bengaluru"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="Karnataka"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      placeholder="560001"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="outlet@janubhaicoffee.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>GSTIN</label>
                    <input
                      value={form.gstin}
                      onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                      placeholder="29ABCDE1234F1Z5"
                    />
                  </div>
                </div>

                <h3
                  style={{
                    margin: '1rem 0 0.75rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Manager Details
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Manager Name</label>
                    <input
                      value={form.manager_name}
                      onChange={(e) => setForm({ ...form, manager_name: e.target.value })}
                      placeholder="Rahul Sharma"
                    />
                  </div>
                  <div className="form-group">
                    <label>Manager Phone</label>
                    <input
                      value={form.manager_phone}
                      onChange={(e) => setForm({ ...form, manager_phone: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="form-group">
                    <label>Manager Email</label>
                    <input
                      type="email"
                      value={form.manager_email}
                      onChange={(e) => setForm({ ...form, manager_email: e.target.value })}
                      placeholder="manager@example.com"
                    />
                  </div>
                </div>

                <h3
                  style={{
                    margin: '1rem 0 0.75rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Financial Settings
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Monthly Rent (₹)</label>
                    <input
                      type="number"
                      value={form.rent}
                      onChange={(e) => setForm({ ...form, rent: e.target.value })}
                      placeholder="50000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Monthly Electricity (₹)</label>
                    <input
                      type="number"
                      value={form.electricity}
                      onChange={(e) => setForm({ ...form, electricity: e.target.value })}
                      placeholder="8000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Monthly Water (₹)</label>
                    <input
                      type="number"
                      value={form.water}
                      onChange={(e) => setForm({ ...form, water: e.target.value })}
                      placeholder="2000"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Monthly Internet (₹)</label>
                    <input
                      type="number"
                      value={form.internet}
                      onChange={(e) => setForm({ ...form, internet: e.target.value })}
                      placeholder="1500"
                    />
                  </div>
                  <div className="form-group">
                    <label>COGS %</label>
                    <input
                      type="number"
                      value={form.cogs}
                      onChange={(e) => setForm({ ...form, cogs: e.target.value })}
                      placeholder="35"
                    />
                  </div>
                </div>
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
                  {saving ? 'Saving...' : editOutlet ? 'Update Outlet' : 'Create Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
