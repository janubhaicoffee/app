'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Eye,
  RotateCcw,
  Filter,
  Clock,
  DollarSign,
  User,
} from 'lucide-react';

const STATUSES = ['all', 'pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'];

export default function POSOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [outletId, setOutletId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refunding, setRefunding] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      let oid = sessionStorage.getItem('selected_outlet_id');
      if (!oid) {
        const { data: staff } = await supabase
          .from('outlet_staff')
          .select('outlet_id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        oid = staff?.outlet_id;
        if (oid) sessionStorage.setItem('selected_outlet_id', oid);
      }
      setOutletId(oid);

      const params = new URLSearchParams();
      if (oid) params.set('outletId', oid);
      if (dateFilter) params.set('date', dateFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '100');

      const res = await fetch(`/api/pos/orders?${params}`);
      if (res.ok) {
        const { data } = await res.json();
        let list = Array.isArray(data) ? data : [];
        if (paymentFilter) list = list.filter((o) => o.payment_status === paymentFilter);
        setOrders(list);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, paymentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const channel = supabase.channel('pos-orders-realtime');
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_orders' }, () => {
        fetchOrders();
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pos_order_items' },
        () => {
          fetchOrders();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const handleRefund = async (order) => {
    if (!confirm(`Process refund for ${order.order_number}?`)) return;
    setRefunding(true);
    try {
      const res = await fetch(`/api/pos/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', payment_status: 'refunded' }),
      });
      if (res.ok) {
        fetchOrders();
        setSelectedOrder(null);
      } else {
        const b = await res.json();
        alert(b.error || 'Refund failed');
      }
    } catch {
    } finally {
      setRefunding(false);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
  const unpaidOrders = orders.filter((o) => o.payment_status === 'unpaid').length;

  return (
    <div>
      <div className="outlet-page-header">
        <div>
          <h1>POS Orders</h1>
          <p className="outlet-page-subtitle">
            {orders.length} orders &middot; {unpaidOrders} unpaid
          </p>
        </div>
        <button className="outlet-btn outline sm" onClick={fetchOrders}>
          <RefreshCw size={14} />
        </button>
      </div>

      {error && <div className="outlet-error-banner">{error}</div>}

      <div className="outlet-stats-grid">
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon blue">
            <ShoppingCart size={24} />
          </div>
          <div className="outlet-stat-info">
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon green">
            <DollarSign size={24} />
          </div>
          <div className="outlet-stat-info">
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Revenue</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon orange">
            <Clock size={24} />
          </div>
          <div className="outlet-stat-info">
            <h3>{unpaidOrders}</h3>
            <p>Unpaid</p>
          </div>
        </div>
      </div>

      <div className="outlet-filter-bar">
        <div className="outlet-tabs" style={{ margin: 0 }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`outlet-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <input
          type="date"
          className="form-control"
          style={{ width: 160 }}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          style={{ width: 140 }}
        >
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      <div className="outlet-card">
        <div className="table-responsive" style={{ maxHeight: 500 }}>
          <table className="outlet-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Items</th>
                <th>Type</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Staff</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="outlet-empty">
                      <p>No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const items = order.pos_order_items;
                  const itemSummary = Array.isArray(items)
                    ? items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')
                    : '-';
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700 }}>{order.order_number || `#${order.id}`}</td>
                      <td
                        style={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={itemSummary}
                      >
                        {itemSummary}
                      </td>
                      <td>
                        <span className="outlet-badge gray">{order.order_type}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(order.total_amount)}</td>
                      <td>
                        <span
                          className={`outlet-badge ${order.payment_status === 'paid' ? 'green' : 'red'}`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`outlet-badge ${order.status === 'completed' ? 'green' : order.status === 'cancelled' ? 'red' : 'yellow'}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>{order.staff_id ? `#${order.staff_id}` : '-'}</td>
                      <td style={{ fontSize: 12 }}>
                        {new Date(order.created_at).toLocaleTimeString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="outlet-btn outline sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={12} />
                          </button>
                          {order.payment_status === 'paid' && (
                            <button
                              className="outlet-btn danger sm"
                              onClick={() => handleRefund(order)}
                              disabled={refunding}
                            >
                              <RotateCcw size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="outlet-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="outlet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="outlet-modal-header">
              <span>Order {selectedOrder.order_number}</span>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
              >
                &times;
              </button>
            </div>
            <div className="outlet-modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 12, color: '#718096', margin: 0 }}>Type</p>
                  <p style={{ fontWeight: 600, margin: 0 }}>{selectedOrder.order_type}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: '#718096', margin: 0 }}>Status</p>
                  <span
                    className={`outlet-badge ${selectedOrder.status === 'completed' ? 'green' : selectedOrder.status === 'cancelled' ? 'red' : 'yellow'}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 12, color: '#718096', margin: 0 }}>Time</p>
                  <p style={{ margin: 0 }}>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: '#718096', margin: 0 }}>Payment</p>
                  <span
                    className={`outlet-badge ${selectedOrder.payment_status === 'paid' ? 'green' : 'red'}`}
                  >
                    {selectedOrder.payment_status}
                  </span>
                </div>
              </div>

              <h4 style={{ margin: '16px 0 8px', fontSize: 14 }}>Items</h4>
              <table className="outlet-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(selectedOrder.pos_order_items)
                    ? selectedOrder.pos_order_items
                    : []
                  ).map((item, i) => (
                    <tr key={i}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={{
                  borderTop: '2px solid #e2e8f0',
                  marginTop: 16,
                  paddingTop: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                <span>Total</span>
                <span>{formatCurrency(selectedOrder.total_amount)}</span>
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                {selectedOrder.payment_status === 'paid' && (
                  <button
                    className="outlet-btn danger"
                    onClick={() => handleRefund(selectedOrder)}
                    disabled={refunding}
                  >
                    <RotateCcw size={14} /> Process Refund
                  </button>
                )}
                <button className="outlet-btn outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function formatCurrency(n) {
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }
}
