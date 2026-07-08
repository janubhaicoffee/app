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
} from 'lucide-react';
import '../pos.css';

export default function PosDashboard() {
  const router = useRouter();
  const [outlet, setOutlet] = useState(null);
  const [stats, setStats] = useState({ todayOrders: 0, todayRevenue: 0, openOrders: 0 });
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('pos_outlet');
    if (!stored) {
      router.push('/pos');
      return;
    }
    setOutlet(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    if (!outlet) return;

    const load = async () => {
      try {
        const [ordersRes, shiftRes] = await Promise.allSettled([
          fetchOrders(outlet.id, { status: 'pending,preparing' }),
          fetchShiftStatus(outlet.id),
        ]);

        if (ordersRes.status === 'fulfilled') {
          const orders = ordersRes.value.data || [];
          setStats({
            todayOrders: orders.length,
            todayRevenue: orders.reduce((s, o) => s + parseFloat(o.total || 0), 0),
            openOrders: orders.filter(
              (o) =>
                o.status === 'pending' || o.status === 'preparing' || o.status === 'pending_sync',
            ).length,
          });
        }

        if (shiftRes.status === 'fulfilled') {
          setShift(shiftRes.value.data || null);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();

    const channel = supabase.channel('pos-dashboard');
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pos_orders',
          filter: `outlet_id=eq.${outlet.id}`,
        },
        () => {
          setStats((s) => ({ ...s, todayOrders: s.todayOrders + 1, openOrders: s.openOrders + 1 }));
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pos_orders',
          filter: `outlet_id=eq.${outlet.id}`,
        },
        () => {
          fetchOrders(outlet.id)
            .then((r) => {
              const orders = r.data || [];
              setStats({
                todayOrders: orders.length,
                todayRevenue: orders.reduce((s, o) => s + parseFloat(o.total || 0), 0),
                openOrders: orders.filter((o) => o.status === 'pending' || o.status === 'preparing')
                  .length,
              });
            })
            .catch(() => {});
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [outlet]);

  const handleLogout = () => {
    sessionStorage.removeItem('pos_outlet');
    router.push('/pos');
  };

  if (loading) {
    return (
      <div className="pos-fullscreen">
        <div className="pos-top-bar">
          <h1>Dashboard</h1>
        </div>
        <div className="pos-loading">Loading dashboard...</div>
      </div>
    );
  }

  const quickActions = [
    { label: 'New Order', icon: PlusCircle, path: '/pos/orders/new', color: '#B71C1C' },
    { label: 'View Orders', icon: ListOrdered, path: '/pos/orders', color: '#1565C0' },
    { label: 'Kitchen Display', icon: ChefHat, path: '/pos/orders/kitchen', color: '#E65100' },
    {
      label: 'QR Orders',
      icon: ShoppingCart,
      path: '/pos/orders?source=qr_menu',
      color: '#6A1B9A',
    },
    { label: 'Customer Lookup', icon: Users, path: '/pos/customers', color: '#00796B' },
    { label: 'Pickups', icon: Package, path: '/pos/pickups', color: '#E65100' },
    { label: 'Shifts', icon: CalendarClock, path: '/pos/shifts', color: '#2E7D32' },
  ];

  return (
    <div className="pos-fullscreen">
      <div className="pos-top-bar">
        <h1>{outlet?.name || 'POS'} Dashboard</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {shift && <span className={`pos-badge ${shift.status}`}>Shift: {shift.status}</span>}
          <button onClick={() => router.push('/pos/orders/new')}>
            <PlusCircle size={16} /> New Order
          </button>
          <button onClick={handleLogout}>
            <LogOut size={16} /> Exit
          </button>
        </div>
      </div>

      <div className="pos-dashboard" style={{ overflow: 'auto', flex: 1 }}>
        <div className="pos-stats-grid">
          <div className="pos-stat-card">
            <ClipboardList size={24} style={{ color: 'var(--accent-red)' }} />
            <div className="pos-stat-value">{stats.todayOrders}</div>
            <div className="pos-stat-label">Today's Orders</div>
          </div>
          <div className="pos-stat-card">
            <DollarSign size={24} style={{ color: '#2E7D32' }} />
            <div className="pos-stat-value">₹{stats.todayRevenue.toFixed(2)}</div>
            <div className="pos-stat-label">Today's Revenue</div>
          </div>
          <div className="pos-stat-card">
            <Timer size={24} style={{ color: '#E65100' }} />
            <div className="pos-stat-value">{stats.openOrders}</div>
            <div className="pos-stat-label">Open Orders</div>
          </div>
          <div className="pos-stat-card">
            <TrendingUp size={24} style={{ color: '#1565C0' }} />
            <div className="pos-stat-value">
              {stats.todayOrders > 0
                ? `₹${(stats.todayRevenue / stats.todayOrders).toFixed(2)}`
                : '₹0.00'}
            </div>
            <div className="pos-stat-label">Avg. Order Value</div>
          </div>
        </div>

        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Quick Actions</h2>
        <div className="pos-actions-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                className="pos-action-btn"
                onClick={() => router.push(action.path)}
              >
                <Icon size={32} style={{ color: action.color }} />
                {action.label}
              </button>
            );
          })}
        </div>

        <div className="pos-panel">
          <h2>Current Shift</h2>
          {shift ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>
                  Status: <span className={`pos-badge ${shift.status}`}>{shift.status}</span>
                </div>
                {shift.opened_at && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Opened: {new Date(shift.opened_at).toLocaleString()}
                  </div>
                )}
                {shift.opening_cash !== undefined && (
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    Opening Cash: ₹{parseFloat(shift.opening_cash || 0).toFixed(2)}
                  </div>
                )}
              </div>
              <button className="pos-btn secondary" onClick={() => router.push('/pos/shifts')}>
                Manage Shift
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ marginBottom: 12, color: 'var(--text-secondary)' }}>No open shift</p>
              <button className="pos-btn primary" onClick={() => router.push('/pos/shifts')}>
                Open Shift
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
