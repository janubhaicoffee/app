"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Plus, X, Search, Filter, Shield, UserCheck, UserX } from "lucide-react";

const roleBadgeColors = {
  superadmin: { bg: "#cce5ff", color: "#004085" },
  owner: { bg: "#e8d5f5", color: "#6a1b9a" },
  manager: { bg: "#bbdefb", color: "#1565c0" },
  cashier: { bg: "#c8e6c9", color: "#2e7d32" },
  barista: { bg: "#ffe0b2", color: "#e65100" },
  kitchen: { bg: "#fff9c4", color: "#f57f17" },
  staff: { bg: "#e2e3e5", color: "#383d41" }
};

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOutlet, setFilterOutlet] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    outlet_id: "", name: "", email: "", phone: "", role: "staff", pin: ""
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [staffRes, outletsRes] = await Promise.all([
        fetch("/api/admin/staff", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        }),
        fetch("/api/admin/outlets", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        })
      ]);

      if (staffRes.ok) {
        const json = await staffRes.json();
        setStaff(json.data || []);
      }

      if (outletsRes.ok) {
        const json = await outletsRes.json();
        setOutlets(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load staff", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditMember(null);
    setForm({ outlet_id: "", name: "", email: "", phone: "", role: "staff", pin: "" });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let res;
      if (editMember) {
        const body = { id: editMember.id, ...form };
        if (!form.pin) delete body.pin;
        res = await fetch("/api/admin/staff", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch("/api/admin/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
          body: JSON.stringify(form)
        });
      }

      if (res.ok) {
        showToast(editMember ? "Staff updated successfully" : "Staff added successfully");
        setShowModal(false);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save staff", "error");
      }
    } catch (err) {
      showToast("Failed to save staff", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(member) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ id: member.id, is_active: !member.is_active })
      });

      if (res.ok) {
        showToast(member.is_active ? "Staff deactivated" : "Staff activated");
        loadData();
      }
    } catch (err) {
      showToast("Failed to update staff", "error");
    }
  }

  function getOutletName(id) {
    const outlet = outlets.find(o => o.id === id);
    return outlet ? outlet.name : id;
  }

  const filtered = staff.filter(m => {
    const matchesSearch = !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    const matchesOutlet = filterOutlet === "all" || m.outlet_id === filterOutlet;
    return matchesSearch && matchesOutlet;
  });

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /> Loading staff...</div>;
  }

  return (
    <div>
      {toast && (
        <div className={`admin-toast ${toast.type === "error" ? "admin-toast-error" : ""}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1>Staff Management</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {staff.length} staff members across {outlets.length} outlets
          </p>
        </div>
        <button className="admin-btn" onClick={openCreateModal}>
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} color="var(--text-secondary)" />
          <input placeholder="Search staff by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <select value={filterOutlet} onChange={e => setFilterOutlet(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <option value="all">All Outlets</option>
            {outlets.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>{search || filterOutlet !== "all" ? "No staff match your filters" : "No staff yet"}</h3>
          <p>{search || filterOutlet !== "all" ? "Try different search terms or filters" : "Add staff members to manage outlet operations"}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map(member => {
            const badge = roleBadgeColors[member.role] || roleBadgeColors.staff;
            return (
              <div key={member.id} className="admin-card" style={{ padding: '1rem', marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: badge.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.9rem', color: badge.color
                  }}>
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{member.email || member.phone || 'No contact'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <span className="status-badge" style={{ background: badge.bg, color: badge.color }}>
                      {member.role}
                    </span>
                    <span className="status-badge" style={{
                      background: member.is_active !== false ? '#d4edda' : '#f8d7da',
                      color: member.is_active !== false ? '#155724' : '#721c24'
                    }}>
                      {member.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <Shield size={12} style={{ display: 'inline', marginRight: 3 }} />
                  Outlet: {member.outlets?.name || getOutletName(member.outlet_id) || '—'}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Joined: {member.created_at ? new Date(member.created_at).toLocaleDateString() : '—'}
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <button onClick={() => { setEditMember(member); setForm({
                    outlet_id: member.outlet_id || "",
                    name: member.name || "",
                    email: member.email || "",
                    phone: member.phone || "",
                    role: member.role || "staff",
                    pin: ""
                  }); setShowModal(true); }}
                    className="admin-btn-outline admin-btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    Edit Role
                  </button>
                  <button onClick={() => toggleActive(member)}
                    className="admin-btn-sm" style={{
                      flex: 1, justifyContent: 'center', border: '1px solid var(--border-color)',
                      background: member.is_active !== false ? '#f8d7da' : '#d4edda',
                      color: member.is_active !== false ? '#721c24' : '#155724', cursor: 'pointer', borderRadius: 6,
                      fontWeight: 600, fontSize: '0.78rem'
                    }}>
                    {member.is_active !== false ? <UserX size={14} /> : <UserCheck size={14} />}
                    {member.is_active !== false ? ' Deactivate' : ' Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>{editMember ? "Edit Staff Member" : "Add Staff Member"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Outlet *</label>
                  <select required value={form.outlet_id} onChange={e => setForm({...form, outlet_id: e.target.value})}>
                    <option value="">Select outlet...</option>
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Staff name" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="staff@example.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 9876543210" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      <option value="manager">Manager</option>
                      <option value="cashier">Cashier</option>
                      <option value="barista">Barista</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>PIN (for POS)</label>
                    <input type="password" maxLength={4} value={form.pin} onChange={e => setForm({...form, pin: e.target.value})} placeholder="1234" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn" disabled={saving}>
                  {saving ? "Saving..." : (editMember ? "Update Staff" : "Add Staff")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
