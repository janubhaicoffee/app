'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Store,
  Package,
  ArrowRight,
  X,
  RefreshCw
} from 'lucide-react';

const statusConfig = {
  pending: { bg: '#fff3cd', color: '#856404', label: 'Pending Approval' },
  in_transit: { bg: '#cce5ff', color: '#004085', label: 'In-Transit' },
  completed: { bg: '#d4edda', color: '#155724', label: 'Completed' },
  cancelled: { bg: '#f8d7da', color: '#721c24', label: 'Cancelled' },
};

const COMMON_ITEMS = [
  { name: 'Arabica Espresso Coffee Beans (kg)', unit: 'kg' },
  { name: 'Robusta House Blend Beans (kg)', unit: 'kg' },
  { name: 'Oat Milk Barista Edition (1L)', unit: 'litres' },
  { name: 'Whole Dairy Milk (1L)', unit: 'litres' },
  { name: 'Almond Milk (1L)', unit: 'litres' },
  { name: 'Vanilla Bean Syrup (750ml)', unit: 'bottles' },
  { name: 'Caramel Toffee Syrup (750ml)', unit: 'bottles' },
  { name: 'Hazelnut Syrup (750ml)', unit: 'bottles' },
  { name: 'Paper Hot Coffee Cups 250ml (500ct)', unit: 'sleeves' },
  { name: 'Paper Hot Coffee Cups 350ml (500ct)', unit: 'sleeves' },
  { name: 'Cold Cup Iced Tumblers with Lids (500ct)', unit: 'boxes' },
  { name: 'Paper Napkins & Wooden Stirrers (1000ct)', unit: 'packs' },
  { name: 'Espresso Machine Cleaning Detergent (Puly Caff)', unit: 'tins' },
];

export default function AdminStockTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    source_outlet_id: '',
    destination_outlet_id: '',
    item_name: '',
    quantity: '',
    unit: 'kg',
    requested_by: 'Operations Manager',
    notes: '',
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

      const [transfersRes, outletsRes] = await Promise.all([
        fetch('/api/outlet/transfers', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/admin/outlets', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (transfersRes.ok) {
        const json = await transfersRes.json();
        setTransfers(json.data || []);
      }

      if (outletsRes.ok) {
        const json = await outletsRes.json();
        setOutlets(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load transfers:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTransfer(e) {
    e.preventDefault();
    if (!form.source_outlet_id || !form.destination_outlet_id) {
      showToast('Please select both source and destination outlets', 'error');
      return;
    }
    if (form.source_outlet_id === form.destination_outlet_id) {
      showToast('Source and destination outlet cannot be identical', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/outlet/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        showToast('Stock transfer created successfully');
        setShowCreateModal(false);
        setForm({
          source_outlet_id: '',
          destination_outlet_id: '',
          item_name: '',
          quantity: '',
          unit: 'kg',
          requested_by: 'Operations Manager',
          notes: '',
        });
        loadData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create transfer', 'error');
      }
    } catch (err) {
      showToast('Error creating transfer', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function updateTransferStatus(id, newStatus) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/outlet/transfers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          approved_by: session.user.email?.split('@')[0] || 'Operations Lead',
        }),
      });

      if (res.ok) {
        showToast(`Transfer marked as ${newStatus}`);
        loadData();
      } else {
        showToast('Failed to update transfer status', 'error');
      }
    } catch (err) {
      showToast('Error updating transfer', 'error');
    }
  }

  const filteredTransfers = transfers.filter((t) => {
    const matchSearch =
      (t.item_name && t.item_name.toLowerCase().includes(search.toLowerCase())) ||
      (t.source_outlet?.name && t.source_outlet.name.toLowerCase().includes(search.toLowerCase())) ||
      (t.destination_outlet?.name && t.destination_outlet.name.toLowerCase().includes(search.toLowerCase()));

    if (statusFilter === 'all') return matchSearch;
    return matchSearch && t.status === statusFilter;
  });

  const pendingCount = transfers.filter((t) => t.status === 'pending').length;
  const inTransitCount = transfers.filter((t) => t.status === 'in_transit').length;
  const completedCount = transfers.filter((t) => t.status === 'completed').length;

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
            <h1 style={{ margin: 0 }}>Inter-Outlet Stock Transfers</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Manage ingredient and supply shipments between cafes with automated inventory reconciliation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="admin-btn-outline admin-btn-sm" onClick={loadData}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="admin-btn admin-btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> New Stock Transfer
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card gold">
          <h3>
            <Clock size={14} style={{ display: 'inline', marginRight: 4 }} /> Pending Approval
          </h3>
          <p className="stat-value">{pendingCount}</p>
          <p className="stat-sub">Awaiting dispatch</p>
        </div>
        <div className="stat-card blue">
          <h3>
            <Truck size={14} style={{ display: 'inline', marginRight: 4 }} /> In-Transit
          </h3>
          <p className="stat-value">{inTransitCount}</p>
          <p className="stat-sub">En route between outlets</p>
        </div>
        <div className="stat-card green">
          <h3>
            <CheckCircle2 size={14} style={{ display: 'inline', marginRight: 4 }} /> Completed Transfers
          </h3>
          <p className="stat-value">{completedCount}</p>
          <p className="stat-sub">Stock reconciled</p>
        </div>
        <div className="stat-card">
          <h3>
            <Package size={14} style={{ display: 'inline', marginRight: 4 }} /> Total Transfers
          </h3>
          <p className="stat-value">{transfers.length}</p>
          <p className="stat-sub">All-time transfer log</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
        <div className="admin-search" style={{ flex: 1 }}>
          <Search size={16} color="var(--text-secondary)" />
          <input
            placeholder="Search by item, source, or destination outlet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In-Transit</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" /> Loading stock transfers...
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <ArrowLeftRight size={48} />
            <h3>No stock transfers found</h3>
            <p>Initiate a transfer to move beans, dairy, or supplies between outlets.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>ITEM & QUANTITY</th>
                  <th style={{ padding: '0.75rem 1rem' }}>SOURCE OUTLET</th>
                  <th style={{ padding: '0.75rem 1rem' }}>DESTINATION OUTLET</th>
                  <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem' }}>DATE / REQUESTER</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.map((t) => {
                  const cfg = statusConfig[t.status] || statusConfig.pending;
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                        <div>{t.item_name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {t.quantity} {t.unit || 'units'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <Store size={14} style={{ display: 'inline', marginRight: 4, color: 'var(--text-secondary)' }} />
                        {t.source_outlet?.name || 'Main Warehouse'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <Store size={14} style={{ display: 'inline', marginRight: 4, color: 'var(--text-secondary)' }} />
                        {t.destination_outlet?.name || 'Destination Outlet'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: cfg.bg,
                            color: cfg.color,
                          }}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div>{new Date(t.created_at).toLocaleDateString()}</div>
                        <div>By: {t.requested_by || 'Operations'}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        {t.status === 'pending' && (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              className="admin-btn admin-btn-sm"
                              onClick={() => updateTransferStatus(t.id, 'in_transit')}
                            >
                              Dispatch
                            </button>
                            <button
                              className="admin-btn-outline admin-btn-sm"
                              onClick={() => updateTransferStatus(t.id, 'cancelled')}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {t.status === 'in_transit' && (
                          <button
                            className="admin-btn admin-btn-sm"
                            style={{ background: '#2e7d32', borderColor: '#2e7d32' }}
                            onClick={() => updateTransferStatus(t.id, 'completed')}
                          >
                            ✓ Confirm Received
                          </button>
                        )}
                        {t.status === 'completed' && (
                          <span style={{ color: '#2e7d32', fontSize: '0.8rem', fontWeight: 600 }}>
                            ✓ Reconciled
                          </span>
                        )}
                        {t.status === 'cancelled' && (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            Cancelled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Stock Transfer Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h2>Initiate Inter-Outlet Stock Transfer</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTransfer}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Source Outlet (From) *</label>
                    <select
                      required
                      value={form.source_outlet_id}
                      onChange={(e) => setForm({ ...form, source_outlet_id: e.target.value })}
                    >
                      <option value="">Select origin...</option>
                      {outlets.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Destination Outlet (To) *</label>
                    <select
                      required
                      value={form.destination_outlet_id}
                      onChange={(e) => setForm({ ...form, destination_outlet_id: e.target.value })}
                    >
                      <option value="">Select destination...</option>
                      {outlets.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Item Name / Supply *</label>
                  <input
                    required
                    list="common-transfer-items"
                    placeholder="e.g. Arabica Espresso Coffee Beans (kg)"
                    value={form.item_name}
                    onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                  />
                  <datalist id="common-transfer-items">
                    {COMMON_ITEMS.map((item, idx) => (
                      <option key={idx} value={item.name} />
                    ))}
                  </datalist>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="e.g. 5"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <select
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    >
                      <option value="kg">kg (Kilograms)</option>
                      <option value="litres">litres (Litres)</option>
                      <option value="bottles">bottles</option>
                      <option value="sleeves">sleeves / packs</option>
                      <option value="boxes">boxes</option>
                      <option value="units">units</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Transfer Notes / Reason</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Weekend surge stock replenishment from flagship store"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Transfer Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
