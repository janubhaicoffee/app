"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import {
  DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown,
  Store, Award, BarChart3
} from "lucide-react";

function formatINR(n) {
  return '₹ ' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function ConsolidatedAnalytics() {
  const [outlets, setOutlets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [outletsRes, ordersRes, staffRes] = await Promise.all([
        fetch("/api/admin/outlets", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        }),
        fetch("/api/admin/data?type=orders", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        }),
        fetch("/api/admin/staff", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        })
      ]);

      let outletData = [];
      let orderData = [];
      let staffData = [];

      if (outletsRes.ok) {
        const json = await outletsRes.json();
        outletData = json.data || [];
        setOutlets(outletData);
      }
      if (ordersRes.ok) {
        const json = await ordersRes.json();
        orderData = json.data || [];
        setOrders(orderData);
      }
      if (staffRes.ok) {
        const json = await staffRes.json();
        staffData = json.data || [];
        setStaff(staffData);
      }
    } catch (err) {
      console.error("Failed to load consolidated data", err);
    } finally {
      setLoading(false);
    }
  }

  const analysis = (() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const validOrders = orders.filter(o =>
      ["paid", "processing", "shipped", "delivered"].includes(o.status)
    );

    const totalRevenue = validOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const totalOrders = validOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalStaff = staff.length;

    const outletPerformance = outlets.map(outlet => {
      const localOrders = validOrders.filter(o =>
        o.outlet_id === outlet.id || o.outlet_code === outlet.code
      );
      const revenue = localOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
      const count = localOrders.length;
      const localStaff = staff.filter(s => s.outlet_id === outlet.id).length;
      return {
        name: outlet.name,
        code: outlet.code,
        revenue,
        orders: count,
        staff: localStaff,
        status: outlet.status
      };
    }).filter(o => o.revenue > 0 || o.orders > 0);

    const sortedByRevenue = [...outletPerformance].sort((a, b) => b.revenue - a.revenue);
    const topOutlet = sortedByRevenue[0] || null;
    const bottomOutlet = sortedByRevenue[sortedByRevenue.length - 1] || null;

    const totalRevenueAll = outletPerformance.reduce((s, o) => s + o.revenue, 0);
    const totalOrdersAll = outletPerformance.reduce((s, o) => s + o.orders, 0);
    const avgOrderValueTotal = totalOrdersAll > 0 ? totalRevenueAll / totalOrdersAll : 0;

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const recentRevenue = validOrders.filter(o => {
      const d = new Date(o.created_at);
      return (Date.now() - d.getTime()) <= thirtyDaysMs;
    }).reduce((s, o) => s + (o.total_amount || 0), 0);

    const prevThirtyDaysMs = 60 * 24 * 60 * 60 * 1000;
    const prevRevenue = validOrders.filter(o => {
      const d = new Date(o.created_at);
      const diff = Date.now() - d.getTime();
      return diff > thirtyDaysMs && diff <= prevThirtyDaysMs;
    }).reduce((s, o) => s + (o.total_amount || 0), 0);

    const momGrowth = prevRevenue > 0 ? ((recentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    return {
      outletPerformance,
      totalRevenue: totalRevenueAll,
      totalOrders: totalOrdersAll,
      avgOrderValue: avgOrderValueTotal,
      totalStaff,
      topOutlet,
      bottomOutlet,
      momGrowth
    };
  })();

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /> Loading consolidated analytics...</div>;
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Consolidated Analytics</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Performance overview across all outlets
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card green">
          <h3><DollarSign size={14} style={{ display: 'inline', marginRight: 4 }} /> Total Revenue</h3>
          <p className="stat-value">{formatINR(analysis.totalRevenue)}</p>
          <p className="stat-sub">Across all outlets</p>
        </div>
        <div className="stat-card">
          <h3><ShoppingCart size={14} style={{ display: 'inline', marginRight: 4 }} /> Total Orders</h3>
          <p className="stat-value">{analysis.totalOrders.toLocaleString()}</p>
          <p className="stat-sub">All time</p>
        </div>
        <div className="stat-card blue">
          <h3><BarChart3 size={14} style={{ display: 'inline', marginRight: 4 }} /> Avg Order Value</h3>
          <p className="stat-value">{formatINR(analysis.avgOrderValue)}</p>
          <p className="stat-sub">Per order average</p>
        </div>
        <div className="stat-card gold">
          <h3><Users size={14} style={{ display: 'inline', marginRight: 4 }} /> Total Staff</h3>
          <p className="stat-value">{analysis.totalStaff}</p>
          <p className="stat-sub">Across all outlets</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Revenue Comparison</h2>
            <DollarSign size={18} color="#2e7d32" />
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={analysis.outletPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [formatINR(v), "Revenue"]} />
                <Bar dataKey="revenue" fill="#2e7d32" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Orders Comparison</h2>
            <ShoppingCart size={18} color="#c0392b" />
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={analysis.outletPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#c0392b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {analysis.topOutlet && (
          <div className="admin-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="admin-card-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="#2e7d32" /> Top Performer
              </h2>
              <Award size={20} color="#f59e0b" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 50, height: 50, borderRadius: 12, background: '#e8f5e9',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Store size={24} color="#2e7d32" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{analysis.topOutlet.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Code: {analysis.topOutlet.code}</div>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Revenue</span><br /><strong>{formatINR(analysis.topOutlet.revenue)}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Orders</span><br /><strong>{analysis.topOutlet.orders}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Staff</span><br /><strong>{analysis.topOutlet.staff}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {analysis.bottomOutlet && (
          <div className="admin-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="admin-card-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingDown size={18} color="#c62828" /> Needs Attention
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 50, height: 50, borderRadius: 12, background: '#ffebee',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Store size={24} color="#c62828" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{analysis.bottomOutlet.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Code: {analysis.bottomOutlet.code}</div>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Revenue</span><br /><strong>{formatINR(analysis.bottomOutlet.revenue)}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Orders</span><br /><strong>{analysis.bottomOutlet.orders}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Staff</span><br /><strong>{analysis.bottomOutlet.staff}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Month-over-Month Growth</h2>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontWeight: 700, fontSize: '1.1rem',
            color: analysis.momGrowth >= 0 ? '#2e7d32' : '#c62828'
          }}>
            {analysis.momGrowth >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {Math.abs(analysis.momGrowth).toFixed(1)}% {analysis.momGrowth >= 0 ? 'growth' : 'decline'}
          </div>
        </div>
        <div style={{ padding: '1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Compared to the previous 30-day period
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Outlet Performance Summary</h2>
        </div>
        {analysis.outletPerformance.length === 0 ? (
          <div className="empty-state">
            <Store size={40} />
            <h3>No performance data</h3>
            <p>Orders need to be associated with outlets for data to appear.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Outlet</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Staff</th>
                  <th>Avg Order</th>
                </tr>
              </thead>
              <tbody>
                {analysis.outletPerformance.map(o => (
                  <tr key={o.code}>
                    <td style={{ fontWeight: 600 }}>{o.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{o.code}</td>
                    <td>
                      <span className="status-badge" style={{
                        background: o.status === 'active' ? '#d4edda' : '#e2e3e5',
                        color: o.status === 'active' ? '#155724' : '#383d41'
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#2e7d32' }}>{formatINR(o.revenue)}</td>
                    <td>{o.orders}</td>
                    <td>{o.staff}</td>
                    <td>{o.orders > 0 ? formatINR(o.revenue / o.orders) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
