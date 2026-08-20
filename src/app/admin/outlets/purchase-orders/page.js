'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Package,
  Store,
  Calendar,
  X,
  Trash2,
  Receipt,
  Truck,
  RefreshCw
} from 'lucide-react';

const statusBadges = {
  draft: { bg: '#e2e3e5', color: '#383d41', label: 'Draft' },
  ordered: { bg: '#cce5ff', color: '#004085', label: 'Ordered / Dispatched' },
  received: { bg: '#d4edda', color: '#155724', label: 'Received & Stocked' },
  cancelled: { bg: '#f8d7da', color: '#721c24', label: 'Cancelled' },
};

export default function AdminPurchaseOrders() {
  const [pos, setPos] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    outlet_id: '',
    vendor_id: '',
    vendor_name: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_date: '',
    notes: '',
    items: [{ item_name: 'Specialty Arabica Coffee Beans (5kg)', quantity: 4, unit_price: 2800 }],
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

      const [posRes, outletsRes, vendorsRes] = await Promise.all([
        fetch('/api/outlet/purchase-orders', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/admin/outlets', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        supabase.from('outlet_vendors').select('*'),
      ]);

      if (posRes.ok) {
        const json = await posRes.json();
        setPos(json.data || []);
      }

      if (outletsRes.ok) {
        const json = await outletsRes.json();
        setOutlets(json.data || []);
      }

      if (vendorsRes.data) {
        setVendors(vendorsRes.data);
      }
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoading(false);
    }
  }

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { item_name: '', quantity: 1, unit_price: 0 }],
    }));
  };

  const removeItemRow = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItemRow = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.items];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, items: next };
    });
  };

  const subtotal = form.items.reduce((s, i) => s + ((parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0)), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  async function handleCreatePO(e) {
    e.preventDefault();
    if (!form.outlet_id) {
      showToast('Please select an outlet', 'error');
      return;
    }
    if (form.items.length === 0 || form.items.some((i) => !i.item_name)) {
      showToast('Please specify valid line items', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/outlet/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...form,
          subtotal,
          tax,
          total,
        }),
      });

      if (res.ok) {
        showToast('Purchase Order created successfully');
        setShowModal(false);
        setForm({
          outlet_id: '',
          vendor_id: '',
          vendor_name: '',
          order_date: new Date().toISOString().split('T')[0],
          expected_date: '',
          notes: '',
          items: [{ item_name: 'Specialty Arabica Coffee Beans (5kg)', quantity: 4, unit_price: 2800 }],
        });
        loadData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create PO', 'error');
      }
    } catch (err) {
      showToast('Error creating PO', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function updatePOStatus(id, newStatus) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/outlet/purchase-orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        showToast(newStatus === 'received' ? 'PO received & inventory stock updated!' : `PO updated to ${newStatus}`);
        loadData();
      } else {
        showToast('Failed to update PO status', 'error');
      }
    } catch (err) {
      showToast('Error updating PO', 'error');
    }
  }

  const filteredPOs = pos.filter((p) => {
    const matchSearch =
      (p.po_number && p.po_number.toLowerCase().includes(search.toLowerCase())) ||
      (p.outlets?.name && p.outlets.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.outlet_vendors?.name && p.outlet_vendors.name.toLowerCase().includes(search.toLowerCase()));

    if (statusFilter === 'all') return matchSearch;
    return matchSearch && p.status === statusFilter;
  });

  const totalSpend = pos.reduce((s, p) => s + (parseFloat(p.total) || 0), 0);
  const receivedCount = pos.filter((p) => p.status === 'received').length;

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
            <h1 style={{ margin: 0 }}>Supplier Purchase Orders</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Manage supplier purchase orders, coffee bean deliveries, and automatic inventory receiving.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="admin-btn-outline admin-btn-sm" onClick={loadData}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="admin-btn admin-btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Purchase Order
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card green">
          <h3>
            <ShoppingBag size={14} style={{ display: 'inline', marginRight: 4 }} /> Total POs
          </h3>
          <p className="stat-value">{pos.length}</p>
          <p className="stat-sub">{receivedCount} received & stocked</p>
        </div>
        <div className="stat-card blue">
          <h3>
            <Truck size={14} style={{ display: 'inline', marginRight: 4 }} /> Active Shipments
          </h3>
          <p className="stat-value">{pos.filter((p) => p.status === 'ordered').length}</p>
          <p className="stat-sub">En route from suppliers</p>
        </div>
        <div className="stat-card gold">
          <h3>
            <Receipt size={14} style={{ display: 'inline', marginRight: 4 }} /> Total Supply Spend
          </h3>
          <p className="stat-value">₹ {totalSpend.toLocaleString('en-IN')}</p>
          <p className="stat-sub">Across all cafes</p>
        </div>
        <div className="stat-card">
          <h3>
            <Clock size={14} style={{ display: 'inline', marginRight: 4 }} /> Draft POs
          </h3>
          <p className="stat-value">{pos.filter((p) => p.status === 'draft').length}</p>
          <p className="stat-sub">Pending dispatch</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
        <div className="admin-search" style={{ flex: 1 }}>
          <Search size={16} color="var(--text-secondary)" />
          <input
            placeholder="Search by PO number, outlet, or supplier..."
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
            <option value="draft">Draft</option>
            <option value="ordered">Ordered</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* PO Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" /> Loading purchase orders...
          </div>
        ) : filteredPOs.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <ShoppingBag size={48} />
            <h3>No purchase orders found</h3>
            <p>Create a PO to restock coffee beans, milks, or packaging from suppliers.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>PO NUMBER</th>
                  <th style={{ padding: '0.75rem 1rem' }}>OUTLET</th>
                  <th style={{ padding: '0.75rem 1rem' }}>SUPPLIER / VENDOR</th>
                  <th style={{ padding: '0.75rem 1rem' }}>TOTAL (₹)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem' }}>DATES</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPOs.map((p) => {
                  const cfg = statusBadges[p.status] || statusBadges.draft;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                        <div>{p.po_number}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {p.notes || 'Standard replenishment'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <Store size={14} style={{ display: 'inline', marginRight: 4, color: 'var(--text-secondary)' }} />
                        {p.outlets?.name || 'Main Outlet'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {p.outlet_vendors?.name || 'Artisan Coffee Roasters'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                        ₹ {(parseFloat(p.total) || 0).toLocaleString('en-IN')}
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
                        <div>Ordered: {p.order_date || new Date(p.created_at).toLocaleDateString()}</div>
                        {p.expected_date && <div>Expected: {p.expected_date}</div>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        {p.status === 'draft' && (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              className="admin-btn admin-btn-sm"
                              onClick={() => updatePOStatus(p.id, 'ordered')}
                            >
                              Dispatch Order
                            </button>
                            <button
                              className="admin-btn-outline admin-btn-sm"
                              onClick={() => updatePOStatus(p.id, 'cancelled')}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {p.status === 'ordered' && (
                          <button
                            className="admin-btn admin-btn-sm"
                            style={{ background: '#2e7d32', borderColor: '#2e7d32' }}
                            onClick={() => updatePOStatus(p.id, 'received')}
                          >
                            ✓ Receive & Stock
                          </button>
                        )}
                        {p.status === 'received' && (
                          <span style={{ color: '#2e7d32', fontSize: '0.8rem', fontWeight: 600 }}>
                            ✓ In Inventory
                          </span>
                        )}
                        {p.status === 'cancelled' && (
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

      {/* Create Purchase Order Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h2>Create Supplier Purchase Order</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePO}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Destination Outlet *</label>
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
                  <div className="form-group">
                    <label>Supplier / Vendor</label>
                    <select
                      value={form.vendor_id}
                      onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
                    >
                      <option value="">Select or leave default...</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.category || 'Supplies'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Order Date</label>
                    <input
                      type="date"
                      value={form.order_date}
                      onChange={(e) => setForm({ ...form, order_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Expected Delivery Date</label>
                    <input
                      type="date"
                      value={form.expected_date}
                      onChange={(e) => setForm({ ...form, expected_date: e.target.value })}
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 700, margin: 0 }}>Line Items to Order</label>
                    <button
                      type="button"
                      className="admin-btn-outline admin-btn-sm"
                      onClick={addItemRow}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {form.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr auto',
                          gap: '0.5rem',
                          alignItems: 'center',
                          background: 'var(--bg-secondary)',
                          padding: '0.5rem',
                          borderRadius: 6,
                        }}
                      >
                        <input
                          required
                          placeholder="Item Name (e.g. Arabica Beans)"
                          value={item.item_name}
                          onChange={(e) => updateItemRow(idx, 'item_name', e.target.value)}
                        />
                        <input
                          required
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItemRow(idx, 'quantity', e.target.value)}
                        />
                        <input
                          required
                          type="number"
                          min="0"
                          placeholder="Unit Price ₹"
                          value={item.unit_price}
                          onChange={(e) => updateItemRow(idx, 'unit_price', e.target.value)}
                        />
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div style={{ marginTop: '0.75rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div>Subtotal: ₹ {subtotal.toFixed(2)}</div>
                    <div>GST (5%): ₹ {tax.toFixed(2)}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                      Grand Total: ₹ {total.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>PO Instructions / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please deliver to back-kitchen loading bay before 11:00 AM"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Generate Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
