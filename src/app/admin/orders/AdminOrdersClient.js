"use client";
import { useState } from "react";

export default function AdminOrdersClient({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div>
      <div className="admin-header">
        <h1>Orders & Shipping</h1>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No orders found.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.id.split('-')[0]}</td>
                  <td>{order.customer_email || order.customer_phone || "Guest"}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>₹{order.total_amount}</td>
                  <td>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      background: order.status === 'processing' ? '#cce5ff' : order.status === 'pending' ? '#fff3cd' : '#d4edda',
                      color: order.status === 'processing' ? '#004085' : order.status === 'pending' ? '#856404' : '#155724'
                    }}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button className="admin-btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={() => setSelectedOrder(order)}>View Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '600px', backgroundColor: 'var(--bg-primary)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Order #{selectedOrder.id.split('-')[0]}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Customer Details</h4>
                <p style={{ margin: '0 0 0.2rem 0' }}>{selectedOrder.customer_email || 'No Email'}</p>
                <p style={{ margin: 0 }}>{selectedOrder.customer_phone || 'No Phone'}</p>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Shipping Info</h4>
                <p style={{ margin: '0 0 0.2rem 0' }}>AWB: <strong>{selectedOrder.awb_number || 'Pending'}</strong></p>
                <p style={{ margin: 0 }}>Status: {selectedOrder.status}</p>
              </div>
            </div>

            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Items Ordered</h4>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                selectedOrder.order_items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx < selectedOrder.order_items.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>{item.product_name}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</p>
                    </div>
                    <p style={{ margin: 0 }}>₹{item.price * item.quantity}</p>
                  </div>
                ))
              ) : (
                <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)' }}>No item details found.</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <h3 style={{ margin: 0 }}>Total</h3>
              <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>₹{selectedOrder.total_amount}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
