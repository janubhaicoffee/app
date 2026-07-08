'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_STYLES = {
  pending: { color: '#856404', bg: '#fff3cd' },
  processing: { color: '#004085', bg: '#cce5ff' },
  shipped: { color: '#e65100', bg: '#ffe0b2' },
  delivered: { color: '#155724', bg: '#d4edda' },
  cancelled: { color: '#721c24', bg: '#f8d7da' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());

  // Quick-update modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalAwb, setModalAwb] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin/data?type=orders', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (res.ok) setOrders(json.data || []);
      else setError(json.error);
    } catch {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtered + searched orders
  const filteredOrders = useMemo(() => {
    let list = orders;
    if (statusFilter !== 'all') {
      list = list.filter((o) => o.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.id?.toLowerCase().includes(q) ||
          (o.customer_email || '').toLowerCase().includes(q) ||
          (o.customer_phone || '').includes(q),
      );
    }
    return list;
  }, [orders, statusFilter, searchQuery]);

  const toggleOrderSelection = (id) => {
    const next = new Set(selectedOrderIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOrderIds(next);
  };

  const selectAll = () => {
    if (selectedOrderIds.size === filteredOrders.length) setSelectedOrderIds(new Set());
    else setSelectedOrderIds(new Set(filteredOrders.map((o) => o.id)));
  };

  const handleBulkFulfill = async () => {
    if (selectedOrderIds.size === 0) return;
    if (!confirm(`Are you sure you want to mark ${selectedOrderIds.size} orders as processed?`))
      return;
    setIsUpdating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const idsArray = Array.from(selectedOrderIds);

      // Update each order one by one for simplicity (or can build a bulk endpoint)
      for (const id of idsArray) {
        await fetch('/api/admin/data', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update_order',
            id: id,
            payload: { status: 'processing' },
          }),
        });
      }
      alert('Orders updated to processing successfully!');
      fetchOrders();
      setSelectedOrderIds(new Set());
    } catch {
      alert('An error occurred during bulk update.');
    } finally {
      setIsUpdating(false);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setModalStatus(order.status || 'pending');
    setModalAwb(order.awb_number || '');
  };

  const handleUpdateOrder = async () => {
    setIsUpdating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_order',
          id: selectedOrder.id,
          payload: { status: modalStatus, awb_number: modalAwb },
        }),
      });
      if (res.ok) {
        alert('Order updated successfully!');
        fetchOrders();
        setSelectedOrder(null);
      } else {
        const err = await res.json();
        alert('Failed to update order: ' + (err.error || ''));
      }
    } catch {
      alert('An error occurred while updating.');
    } finally {
      setIsUpdating(false);
    }
  };

  const exportCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      'Order ID',
      'Customer Email',
      'Customer Phone',
      'Total Amount',
      'Status',
      'Date',
      'AWB',
      'Items',
      'Payment ID',
    ];
    const csvRows = [headers.join(',')];
    orders.forEach((o) => {
      const row = [
        o.id,
        `"${o.customer_email || ''}"`,
        `"${o.customer_phone || ''}"`,
        o.total_amount,
        o.status,
        new Date(o.created_at).toISOString().split('T')[0],
        `"${o.awb_number || ''}"`,
        (o.order_items || []).length,
        `"${o.razorpay_payment_id || ''}"`,
      ];
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Counts for filter tabs
  const counts = useMemo(() => {
    const c = { all: orders.length };
    STATUSES.slice(1).forEach((s) => {
      c[s] = orders.filter((o) => o.status === s).length;
    });
    return c;
  }, [orders]);

  if (loading)
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div> Loading orders...
      </div>
    );
  if (error)
    return (
      <div className="admin-loading" style={{ color: '#c62828' }}>
        Error: {error}
      </div>
    );

  return (
    <div>
      <div
        className="admin-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <h1>Orders &amp; Shipping</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {selectedOrderIds.size > 0 && (
            <button
              className="admin-btn"
              style={{ background: 'var(--primary-color)' }}
              onClick={handleBulkFulfill}
              disabled={isUpdating}
            >
              {isUpdating ? 'Processing...' : `Fulfill ${selectedOrderIds.size} Orders`}
            </button>
          )}
          <button className="admin-btn-outline" onClick={exportCSV}>
            Download CSV
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {STATUSES.map((s) => {
          const cfg =
            s === 'all' ? { label: 'All', color: '#333', bg: '#e0e0e0' } : STATUS_STYLES[s];
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                border: isActive ? `2px solid ${cfg.color}` : '2px solid transparent',
                background: isActive ? cfg.bg : 'transparent',
                color: isActive ? cfg.color : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s === 'all' ? 'All' : s} ({counts[s]})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="admin-card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <input
          type="text"
          placeholder="Search by Order ID, Email, or Phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={
                    filteredOrders.length > 0 && selectedOrderIds.size === filteredOrders.length
                  }
                  onChange={selectAll}
                />
              </th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    padding: '2rem',
                  }}
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const st = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                return (
                  <tr
                    key={order.id}
                    style={{
                      background: selectedOrderIds.has(order.id) ? '#faf8f5' : 'transparent',
                    }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.has(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                      />
                    </td>
                    <td>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          color: 'var(--accent-red)',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {order.id?.split('-')[0]}
                      </Link>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {order.customer_email || order.customer_phone || 'Guest'}
                    </td>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>{(order.order_items || []).length || 0}</td>
                    <td style={{ fontWeight: 600 }}>₹{order.total_amount}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: st.bg,
                          color: st.color,
                          textTransform: 'uppercase',
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="admin-btn-outline"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            textDecoration: 'none',
                          }}
                        >
                          View
                        </Link>
                        <button
                          className="admin-btn-outline"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                          }}
                          onClick={() => openModal(order)}
                        >
                          Quick Edit
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

      {/* Quick-edit modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '520px',
              backgroundColor: 'var(--bg-primary)',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Order #{selectedOrder.id?.split('-')[0]}</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h4
                  style={{
                    margin: '0 0 0.5rem 0',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                  }}
                >
                  Customer Details
                </h4>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem' }}>
                  {selectedOrder.customer_email || 'No Email'}
                </p>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                  {selectedOrder.customer_phone || 'No Phone'}
                </p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ₹{selectedOrder.total_amount} &middot; {(selectedOrder.order_items || []).length}{' '}
                  item(s)
                </p>
              </div>
              <div
                style={{
                  background: '#fcfcfc',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 0.75rem 0',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                >
                  Update Fulfillment
                </h4>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.2rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Status:
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="admin-select"
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.2rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Tracking / AWB No:
                </label>
                <input
                  type="text"
                  value={modalAwb}
                  onChange={(e) => setModalAwb(e.target.value)}
                  placeholder="e.g. AWB123456789"
                  className="admin-select"
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                />

                <button
                  onClick={handleUpdateOrder}
                  disabled={isUpdating}
                  className="admin-btn"
                  style={{ width: '100%' }}
                >
                  {isUpdating ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </div>

            {/* Quick items preview */}
            <h4
              style={{
                margin: '0 0 0.5rem 0',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
              }}
            >
              Items Ordered
            </h4>
            <div
              style={{
                background: 'rgba(0,0,0,0.02)',
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                border: '1px solid var(--border-color)',
              }}
            >
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                selectedOrder.order_items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.4rem 0',
                      borderBottom:
                        idx < selectedOrder.order_items.length - 1
                          ? '1px solid var(--border-color)'
                          : 'none',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.product_name}</span>
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          color: 'var(--text-secondary)',
                          fontSize: '0.8rem',
                        }}
                      >
                        x{item.quantity}
                      </span>
                    </div>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontStyle: 'italic',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                  }}
                >
                  No item details found.
                </p>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.75rem',
              }}
            >
              <div>
                <Link
                  href={`/admin/orders/${selectedOrder.id}`}
                  className="admin-btn-outline"
                  style={{ fontSize: '0.85rem', textDecoration: 'none' }}
                  onClick={() => setSelectedOrder(null)}
                >
                  Full Details &rarr;
                </Link>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total</span>
                <h3 style={{ margin: 0, color: 'var(--accent-red)' }}>
                  ₹{selectedOrder.total_amount}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
