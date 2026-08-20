'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchOrders, fetchShiftStatus } from '@/lib/offlineApi';
import {
  ShoppingCart,
  ClipboardList,
  ChefHat,
  Timer,
  DollarSign,
  TrendingUp,
  LogOut,
  CalendarClock,
  PlusCircle,
  ListOrdered,
  Users,
  Package,
  Store,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Coffee,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import '../pos.css';

export default function PosDashboard() {
  const router = useRouter();
  const [outlet, setOutlet] = useState(null);
  const [stats, setStats] = useState({ todayOrders: 0, todayRevenue: 0, openOrders: 0, lowStockCount: 0 });
  const [shift, setShift] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [checklists, setChecklists] = useState({ openingDone: false, closingDone: false });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [staffRole, setStaffRole] = useState('Staff');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('pos_outlet');
    if (!stored) {
      router.push('/pos');
      return;
    }
    const parsedOutlet = JSON.parse(stored);
    setOutlet(parsedOutlet);
    const impRole = sessionStorage.getItem('impersonated_role') || 'staff';
    setStaffRole(impRole.toUpperCase());
  }, [router]);

  useEffect(() => {
    if (!outlet) return;

    const load = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [ordersRes, shiftRes, invRes, checklistRes] = await Promise.allSettled([
          fetchOrders(outlet.id, { limit: 10 }),
          fetchShiftStatus(outlet.id),
          fetch(`/api/outlet/inventory?outletId=${outlet.id}&lowStock=true`),
          fetch(`/api/outlet/checklists?outletId=${outlet.id}&date=${today}`),
        ]);

        let orders = [];
        if (ordersRes.status === 'fulfilled') {
          orders = ordersRes.value.data || [];
          const active = orders.filter(
            (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready',
          );
          setActiveOrders(active);
          setStats((prev) => ({
            ...prev,
            todayOrders: orders.length,
            todayRevenue: orders.reduce((s, o) => s + parseFloat(o.total || o.total_amount || 0), 0),
            openOrders: active.length,
          }));
        }

        if (shiftRes.status === 'fulfilled') {
          setShift(shiftRes.value.data || null);
        }

        if (invRes.status === 'fulfilled' && invRes.value.ok) {
          const invJson = await invRes.value.json();
          const lowList = invJson.data || [];
          setStats((prev) => ({ ...prev, lowStockCount: lowList.length }));
        }

        if (checklistRes.status === 'fulfilled' && checklistRes.value.ok) {
          const checkJson = await checklistRes.value.json();
          const items = checkJson.data || [];
          setChecklists({
            openingDone: items.some((c) => c.type === 'opening' && c.status === 'completed'),
            closingDone: items.some((c) => c.type === 'closing' && c.status === 'completed'),
          });
        }
      } catch (err) {
        console.error('Staff dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();

    const channel = supabase.channel('pos-dashboard-live');
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pos_orders',
          filter: `outlet_id=eq.${outlet.id}`,
        },
        () => {
          load();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [outlet]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/pos/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActiveOrders((prev) =>
          prev
            .map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            .filter((o) => (newStatus === 'completed' || newStatus === 'cancelled' ? o.id !== orderId : true)),
        );
        setStats((prev) => ({ ...prev, openOrders: Math.max(0, prev.openOrders - (newStatus === 'completed' ? 1 : 0)) }));
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pos_outlet');
    router.push('/pos');
  };

  if (loading) {
    return (
      <div className="pos-fullscreen">
        <div className="pos-top-bar">
          <h1>Employee Command Center</h1>
        </div>
        <div className="pos-loading" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary, #cbb9a8)' }}>
          <RefreshCw size={32} className="spin" color="var(--accent-gold, #d89a1e)" />
          <span>Connecting to cafe terminal...</span>
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: '⚡ New POS Order', icon: PlusCircle, path: '/pos/orders/new', color: 'var(--accent-gold, #d89a1e)', highlight: true },
    { label: '👨‍🍳 Kitchen Display (KDS)', icon: ChefHat, path: '/pos/orders/kitchen', color: '#ffb300' },
    { label: '📋 All Orders Queue', icon: ListOrdered, path: '/pos/orders', color: '#90caf9' },
    { label: '📱 QR & Table Orders', icon: ShoppingCart, path: '/pos/orders?source=qr_menu', color: '#ce93d8' },
    { label: '📦 Order Pickups', icon: Package, path: '/pos/pickups', color: '#80cbc4' },
    { label: '👥 Customer Loyalty', icon: Users, path: '/pos/customers', color: '#69f0ae' },
    { label: '📅 Shift & Register', icon: CalendarClock, path: '/pos/shifts', color: '#ffcc80' },
    { label: '✓ SOP Checklists', icon: ClipboardList, path: '/outlet/operations/inventory', color: '#81c784' },
  ];

  return (
    <div className="pos-fullscreen">
      {/* Employee Top Bar */}
      <div className="pos-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Coffee size={22} color="var(--accent-gold, #d89a1e)" />
            <h1>{outlet?.name || 'Cafe Terminal'}</h1>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'rgba(216, 154, 30, 0.2)',
              color: 'var(--accent-gold, #d89a1e)',
              border: '1px solid rgba(216, 154, 30, 0.35)',
              letterSpacing: '0.5px',
            }}
          >
            {staffRole}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {currentTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary, #cbb9a8)' }}>
              <Clock size={14} color="var(--accent-gold, #d89a1e)" />
              <span>{currentTime}</span>
            </div>
          )}

          {shift && (
            <span className={`pos-badge ${shift.status}`}>
              Shift: {shift.status}
            </span>
          )}

          <button
            onClick={() => {
              if (outlet?.id) {
                sessionStorage.setItem('selected_outlet_id', outlet.id);
              }
              router.push('/outlet/dashboard');
            }}
            style={{
              background: 'rgba(216, 154, 30, 0.15)',
              border: '1px solid var(--accent-gold, #d89a1e)',
              color: 'var(--accent-gold, #d89a1e)',
            }}
          >
            <Store size={15} /> Outlet Hub
          </button>

          <button onClick={handleLogout} style={{ color: '#ff8a80', borderColor: 'rgba(255, 82, 82, 0.3)' }}>
            <LogOut size={15} /> Exit
          </button>
        </div>
      </div>

      {/* Main Staff Hub Content */}
      <div className="pos-dashboard" style={{ overflowY: 'auto', flex: 1 }}>
        
        {/* KPI Metrics */}
        <div className="pos-stats-grid">
          <div className="pos-stat-card">
            <ClipboardList size={24} style={{ color: 'var(--accent-gold, #d89a1e)', margin: '0 auto' }} />
            <div className="pos-stat-value">{stats.todayOrders}</div>
            <div className="pos-stat-label">Today's Orders</div>
          </div>
          <div className="pos-stat-card">
            <DollarSign size={24} style={{ color: '#69f0ae', margin: '0 auto' }} />
            <div className="pos-stat-value">₹{Number(stats.todayRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="pos-stat-label">Today's Register Total</div>
          </div>
          <div className="pos-stat-card">
            <Timer size={24} style={{ color: stats.openOrders > 0 ? '#ff8a80' : '#90caf9', margin: '0 auto' }} />
            <div className="pos-stat-value" style={{ color: stats.openOrders > 0 ? '#ff8a80' : 'var(--accent-gold, #d89a1e)' }}>
              {stats.openOrders}
            </div>
            <div className="pos-stat-label">Active Kitchen/Counter Orders</div>
          </div>
          <div className="pos-stat-card">
            <Package size={24} style={{ color: stats.lowStockCount > 0 ? '#ff8a80' : '#69f0ae', margin: '0 auto' }} />
            <div className="pos-stat-value" style={{ color: stats.lowStockCount > 0 ? '#ff8a80' : '#69f0ae' }}>
              {stats.lowStockCount}
            </div>
            <div className="pos-stat-label">Stock Threshold Alerts</div>
          </div>
        </div>

        {/* Quick Action Tiles */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', margin: '0 0 1rem' }}>
            Touch Command Actions
          </h2>
          <div className="pos-actions-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  className="pos-action-btn"
                  onClick={() => router.push(action.path)}
                  style={{
                    border: action.highlight ? '1.5px solid var(--accent-gold, #d89a1e)' : undefined,
                    background: action.highlight
                      ? 'linear-gradient(135deg, rgba(216, 154, 30, 0.25) 0%, rgba(58, 36, 31, 0.85) 100%)'
                      : undefined,
                  }}
                >
                  <Icon size={28} style={{ color: action.color }} />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 Bottom Operational Panels: Shift Status & Live Orders Queue */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Shift Panel */}
          <div className="pos-panel">
            <h2>Current Register & Shift</h2>
            {shift ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Shift Status
                    </span>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`pos-badge ${shift.status}`}>{shift.status}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Opening Float
                    </span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold, #d89a1e)' }}>
                      ₹{parseFloat(shift.opening_cash || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                {shift.opened_at && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '10px' }}>
                    🕒 Clocked in: {new Date(shift.opened_at).toLocaleString('en-IN')}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button className="pos-btn primary" style={{ flex: 1 }} onClick={() => router.push('/pos/shifts')}>
                    Manage Register
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CalendarClock size={36} color="var(--accent-gold, #d89a1e)" style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
                <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No active shift currently open for this terminal.
                </p>
                <button className="pos-btn primary" onClick={() => router.push('/pos/shifts')}>
                  Clock In & Open Shift
                </button>
              </div>
            )}
          </div>

          {/* Daily SOP Checklists Strip */}
          <div className="pos-panel">
            <h2>Daily Cafe SOP Tasks</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: checklists.openingDone ? 'rgba(46, 125, 50, 0.2)' : 'rgba(216, 154, 30, 0.12)',
                  border: `1px solid ${checklists.openingDone ? 'rgba(76, 175, 80, 0.4)' : 'rgba(216, 154, 30, 0.3)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color={checklists.openingDone ? '#69f0ae' : '#d89a1e'} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Morning Opening Prep</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Grinder calibration, milk stock, sanitizer check</div>
                  </div>
                </div>
                <span className={`pos-badge ${checklists.openingDone ? 'completed' : 'pending'}`}>
                  {checklists.openingDone ? 'Completed' : 'Pending'}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: checklists.closingDone ? 'rgba(46, 125, 50, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${checklists.closingDone ? 'rgba(76, 175, 80, 0.4)' : 'rgba(245, 240, 234, 0.1)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color={checklists.closingDone ? '#69f0ae' : '#cbb9a8'} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Evening Closing Audit</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Espresso machine backflush, waste log, register tally</div>
                  </div>
                </div>
                <span className={`pos-badge ${checklists.closingDone ? 'completed' : 'closed'}`}>
                  {checklists.closingDone ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Active Prep Orders Queue */}
        <div className="pos-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, border: 'none', padding: 0 }}>Active Kitchen & Counter Queue ({activeOrders.length})</h2>
            <button className="pos-btn secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => router.push('/pos/orders')}>
              View All Orders <ArrowRight size={13} style={{ display: 'inline', marginLeft: 4 }} />
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={36} color="#69f0ae" style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>All counter & kitchen orders served! Ready for next customer.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(245, 240, 234, 0.1)',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-gold, #d89a1e)', fontFamily: 'var(--font-playfair)' }}>
                      #{order.order_number || order.id?.toString().slice(-4)}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {order.customer_name || 'Counter Customer'} &middot; ₹{Number(order.total || order.total_amount || 0).toFixed(0)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {order.order_type || 'Takeaway'} &middot; {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`pos-badge ${order.status}`}>{order.status}</span>
                    {order.status === 'pending' && (
                      <button
                        className="pos-btn primary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                        onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                      >
                        Start Prep
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        className="pos-btn primary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px', background: '#2e7d32' }}
                        onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        className="pos-btn primary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px', background: '#1976d2' }}
                        onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                      >
                        Mark Served
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

