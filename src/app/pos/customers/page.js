'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, Phone, User, ShoppingCart, ArrowLeft } from 'lucide-react';
import '../pos.css';

export default function PosCustomers() {
  const router = useRouter();
  const [outlet, setOutlet] = useState(null);
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('pos_outlet');
    if (!stored) {
      router.push('/pos');
      return;
    }
    setOutlet(JSON.parse(stored));
  }, [router]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data: cust } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone.trim())
        .maybeSingle();

      setCustomer(cust);

      if (cust) {
        const { data: posOrders } = await supabase
          .from('pos_orders')
          .select('*')
          .or(`customer_id.eq.${cust.id},customer_phone.eq.${phone.trim()}`)
          .order('created_at', { ascending: false })
          .limit(20);

        setOrders(posOrders || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Customer search error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="pos-fullscreen">
      <div className="pos-top-bar">
        <button onClick={() => router.push('/pos/dashboard')}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1>Customer Lookup</h1>
        <div />
      </div>

      <div style={{ overflow: 'auto', flex: 1 }}>
        <form onSubmit={handleSearch} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Search by phone number..."
              style={{
                flex: 1,
                padding: '12px',
                border: '2px solid var(--border-color)',
                fontSize: '1rem',
              }}
            />
            <button type="submit" className="pos-btn primary" disabled={loading || !phone.trim()}>
              <Search size={16} /> Search
            </button>
          </div>
        </form>

        {loading && <div className="pos-loading">Searching...</div>}

        {!loading && searched && !customer && (
          <div className="pos-empty" style={{ padding: '40px' }}>
            <User size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>No customer found with this phone number</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              This phone will be auto-registered when they place an order
            </p>
          </div>
        )}

        {customer && (
          <div style={{ padding: '0 20px 20px' }}>
            <div className="pos-panel" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, marginBottom: 12 }}>{customer.name || 'Customer'}</h2>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13 }}>
                {customer.phone && (
                  <span>
                    <Phone size={14} /> {customer.phone}
                  </span>
                )}
                {customer.email && (
                  <span>
                    <User size={14} /> {customer.email}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 13 }}>
                <span>
                  <strong>Orders:</strong> {customer.total_orders || 0}
                </span>
                <span>
                  <strong>Spent:</strong> ₹{parseFloat(customer.total_spent || 0).toFixed(2)}
                </span>
                <span>
                  <strong>Visits:</strong> {customer.visit_count || 0}
                </span>
              </div>
              {customer.last_order_at && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                  Last order: {new Date(customer.last_order_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <h3
              style={{
                fontSize: 14,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ShoppingCart size={16} /> Recent POS Orders
            </h3>
            {orders.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No POS orders yet</p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="pos-order-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/pos/orders/${order.id}`)}
                >
                  <div className="pos-order-number">#{order.order_number}</div>
                  <div className="pos-order-info">
                    <div className="pos-order-meta">
                      {new Date(order.created_at).toLocaleDateString()} · {order.type}
                    </div>
                    <span className={`pos-badge ${order.status}`}>{order.status}</span>
                  </div>
                  <div className="pos-order-total">₹{parseFloat(order.total || 0).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
