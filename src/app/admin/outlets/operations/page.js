'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  Activity,
  Store,
  Power,
  PowerOff,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Package,
  Users,
  Camera,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Search,
  Sliders,
  ShieldAlert,
  ArrowLeftRight,
  ClipboardCheck,
  Truck,
  Coffee,
  XCircle,
  AlertCircle
} from 'lucide-react';

const statusBadges = {
  open: { bg: 'rgba(46, 125, 50, 0.25)', color: '#69f0ae', border: '1px solid rgba(76, 175, 80, 0.4)', label: 'Open' },
  busy: { bg: 'rgba(216, 154, 30, 0.2)', color: '#d89a1e', border: '1px solid rgba(216, 154, 30, 0.4)', label: 'Busy / Throttled' },
  paused: { bg: 'rgba(198, 40, 40, 0.25)', color: '#ff8a80', border: '1px solid rgba(255, 82, 82, 0.4)', label: 'Paused' },
  closed: { bg: 'rgba(255, 255, 255, 0.08)', color: '#cbb9a8', border: '1px solid rgba(245, 240, 234, 0.12)', label: 'Closed' },
};

export default function AdminOperationsHub() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyAction, setEmergencyAction] = useState('pause');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadOperations();
    const interval = setInterval(loadOperations, 20000); // 20s auto-refresh
    return () => clearInterval(interval);
  }, []);

  async function loadOperations() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/outlets/operations', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load operations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleOutletSetting(outletId, field, value) {
    setActionLoading((prev) => ({ ...prev, [`${outletId}_${field}`]: true }));
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/outlets/operations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          outletId,
          [field]: value,
        }),
      });

      if (res.ok) {
        showToast(`Updated ${field.replace(/_/g, ' ')} successfully`);
        loadOperations();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update setting', 'error');
      }
    } catch (err) {
      showToast('Failed to update setting', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`${outletId}_${field}`]: false }));
    }
  }

  async function handleEmergencyAction() {
    setActionLoading((prev) => ({ ...prev, emergency: true }));
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/outlets/operations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(
          emergencyAction === 'pause'
            ? { emergency_pause_all: true }
            : { emergency_resume_all: true }
        ),
      });

      if (res.ok) {
        const json = await res.json();
        showToast(json.message || 'Emergency operation executed');
        setShowEmergencyModal(false);
        loadOperations();
      } else {
        showToast('Failed to execute emergency operation', 'error');
      }
    } catch (err) {
      showToast('Error during emergency action', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, emergency: false }));
    }
  }

  if (loading && !data) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" /> Loading Operations Hub...
      </div>
    );
  }

  const summary = data?.summary || {};
  const outlets = data?.outlets || [];
  const openIncidents = data?.openIncidents || [];
  const activeTransfers = data?.activeTransfers || [];
  const recentAlerts = data?.recentAlerts || [];

  const filteredOutlets = outlets.filter((o) => {
    const matchSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      (o.city && o.city.toLowerCase().includes(search.toLowerCase()));

    if (filterStatus === 'all') return matchSearch;
    return matchSearch && (o.operational_status === filterStatus || (!o.operational_status && filterStatus === 'open'));
  });

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

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity color="var(--primary-color)" /> Operations Command Center
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Central operations hub for managing live outlet states, stock supply, checklists & surveillance.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            className="admin-btn-outline admin-btn-sm"
            onClick={loadOperations}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <RefreshCw size={14} /> Refresh Live
          </button>
          <button
            className="admin-btn admin-btn-sm"
            style={{ background: '#c62828', borderColor: '#c62828' }}
            onClick={() => {
              setEmergencyAction('pause');
              setShowEmergencyModal(true);
            }}
          >
            <ShieldAlert size={14} /> Emergency Pause All
          </button>
          <button
            className="admin-btn-outline admin-btn-sm"
            style={{ borderColor: '#2e7d32', color: '#2e7d32' }}
            onClick={() => {
              setEmergencyAction('resume');
              setShowEmergencyModal(true);
            }}
          >
            <CheckCircle2 size={14} /> Resume All
          </button>
        </div>
      </div>

      {/* High-level Operations KPI Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card green">
          <h3>
            <Store size={14} style={{ display: 'inline', marginRight: 4 }} /> Active Outlets
          </h3>
          <p className="stat-value">{summary.activeOutlets || 0} / {summary.totalOutlets || 0}</p>
          <p className="stat-sub">{summary.pausedOutlets || 0} paused, {summary.closedOutlets || 0} closed</p>
        </div>
        <div className="stat-card gold">
          <h3>
            <TrendingUp size={14} style={{ display: 'inline', marginRight: 4 }} /> Today's Sales
          </h3>
          <p className="stat-value">₹ {(summary.totalRevenueToday || 0).toLocaleString('en-IN')}</p>
          <p className="stat-sub">{summary.totalOrdersToday || 0} total orders</p>
        </div>
        <div className="stat-card blue">
          <h3>
            <ShoppingBag size={14} style={{ display: 'inline', marginRight: 4 }} /> Active Prep Orders
          </h3>
          <p className="stat-value">{summary.activePrepOrders || 0}</p>
          <p className="stat-sub">Across all kitchen bars</p>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f57c00' }}>
          <h3>
            <Package size={14} style={{ display: 'inline', marginRight: 4 }} /> Low Stock Alerts
          </h3>
          <p className="stat-value">{summary.totalLowStockAlerts || 0}</p>
          <p className="stat-sub">Below threshold</p>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #d32f2f' }}>
          <h3>
            <AlertTriangle size={14} style={{ display: 'inline', marginRight: 4 }} /> Incidents & Alerts
          </h3>
          <p className="stat-value">{summary.totalOpenIncidents || 0} / {summary.totalOpenAlerts || 0}</p>
          <p className="stat-sub">{summary.activeStockTransfers || 0} active transfers</p>
        </div>
        <div className="stat-card">
          <h3>
            <Users size={14} style={{ display: 'inline', marginRight: 4 }} /> On-Duty Staff
          </h3>
          <p className="stat-value">{summary.totalActiveStaff || 0}</p>
          <p className="stat-sub">Rostered team members</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
        <div className="admin-search" style={{ flex: 1 }}>
          <Search size={16} color="var(--text-secondary)" />
          <input
            placeholder="Search outlets by name, code, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              background: 'var(--bg-secondary)',
            }}
          >
            <option value="all">All Outlets</option>
            <option value="open">Open</option>
            <option value="busy">Busy / High Volume</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Operations Matrix Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Left Column: Outlets Live Switchboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOutlets.length === 0 ? (
            <div className="empty-state">
              <Store size={48} />
              <h3>No outlets match your search</h3>
              <p>Try adjusting your search query or status filter.</p>
            </div>
          ) : (
            filteredOutlets.map((outlet) => {
              const statusCfg = statusBadges[outlet.operational_status] || statusBadges.open;
              const isActioning = (field) => actionLoading[`${outlet.id}_${field}`];

              return (
                <div
                  key={outlet.id}
                  className="admin-card"
                  style={{
                    padding: '1.25rem',
                    borderLeft: `5px solid ${outlet.operational_status === 'open' ? '#2e7d32' : outlet.operational_status === 'paused' ? '#c62828' : '#e65100'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.15rem', margin: 0 }}>{outlet.name}</h2>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: statusCfg.bg,
                            color: statusCfg.color,
                          }}
                        >
                          {statusCfg.label}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          ({outlet.code})
                        </span>
                      </div>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {outlet.city || outlet.address || 'Address not set'} &middot; Hours: {outlet.opening_time || '08:00'} - {outlet.closing_time || '22:00'} &middot; Manager: {outlet.manager_name || 'Unassigned'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <Link
                        href={`/admin/outlets/${outlet.id}`}
                        className="admin-btn-outline admin-btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        Deep Dive <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Outlet Live Metrics Strip */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                      gap: '0.5rem',
                      background: 'var(--bg-secondary)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      margin: '1rem 0',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Today's Sales</span>
                      <strong style={{ fontSize: '0.95rem' }}>₹ {(outlet.metrics.todayRevenue || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Orders (Prep)</span>
                      <strong style={{ fontSize: '0.95rem' }}>{outlet.metrics.totalOrdersToday} ({outlet.metrics.activeOrdersCount})</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Stock Alerts</span>
                      <strong style={{ fontSize: '0.95rem', color: outlet.metrics.lowStockCount > 0 ? '#c62828' : 'inherit' }}>
                        {outlet.metrics.lowStockCount} items
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Cameras</span>
                      <strong style={{ fontSize: '0.95rem' }}>
                        {outlet.metrics.camerasOnline} / {outlet.metrics.camerasTotal} Online
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Staff on Duty</span>
                      <strong style={{ fontSize: '0.95rem' }}>{outlet.metrics.activeStaffCount} active</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Checklists</span>
                      <strong style={{ fontSize: '0.85rem', color: outlet.metrics.checklists.openingDone ? '#2e7d32' : '#856404' }}>
                        {outlet.metrics.checklists.openingDone ? '✓ Opening' : 'Pending'} &middot; {outlet.metrics.checklists.closingDone ? '✓ Closing' : 'Pending'}
                      </strong>
                    </div>
                  </div>

                  {/* Operational Controls & Quick Toggles */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                    
                    {/* Operational Status Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Status:</span>
                      <select
                        value={outlet.operational_status || 'open'}
                        disabled={isActioning('operational_status')}
                        onChange={(e) => toggleOutletSetting(outlet.id, 'operational_status', e.target.value)}
                        style={{
                          padding: '0.3rem 0.5rem',
                          borderRadius: 4,
                          border: '1px solid var(--border-color)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        <option value="open">Open</option>
                        <option value="busy">Busy (Throttle Orders)</option>
                        <option value="paused">Pause Orders</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    {/* Online Orders Toggle */}
                    <button
                      onClick={() => toggleOutletSetting(outlet.id, 'accepting_orders', !outlet.accepting_orders)}
                      disabled={isActioning('accepting_orders')}
                      className={`admin-btn-sm ${outlet.accepting_orders ? 'admin-btn' : 'admin-btn-outline'}`}
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    >
                      {outlet.accepting_orders ? '✓ Accepting Orders' : '✕ Orders Paused'}
                    </button>

                    {/* Delivery Partner Channels Toggle */}
                    <button
                      onClick={() => toggleOutletSetting(outlet.id, 'delivery_active', !outlet.delivery_active)}
                      disabled={isActioning('delivery_active')}
                      className={`admin-btn-sm ${outlet.delivery_active ? 'admin-btn' : 'admin-btn-outline'}`}
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    >
                      <Truck size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {outlet.delivery_active ? 'Delivery Active' : 'Delivery Off'}
                    </button>

                    {/* Dine-In Toggle */}
                    <button
                      onClick={() => toggleOutletSetting(outlet.id, 'dine_in_active', !outlet.dine_in_active)}
                      disabled={isActioning('dine_in_active')}
                      className={`admin-btn-sm ${outlet.dine_in_active ? 'admin-btn' : 'admin-btn-outline'}`}
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    >
                      <Coffee size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {outlet.dine_in_active ? 'Dine-In Open' : 'Dine-In Closed'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Live Operations Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Quick Action Navigation Buttons */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Operations Quick Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <Link
                href="/admin/outlets/transfers"
                className="admin-btn-outline admin-btn-sm"
                style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <ArrowLeftRight size={14} /> Stock Transfers
              </Link>
              <Link
                href="/admin/outlets/purchase-orders"
                className="admin-btn-outline admin-btn-sm"
                style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <ShoppingBag size={14} /> Purchase Orders
              </Link>
              <Link
                href="/admin/outlets/checklists"
                className="admin-btn-outline admin-btn-sm"
                style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <ClipboardCheck size={14} /> Checklists & Audits
              </Link>
              <Link
                href="/admin/outlets/surveillance"
                className="admin-btn-outline admin-btn-sm"
                style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Camera size={14} /> Live Surveillance
              </Link>
            </div>
          </div>

          {/* Open Incidents & Maintenance */}
          <div className="admin-card">
            <div className="admin-card-header" style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} color="#c62828" /> Open Incidents ({openIncidents.length})
              </h3>
              <Link href="/admin/outlets/surveillance" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                View All
              </Link>
            </div>

            {openIncidents.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                ✓ No active equipment or operational incidents reported.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {openIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    style={{
                      padding: '0.6rem',
                      borderRadius: 6,
                      background: 'var(--bg-secondary)',
                      borderLeft: `4px solid ${inc.severity === 'critical' ? '#c62828' : '#f57c00'}`,
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>{inc.title || inc.description}</span>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: inc.severity === 'critical' ? '#c62828' : '#f57c00' }}>
                        {inc.severity}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      <span>{inc.outlets?.name || 'All Outlets'}</span>
                      <span>{new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Stock Transfers */}
          <div className="admin-card">
            <div className="admin-card-header" style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ArrowLeftRight size={16} color="var(--primary-color)" /> Inter-Outlet Transfers ({activeTransfers.length})
              </h3>
              <Link href="/admin/outlets/transfers" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                Manage
              </Link>
            </div>

            {activeTransfers.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                No active stock transfers in-transit.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeTransfers.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '0.6rem',
                      borderRadius: 6,
                      background: 'var(--bg-secondary)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>{t.item_name} ({t.quantity} {t.unit || 'units'})</span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: 4,
                          background: t.status === 'in_transit' ? '#bbdefb' : '#fff3cd',
                          color: t.status === 'in_transit' ? '#0d47a1' : '#856404',
                        }}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      From: {t.source_outlet?.name || 'Main Warehouse'} &rarr; To: {t.destination_outlet?.name || 'Outlet'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Threshold Alerts */}
          <div className="admin-card">
            <div className="admin-card-header" style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} color="#f57c00" /> Operational Alerts ({recentAlerts.length})
              </h3>
            </div>

            {recentAlerts.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                ✓ All systems and equipment functioning normally.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentAlerts.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: 6,
                      background: '#fff3cd',
                      color: '#856404',
                      fontSize: '0.8rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{a.message}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                      {a.time ? new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Emergency Confirmation Modal */}
      {showEmergencyModal && (
        <div className="modal-overlay" onClick={() => setShowEmergencyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: emergencyAction === 'pause' ? '#c62828' : '#2e7d32' }}>
                <ShieldAlert size={20} />
                {emergencyAction === 'pause' ? 'Emergency Pause All Outlets' : 'Resume All Outlets'}
              </h2>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                {emergencyAction === 'pause'
                  ? 'Are you sure you want to pause online ordering and delivery channels across ALL outlets immediately? Existing in-progress orders can still be completed.'
                  : 'Are you sure you want to resume normal operations, online ordering, and delivery channels across ALL outlets?'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button className="admin-btn-outline" onClick={() => setShowEmergencyModal(false)}>
                  Cancel
                </button>
                <button
                  className="admin-btn"
                  style={{
                    background: emergencyAction === 'pause' ? '#c62828' : '#2e7d32',
                    borderColor: emergencyAction === 'pause' ? '#c62828' : '#2e7d32',
                  }}
                  disabled={actionLoading.emergency}
                  onClick={handleEmergencyAction}
                >
                  {actionLoading.emergency ? 'Processing...' : emergencyAction === 'pause' ? 'Confirm Emergency Pause' : 'Confirm Resume'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
