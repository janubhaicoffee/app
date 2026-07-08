'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Search, Store, ArrowRightLeft, RefreshCw } from 'lucide-react';

export default function OutletInventoryPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filterOutlet, setFilterOutlet] = useState('');
  const [search, setSearch] = useState('');
  const [transferModal, setTransferModal] = useState(null);
  const [adjustModal, setAdjustModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [prodRes, outletRes] = await Promise.all([
        fetch(`/api/admin/inventory?type=outlet_stock`, { headers }),
        fetch('/api/admin/outlets', { headers }),
      ]);
      if (prodRes.ok) {
        const j = await prodRes.json();
        setProducts(j.data || []);
      }
      if (outletRes.ok) {
        const j = await outletRes.json();
        setOutlets(j.data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = products.filter((p) => {
    if (filterOutlet && p.outlet_id !== filterOutlet) return false;
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleTransfer = async (productId, outletId, quantity, notes) => {
    setSaving(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'transfer_to_outlet',
          product_id: productId,
          outlet_id: outletId,
          quantity,
          notes,
        }),
      });
      if (res.ok) {
        showToast('Stock transferred to outlet');
        setTransferModal(null);
        const headers = { Authorization: `Bearer ${session.access_token}` };
        const prodRes = await fetch(`/api/admin/inventory?type=outlet_stock`, { headers });
        if (prodRes.ok) {
          const j = await prodRes.json();
          setProducts(j.data || []);
        }
      } else {
        const err = await res.json();
        showToast(err.error || 'Transfer failed', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAdjust = async (productId, newStock, notes) => {
    setSaving(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'adjust_stock',
          product_id: productId,
          new_stock: newStock,
          notes,
        }),
      });
      if (res.ok) {
        showToast('Stock adjusted');
        setAdjustModal(null);
        const headers = { Authorization: `Bearer ${session.access_token}` };
        const prodRes = await fetch(`/api/admin/inventory?type=outlet_stock`, { headers });
        if (prodRes.ok) {
          const j = await prodRes.json();
          setProducts(j.data || []);
        }
      } else {
        const err = await res.json();
        showToast(err.error || 'Adjustment failed', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading outlet inventory...</div>;

  return (
    <div>
      {toast && (
        <div
          style={{
            padding: '10px 16px',
            background: toast.type === 'success' ? '#d4edda' : '#f8d7da',
            color: toast.type === 'success' ? '#155724' : '#721c24',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {toast.msg}
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1>Outlet Inventory</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Manage stock levels at outlet POS locations
          </p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: 10, top: 10, color: '#a0aec0' }}
            />
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.5rem 0.5rem 2rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.85rem',
              }}
            />
          </div>
          <select
            value={filterOutlet}
            onChange={(e) => setFilterOutlet(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
            }}
          >
            <option value="">All Outlets</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {filtered.length} product(s) across {new Set(filtered.map((p) => p.outlet_id)).size}{' '}
          outlet(s)
        </span>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Outlet</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No products found
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const stockStatus =
                  p.current_stock <= 0
                    ? 'out_of_stock'
                    : p.current_stock <= (p.min_stock || 5)
                      ? 'low_stock'
                      : 'in_stock';
                const statusColor =
                  stockStatus === 'out_of_stock'
                    ? '#c62828'
                    : stockStatus === 'low_stock'
                      ? '#e65100'
                      : '#2e7d32';
                return (
                  <tr key={`${p.outlet_id}-${p.id}`}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ fontSize: '0.85rem' }}>{p.outlet?.name || 'Unknown'}</td>
                    <td
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {p.sku || '-'}
                    </td>
                    <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600, color: statusColor }}>{p.current_stock ?? 0}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background:
                            stockStatus === 'out_of_stock'
                              ? '#ffebee'
                              : stockStatus === 'low_stock'
                                ? '#fff3e0'
                                : '#e8f5e9',
                          color: statusColor,
                        }}
                      >
                        {stockStatus === 'out_of_stock'
                          ? 'Out'
                          : stockStatus === 'low_stock'
                            ? 'Low'
                            : 'In Stock'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          className="admin-btn outline sm"
                          onClick={() => setTransferModal(p)}
                        >
                          <ArrowRightLeft size={12} /> Transfer
                        </button>
                        <button className="admin-btn outline sm" onClick={() => setAdjustModal(p)}>
                          <RefreshCw size={12} /> Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {transferModal && (
        <ModalForm
          title={`Transfer Stock: ${transferModal.name}`}
          fields={[
            { label: 'Current Stock', value: transferModal.current_stock ?? 0, readOnly: true },
            { label: 'Outlet', value: transferModal.outlet?.name || 'Current', readOnly: true },
            { label: 'Quantity to Add', type: 'number', key: 'quantity', defaultValue: '' },
            { label: 'Notes', type: 'text', key: 'notes', defaultValue: '' },
          ]}
          onSave={(vals) =>
            handleTransfer(transferModal.id, transferModal.outlet_id, vals.quantity, vals.notes)
          }
          onCancel={() => setTransferModal(null)}
          saving={saving}
        />
      )}

      {adjustModal && (
        <ModalForm
          title={`Adjust Stock: ${adjustModal.name}`}
          fields={[
            { label: 'Current Stock', value: adjustModal.current_stock ?? 0, readOnly: true },
            {
              label: 'New Stock',
              type: 'number',
              key: 'newStock',
              defaultValue: String(adjustModal.current_stock ?? 0),
            },
            { label: 'Notes', type: 'text', key: 'notes', defaultValue: '' },
          ]}
          onSave={(vals) => handleAdjust(adjustModal.id, vals.newStock, vals.notes)}
          onCancel={() => setAdjustModal(null)}
          saving={saving}
        />
      )}
    </div>
  );
}

function ModalForm({ title, fields, onSave, onCancel, saving }) {
  const [values, setValues] = useState(() => {
    const initial = {};
    fields.forEach((f) => {
      if (f.key) initial[f.key] = f.defaultValue || '';
    });
    return initial;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(values);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          minWidth: 380,
          maxWidth: 450,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 1rem' }}>{title}</h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {fields.map((f, i) => (
            <div key={i}>
              <label
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                {f.label}
              </label>
              {f.readOnly ? (
                <div
                  style={{
                    padding: '0.5rem',
                    background: '#f5f5f5',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  {f.value}
                </div>
              ) : (
                <input
                  type={f.type || 'text'}
                  value={values[f.key] || ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  required={f.required !== false}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                  }}
                />
              )}
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end',
              marginTop: '0.5rem',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              className="admin-btn outline"
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
