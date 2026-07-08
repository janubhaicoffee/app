'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Search,
  Calendar,
  Landmark,
  MapPin,
  Truck,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import './page.css';

function TrackPageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [trackingData, setTrackingData] = useState(null);

  useEffect(() => {
    // Check if query exists in search params on load
    const orderParam =
      searchParams.get('order') || searchParams.get('awb') || searchParams.get('q');
    if (orderParam) {
      setQuery(orderParam);
      performTracking(orderParam);
    }
  }, [searchParams]);

  const performTracking = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setOrderData(null);
    setTrackingData(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setOrderData(data.order || null);
        setTrackingData(data.tracking);
      } else {
        setError(data.error || 'Unable to track this Order / AWB.');
      }
    } catch (err) {
      setError('Failed to fetch tracking data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    performTracking(query);
  };

  // Helper to determine active stepper stage
  const getStepperStage = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'pending') return 1;
    if (s === 'payment_successful_shipping_failed' || s === 'payment_webhook_received') return 2;
    if (s === 'processing') return 3;
    if (s === 'delivered') return 5;
    // Shipped or in_transit statuses
    if (
      s === 'shipped' ||
      s === 'in_transit' ||
      s === 'dispatched' ||
      s === 'out_for_delivery' ||
      s === 'rto' ||
      s === 'returned'
    )
      return 4;
    return 3; // Default to preparing
  };

  const activeStage = trackingData ? getStepperStage(trackingData.status) : 1;

  const stepperStages = [
    { number: 1, label: 'Placed', desc: 'Order Received' },
    { number: 2, label: 'Paid', desc: 'Payment Confirmed' },
    { number: 3, label: 'Preparing', desc: 'Roasting & Packing' },
    { number: 4, label: 'Shipped', desc: 'In Transit' },
    { number: 5, label: 'Delivered', desc: 'Enjoy your coffee!' },
  ];

  return (
    <main className="track-page-wrapper">
      <div className="track-container vintage-border">
        <h1 className="track-title">TRACK YOUR ORDER</h1>
        <p
          className="track-subtitle"
          style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}
        >
          Enter your Order Number (e.g. JB-1720367489), AWB, or Database UUID.
        </p>

        <form
          onSubmit={handleTrack}
          className="track-form"
          style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="e.g. JB-1720367489"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="track-input"
              style={{ width: '100%', paddingRight: '40px' }}
              required
            />
            <Package
              size={20}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#888',
              }}
            />
          </div>
          <button
            type="submit"
            className="track-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            disabled={loading}
          >
            <Search size={18} />
            {loading ? 'SEARCHING...' : 'TRACK'}
          </button>
        </form>

        {error && <p className="track-error">{error}</p>}

        {loading && (
          <div className="text-center" style={{ padding: '3rem 0' }}>
            <div
              className="spinner"
              style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid var(--accent-red)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px',
              }}
            ></div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Retrieving live order and shipping status...
            </p>
          </div>
        )}

        {trackingData && (
          <div className="track-results-content fade-in">
            {/* 1. Status Stepper */}
            <div className="stepper-wrapper" style={{ margin: '2rem 0 3rem 0' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '18px',
                    left: '10%',
                    right: '10%',
                    height: '4px',
                    backgroundColor: '#e2e8f0',
                    zIndex: 1,
                  }}
                ></div>
                <div
                  style={{
                    position: 'absolute',
                    top: '18px',
                    left: '10%',
                    width: `${((activeStage - 1) / 4) * 80}%`,
                    height: '4px',
                    backgroundColor: 'var(--accent-red)',
                    zIndex: 2,
                    transition: 'width 0.8s ease-in-out',
                  }}
                ></div>

                {stepperStages.map((stage) => {
                  const isCompleted = activeStage >= stage.number;
                  const isActive = activeStage === stage.number;
                  return (
                    <div
                      key={stage.number}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '20%',
                        zIndex: 3,
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? 'var(--accent-red)' : '#fff',
                          border: isCompleted ? '2px solid var(--accent-red)' : '2px solid #cbd5e1',
                          color: isCompleted ? '#fff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          boxShadow: isActive ? '0 0 12px rgba(183, 28, 28, 0.4)' : 'none',
                          transition: 'all 0.5s ease',
                        }}
                      >
                        {isCompleted ? <CheckCircle2 size={20} /> : stage.number}
                      </div>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: isCompleted ? 'bold' : 'normal',
                          marginTop: '8px',
                          color: isCompleted ? 'var(--text-primary)' : '#64748b',
                        }}
                      >
                        {stage.label}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#94a3b8',
                          display: 'block',
                          textAlign: 'center',
                        }}
                      >
                        {stage.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Order Information Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '2rem',
              }}
            >
              <div className="track-result" style={{ margin: 0 }}>
                <h3>Order Information</h3>
                <div className="track-info-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="track-info-item">
                    <span className="track-label">Order Reference</span>
                    <span
                      className="track-value"
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '1.2rem',
                        color: 'var(--accent-red)',
                      }}
                    >
                      {trackingData.order_number}
                    </span>
                  </div>
                  {orderData && (
                    <>
                      <div className="track-info-item" style={{ marginTop: '10px' }}>
                        <span className="track-label">Order Date</span>
                        <span
                          className="track-value"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Calendar size={16} />
                          {new Date(orderData.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="track-info-item" style={{ marginTop: '10px' }}>
                        <span className="track-label">Total Paid Amount</span>
                        <span className="track-value" style={{ fontWeight: '700' }}>
                          ₹ {orderData.total_amount}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="track-result" style={{ margin: 0 }}>
                <h3>Shipping & Logistics</h3>
                <div className="track-info-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="track-info-item">
                    <span className="track-label">AWB / Airway Bill</span>
                    <span className="track-value" style={{ fontFamily: 'monospace' }}>
                      {trackingData.awb_number || 'Awaiting courier assignment'}
                    </span>
                  </div>
                  <div className="track-info-item" style={{ marginTop: '10px' }}>
                    <span className="track-label">Courier Service</span>
                    <span
                      className="track-value"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Truck size={16} />
                      {trackingData.courier_name}
                    </span>
                  </div>
                  {orderData && (
                    <div className="track-info-item" style={{ marginTop: '10px' }}>
                      <span className="track-label">Deliver To</span>
                      <span
                        className="track-value"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <MapPin size={16} />
                        {orderData.shipping_address.city}, {orderData.shipping_address.state} (
                        {orderData.shipping_address.pincode})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Items Summary */}
            {orderData && orderData.items && orderData.items.length > 0 && (
              <div className="track-result" style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '8px',
                    marginBottom: '15px',
                  }}
                >
                  Items in this Shipment
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {orderData.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            backgroundColor: 'var(--accent-red)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {item.quantity}x
                        </span>
                        <span style={{ fontWeight: '500' }}>{item.product_name}</span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#64748b' }}>
                        ₹ {item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Tracking History Timeline */}
            <div className="track-result">
              <h3>Tracking Status History</h3>
              <div
                className="timeline-container"
                style={{ paddingLeft: '15px', marginTop: '1.5rem' }}
              >
                {trackingData.history && trackingData.history.length > 0 ? (
                  trackingData.history.map((event, index) => (
                    <div key={index} className="timeline-event" style={{ paddingLeft: '15px' }}>
                      <div
                        className="timeline-dot"
                        style={{
                          backgroundColor: index === 0 ? 'var(--accent-red)' : '#94a3b8',
                          boxShadow: index === 0 ? '0 0 10px var(--accent-red)' : 'none',
                        }}
                      ></div>
                      <div className="timeline-content">
                        <h3
                          style={{
                            color: index === 0 ? 'var(--accent-red)' : 'var(--text-primary)',
                            fontWeight: index === 0 ? '700' : '500',
                            fontSize: '1.05rem',
                          }}
                        >
                          {event.status_code} - {event.message}
                        </h3>
                        {event.location && (
                          <p
                            style={{ fontSize: '0.85rem', margin: '2px 0 6px 0', color: '#64748b' }}
                          >
                            <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />{' '}
                            {event.location}
                          </p>
                        )}
                        <span
                          className="timeline-date"
                          style={{ color: index === 0 ? 'var(--accent-red)' : '#64748b' }}
                        >
                          {event.event_time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      textAlign: 'center',
                      padding: '1rem 0',
                    }}
                  >
                    No tracking updates available yet. The courier will scan it shortly upon pickup.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="track-page-wrapper">
          <div className="track-container text-center">
            <p>Loading tracking screen...</p>
          </div>
        </div>
      }
    >
      <TrackPageContent />
    </Suspense>
  );
}
