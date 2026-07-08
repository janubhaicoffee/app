'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Clock,
  UserCheck,
  Calendar,
  BadgeCheck,
  BadgeX,
} from 'lucide-react';

const ROLES = ['manager', 'cashier', 'barista', 'kitchen', 'staff'];

const ROLE_BADGES = {
  manager: { color: '#805ad5', bg: '#faf5ff' },
  cashier: { color: '#3182ce', bg: '#ebf8ff' },
  barista: { color: '#dd6b20', bg: '#fffaf0' },
  kitchen: { color: '#e53e3e', bg: '#fff5f5' },
  staff: { color: '#718096', bg: '#f7fafc' },
};

export default function StaffPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [outletId, setOutletId] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('roster');
  const [clockingIn, setClockingIn] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    hourly_rate: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      let oid = sessionStorage.getItem('selected_outlet_id');
      if (!oid) {
        const { data: staffRec } = await supabase
          .from('outlet_staff')
          .select('outlet_id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        oid = staffRec?.outlet_id;
        if (oid) sessionStorage.setItem('selected_outlet_id', oid);
      }
      setOutletId(oid);

      const params = oid ? `?outletId=${oid}` : '';
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const [staffRes, attRes, schedRes] = await Promise.allSettled([
        fetch(`/api/outlet/staff${params}`),
        fetch(`/api/outlet/staff/attendance${params}&date=${today}`),
        fetch(
          `/api/outlet/staff/schedules${params}&startDate=${weekStart.toISOString().split('T')[0]}&endDate=${weekEnd.toISOString().split('T')[0]}`,
        ),
      ]);

      if (staffRes.status === 'fulfilled' && staffRes.value.ok) {
        const { data } = await staffRes.value.json();
        setStaff(Array.isArray(data) ? data : []);
      }
      if (attRes.status === 'fulfilled' && attRes.value.ok) {
        const { data } = await attRes.value.json();
        setAttendance(Array.isArray(data) ? data : []);
      }
      if (schedRes.status === 'fulfilled' && schedRes.value.ok) {
        const { data } = await schedRes.value.json();
        setSchedules(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/outlet/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet_id: outletId,
          ...form,
          hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
        }),
      });
      if (!res.ok) {
        const b = await res.json();
        throw new Error(b.error);
      }
      setSuccess(`Added "${form.name}"`);
      setForm({ name: '', email: '', phone: '', role: 'staff', hourly_rate: '', notes: '' });
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClockAction = async (staffId, action) => {
    setClockingIn(staffId);
    try {
      const res = await fetch('/api/outlet/staff/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outlet_id: outletId, staff_id: staffId, action }),
      });
      if (res.ok) {
        fetchData();
        setSuccess(action === 'clock_in' ? 'Clocked in' : 'Clocked out');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        const b = await res.json();
        setError(b.error);
      }
    } catch {
    } finally {
      setClockingIn(null);
    }
  };

  const getTodayAttendance = (staffId) => attendance.find((a) => a.staff_id === staffId);

  const filteredStaff = staff.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q)
    );
  });

  const activeStaff = staff.filter((s) => s.is_active !== false);
  const onDuty = attendance.filter((a) => !a.clock_out).length;

  if (loading)
    return (
      <div className="outlet-loading">
        <div className="outlet-loading-spinner" />
        <p>Loading staff...</p>
      </div>
    );

  return (
    <div>
      <div className="outlet-page-header">
        <div>
          <h1>Staff Management</h1>
          <p className="outlet-page-subtitle">
            {activeStaff.length} active &middot; {onDuty} on duty
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="outlet-btn primary sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> {showForm ? 'Cancel' : 'Add Staff'}
          </button>
          <button className="outlet-btn outline sm" onClick={fetchData}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {success && <div className="outlet-success-banner">{success}</div>}
      {error && <div className="outlet-error-banner">{error}</div>}

      <div className="outlet-stats-grid">
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon blue">
            <Users size={24} />
          </div>
          <div className="outlet-stat-info">
            <h3>{activeStaff.length}</h3>
            <p>Active Staff</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon green">
            <UserCheck size={24} />
          </div>
          <div className="outlet-stat-info">
            <h3>{onDuty}</h3>
            <p>On Duty Today</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon purple">
            <Calendar size={24} />
          </div>
          <div className="outlet-stat-info">
            <h3>{schedules.length}</h3>
            <p>Week Schedules</p>
          </div>
        </div>
      </div>

      <div className="outlet-tabs">
        <button
          className={`outlet-tab ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          Roster
        </button>
        <button
          className={`outlet-tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
        <button
          className={`outlet-tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
      </div>

      {showForm && (
        <form className="outlet-form" onSubmit={handleAddStaff}>
          <h3>Add Staff Member</h3>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                className="form-control"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                className="form-control"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Hourly Rate (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={form.hourly_rate}
                onChange={(e) => setForm((p) => ({ ...p, hourly_rate: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input
                className="form-control"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="outlet-btn primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Staff'}
          </button>
        </form>
      )}

      {activeTab === 'roster' && (
        <div>
          <div className="outlet-filter-bar">
            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: 10, top: 10, color: '#a0aec0' }}
              />
              <input
                className="form-control"
                style={{ paddingLeft: 32 }}
                placeholder="Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="outlet-card">
            <div className="table-responsive" style={{ maxHeight: 'none' }}>
              <table className="outlet-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="outlet-empty">
                          <p>No staff found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((s) => {
                      const badge = ROLE_BADGES[s.role] || ROLE_BADGES.staff;
                      const todayAtt = getTodayAttendance(s.id);
                      const isClockedIn = todayAtt && !todayAtt.clock_out;
                      return (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td>{s.email || '-'}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 10px',
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 600,
                                background: badge.bg,
                                color: badge.color,
                              }}
                            >
                              {s.role?.charAt(0).toUpperCase() + s.role?.slice(1)}
                            </span>
                          </td>
                          <td>
                            {s.is_active !== false ? (
                              <span className="outlet-badge green">Active</span>
                            ) : (
                              <span className="outlet-badge red">Inactive</span>
                            )}
                          </td>
                          <td>
                            {s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'}
                          </td>
                          <td>
                            <button
                              className="outlet-btn sm"
                              style={{
                                background: isClockedIn ? '#e53e3e' : '#38a169',
                                color: '#fff',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: 4,
                                cursor: 'pointer',
                              }}
                              onClick={() =>
                                handleClockAction(s.id, isClockedIn ? 'clock_out' : 'clock_in')
                              }
                              disabled={clockingIn === s.id}
                            >
                              <Clock size={12} /> {isClockedIn ? 'Clock Out' : 'Clock In'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="outlet-card">
          <h2>Today&apos;s Attendance</h2>
          <div className="table-responsive" style={{ maxHeight: 400 }}>
            <table className="outlet-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Role</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="outlet-empty">
                        <p>No attendance records today</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  attendance.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.outlet_staff?.name || 'Unknown'}</td>
                      <td>{a.outlet_staff?.role || '-'}</td>
                      <td>{a.clock_in ? new Date(a.clock_in).toLocaleTimeString() : '-'}</td>
                      <td>
                        {a.clock_out ? (
                          new Date(a.clock_out).toLocaleTimeString()
                        ) : (
                          <span className="outlet-badge green">Active</span>
                        )}
                      </td>
                      <td>{a.hours_worked ? `${a.hours_worked}h` : '-'}</td>
                      <td>
                        <span
                          className={`outlet-badge ${a.status === 'present' ? 'green' : a.status === 'absent' ? 'red' : 'yellow'}`}
                        >
                          {a.status || 'present'}
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

      {activeTab === 'schedule' && (
        <div className="outlet-card">
          <h2>Weekly Schedule</h2>
          <div className="table-responsive" style={{ maxHeight: 400 }}>
            <table className="outlet-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Role</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="outlet-empty">
                        <p>No schedules this week</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  schedules.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.outlet_staff?.name || 'Unknown'}</td>
                      <td>{s.outlet_staff?.role || '-'}</td>
                      <td>
                        {new Date(s.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td>{s.start_time}</td>
                      <td>{s.end_time}</td>
                      <td>
                        <span
                          className={`outlet-badge ${s.status === 'confirmed' ? 'green' : s.status === 'cancelled' ? 'red' : 'yellow'}`}
                        >
                          {s.status}
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
    </div>
  );
}
