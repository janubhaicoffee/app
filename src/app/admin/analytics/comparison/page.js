'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { Store, BarChart3, TrendingUp, X, Info } from 'lucide-react';

function formatINR(n) {
  return '₹ ' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

const METRICS = [
  { key: 'revenue', label: 'Revenue', color: '#2e7d32' },
  { key: 'orders', label: 'Orders', color: '#c0392b' },
  { key: 'avgOrder', label: 'Avg Order', color: '#1976d2' },
  { key: 'staff', label: 'Staff Count', color: '#f59e0b' },
];

export default function OutletComparison() {
  const [outlets, setOutlets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const [outletsRes, ordersRes, staffRes] = await Promise.all([
        fetch('/api/admin/outlets', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/admin/data?type=orders', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/admin/staff', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (outletsRes.ok) {
        const json = await outletsRes.json();
        setOutlets(json.data || []);
      }
      if (ordersRes.ok) {
        const json = await ordersRes.json();
        setOrders(json.data || []);
      }
      if (staffRes.ok) {
        const json = await staffRes.json();
        setStaff(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load comparison data', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleOutlet(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const validOrders = orders.filter((o) =>
    ['paid', 'processing', 'shipped', 'delivered'].includes(o.status),
  );

  const outletMetrics = outlets.map((outlet) => {
    const outletOrders = validOrders.filter(
      (o) => o.outlet_id === outlet.id || o.outlet_code === outlet.code,
    );
    const revenue = outletOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const count = outletOrders.length;
    const localStaff = staff.filter((s) => s.outlet_id === outlet.id).length;

    const chartDataMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      chartDataMap[dateStr] = { date: dateStr, revenue: 0 };
    }
    outletOrders.forEach((o) => {
      if (o.created_at && chartDataMap[o.created_at.split('T')[0]]) {
        chartDataMap[o.created_at.split('T')[0]].revenue += o.total_amount || 0;
      }
    });

    return {
      id: outlet.id,
      name: outlet.name,
      code: outlet.code,
      revenue,
      orders: count,
      avgOrder: count > 0 ? revenue / count : 0,
      staff: localStaff,
      chartData: Object.values(chartDataMap),
    };
  });

  const selectedMetrics = outletMetrics.filter((m) => selected.includes(m.id));

  const radarData = METRICS.map((metric) => {
    const entry = { metric: metric.label };
    selectedMetrics.forEach((m) => {
      let value = m[metric.key];
      if (metric.key === 'avgOrder') value = m.avgOrder;
      entry[m.name] = value;
    });
    return entry;
  });

  const maxValues = {};
  METRICS.forEach((m) => {
    maxValues[m.key] = Math.max(...selectedMetrics.map((s) => s[m.key] || 0), 1);
  });

  const radarNormalized = METRICS.map((metric) => {
    const entry = { metric: metric.label };
    selectedMetrics.forEach((m) => {
      let value = m[metric.key];
      if (metric.key === 'avgOrder') value = m.avgOrder;
      entry[m.name] = maxValues[metric.key] > 0 ? ((value || 0) / maxValues[metric.key]) * 100 : 0;
    });
    return entry;
  });

  const COLORS = ['#2e7d32', '#c0392b', '#1976d2', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" /> Loading comparison data...
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Outlet Comparison</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Compare performance across outlets
          </p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Select Outlets to Compare</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {selected.length} selected
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {outlets.map((outlet) => (
            <button
              key={outlet.id}
              onClick={() => toggleOutlet(outlet.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                borderRadius: 6,
                border: `2px solid ${selected.includes(outlet.id) ? 'var(--primary-color)' : 'var(--border-color)'}`,
                background: selected.includes(outlet.id) ? 'var(--primary-color)' : '#fff',
                color: selected.includes(outlet.id) ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
                transition: 'all 0.2s',
              }}
            >
              <Store size={14} />
              {outlet.name}
              {selected.includes(outlet.id) && <X size={14} />}
            </button>
          ))}
        </div>
      </div>

      {selectedMetrics.length === 0 ? (
        <div className="empty-state">
          <BarChart3 size={48} />
          <h3>Select outlets to compare</h3>
          <p>Choose at least 2 outlets from the selection above to see comparison data.</p>
        </div>
      ) : (
        <>
          {selectedMetrics.length >= 2 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>Radar Chart - Strengths Comparison</h2>
                <Info size={16} color="var(--text-secondary)" />
              </div>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <RadarChart data={radarNormalized}>
                    <PolarGrid stroke="#e0e0e0" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    {selectedMetrics.map((m, i) => (
                      <Radar
                        key={m.id}
                        name={m.name}
                        dataKey={m.name}
                        stroke={COLORS[i % COLORS.length]}
                        fill={COLORS[i % COLORS.length]}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend />
                    <Tooltip formatter={(v) => `${v.toFixed(0)}%`} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="admin-card">
            <div className="admin-card-header">
              <h2>Revenue Trend Overlay</h2>
              <TrendingUp size={18} color="var(--text-secondary)" />
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={selectedMetrics[0]?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => v.split('-').slice(1).join('/')}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip formatter={(v) => [formatINR(v), 'Revenue']} />
                  <Legend />
                  {selectedMetrics.map((m, i) => (
                    <Line
                      key={m.id}
                      type="monotone"
                      dataKey="revenue"
                      data={m.chartData}
                      name={m.name}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h2>Side-by-Side Metrics</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    {selectedMetrics.map((m) => (
                      <th key={m.id}>{m.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Revenue</td>
                    {selectedMetrics.map((m) => (
                      <td key={m.id} style={{ fontWeight: 700, color: '#2e7d32' }}>
                        {formatINR(m.revenue)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Orders</td>
                    {selectedMetrics.map((m) => (
                      <td key={m.id}>{m.orders}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Avg Order Value</td>
                    {selectedMetrics.map((m) => (
                      <td key={m.id} style={{ fontWeight: 600 }}>
                        {formatINR(m.avgOrder)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Staff Count</td>
                    {selectedMetrics.map((m) => (
                      <td key={m.id}>{m.staff}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Status</td>
                    {selectedMetrics.map((m) => {
                      const outlet = outlets.find((o) => o.id === m.id);
                      return (
                        <td key={m.id}>
                          <span
                            className="status-badge"
                            style={{
                              background: outlet?.status === 'active' ? '#d4edda' : '#e2e3e5',
                              color: outlet?.status === 'active' ? '#155724' : '#383d41',
                            }}
                          >
                            {outlet?.status || '—'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {selectedMetrics.map((m, i) => (
              <div
                key={m.id}
                className="admin-card"
                style={{ marginBottom: 0, borderLeft: `4px solid ${COLORS[i % COLORS.length]}` }}
              >
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                  {m.name}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Revenue</span>
                    <span style={{ fontWeight: 700, color: '#2e7d32' }}>
                      {formatINR(m.revenue)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Orders</span>
                    <span>{m.orders}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Avg Order</span>
                    <span style={{ fontWeight: 600 }}>{formatINR(m.avgOrder)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Staff</span>
                    <span>{m.staff}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
