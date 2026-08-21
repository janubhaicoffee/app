'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Clock,
  UserCheck,
  Calendar,
  Store,
  Shield,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  DollarSign,
  Phone,
  Mail,
  Key,
} from 'lucide-react';

const ROLE_BADGES = {
  superadmin: { color: '#d89a1e', bg: 'rgba(216, 154, 30, 0.15)', label: 'Superadmin' },
  operations_head: { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', label: 'Operations Head' },
  growth: { color: '#f472b6', bg: 'rgba(236, 72, 153, 0.15)', label: 'Growth' },
  manager: { color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', label: 'Store Manager' },
  employee: { color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', label: 'Barista / Staff' },
};

export default function AdminStaffPage() {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    outlet_id: '',
    pin_code: '',
    monthly_salary: '',
    is_active: true,
  });

  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Fetch Outlets
      const outRes = await fetch('/api/pos/outlets', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (outRes.ok) {
        const outData = await outRes.json();
        setOutlets(outData.data || []);
        if (outData.data?.length > 0 && !form.outlet_id) {
          setForm((prev) => ({ ...prev, outlet_id: outData.data[0].id }));
        }
      }

      // 2. Fetch Staff
      const staffRes = await fetch('/api/outlet/staff', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (staffRes.ok) {
        const sData = await staffRes.json();
        setStaff(sData.data || []);
      }
    } catch (err) {
      console.error('Failed to load cafe staff:', err);
    } finally {
      setLoading(false);
    }
  }, [form.outlet_id]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      outlet_id: outlets[0]?.id || '',
      pin_code: '',
      monthly_salary: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (member) => {
    setEditingStaff(member);
    setForm({
      name: member.display_name || member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'employee',
      outlet_id: member.outlet_id || outlets[0]?.id || '',
      pin_code: member.pin_code || '',
      monthly_salary: member.monthly_salary || '',
      is_active: member.is_active !== false,
    });
    setShowModal(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (editingStaff) {
        // Update staff
        const res = await fetch(`/api/outlet/staff?id=${editingStaff.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            display_name: form.name,
            email: form.email || null,
            phone: form.phone || null,
            role: form.role,
            outlet_id: form.outlet_id,
            pin_code: form.pin_code || null,
            monthly_salary: form.monthly_salary ? parseFloat(form.monthly_salary) : null,
            is_active: form.is_active,
          }),
        });
        if (res.ok) {
          setShowModal(false);
          fetchStaffData();
        }
      } else {
        // Create staff
        const res = await fetch('/api/outlet/staff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            display_name: form.name,
            name: form.name,
            email: form.email || null,
            phone: form.phone || null,
            role: form.role,
            outlet_id: form.outlet_id,
            pin_code: form.pin_code || '0000',
            monthly_salary: form.monthly_salary ? parseFloat(form.monthly_salary) : null,
            is_active: true,
          }),
        });
        if (res.ok) {
          setShowModal(false);
          fetchStaffData();
        }
      }
    } catch (err) {
      console.error('Failed to save staff member:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredStaff = staff.filter((member) => {
    const matchesOutlet = selectedOutlet === 'all' || member.outlet_id === selectedOutlet;
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesSearch =
      !search ||
      (member.display_name || member.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (member.phone || '').includes(search);
    return matchesOutlet && matchesRole && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0 }}>Janu Bhai Cafe Staff & Rosters</h1>
            <span
              style={{
                background: 'rgba(251, 191, 36, 0.2)',
                color: '#fbbf24',
                padding: '4px 10px',
                borderRadius: '100px',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                border: '1px solid rgba(251, 191, 36, 0.3)',
              }}
            >
              Cafe Chain Operations
            </span>
          </div>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary, #cbb9a8)', fontSize: '0.88rem' }}>
            Manage cafe managers, baristas, cashiers, shift pins, and multi-outlet team rosters.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={fetchStaffData} className="admin-btn-outline admin-btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={handleOpenAdd} className="admin-btn admin-btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={15} />
            <span>Add Cafe Staff</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="admin-card"
        style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#cbb9a8' }} />
          <input
            type="text"
            placeholder="Search staff by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(245,240,234,0.1)',
              borderRadius: '8px',
              color: '#f5f0ea',
              fontSize: '0.86rem',
            }}
          />
        </div>

        <select
          value={selectedOutlet}
          onChange={(e) => setSelectedOutlet(e.target.value)}
          style={{
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(245,240,234,0.1)',
            borderRadius: '8px',
            color: '#f5f0ea',
            fontSize: '0.86rem',
          }}
        >
          <option value="all">🏢 All Cafe Outlets ({outlets.length})</option>
          {outlets.map((o) => (
            <option key={o.id} value={o.id}>
              📍 {o.name}
            </option>
          ))}
        </select>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(245,240,234,0.1)',
            borderRadius: '8px',
            color: '#f5f0ea',
            fontSize: '0.86rem',
          }}
        >
          <option value="all">👥 All Roles</option>
          <option value="operations_head">Operations Head</option>
          <option value="manager">Store Manager</option>
          <option value="growth">Growth Leader</option>
          <option value="employee">Barista / Staff</option>
        </select>
      </div>

      {/* Staff Roster Grid */}
      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Loading cafe staff roster...</span>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="admin-card empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Users size={44} color="#d89a1e" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ color: '#f5f0ea', margin: '0 0 6px' }}>No Cafe Staff Found</h3>
          <p style={{ color: '#cbb9a8', fontSize: '0.88rem', margin: '0 0 16px' }}>
            Add store managers and baristas to manage POS terminal shifts and cafe operations.
          </p>
          <button onClick={handleOpenAdd} className="admin-btn">
            <Plus size={15} /> Add First Staff Member
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {filteredStaff.map((member) => {
            const badge = ROLE_BADGES[member.role] || ROLE_BADGES.employee;
            const outletName = outlets.find((o) => o.id === member.outlet_id)?.name || 'Gafoor Nagar Flagship';

            return (
              <div
                key={member.id}
                className="admin-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  border: '1px solid rgba(216, 154, 30, 0.2)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f5f0ea' }}>
                      {member.display_name || member.name || 'Unnamed Staff'}
                    </h3>
                    <span
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#cbb9a8', lineHeight: 1.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Store size={14} color="#d89a1e" />
                      <span>{outletName}</span>
                    </div>
                    {member.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#cbb9a8" />
                        <span>{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="#cbb9a8" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.pin_code && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Key size={14} color="#69f0ae" />
                        <span>POS PIN: ****</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(245,240,234,0.08)', paddingTop: '10px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: member.is_active !== false ? '#69f0ae' : '#f87171',
                    }}
                  >
                    ● {member.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="admin-btn-outline admin-btn-sm"
                      style={{ padding: '4px 8px' }}
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Staff Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#1a100b',
              border: '1px solid rgba(216, 154, 30, 0.4)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              color: '#f5f0ea',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--accent-gold, #d89a1e)', fontSize: '1.2rem' }}>
                {editingStaff ? 'Edit Staff Member' : 'Add Cafe Staff Member'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#cbb9a8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbb9a8', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245,240,234,0.15)', borderRadius: '8px', color: '#f5f0ea' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbb9a8', marginBottom: '4px' }}>
                  Role *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245,240,234,0.15)', borderRadius: '8px', color: '#f5f0ea' }}
                >
                  <option value="employee">Barista / Cafe Staff</option>
                  <option value="manager">Cafe Store Manager</option>
                  <option value="operations_head">Operations Head</option>
                  <option value="growth">Growth & Brand Activator</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbb9a8', marginBottom: '4px' }}>
                  Assigned Cafe Outlet *
                </label>
                <select
                  value={form.outlet_id}
                  onChange={(e) => setForm({ ...form, outlet_id: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245,240,234,0.15)', borderRadius: '8px', color: '#f5f0ea' }}
                >
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbb9a8', marginBottom: '4px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="staff@janubhai.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245,240,234,0.15)', borderRadius: '8px', color: '#f5f0ea' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbb9a8', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="9910778500"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245,240,234,0.15)', borderRadius: '8px', color: '#f5f0ea' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbb9a8', marginBottom: '4px' }}>
                    POS 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="1234"
                    value={form.pin_code}
                    onChange={(e) => setForm({ ...form, pin_code: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245,240,234,0.15)', borderRadius: '8px', color: '#f5f0ea' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbb9a8', marginBottom: '4px' }}>
                    Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={form.monthly_salary}
                    onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245,240,234,0.15)', borderRadius: '8px', color: '#f5f0ea' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="admin-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn"
                >
                  {saving ? 'Saving...' : editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
