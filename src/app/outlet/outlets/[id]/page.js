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
  Link2,
  Unlink,
  Search,
  X,
  Trash2,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import '@/app/admin/admin.css';
import '@/components/outlet/outlet.css';

const roleBadgeColors = {
  superadmin: { bg: '#cce5ff', color: '#004085' },
  owner: { bg: '#e8d5f5', color: '#6a1b9a' },
  manager: { bg: '#bbdefb', color: '#1565c0' },
  cashier: { bg: '#c8e6c9', color: '#2e7d32' },
  barista: { bg: '#ffe0b2', color: '#e65100' },
  kitchen: { bg: '#fff9c4', color: '#f57f17' },
  staff: { bg: '#e2e3e5', color: '#383d41' },
};

export default function OutletDetailPortal() {
  const params = useParams();
  const router = useRouter();
  const [outlet, setOutlet] = useState(null);
  const [staff, setStaff] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    gstin: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    rent: '',
    electricity: '',
    water: '',
    internet: '',
    cogs: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  function openEditModal() {
    if (!outlet) return;
    const settings = outlet.settings || {};
    setForm({
      name: outlet.name || '',
      code: outlet.code || '',
      address: outlet.address || '',
      city: outlet.city || '',
      state: outlet.state || '',
      pincode: outlet.pincode || '',
      phone: outlet.phone || '',
      email: outlet.email || '',
      gstin: settings.gstin || '',
      manager_name: settings.manager_name || '',
      manager_phone: settings.manager_phone || '',
      manager_email: settings.manager_email || '',
      rent: settings.rent || '',
      electricity: settings.electricity || '',
      water: settings.water || '',
      internet: settings.internet || '',
      cogs: settings.cogs || '',
    });
    setShowEditModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const settings = {
        gstin: form.gstin,
        manager_name: form.manager_name,
        manager_phone: form.manager_phone,
        manager_email: form.manager_email,
        rent: form.rent ? parseFloat(form.rent) : 0,
        electricity: form.electricity ? parseFloat(form.electricity) : 0,
        water: form.water ? parseFloat(form.water) : 0,
        internet: form.internet ? parseFloat(form.internet) : 0,
        cogs: form.cogs ? parseFloat(form.cogs) : 35,
      };

      const body = {
        name: form.name,
        code: form.code,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone,
        email: form.email,
        settings,
      };

      const res = await fetch('/api/admin/outlets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: outlet.id, ...body }),
      });

      if (res.ok) {
        showToast('Outlet updated successfully');
        setShowEditModal(false);
        loadOutletData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save outlet', 'error');
      }
    } catch (err) {
      showToast('Failed to save outlet', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOutlet() {
    if (!confirm('Are you sure you want to delete this outlet? All associated staff, schedules, transactions, and POS data will be deleted.')) {
      return;
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/admin/outlets?id=${outlet.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        router.push('/outlet/outlets');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to delete outlet', 'error');
      }
    } catch (err) {
      showToast('Failed to delete outlet', 'error');
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
        <Link href="/outlet/outlets" className="admin-btn-outline">
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
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      {toast && (
        <div className={`admin-toast ${toast.type === 'error' ? 'admin-toast-error' : ''}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/outlet/outlets" style={{ color: 'var(--text-secondary, #5D4037)', display: 'flex' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ margin: 0, color: 'var(--primary-color, #3E2723)' }}>{outlet.name}</h1>
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
                color: 'var(--text-secondary, #5D4037)',
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
          <button onClick={openEditModal} className="admin-btn-outline admin-btn-sm">
            <Edit3 size={14} /> Edit
          </button>
          <button onClick={handleDeleteOutlet} className="admin-btn admin-btn-sm" style={{ background: '#c62828', color: '#fff' }}>
            <Trash2 size={14} /> Delete
          </button>
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
        {['overview', 'orders', 'staff', 'expenses', 'sources', 'commissions'].map((tab) => (
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
                      borderBottom: '1px solid var(--border-color, #e0d5c1)',
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
                <button
                  className="admin-btn-outline"
                  style={{ justifyContent: 'center', width: '100%' }}
                  onClick={() => router.push('/outlet/dashboard')}
                >
                  <Store size={16} /> View Outlet Dashboard
                </button>
                <button
                  className="admin-btn-outline"
                  style={{ justifyContent: 'center', width: '100%' }}
                  onClick={() => {
                    const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
                    const targetUrl = isLocal 
                      ? `${window.location.protocol}//pos.localhost:${window.location.port}`
                      : `${window.location.protocol}//pos.janubhai.com`;
                    window.location.href = targetUrl;
                  }}
                >
                  <CreditCard size={16} /> View POS
                </button>
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
              <button onClick={() => router.push('/outlet/operations/staff')} className="admin-btn-outline">
                <UserPlus size={14} /> Manage Staff
              </button>
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
                      border: '1px solid var(--border-color, #e0d5c1)',
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

      {activeTab === 'commissions' && <OutletCommissionsTab outletId={params.id} />}

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

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Outlet</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <h3
                  style={{
                    margin: '0 0 0.75rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Basic Information
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Outlet Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Janu Bhai Coffee - Indira Nagar"
                    />
                  </div>
                  <div className="form-group">
                    <label>Outlet Code *</label>
                    <input
                      required
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      placeholder="JBC-IND"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="123, Main Road"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Bengaluru"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="Karnataka"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      placeholder="560001"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="outlet@janubhaicoffee.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>GSTIN</label>
                    <input
                      value={form.gstin}
                      onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                      placeholder="29ABCDE1234F1Z5"
                    />
                  </div>
                </div>

                <h3
                  style={{
                    margin: '1rem 0 0.75rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Manager Details
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Manager Name</label>
                    <input
                      value={form.manager_name}
                      onChange={(e) => setForm({ ...form, manager_name: e.target.value })}
                      placeholder="Rahul Sharma"
                    />
                  </div>
                  <div className="form-group">
                    <label>Manager Phone</label>
                    <input
                      value={form.manager_phone}
                      onChange={(e) => setForm({ ...form, manager_phone: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="form-group">
                    <label>Manager Email</label>
                    <input
                      type="email"
                      value={form.manager_email}
                      onChange={(e) => setForm({ ...form, manager_email: e.target.value })}
                      placeholder="manager@example.com"
                    />
                  </div>
                </div>

                <h3
                  style={{
                    margin: '1rem 0 0.75rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Financial Settings
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Monthly Rent (₹)</label>
                    <input
                      type="number"
                      value={form.rent}
                      onChange={(e) => setForm({ ...form, rent: e.target.value })}
                      placeholder="50000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Monthly Electricity (₹)</label>
                    <input
                      type="number"
                      value={form.electricity}
                      onChange={(e) => setForm({ ...form, electricity: e.target.value })}
                      placeholder="8000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Monthly Water (₹)</label>
                    <input
                      type="number"
                      value={form.water}
                      onChange={(e) => setForm({ ...form, water: e.target.value })}
                      placeholder="2000"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Monthly Internet (₹)</label>
                    <input
                      type="number"
                      value={form.internet}
                      onChange={(e) => setForm({ ...form, internet: e.target.value })}
                      placeholder="1500"
                    />
                  </div>
                  <div className="form-group">
                    <label>COGS %</label>
                    <input
                      type="number"
                      value={form.cogs}
                      onChange={(e) => setForm({ ...form, cogs: e.target.value })}
                      placeholder="35"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
            {posProducts.filter((p) => p.source_product_id).length} of {posProducts.length} linked to Janu Bhai catalog
          </span>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Source</th>
              <th>Commission/Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posProducts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
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
                          <Link2 size={14} /> {pp.source_product_id}
                        </span>
                      ) : (
                        <span style={{ color: '#a0aec0' }}>Local item</span>
                      )}
                    </td>
                    <td>
                      {isLinked
                        ? `₹${Number(pp.commission_per_unit).toLocaleString('en-IN')}`
                        : '-'}
                    </td>
                    <td>
                      {editingProduct === pp.id ? (
                        <SourceLinkForm
                          sourceProducts={filteredSP}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          onLink={(spId, commission) => handleLinkProduct(pp.id, spId, commission)}
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
  const [commission, setCommission] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) return;
    onLink(selected, commission);
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
      <input
        type="number"
        step="0.01"
        placeholder="Commission per unit (₹)"
        value={commission}
        onChange={(e) => setCommission(e.target.value)}
        style={{
          padding: '6px',
          fontSize: '0.8rem',
          borderRadius: '4px',
          border: '1px solid var(--border-color)',
        }}
      />
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

function OutletCommissionsTab({ outletId }) {
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');

  const statusColors = {
    pending: { bg: '#fff3cd', color: '#856404' },
    approved: { bg: '#cce5ff', color: '#004085' },
    paid: { bg: '#d4edda', color: '#155724' },
    cancelled: { bg: '#f8d7da', color: '#721c24' },
  };

  const fetchData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const headers = { Authorization: `Bearer ${session.access_token}` };
    const params = new URLSearchParams({ outlet_id: outletId });
    if (filterStatus) params.set('status', filterStatus);
    const res = await fetch(`/api/admin/data?type=commissions&${params}`, { headers });
    if (res.ok) {
      const j = await res.json();
      setCommissions(j.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (outletId) fetchData();
  }, [outletId, filterStatus]);

  const doAction = async (action, id) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, id }),
    });
    fetchData();
  };

  const totals = commissions.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + Number(c.total_commission);
      acc.total += Number(c.total_commission);
      return acc;
    },
    { total: 0 },
  );

  if (loading) return <div className="admin-loading">Loading commissions...</div>;

  return (
    <div>
      <div
        className="admin-card"
        style={{ display: 'flex', gap: '1.5rem', padding: '1.25rem', marginBottom: '1rem' }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pending</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#856404' }}>
            ₹{(totals.pending || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Approved</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#004085' }}>
            ₹{(totals.approved || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Paid</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#155724' }}>
            ₹{(totals.paid || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            ₹{totals.total.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="admin-toolbar">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem',
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
        </select>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {commissions.length} transaction(s)
        </span>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
              <th>Period</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {commissions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No commission transactions
                </td>
              </tr>
            ) : (
              commissions.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    {c.pos_orders?.order_number || '-'}
                  </td>
                  <td>{c.pos_products?.name || 'Deleted'}</td>
                  <td>{c.quantity}</td>
                  <td>₹{Number(c.commission_per_unit).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>
                    ₹{Number(c.total_commission).toLocaleString()}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {
                      [
                        'Jan',
                        'Feb',
                        'Mar',
                        'Apr',
                        'May',
                        'Jun',
                        'Jul',
                        'Aug',
                        'Sep',
                        'Oct',
                        'Nov',
                        'Dec',
                      ][c.period_month - 1]
                    }{' '}
                    {c.period_year}
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        ...(statusColors[c.status] || { bg: '#e2e3e5', color: '#383d41' }),
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {c.status === 'pending' && (
                        <button
                          className="admin-btn sm"
                          onClick={() => doAction('approve_commission', c.id)}
                          style={{ background: '#004085', color: '#fff', fontSize: '0.75rem' }}
                        >
                          <CheckCircle size={12} /> Approve
                        </button>
                      )}
                      {c.status === 'approved' && (
                        <button
                          className="admin-btn sm"
                          onClick={() => doAction('pay_commission', c.id)}
                          style={{ background: '#155724', color: '#fff', fontSize: '0.75rem' }}
                        >
                          <DollarSign size={12} /> Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
