'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#856404', bg: '#fff3cd' },
  processing: { label: 'Processing', color: '#004085', bg: '#cce5ff' },
  shipped: { label: 'Shipped', color: '#e65100', bg: '#ffe0b2' },
  delivered: { label: 'Delivered', color: '#155724', bg: '#d4edda' },
  cancelled: { label: 'Cancelled', color: '#721c24', bg: '#f8d7da' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // form state
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [awbNumber, setAwbNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  async function fetchOrder() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/admin/data?type=order_detail&id=${params.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        setError('Failed to load order');
        setLoading(false);
        return;
      }
      const json = await res.json();
      const o = json.data;
      setOrder(o);
      setStatus(o.status || 'pending');
      setAwbNumber(o.awb_number || '');
      setTrackingUrl(o.tracking_url || '');
      setAdminNotes(o.admin_notes || '');
    } catch {
      setError('Error loading order');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(field, value) {
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      let action = 'update_order';
      const payload = {};

      if (field === 'status') {
        payload.status = value;
      } else if (field === 'awb') {
        payload.awb_number = value.awb;
        payload.tracking_url = value.url;
      } else if (field === 'notes') {
        payload.admin_notes = value;
      } else if (field === 'refund') {
        action = 'process_refund';
        payload.refund_status = value.amount ? 'partial' : 'full';
        payload.refund_amount = value.amount;
        payload.refund_reason = value.reason;
      }

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, id: params.id, payload }),
      });
      if (res.ok) {
        alert('Saved successfully!');
        if (field !== 'refund') fetchOrder();
      } else {
        alert('Failed to save changes');
      }
    } catch {
      alert('Error saving changes');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div> Loading order...
      </div>
    );
  }
  if (error) {
    return (
      <div className="admin-loading" style={{ color: '#c62828' }}>
        {error}
      </div>
    );
  }
  if (!order) {
    return <div className="admin-loading">Order not found</div>;
  }

  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/admin/orders"
            className="admin-btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
            }}
          >
            &larr; Back
          </Link>
          <h1>Order #{order.id?.split('-')[0] || order.id?.slice(0, 8)}</h1>
          <span
            className="status-badge"
            style={{
              background: statusInfo.bg,
              color: statusInfo.color,
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
            }}
          >
            {statusInfo.label}
          </span>
        </div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {new Date(order.created_at).toLocaleString()}
        </span>
      </div>

      <div
        className="stats-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
      >
        <div className="stat-card">
          <h3>Order Total</h3>
          <p className="stat-value" style={{ color: '#2e7d32', fontSize: '1.5rem' }}>
            ₹{order.total_amount}
          </p>
        </div>
        <div className="stat-card">
          <h3>Payment</h3>
          <p className="stat-value" style={{ fontSize: '1rem' }}>
            {order.razorpay_payment_id ? 'Paid' : 'Pending'}
          </p>
          {order.razorpay_payment_id && (
            <span className="stat-sub" style={{ wordBreak: 'break-all' }}>
              ID: {order.razorpay_payment_id}
            </span>
          )}
        </div>
        <div className="stat-card">
          <h3>Shipping</h3>
          <p className="stat-value" style={{ fontSize: '1rem' }}>
            {order.awb_number ? 'Tracked' : 'Not Shipped'}
          </p>
          {order.awb_number && <span className="stat-sub">AWB: {order.awb_number}</span>}
        </div>
        <div className="stat-card">
          <h3>Gift</h3>
          <p className="stat-value" style={{ fontSize: '1rem' }}>
            {order.is_gift ? 'Yes' : 'No'}
          </p>
          {order.gift_message && <span className="stat-sub">{order.gift_message}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Customer Details</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p>
              <strong>Email:</strong> {order.customer_email || '-'}
            </p>
            <p>
              <strong>Phone:</strong> {order.customer_phone || '-'}
            </p>
            {order.shipping_address && (
              <div>
                <strong>Shipping Address:</strong>
                <p
                  style={{
                    marginTop: '0.25rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {formatAddress(order.shipping_address)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Fulfillment</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label className="form-group" style={{ margin: 0 }}>
                <span
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Status
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="admin-select"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label className="form-group" style={{ margin: 0 }}>
                <span
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  AWB / Tracking Number
                </span>
                <input
                  type="text"
                  value={awbNumber}
                  onChange={(e) => setAwbNumber(e.target.value)}
                  placeholder="e.g. AWB123456789"
                />
              </label>
            </div>
            <div>
              <label className="form-group" style={{ margin: 0 }}>
                <span
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Tracking URL
                </span>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://..."
                />
              </label>
            </div>
            <button
              className="admin-btn"
              onClick={() => handleSave('status', status)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update Status'}
            </button>
            <button
              className="admin-btn-outline"
              onClick={() => handleSave('awb', { awb: awbNumber, url: trackingUrl })}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Tracking'}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Order Items</h2>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items || []).length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No items found.
                </td>
              </tr>
            ) : (
              (order.order_items || []).map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.product_id}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price}</td>
                  <td style={{ fontWeight: 600 }}>₹{(item.price || 0) * (item.quantity || 0)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700 }}>
                Total
              </td>
              <td style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: '1.1rem' }}>
                ₹{order.total_amount}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Admin Notes</h2>
          </div>
          <textarea
            rows="4"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add internal notes about this order..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              marginBottom: '0.75rem',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="admin-btn-outline admin-btn-sm"
              onClick={() => handleSave('notes', adminNotes)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
            <button
              className="admin-btn-outline admin-btn-sm"
              onClick={() => {
                setAdminNotes(order.admin_notes || '');
                alert('Discarded changes');
              }}
            >
              Discard
            </button>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Refund Processing</h2>
          </div>
          {order.refund_status && order.refund_status !== 'none' ? (
            <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '6px' }}>
              <p style={{ fontWeight: 600, margin: '0 0 0.5rem' }}>Refund {order.refund_status}</p>
              {order.refund_amount > 0 && <p>Amount: ₹{order.refund_amount}</p>}
              {order.refund_reason && <p>Reason: {order.refund_reason}</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="form-group" style={{ margin: 0 }}>
                  <span
                    style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                  >
                    Refund Amount (₹)
                  </span>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="Leave empty for full refund"
                  />
                </label>
              </div>
              <div>
                <label className="form-group" style={{ margin: 0 }}>
                  <span
                    style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                  >
                    Reason
                  </span>
                  <textarea
                    rows="2"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Why is this being refunded?"
                  />
                </label>
              </div>
              <button
                className="admin-btn-danger admin-btn-sm"
                onClick={() => {
                  if (confirm('Process this refund?')) {
                    handleSave('refund', {
                      amount: parseFloat(refundAmount) || 0,
                      reason: refundReason,
                    });
                  }
                }}
                disabled={saving}
              >
                {saving ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          )}
        </div>
      </div>

      {renderTimeline(order)}
    </div>
  );
}

function formatAddress(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') {
    try {
      const parsed = JSON.parse(addr);
      const { address, city, state, pincode, phone, name } = parsed;
      const parts = [name, address, city, state, pincode, phone].filter(Boolean);
      return parts.join('\n');
    } catch {
      return addr;
    }
  }
  const { address, city, state, pincode, phone, name } = addr;
  const parts = [name, address, city, state, pincode, phone].filter(Boolean);
  return parts.join('\n');
}

function renderTimeline(order) {
  const events = [];
  if (order.created_at) {
    events.push({ time: order.created_at, label: 'Order placed' });
  }
  if (order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
    events.push({
      time: order.updated_at || order.created_at,
      label: `Status changed to ${order.status}`,
    });
  }
  if (order.awb_number) {
    events.push({
      time: order.updated_at || order.created_at,
      label: `AWB assigned: ${order.awb_number}`,
    });
  }
  if (order.refund_status && order.refund_status !== 'none') {
    events.push({
      time: order.updated_at || order.created_at,
      label: `Refund ${order.refund_status} - ₹${order.refund_amount || 0}`,
    });
  }

  if (events.length === 0) return null;

  return (
    <div className="admin-card" style={{ marginTop: '1.5rem' }}>
      <div className="admin-card-header">
        <h2>Order Timeline</h2>
      </div>
      <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
        <div
          style={{
            position: 'absolute',
            left: '0.5rem',
            top: '0',
            bottom: '0',
            width: '2px',
            background: 'var(--border-color)',
          }}
        />
        {events.map((ev, i) => (
          <div
            key={i}
            style={{ position: 'relative', paddingBottom: '1rem', paddingLeft: '1.5rem' }}
          >
            <div
              style={{
                position: 'absolute',
                left: '-1.25rem',
                top: '0.35rem',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--accent-red)',
                border: '2px solid var(--bg-primary)',
              }}
            />
            <p style={{ margin: 0, fontWeight: 500 }}>{ev.label}</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {new Date(ev.time).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
