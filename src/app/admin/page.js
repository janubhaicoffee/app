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
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Welcome back, Janu Bhai Coffee
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {lastSync && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
              }}
            >
              <Clock size={12} />
              Last sync: {lastSync.toLocaleTimeString('en-IN')}
            </span>
          )}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: syncing ? '#fff3cd' : '#d4edda',
              color: syncing ? '#856404' : '#155724',
              border: `1px solid ${syncing ? '#ffeeba' : '#c3e6cb'}`,
            }}
          >
            <RefreshCw size={12} className={syncing ? 'spin' : ''} />
            {syncing ? 'Syncing...' : 'Live'}
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card green">
          <h3>
            <DollarSign size={14} style={{ display: 'inline', marginRight: 4 }} /> Total Revenue
          </h3>
          <p className="stat-value">
            <AnimatedNumber value={data.revenue} isCurrency={true} />
          </p>
          <p className="stat-sub">Lifetime sales</p>
        </div>
        <div className="stat-card">
          <h3>
            <ShoppingCart size={14} style={{ display: 'inline', marginRight: 4 }} /> Total Orders
          </h3>
          <p className="stat-value">
            <AnimatedNumber value={data.orders} />
          </p>
          <p className="stat-sub">All time</p>
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
          <p className="stat-sub">In catalog</p>
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
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(58, 36, 31, 0.04) 0%, rgba(216, 154, 30, 0.08) 100%)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Store size={18} color="var(--accent-gold, #d89a1e)" />
              Operations Command Suite
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Manage multi-outlet live switchboards, inter-cafe stock transfers, purchase orders, SOP audits, and CCTV streams.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link href="/admin/outlets/operations" className="admin-btn admin-btn-sm" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              <Store size={14} /> Operations Hub
            </Link>
            <Link href="/admin/outlets/transfers" className="admin-btn-outline admin-btn-sm" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              <ArrowLeftRight size={14} /> Stock Transfers
            </Link>
            <Link href="/admin/outlets/purchase-orders" className="admin-btn-outline admin-btn-sm" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              <ShoppingBag size={14} /> Purchase Orders
            </Link>
            <Link href="/admin/outlets/checklists" className="admin-btn-outline admin-btn-sm" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              <ClipboardCheck size={14} /> SOP Audits
            </Link>
            <Link href="/admin/outlets/surveillance" className="admin-btn-outline admin-btn-sm" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              <Video size={14} /> Surveillance
            </Link>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>
              Revenue{' '}
              <span
                style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-secondary)' }}
              >
                (Last 30 Days)
              </span>
            </h2>
            <TrendingUp size={18} style={{ color: '#2e7d32' }} />
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2e7d32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2e7d32"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>
              Orders{' '}
              <span
                style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-secondary)' }}
              >
                (Last 30 Days)
              </span>
            </h2>
            <ShoppingCart size={18} style={{ color: 'var(--accent-red)' }} />
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [value, 'Orders']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="orders" fill="#c0392b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Orders</h2>
            <Link href="/admin/orders" className="admin-btn admin-btn-sm">
              View All
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
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      #
                      {order.order_id ||
                        order.id?.toString().slice(-6).toUpperCase() ||
                        `ORD-${String(i + 1).padStart(4, '0')}`}
                    </td>
                    <td>{order.customer_name || order.customer?.name || order.email || 'Guest'}</td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{Number(order.total || order.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: `${statusColors[order.status] || '#6b7280'}20`,
                          color: statusColors[order.status] || '#6b7280',
                        }}
                      >
                        {order.status || 'unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <ShoppingCart size={40} />
              <h3>No orders yet</h3>
              <p>Orders will appear here once customers start purchasing.</p>
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Low Stock Alerts</h2>
            <Link href="/admin/inventory" className="admin-btn admin-btn-sm admin-btn-outline">
              Manage
            </Link>
          </div>
          {data.lowStockAlerts && data.lowStockAlerts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.lowStockAlerts.slice(0, 8).map((item, i) => (
                <div
                  key={item.id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.75rem',
                    background: '#fff8f0',
                    borderRadius: '6px',
                    border: '1px solid #fde6c8',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {item.name || item.product_name || item.title || 'Unknown Product'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {item.variant || item.sku || ''}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: item.stock <= 0 ? '#ef4444' : '#f59e0b',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.stock || item.quantity || 0} in stock
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Package size={40} />
              <h3>All stocked up</h3>
              <p>No low stock alerts right now. Inventory levels are healthy.</p>
            </div>
          )}
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-header">
          <h2>Top Selling Products</h2>
          <TrendingUp size={18} style={{ color: 'var(--accent-gold)' }} />
        </div>
        {data.topProducts && data.topProducts.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Category</th>
                <th>Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.slice(0, 8).map((product, i) => (
                <tr key={product.id || i}>
                  <td style={{ fontWeight: 700, color: 'var(--text-secondary)', width: 40 }}>
                    {i + 1}
                  </td>
                  <td style={{ fontWeight: 600 }}>{product.name || product.title || 'Product'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {product.category || product.type || '-'}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {product.sold || product.orders_count || product.quantity || 0}
                  </td>
                  <td style={{ fontWeight: 600, color: '#2e7d32' }}>
                    ₹{Number(product.revenue || product.total || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <BarChart3 size={40} />
            <h3>No sales data yet</h3>
            <p>Top products will appear here as orders come in.</p>
          </div>
        )}
      </div>
    </div>
  );
}
