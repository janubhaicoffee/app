'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  ArrowLeft,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  Store,
  MapPin,
  Phone,
  Mail,
  Building2,
  Edit3,
  CreditCard,
  UserPlus,
  Receipt,
  Activity,
  CheckCircle,
  CheckCircle2,
  Link2,
  Unlink,
  Search,
  Truck,
  Package,
  Video,
  AlertTriangle,
  Trash2,
  Plus,
  Coffee,
  ShieldAlert,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const roleBadgeColors = {
  superadmin: { bg: '#cce5ff', color: '#004085' },
  owner: { bg: '#e8d5f5', color: '#6a1b9a' },
  manager: { bg: '#bbdefb', color: '#1565c0' },
  cashier: { bg: '#c8e6c9', color: '#2e7d32' },
  barista: { bg: '#ffe0b2', color: '#e65100' },
  kitchen: { bg: '#fff9c4', color: '#f57f17' },
  staff: { bg: '#e2e3e5', color: '#383d41' },
};

export default function OutletDetail() {
  const params = useParams();
  const router = useRouter();
  const [outlet, setOutlet] = useState(null);
  const [staff, setStaff] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) loadOutletData();
  }, [params.id]);

  async function loadOutletData() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const [outletRes, staffRes, ordersRes] = await Promise.all([
        fetch(`/api/admin/outlets?id=${params.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(`/api/admin/staff?outletId=${params.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(`/api/admin/data?type=orders`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (outletRes.ok) {
        const json = await outletRes.json();
        setOutlet(json.data);
      } else {
        setError('Outlet not found');
        return;
      }

      if (staffRes.ok) {
        const json = await staffRes.json();
        setStaff(json.data || []);
      }

      if (ordersRes.ok) {
        const json = await ordersRes.json();
        const outletOrders = (json.data || []).filter(
          (o) => o.outlet_id === params.id || o.outlet_code === outlet?.code,
        );
        setOrders(outletOrders);
      }
    } catch (err) {
      console.error('Failed to load outlet data', err);
      setError('Failed to load outlet data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" /> Loading outlet details...
      </div>
    );
  }

  if (error || !outlet) {
    return (
      <div className="empty-state">
        <Store size={48} />
        <h3>{error || 'Outlet not found'}</h3>
        <p>The outlet you're looking for doesn't exist or has been removed.</p>
        <Link href="/admin/outlets" className="admin-btn-outline">
          Back to Outlets
        </Link>
      </div>
    );
  }

  const settings = outlet.settings || {};
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(
    (o) =>
      o.created_at?.startsWith(today) &&
      ['paid', 'processing', 'shipped', 'delivered'].includes(o.status),
  );
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total_amount || 0), 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentOrders = orders.filter((o) => new Date(o.created_at) >= thirtyDaysAgo);
  const mtdRevenue = recentOrders.reduce((s, o) => {
    if (['paid', 'processing', 'shipped', 'delivered'].includes(o.status)) {
      return s + (o.total_amount || 0);
    }
    return s;
  }, 0);
  const mtdOrders = recentOrders.filter((o) =>
    ['paid', 'processing', 'shipped', 'delivered'].includes(o.status),
  ).length;
  const activeOrders = orders.filter((o) =>
    ['pending', 'confirmed', 'processing'].includes(o.status),
  ).length;

  const chartDataMap = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    chartDataMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
  }
  recentOrders.forEach((o) => {
    if (o.created_at && chartDataMap[o.created_at.split('T')[0]]) {
      chartDataMap[o.created_at.split('T')[0]].revenue += o.total_amount || 0;
      chartDataMap[o.created_at.split('T')[0]].orders += 1;
    }
  });
  const chartData = Object.values(chartDataMap);

  const monthlyExpenses =
    (parseFloat(settings.rent || 0) || 0) +
    (parseFloat(settings.electricity || 0) || 0) +
    (parseFloat(settings.water || 0) || 0) +
    (parseFloat(settings.internet || 0) || 0);

  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin/outlets" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ margin: 0 }}>{outlet.name}</h1>
              <span
                className="status-badge"
                style={{
                  background: outlet.status === 'active' ? '#d4edda' : '#e2e3e5',
                  color: outlet.status === 'active' ? '#155724' : '#383d41',
                }}
              >
                {outlet.status}
              </span>
            </div>
            <p
              style={{
                margin: '0.25rem 0 0',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <MapPin size={12} /> {outlet.city || outlet.address || 'Location not set'} &middot;
              Code: {outlet.code}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a 
            href={typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) ? `http://outlet.localhost:${window.location.port}/outlets/${params.id}` : `https://outlet.janubhai.com/outlets/${params.id}`} 
            className="admin-btn-outline admin-btn-sm"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
          >
            <Edit3 size={14} /> Edit in Outlet Portal
          </a>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card green">
          <h3>
            <DollarSign size={14} style={{ display: 'inline', marginRight: 4 }} /> Today's Revenue
          </h3>
          <p className="stat-value">₹ {todayRevenue.toLocaleString('en-IN')}</p>
          <p className="stat-sub">{todayOrders.length} orders today</p>
        </div>
        <div className="stat-card blue">
          <h3>
            <TrendingUp size={14} style={{ display: 'inline', marginRight: 4 }} /> MTD Revenue
          </h3>
          <p className="stat-value">₹ {mtdRevenue.toLocaleString('en-IN')}</p>
          <p className="stat-sub">{mtdOrders} orders (30 days)</p>
        </div>
        <div className="stat-card">
          <h3>
            <ShoppingCart size={14} style={{ display: 'inline', marginRight: 4 }} /> Total Orders
          </h3>
          <p className="stat-value">{orders.length.toLocaleString()}</p>
          <p className="stat-sub">{activeOrders} active</p>
        </div>
        <div className="stat-card gold">
          <h3>
            <Users size={14} style={{ display: 'inline', marginRight: 4 }} /> Staff
          </h3>
          <p className="stat-value">{staff.length}</p>
          <p className="stat-sub">Team members</p>
        </div>
      </div>

      <div className="admin-tabs">
        {['overview', 'operations', 'inventory', 'orders', 'staff', 'expenses', 'sources'].map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'sources' ? 'Product Sources' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>Revenue Trend (30 Days)</h2>
              <TrendingUp size={18} color="#2e7d32" />
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="outletRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2e7d32" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v.split('-').slice(1).join('/')}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2e7d32"
                    strokeWidth={2}
                    fill="url(#outletRevGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
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
                <h3>Outlet Information</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Address', value: outlet.address || '-' },
                  { label: 'City', value: outlet.city || '-' },
                  { label: 'State', value: outlet.state || '-' },
                  { label: 'Pincode', value: outlet.pincode || '-' },
                  { label: 'Phone', value: outlet.phone || '-' },
                  { label: 'Email', value: outlet.email || '-' },
                  { label: 'GSTIN', value: settings.gstin || '-' },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      padding: '0.35rem 0',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
                {settings.manager_name && (
                  <>
                    <div
                      style={{
                        borderTop: '2px solid var(--border-color)',
                        margin: '0.5rem 0',
                        paddingTop: '0.5rem',
                      }}
                    >
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Manager
                      </strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>Name</span>
                      <span style={{ fontWeight: 600 }}>{settings.manager_name}</span>
                    </div>
                    {settings.manager_phone && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.85rem',
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>Phone</span>
                        <span style={{ fontWeight: 600 }}>{settings.manager_phone}</span>
                      </div>
                    )}
                    {settings.manager_email && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.85rem',
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>Email</span>
                        <span style={{ fontWeight: 600 }}>{settings.manager_email}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Quick Actions</h3>
                <Activity size={18} color="var(--text-secondary)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link
                  href={`/`}
                  className="admin-btn-outline"
                  style={{ justifyContent: 'center', width: '100%' }}
                >
                  <Store size={16} /> View Outlet Dashboard
                </Link>
                <Link
                  href={`/`}
                  className="admin-btn-outline"
                  style={{ justifyContent: 'center', width: '100%' }}
                >
                  <CreditCard size={16} /> View POS
                </Link>
                <button
                  className="admin-btn-outline"
                  style={{ justifyContent: 'center', width: '100%' }}
                  onClick={() => setActiveTab('staff')}
                >
                  <UserPlus size={16} /> Manage Staff
                </button>
                <button
                  className="admin-btn-outline"
                  style={{ justifyContent: 'center', width: '100%' }}
                  onClick={() => setActiveTab('expenses')}
                >
                  <Receipt size={16} /> Add Expense
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'operations' && (
        <OutletOperationsTab outlet={outlet} onReload={loadOutletData} />
      )}

      {activeTab === 'inventory' && (
        <OutletInventoryTab outletId={params.id} />
      )}

      {activeTab === 'orders' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Orders</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {orders.length} total
            </span>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={40} />
              <h3>No orders yet</h3>
              <p>Orders from this outlet will appear here.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 50).map((order, i) => (
                    <tr key={order.id || i}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        #
                        {order.id?.toString().slice(-6).toUpperCase() ||
                          `ORD-${String(i + 1).padStart(4, '0')}`}
                      </td>
                      <td>{order.customer_email || order.customer_name || 'Guest'}</td>
                      <td style={{ fontWeight: 600 }}>
                        ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            background:
                              order.status === 'delivered'
                                ? '#d4edda'
                                : order.status === 'cancelled'
                                  ? '#f8d7da'
                                  : order.status === 'pending'
                                    ? '#fff3cd'
                                    : '#cce5ff',
                            color:
                              order.status === 'delivered'
                                ? '#155724'
                                : order.status === 'cancelled'
                                  ? '#721c24'
                                  : order.status === 'pending'
                                    ? '#856404'
                                    : '#004085',
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Staff Members</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {staff.length} members
            </span>
          </div>
          {staff.length === 0 ? (
            <div className="empty-state">
              <Users size={40} />
              <h3>No staff assigned</h3>
              <p>Add staff members to this outlet to get started.</p>
              <Link href="/admin/users?tab=staff" className="admin-btn-outline">
                <UserPlus size={14} /> Manage Staff
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {staff.map((member) => {
                const badge = roleBadgeColors[member.role] || roleBadgeColors.staff;
                return (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: '#fafafa',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: badge.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: badge.color,
                        }}
                      >
                        {member.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {member.email || member.phone || '-'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        className="status-badge"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {member.role}
                      </span>
                      <span
                        className="status-badge"
                        style={{
                          background: member.is_active !== false ? '#d4edda' : '#f8d7da',
                          color: member.is_active !== false ? '#155724' : '#721c24',
                        }}
                      >
                        {member.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sources' && <OutletSourcesTab outletId={params.id} />}

      {activeTab === 'expenses' && (
        <>
          <div className="stats-grid">
            <div className="stat-card red">
              <h3>Monthly Rent</h3>
              <p className="stat-value">₹ {Number(settings.rent || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="stat-card red">
              <h3>Monthly Electricity</h3>
              <p className="stat-value">
                ₹ {Number(settings.electricity || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="stat-card red">
              <h3>Water + Internet</h3>
              <p className="stat-value">
                ₹{' '}
                {(Number(settings.water || 0) + Number(settings.internet || 0)).toLocaleString(
                  'en-IN',
                )}
              </p>
            </div>
            <div className="stat-card red">
              <h3>Total Monthly Expenses</h3>
              <p className="stat-value">₹ {monthlyExpenses.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Expense Breakdown</h3>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Monthly (₹)</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Rent', amount: parseFloat(settings.rent || 0) },
                  { name: 'Electricity', amount: parseFloat(settings.electricity || 0) },
                  { name: 'Water', amount: parseFloat(settings.water || 0) },
                  { name: 'Internet', amount: parseFloat(settings.internet || 0) },
                ]
                  .filter((e) => e.amount > 0)
                  .map((exp, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{exp.name}</td>
                      <td>₹ {exp.amount.toLocaleString('en-IN')}</td>
                      <td>
                        {monthlyExpenses > 0
                          ? ((exp.amount / monthlyExpenses) * 100).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                {monthlyExpenses === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No expenses configured
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function OutletSourcesTab({ outletId }) {
  const [loading, setLoading] = useState(true);
  const [posProducts, setPosProducts] = useState([]);
  const [sourceProducts, setSourceProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      if (!outletId) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [ppRes, spRes] = await Promise.all([
        fetch(`/api/pos/products?outletId=${outletId}`, { headers }),
        fetch(`/api/admin/data?type=sourced_products&outlet_id=${outletId}`, { headers }),
      ]);
      if (ppRes.ok) {
        const j = await ppRes.json();
        setPosProducts(j.data || []);
      }
      if (spRes.ok) {
        const j = await spRes.json();
        setSourceProducts(j.data || []);
      }
      setLoading(false);
    };
    load();
  }, [outletId]);

  const handleLinkProduct = async (posProductId, sourceProductId, commission) => {
    setSaving(true);
    try {
      const res = await fetch('/api/pos/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: posProductId,
          source_product_id: sourceProductId,
          commission_per_unit: parseFloat(commission) || 0,
        }),
      });
      if (res.ok) {
        showToast('Product linked to Janu Bhai source');
        setEditingProduct(null);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const headers = { Authorization: `Bearer ${session.access_token}` };
        const ppRes = await fetch(`/api/pos/products?outletId=${outletId}`, { headers });
        if (ppRes.ok) {
          const j = await ppRes.json();
          setPosProducts(j.data || []);
        }
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to link', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async (posProductId) => {
    setSaving(true);
    try {
      const res = await fetch('/api/pos/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: posProductId,
          source_product_id: null,
          commission_per_unit: null,
        }),
      });
      if (res.ok) {
        showToast('Source link removed');
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const headers = { Authorization: `Bearer ${session.access_token}` };
        const ppRes = await fetch(`/api/pos/products?outletId=${outletId}`, { headers });
        if (ppRes.ok) {
          const j = await ppRes.json();
          setPosProducts(j.data || []);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredSP = sourceProducts.filter(
    (p) => !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) return <div className="admin-loading">Loading products...</div>;

  return (
    <div>
      {toast && (
        <div
          style={{
            padding: '10px 16px',
            background: toast.type === 'success' ? '#d4edda' : '#f8d7da',
            color: toast.type === 'success' ? '#155724' : '#721c24',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {toast.msg}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Outlet Menu Products</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {posProducts.filter((p) => p.source_product_id).length} of {posProducts.length} linked
            to Janu Bhai catalog
          </span>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Source</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posProducts.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No products in outlet menu
                </td>
              </tr>
            ) : (
              posProducts.map((pp) => {
                const isLinked = !!pp.source_product_id;
                return (
                  <tr key={pp.id}>
                    <td style={{ fontWeight: 600 }}>{pp.name}</td>
                    <td>₹{Number(pp.price).toLocaleString('en-IN')}</td>
                    <td>
                      {isLinked ? (
                        <span
                          style={{
                            color: '#155724',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Link2 size={14} /> Linked ({pp.source_product_id})
                        </span>
                      ) : (
                        <span style={{ color: '#a0aec0' }}>Central Standard</span>
                      )}
                    </td>
                    <td>
                      {editingProduct === pp.id ? (
                        <SourceLinkForm
                          sourceProducts={filteredSP}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          onLink={(spId) => handleLinkProduct(pp.id, spId)}
                          onCancel={() => {
                            setEditingProduct(null);
                            setSearchQuery('');
                          }}
                          saving={saving}
                        />
                      ) : isLinked ? (
                        <button
                          className="admin-btn outline sm"
                          onClick={() => handleUnlink(pp.id)}
                          disabled={saving}
                          style={{ color: '#c62828' }}
                        >
                          <Unlink size={12} /> Unlink
                        </button>
                      ) : (
                        <button className="admin-btn sm" onClick={() => setEditingProduct(pp.id)}>
                          <Link2 size={12} /> Link Source
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SourceLinkForm({ sourceProducts, searchQuery, setSearchQuery, onLink, onCancel, saving }) {
  const [selected, setSelected] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) return;
    onLink(selected);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 250 }}
    >
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 8, top: 8, color: '#a0aec0' }} />
        <input
          placeholder="Search Janu Bhai products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 8px 6px 28px',
            fontSize: '0.8rem',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
          }}
        />
      </div>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{
          padding: '6px',
          fontSize: '0.8rem',
          borderRadius: '4px',
          border: '1px solid var(--border-color)',
        }}
      >
        <option value="">Select product...</option>
        {sourceProducts
          .filter((p) => !p.already_linked)
          .map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.name} - ₹{Number(sp.price).toLocaleString('en-IN')}
            </option>
          ))}
      </select>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button type="submit" className="admin-btn sm" disabled={!selected || saving}>
          {saving ? 'Saving...' : 'Link'}
        </button>
        <button type="button" className="admin-btn outline sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function OutletOperationsTab({ outlet, onReload }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    operational_status: outlet.operational_status || 'open',
    accepting_orders: outlet.accepting_orders !== false,
    dine_in_active: outlet.dine_in_active !== false,
    takeaway_active: outlet.takeaway_active !== false,
    delivery_active: outlet.delivery_active !== false,
    delivery_radius_km: outlet.delivery_radius_km || 5,
    opening_time: outlet.opening_time || '08:00',
    closing_time: outlet.closing_time || '22:00',
    fssai_number: outlet.fssai_number || outlet.settings?.fssai_number || '',
  });
  const [cameras, setCameras] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [showAddCam, setShowAddCam] = useState(false);
  const [camName, setCamName] = useState('');
  const [camUrl, setCamUrl] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadOpsData();
  }, [outlet.id]);

  async function loadOpsData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const headers = { Authorization: `Bearer ${session.access_token}` };

      const [camsRes, incRes] = await Promise.all([
        fetch(`/api/outlet/cameras?outletId=${outlet.id}`, { headers }),
        fetch(`/api/outlet/incidents?outletId=${outlet.id}`, { headers }),
      ]);

      if (camsRes.ok) {
        const j = await camsRes.json();
        setCameras(j.data || []);
      }
      if (incRes.ok) {
        const j = await incRes.json();
        setIncidents(j.data || []);
      }
    } catch (e) {
      console.error('Error loading operations tab data:', e);
    }
  }

  async function handleSaveSwitchboard(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/outlets/operations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          outletId: outlet.id,
          ...form,
        }),
      });

      if (res.ok) {
        showToast('Operational switchboard settings updated successfully');
        if (onReload) onReload();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update settings', 'error');
      }
    } catch (err) {
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCamera(e) {
    e.preventDefault();
    if (!camName || !camUrl) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/outlet/cameras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          outlet_id: outlet.id,
          name: camName,
          url: camUrl,
        }),
      });

      if (res.ok) {
        showToast('Camera feed added');
        setShowAddCam(false);
        setCamName('');
        setCamUrl('');
        loadOpsData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add camera', 'error');
      }
    } catch (err) {
      showToast('Error adding camera', 'error');
    }
  }

  async function handleDeleteCamera(id) {
    if (!confirm('Remove this camera stream?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/outlet/cameras?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        showToast('Camera removed');
        loadOpsData();
      }
    } catch (err) {
      showToast('Error removing camera', 'error');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '0.75rem 1.25rem', borderRadius: 8, background: toast.type === 'error' ? '#c62828' : '#2e7d32', color: '#fff', fontWeight: 600, zIndex: 9999 }}>
          {toast.message}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Operational Switchboard & Controls</h2>
          <span className="status-badge" style={{ background: form.operational_status === 'open' ? '#d4edda' : '#f8d7da', color: form.operational_status === 'open' ? '#155724' : '#721c24' }}>
            {form.operational_status.toUpperCase()}
          </span>
        </div>

        <form onSubmit={handleSaveSwitchboard}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label>Operational Status</label>
              <select
                value={form.operational_status}
                onChange={(e) => setForm({ ...form, operational_status: e.target.value })}
              >
                <option value="open">Open (Normal)</option>
                <option value="busy">Busy / High Demand</option>
                <option value="paused">Paused (Temporarily Stopped)</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Delivery Radius (km)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={form.delivery_radius_km}
                onChange={(e) => setForm({ ...form, delivery_radius_km: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Opening Time</label>
              <input
                type="time"
                value={form.opening_time}
                onChange={(e) => setForm({ ...form, opening_time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Closing Time</label>
              <input
                type="time"
                value={form.closing_time}
                onChange={(e) => setForm({ ...form, closing_time: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 8, marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, margin: 0 }}>
              <input
                type="checkbox"
                checked={form.accepting_orders}
                onChange={(e) => setForm({ ...form, accepting_orders: e.target.checked })}
              />
              Accepting Online Orders
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, margin: 0 }}>
              <input
                type="checkbox"
                checked={form.delivery_active}
                onChange={(e) => setForm({ ...form, delivery_active: e.target.checked })}
              />
              Swiggy & Zomato Delivery Active
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, margin: 0 }}>
              <input
                type="checkbox"
                checked={form.dine_in_active}
                onChange={(e) => setForm({ ...form, dine_in_active: e.target.checked })}
              />
              Dine-In Seating Open
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, margin: 0 }}>
              <input
                type="checkbox"
                checked={form.takeaway_active}
                onChange={(e) => setForm({ ...form, takeaway_active: e.target.checked })}
              />
              Takeaway Counter Active
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Switchboard Controls'}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Surveillance Cameras ({cameras.length})</h2>
          <button className="admin-btn-outline admin-btn-sm" onClick={() => setShowAddCam(true)}>
            <Plus size={14} /> Add Stream
          </button>
        </div>

        {cameras.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <Video size={36} />
            <p>No camera feeds attached to this outlet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {cameras.map((c) => (
              <div key={c.id} style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ height: 140, background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Video size={28} color="#4caf50" />
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: 4 }}>
                      {c.active ? 'STREAM ONLINE' : 'STREAM PAUSED'}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{c.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.url.slice(0, 25)}...</div>
                  </div>
                  <button onClick={() => handleDeleteCamera(c.id)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddCam && (
          <form onSubmit={handleAddCamera} style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <h4 style={{ margin: '0 0 0.75rem' }}>Attach New CCTV Camera Feed</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Camera Name</label>
                <input required placeholder="e.g. Espresso Station Cam 1" value={camName} onChange={(e) => setCamName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Stream URL (HLS / RTSP)</label>
                <input required type="url" placeholder="https://stream.janubhai.com/cam1.m3u8" value={camUrl} onChange={(e) => setCamUrl(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="admin-btn-outline admin-btn-sm" onClick={() => setShowAddCam(false)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-sm">Add Feed</button>
            </div>
          </form>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Active Incidents & Maintenance ({incidents.filter(i => i.status === 'open').length} open)</h2>
          <Link href="/admin/outlets/surveillance" className="admin-btn-outline admin-btn-sm">
            View All Incidents
          </Link>
        </div>

        {incidents.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            ✓ No incidents logged for this outlet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {incidents.slice(0, 5).map((inc) => (
              <div key={inc.id} style={{ padding: '0.6rem 0.85rem', borderRadius: 6, background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>{inc.title || inc.description}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{inc.description} &middot; Severity: {inc.severity}</div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: 4, background: inc.status === 'resolved' ? '#d4edda' : '#fff3cd', color: inc.status === 'resolved' ? '#155724' : '#856404' }}>
                  {inc.status || 'open'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OutletInventoryTab({ outletId }) {
  const [items, setItems] = useState([]);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', category: 'Coffee Beans', stock: 10, threshold: 5, auto_reorder: false });
  const [wasteForm, setWasteForm] = useState({ inventory_id: '', quantity: 1, unit_cost: 0, reason: 'Expired', notes: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadData();
  }, [outletId]);

  async function loadData() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const headers = { Authorization: `Bearer ${session.access_token}` };

      const [invRes, wasteRes] = await Promise.all([
        fetch(`/api/outlet/inventory?outletId=${outletId}`, { headers }),
        supabase.from('waste_log').select('*').eq('outlet_id', outletId).order('created_at', { ascending: false }),
      ]);

      if (invRes.ok) {
        const j = await invRes.json();
        setItems(j.data || []);
      }
      if (wasteRes.data) {
        setWasteLogs(wasteRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function adjustStock(id, currentStock, delta) {
    const nextStock = Math.max(0, currentStock + delta);
    try {
      const res = await fetch('/api/outlet/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stock: nextStock }),
      });
      if (res.ok) {
        showToast('Stock adjusted');
        loadData();
      }
    } catch (err) {
      showToast('Error adjusting stock', 'error');
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/outlet/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, outlet_id: outletId }),
      });
      if (res.ok) {
        showToast('Item added to outlet inventory');
        setShowAddModal(false);
        setNewItem({ name: '', category: 'Coffee Beans', stock: 10, threshold: 5, auto_reorder: false });
        loadData();
      }
    } catch (err) {
      showToast('Error adding item', 'error');
    }
  }

  async function handleLogWaste(e) {
    e.preventDefault();
    const item = items.find(i => i.id === wasteForm.inventory_id);
    const totalCost = (parseFloat(wasteForm.quantity) || 1) * (parseFloat(wasteForm.unit_cost) || 0);

    try {
      const { error } = await supabase.from('waste_log').insert([{
        outlet_id: outletId,
        inventory_id: wasteForm.inventory_id || null,
        quantity: parseFloat(wasteForm.quantity) || 1,
        unit_cost: parseFloat(wasteForm.unit_cost) || 0,
        total_cost: totalCost,
        reason: wasteForm.reason,
        notes: wasteForm.notes || (item ? `Spoilage: ${item.name}` : null),
      }]);

      if (!error) {
        if (item) {
          await adjustStock(item.id, item.stock || 0, - (parseFloat(wasteForm.quantity) || 1));
        }
        showToast('Waste log recorded');
        setShowWasteModal(false);
        loadData();
      }
    } catch (err) {
      showToast('Error recording waste', 'error');
    }
  }

  if (loading) return <div className="admin-loading">Loading outlet inventory...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '0.75rem 1.25rem', borderRadius: 8, background: toast.type === 'error' ? '#c62828' : '#2e7d32', color: '#fff', fontWeight: 600, zIndex: 9999 }}>
          {toast.message}
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Live Supplies & Stock ({items.length})</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="admin-btn-outline admin-btn-sm" onClick={() => setShowWasteModal(true)}>
              <Trash2 size={14} /> Log Waste
            </button>
            <button className="admin-btn admin-btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={14} /> Add Supply Item
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="empty-state" style={{ padding: '2.5rem' }}>
            <Package size={40} />
            <p>No inventory items tracked yet for this outlet.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ITEM NAME</th>
                <th>CATEGORY</th>
                <th>CURRENT STOCK</th>
                <th>THRESHOLD</th>
                <th>AUTO-REORDER</th>
                <th style={{ textAlign: 'right' }}>QUICK ADJUST</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isLow = (item.stock || 0) <= (item.threshold || 10);
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>
                      {item.name}
                      {isLow && (
                        <span style={{ marginLeft: 8, fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: 4, background: '#f8d7da', color: '#721c24', fontWeight: 700 }}>
                          LOW STOCK
                        </span>
                      )}
                    </td>
                    <td>{item.category || 'Supplies'}</td>
                    <td style={{ fontSize: '1rem', fontWeight: 700, color: isLow ? '#c62828' : 'inherit' }}>
                      {item.stock || 0}
                    </td>
                    <td>{item.threshold || 10}</td>
                    <td>{item.auto_reorder ? '✓ Active' : 'Off'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                        <button className="admin-btn-outline admin-btn-sm" onClick={() => adjustStock(item.id, item.stock || 0, -1)}>-1</button>
                        <button className="admin-btn-outline admin-btn-sm" onClick={() => adjustStock(item.id, item.stock || 0, +1)}>+1</button>
                        <button className="admin-btn-outline admin-btn-sm" onClick={() => adjustStock(item.id, item.stock || 0, +5)}>+5</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Waste & Spoilage History ({wasteLogs.length})</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Total Loss: ₹ {wasteLogs.reduce((s, w) => s + (parseFloat(w.total_cost) || 0), 0).toLocaleString('en-IN')}
          </span>
        </div>

        {wasteLogs.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>✓ No waste logs recorded for this outlet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {wasteLogs.slice(0, 8).map((w) => (
              <div key={w.id} style={{ padding: '0.6rem 0.85rem', borderRadius: 6, background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <div>
                  <strong>{w.reason || 'Spoilage'}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{w.notes || 'Routine discard'} &middot; Qty: {w.quantity}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#c62828' }}>- ₹{(parseFloat(w.total_cost) || 0).toFixed(2)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(w.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2>Add Outlet Supply Item</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Supply Name *</label>
                  <input required placeholder="e.g. Arabica Beans (5kg)" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                      <option value="Coffee Beans">Coffee Beans</option>
                      <option value="Dairy & Milk">Dairy & Milk</option>
                      <option value="Syrups & Flavours">Syrups & Flavours</option>
                      <option value="Packaging & Cups">Packaging & Cups</option>
                      <option value="Cleaning & Chemicals">Cleaning & Chemicals</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Initial Stock</label>
                    <input type="number" min="0" value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Low Stock Warning Threshold</label>
                  <input type="number" min="1" value={newItem.threshold} onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn">Add Supply</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWasteModal && (
        <div className="modal-overlay" onClick={() => setShowWasteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2>Record Spoilage / Waste Log</h2>
              <button className="modal-close" onClick={() => setShowWasteModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleLogWaste}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Affected Supply Item</label>
                  <select value={wasteForm.inventory_id} onChange={(e) => setWasteForm({ ...wasteForm, inventory_id: e.target.value })}>
                    <option value="">Select supply item...</option>
                    {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.stock} in stock)</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Discarded Quantity *</label>
                    <input required type="number" step="0.1" min="0.1" value={wasteForm.quantity} onChange={(e) => setWasteForm({ ...wasteForm, quantity: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Estimated Unit Cost (₹)</label>
                    <input type="number" step="0.1" min="0" value={wasteForm.unit_cost} onChange={(e) => setWasteForm({ ...wasteForm, unit_cost: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Waste Reason</label>
                  <select value={wasteForm.reason} onChange={(e) => setWasteForm({ ...wasteForm, reason: e.target.value })}>
                    <option value="Expired">Expired / Past Date</option>
                    <option value="Spillage">Spillage / Dropped</option>
                    <option value="Calibration">Espresso Calibration Dialing Discard</option>
                    <option value="Damaged Packaging">Damaged Packaging</option>
                    <option value="Quality Inspection">Failed Quality Inspection</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setShowWasteModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn" style={{ background: '#c62828', borderColor: '#c62828' }}>Record Waste</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
