'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Star,
  AlertTriangle,
  TrendingUp,
  Clock,
  RefreshCw,
  BarChart3,
  Store,
  ArrowLeftRight,
  ClipboardCheck,
  Video,
  ShoppingBag,
  Sparkles,
  Shield,
  Activity,
  Calendar,
} from 'lucide-react';

function AnimatedNumber({ value, isCurrency = false }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1500;
    const incrementTime = 30;
    const steps = duration / incrementTime;
    const stepValue = end / steps;

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  if (isCurrency) {
    return <>₹ {displayValue.toLocaleString('en-IN')}</>;
  }
  return <>{displayValue}</>;
}

const statusColors = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#2e7d32',
  cancelled: '#ef4444',
};

export default function AdminDashboard() {
  const [data, setData] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    articles: 0,
    revenue: 0,
    pendingReviews: 0,
    chartData: [],
    recentOrders: [],
    lowStockAlerts: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  async function loadStats(showSyncing = true) {
    try {
      if (showSyncing) setSyncing(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/data?type=dashboard', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData({
            products: json.data.products || 0,
            customers: json.data.customers || 0,
            orders: json.data.orders || 0,
            articles: json.data.articles || 0,
            revenue: json.data.revenue || 0,
            pendingReviews: json.data.pendingReviews || 0,
            chartData: json.data.chartData || [],
            recentOrders: json.data.recentOrders || [],
            lowStockAlerts: json.data.lowStockAlerts || [],
            topProducts: json.data.topProducts || [],
          });
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setSyncing(false);
      setLastSync(new Date());
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
    const interval = setInterval(() => loadStats(true), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>Loading command center...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary, #cbb9a8)', fontSize: '0.9rem' }}>
            Welcome back, Janu Bhai Roastery Command
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {lastSync && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-secondary, #cbb9a8)',
                fontSize: '0.8rem',
              }}
            >
              <Clock size={13} color="var(--accent-gold, #d89a1e)" />
              Last sync: {lastSync.toLocaleTimeString('en-IN')}
            </span>
          )}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: syncing ? 'rgba(216, 154, 30, 0.15)' : 'rgba(46, 125, 50, 0.2)',
              color: syncing ? '#d89a1e' : '#69f0ae',
              border: `1px solid ${syncing ? 'rgba(216, 154, 30, 0.35)' : 'rgba(76, 175, 80, 0.4)'}`,
            }}
          >
            <RefreshCw size={13} className={syncing ? 'spin' : ''} />
            {syncing ? 'Syncing...' : 'Live Connected'}
          </span>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card green">
          <h3>
            <DollarSign size={14} style={{ display: 'inline', marginRight: 4 }} /> Total Revenue
          </h3>
          <p className="stat-value">
            <AnimatedNumber value={data.revenue} isCurrency={true} />
          </p>
          <p className="stat-sub">Lifetime orders</p>
        </div>
        <div className="stat-card gold">
          <h3>
            <ShoppingCart size={14} style={{ display: 'inline', marginRight: 4 }} /> Total Orders
          </h3>
          <p className="stat-value">
            <AnimatedNumber value={data.orders} />
          </p>
          <p className="stat-sub">Across all channels</p>
        </div>
        <div className="stat-card blue">
          <h3>
            <Users size={14} style={{ display: 'inline', marginRight: 4 }} /> Customers
          </h3>
          <p className="stat-value">
            <AnimatedNumber value={data.customers} />
          </p>
          <p className="stat-sub">Registered accounts</p>
        </div>
        <div className="stat-card">
          <h3>
            <Package size={14} style={{ display: 'inline', marginRight: 4 }} /> Products
          </h3>
          <p className="stat-value">
            <AnimatedNumber value={data.products} />
          </p>
          <p className="stat-sub">In live catalog</p>
        </div>
        <div className="stat-card red">
          <h3>
            <Star size={14} style={{ display: 'inline', marginRight: 4 }} /> Pending Reviews
          </h3>
          <p className="stat-value">
            <AnimatedNumber value={data.pendingReviews} />
          </p>
          <p className="stat-sub">Awaiting moderation</p>
        </div>
      </div>

      {/* Operations Quick Launch Bar */}
      <div
        className="admin-card"
        style={{
          padding: '1.2rem 1.5rem',
          marginBottom: '1.8rem',
          background: 'linear-gradient(135deg, rgba(58, 36, 31, 0.85) 0%, rgba(216, 154, 30, 0.15) 100%)',
          border: '1px solid rgba(216, 154, 30, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold, #d89a1e)', fontFamily: 'var(--font-playfair)' }}>
              <Store size={20} />
              Operations Command Suite
            </div>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #cbb9a8)' }}>
              Manage multi-outlet live switchboards, inter-cafe stock transfers, purchase orders, SOP audits, and CCTV streams.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link href="/admin/operations" className="admin-btn admin-btn-sm">
              <Shield size={14} /> Operations Book
            </Link>
            <Link href="/admin/manager" className="admin-btn-outline admin-btn-sm">
              <Store size={14} /> Manager Feed
            </Link>
            <Link href="/admin/growth" className="admin-btn-outline admin-btn-sm">
              <Activity size={14} /> Growth & BD
            </Link>
            <Link href="/admin/events" className="admin-btn-outline admin-btn-sm">
              <Calendar size={14} /> Events & RSVPs
            </Link>
            <Link href="/admin/outlets/operations" className="admin-btn-outline admin-btn-sm">
              <Store size={14} /> Outlets Hub
            </Link>
            <Link href="/admin/outlets/checklists" className="admin-btn-outline admin-btn-sm">
              <ClipboardCheck size={14} /> SOP Audits
            </Link>
          </div>
        </div>
      </div>

      {/* 2 Main Charts */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>
              Revenue{' '}
              <span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-secondary, #cbb9a8)' }}>
                (Last 30 Days)
              </span>
            </h2>
            <TrendingUp size={18} color="#69f0ae" />
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d89a1e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d89a1e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 240, 234, 0.06)" />
                <XAxis
                  dataKey="date"
                  stroke="#cbb9a8"
                  tick={{ fill: '#cbb9a8', fontSize: 11 }}
                  tickFormatter={(val) => (val ? val.split('-').slice(1).join('/') : '')}
                />
                <YAxis
                  stroke="#cbb9a8"
                  tick={{ fill: '#cbb9a8', fontSize: 11 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(30, 18, 16, 0.95)',
                    border: '1px solid rgba(216, 154, 30, 0.4)',
                    borderRadius: 12,
                    color: '#f5f0ea',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d89a1e"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>
              Orders{' '}
              <span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-secondary, #cbb9a8)' }}>
                (Last 30 Days)
              </span>
            </h2>
            <ShoppingCart size={18} color="var(--accent-gold, #d89a1e)" />
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 240, 234, 0.06)" />
                <XAxis
                  dataKey="date"
                  stroke="#cbb9a8"
                  tick={{ fill: '#cbb9a8', fontSize: 11 }}
                  tickFormatter={(val) => (val ? val.split('-').slice(1).join('/') : '')}
                />
                <YAxis stroke="#cbb9a8" tick={{ fill: '#cbb9a8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(30, 18, 16, 0.95)',
                    border: '1px solid rgba(216, 154, 30, 0.4)',
                    borderRadius: 12,
                    color: '#f5f0ea',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                  formatter={(value) => [value, 'Orders']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="orders" fill="#d89a1e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2 Bottom Columns: Recent Orders & Low Stock */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Orders</h2>
            <Link href="/admin/orders" className="admin-btn admin-btn-sm">
              View All Orders
            </Link>
          </div>
          {data.recentOrders.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.slice(0, 10).map((order, i) => (
                  <tr key={order.id || i}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--accent-gold, #d89a1e)' }}>
                      #{order.order_id || order.id?.toString().slice(-6).toUpperCase() || `ORD-${String(i + 1).padStart(4, '0')}`}
                    </td>
                    <td>{order.customer_name || order.customer?.name || order.email || 'Direct Storefront'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary, #f5f0ea)' }}>
                      ₹{Number(order.total || order.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: `${statusColors[order.status] || '#6b7280'}25`,
                          color: statusColors[order.status] || '#6b7280',
                          border: `1px solid ${statusColors[order.status] || '#6b7280'}50`,
                        }}
                      >
                        {order.status || 'confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <ShoppingCart size={36} />
              <h3>No recent orders</h3>
              <p>Live storefront and POS orders will appear here automatically.</p>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Low Stock Alerts</h2>
            <Link href="/admin/inventory" className="admin-btn-outline admin-btn-sm">
              Manage Inventory
            </Link>
          </div>
          {data.lowStockAlerts && data.lowStockAlerts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {data.lowStockAlerts.slice(0, 8).map((item, i) => (
                <div
                  key={item.id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(216, 154, 30, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(216, 154, 30, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary, #f5f0ea)' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #cbb9a8)' }}>
                        {item.outlet_name ? `Outlet: ${item.outlet_name}` : 'Main Roastery Warehouse'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#ff8a80', fontSize: '0.85rem' }}>
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Package size={36} />
              <h3>Stock levels optimal</h3>
              <p>All catalog products and outlet inventories are above minimum thresholds.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
