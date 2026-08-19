'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  Search,
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle,
  WifiOff,
} from 'lucide-react';
import { fetchOrders, processPayment } from '@/lib/offlineApi';
import useOnlineStatus from '@/hooks/useOnlineStatus';
import toast from 'react-hot-toast';
import '../pos.css';

export default function PosPayments() {
  const router = useRouter();
  const online = useOnlineStatus();
  const [outlet, setOutlet] = useState(null);
  const [searchNumber, setSearchNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [method, setMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState('0');
  const [cardRef, setCardRef] = useState('');
  const [upiRef, setUpiRef] = useState('');
  const [tip, setTip] = useState('0');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [outletUpiId, setOutletUpiId] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('pos_outlet');
    if (!stored) {
      router.push('/pos');
      return;
    }
    const parsed = JSON.parse(stored);
    setOutlet(parsed);
    setOutletUpiId(parsed.upi_id || parsed.upi || 'pay@janubhaicoffee');
  }, [router]);

  const handleSearch = async () => {
    if (!searchNumber.trim() || !outlet) return;
    setSearching(true);
    setSearchError(null);
    setOrder(null);
    try {
      const result = await fetchOrders(outlet.id, { search: searchNumber.trim() });
      const data = result.data || [];
      if (data.length === 0) {
        setSearchError('Order not found');
      } else {
        const found = data[0];
        setOrder(found);
        setAmountTendered(found.total);
      }
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handlePayment = async () => {
    if (!order || !outlet) return;
    setProcessing(true);
    try {
      const payload = {
        order_id: order.id,
        outlet_id: outlet.id,
        amount: parseFloat(order.total),
        tip: parseFloat(tip || 0),
        method,
        tendered: method === 'cash' ? parseFloat(amountTendered || 0) : undefined,
        reference: method === 'card' ? cardRef : method === 'upi' ? upiRef : undefined,
        status: method === 'cash' || method === 'upi' ? 'completed' : 'completed',
      };

      const result = await processPayment(payload);

      if (result.offline) {
        toast.success('Payment recorded offline. Will sync when connected');
      }

      if (online && method !== 'cash' && method !== 'upi') {
        await fetch(`/api/pos/orders/${order.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed', payment_status: 'paid' }),
        }).catch(() => {});
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOrder(null);
        setSearchNumber('');
        setMethod('cash');
        setTip('0');
        setCardRef('');
        setUpiRef('');
      }, 2000);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const tendered = parseFloat(amountTendered) || 0;
  const orderTotal = order ? parseFloat(order.total || 0) : 0;
  const change = tendered - orderTotal - parseFloat(tip || 0);

  const methods = [
    { key: 'cash', label: 'Cash', icon: Banknote },
    { key: 'card', label: 'Card', icon: CreditCard },
    { key: 'upi', label: 'UPI', icon: Smartphone },
  ];

  return (
    <div className="pos-fullscreen">
      <div className="pos-top-bar">
        <button onClick={() => router.push('/pos/dashboard')}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1>Payments</h1>
        <div />
      </div>

      {!online && (
        <div
          style={{
            padding: '4px 8px',
            background: '#ffebee',
            color: '#c62828',
            fontSize: 11,
            textAlign: 'center',
          }}
        >
          <WifiOff size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Offline: cash and UPI payments accepted. Card payments may be delayed.
        </div>
      )}

      <div className="pos-orders-container" style={{ overflow: 'auto', flex: 1 }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <CheckCircle size={64} style={{ color: '#2e7d32' }} />
            <h2 style={{ marginTop: 16 }}>Payment Successful!</h2>
          </div>
        ) : (
          <>
            <div className="pos-panel" style={{ marginBottom: 16 }}>
              <h2>Find Order</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="pos-cart-input"
                  style={{ flex: 1 }}
                  placeholder="Search by order number..."
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="pos-btn primary" onClick={handleSearch} disabled={searching}>
                  <Search size={16} /> {searching ? '...' : 'Search'}
                </button>
              </div>
              {searchError && (
                <div style={{ color: '#c62828', fontSize: 13, marginTop: 8 }}>{searchError}</div>
              )}
            </div>

            {order && (
              <>
                <div className="pos-panel" style={{ marginBottom: 16 }}>
                  <h2>Order #{order.order_number || order.id.toString().slice(-4)}</h2>
                  <div style={{ fontSize: 14, marginBottom: 8 }}>
                    {order.customer_name || 'Walk-in'} · {order.type}
                    {order.table_number && ` · Table ${order.table_number}`}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
                  </div>
                  {(order.items || []).length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      {(order.items || []).map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: 13,
                            padding: '2px 0',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>
                            {item.quantity}x {item.product_name || item.name}
                          </span>
                          <span>
                            ₹
                            {parseFloat(
                              (item.unit_price || item.price || 0) * item.quantity,
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: 'var(--accent-red)',
                      textAlign: 'right',
                    }}
                  >
                    Total: ₹{orderTotal.toFixed(2)}
                  </div>
                </div>

                <div className="pos-panel">
                  <h2>Process Payment</h2>

                  <div className="pos-pay-methods">
                    {methods.map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.key}
                          className={`pos-pay-method ${method === m.key ? 'active' : ''}`}
                          onClick={() => setMethod(m.key)}
                        >
                          <Icon size={20} />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pos-pay-amount" style={{ fontSize: 28 }}>
                    ₹{orderTotal.toFixed(2)}
                  </div>

                  {method === 'cash' && (
                    <>
                      <div className="pos-pay-input-group">
                        <label>Amount Tendered</label>
                        <input
                          type="number"
                          step="0.01"
                          value={amountTendered}
                          onChange={(e) => setAmountTendered(e.target.value)}
                        />
                      </div>
                      {tendered >= orderTotal + parseFloat(tip || 0) && (
                        <div className="pos-change-display">
                          <div>Change Due</div>
                          <div className="change-amount">₹{Math.max(0, change).toFixed(2)}</div>
                        </div>
                      )}
                    </>
                  )}

                  {method === 'card' && (
                    <div className="pos-pay-input-group">
                      <label>Card Reference / Last 4 digits</label>
                      <input
                        type="text"
                        placeholder="e.g., AUTH12345"
                        value={cardRef}
                        onChange={(e) => setCardRef(e.target.value)}
                      />
                    </div>
                  )}

                  {method === 'upi' && (
                    <>
                      <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <div
                          style={{
                            background: '#fff',
                            border: '2px dashed var(--accent-red)',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 8,
                            display: 'inline-block',
                          }}
                        >
                          {outlet?.upi_qr_url ? (
                            <img
                              src={outlet.upi_qr_url}
                              alt="UPI QR"
                              style={{ width: 200, height: 200, objectFit: 'contain' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 200,
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f5f5f5',
                                borderRadius: 8,
                                fontSize: 14,
                                color: 'var(--text-secondary)',
                              }}
                            >
                              No QR configured
                            </div>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{outletUpiId}</div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                          Customer scans QR and pays via any UPI app
                        </p>
                      </div>
                      <div className="pos-pay-input-group">
                        <label>UPI Transaction Ref (optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., UPI12345678"
                          value={upiRef}
                          onChange={(e) => setUpiRef(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <div className="pos-pay-input-group">
                    <label>Tip (optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={tip}
                      onChange={(e) => setTip(e.target.value)}
                    />
                  </div>

                  <button className="pos-confirm-pay" onClick={handlePayment} disabled={processing}>
                    {processing
                      ? 'Processing...'
                      : `Confirm Payment • ₹${(orderTotal + parseFloat(tip || 0)).toFixed(2)}`}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
