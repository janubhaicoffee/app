"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateData, setUpdateData] = useState({ status: '', awb_number: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data?type=orders", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      const json = await res.json();
      if (res.ok) setOrders(json.data || []);
      else setError(json.error);
    } catch (err) {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrder = (order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status || 'pending',
      awb_number: order.awb_number || ''
    });
  };

  const handleUpdateOrder = async () => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "update_order",
          id: selectedOrder.id,
          payload: {
            status: updateData.status,
            awb_number: updateData.awb_number
          }
        })
      });
      if (res.ok) {
        alert("Order updated successfully!");
        fetchOrders();
        setSelectedOrder({ ...selectedOrder, ...updateData });
      } else {
        const err = await res.json();
        alert("Failed to update order: " + (err.error || ""));
      }
    } catch (e) {
      alert("An error occurred while updating.");
    } finally {
      setIsUpdating(false);
    }
  };

  const exportCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Order ID", "Customer Email", "Customer Phone", "Total Amount", "Status", "Date", "AWB"];
    const csvRows = [headers.join(",")];
    
    orders.forEach(o => {
      const row = [
        o.id,
        `"${o.customer_email || ''}"`,
        `"${o.customer_phone || ''}"`,
        o.total_amount,
        o.status,
        new Date(o.created_at).toISOString().split('T')[0],
        `"${o.awb_number || ''}"`
      ];
      csvRows.push(row.join(","));
    });
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading orders...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Orders & Shipping</h1>
        <button className="admin-btn" onClick={exportCSV}>Download CSV</button>
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
                      background: order.status === 'processing' ? '#cce5ff' : order.status === 'pending' ? '#fff3cd' : order.status === 'cancelled' ? '#f8d7da' : '#d4edda',
                      color: order.status === 'processing' ? '#004085' : order.status === 'pending' ? '#856404' : order.status === 'cancelled' ? '#721c24' : '#155724'
                    }}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button className="admin-btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={() => openOrder(order)}>View Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '600px', backgroundColor: 'var(--bg-primary)', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Order #{selectedOrder.id.split('-')[0]}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Customer Details</h4>
                <p style={{ margin: '0 0 0.2rem 0' }}>{selectedOrder.customer_email || 'No Email'}</p>
                <p style={{ margin: 0 }}>{selectedOrder.customer_phone || 'No Phone'}</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>{selectedOrder.shipping_address ? JSON.parse(selectedOrder.shipping_address).address : ''}</p>
              </div>
              <div style={{ background: '#fcfcfc', padding: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Fulfillment Status</h4>
                
                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Status:</label>
                <select 
                  value={updateData.status} 
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Tracking / AWB No:</label>
                <input 
                  type="text" 
                  value={updateData.awb_number} 
                  onChange={(e) => setUpdateData({...updateData, awb_number: e.target.value})}
                  placeholder="e.g. AWB123456789"
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />

                <button onClick={handleUpdateOrder} disabled={isUpdating} className="admin-btn" style={{ width: '100%' }}>
                  {isUpdating ? "Saving..." : "Save Updates"}
                </button>
              </div>
            </div>

            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Items Ordered</h4>
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
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
              <h3 style={{ margin: 0, color: 'var(--accent-red)' }}>₹{selectedOrder.total_amount}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
