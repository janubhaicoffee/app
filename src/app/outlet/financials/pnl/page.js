'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, RefreshCw, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
} from 'recharts';

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'This Week', days: 6 },
  { label: 'This Month', days: 29 },
  { label: 'This Quarter', days: 89 },
  { label: 'Custom', days: -1 },
];

export default function PnLPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pnl, setPnl] = useState(null);
  const [prevPnl, setPrevPnl] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [prevDailySales, setPrevDailySales] = useState([]);
  const [outletId, setOutletId] = useState(null);
  const [preset, setPreset] = useState(PRESETS[1]);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const getDateRange = useCallback((presetIdx) => {
    if (presetIdx === 0) {
      const today = new Date().toISOString().split('T')[0];
      return { start: today, end: today };
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - PRESETS[presetIdx].days);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, []);

  const fetchPnL = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      let oid = sessionStorage.getItem('selected_outlet_id');
      if (!oid) {
        const { data: staff } = await supabase
          .from('outlet_staff')
          .select('outlet_id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        oid = staff?.outlet_id;
        if (oid) sessionStorage.setItem('selected_outlet_id', oid);
      }
      setOutletId(oid);

      let startDate, endDate;
      if (preset.label === 'Custom' && customRange.start && customRange.end) {
        startDate = customRange.start;
        endDate = customRange.end;
      } else {
        const range = getDateRange(PRESETS.indexOf(preset));
        startDate = range.start;
        endDate = range.end;
      }

      // Previous period (same length)
      const rangeLen = new Date(endDate) - new Date(startDate);
      const prevStart = new Date(new Date(startDate).getTime() - rangeLen - 86400000)
        .toISOString()
        .split('T')[0];
      const prevEnd = new Date(new Date(startDate).getTime() - 86400000)
        .toISOString()
        .split('T')[0];

      const params = `?outletId=${oid || ''}&startDate=${startDate}&endDate=${endDate}`;
      const prevParams = `?outletId=${oid || ''}&startDate=${prevStart}&endDate=${prevEnd}`;
      const dailyParams = `?outletId=${oid || ''}&startDate=${startDate}&endDate=${endDate}`;
      const prevDailyParams = `?outletId=${oid || ''}&startDate=${prevStart}&endDate=${prevEnd}`;

      const [pnlRes, prevPnlRes, dailyRes, prevDailyRes] = await Promise.allSettled([
        fetch(`/api/outlet/financials/pnl${params}`),
        fetch(`/api/outlet/financials/pnl${prevParams}`),
        fetch(`/api/outlet/financials/daily-sales${dailyParams}`),
        fetch(`/api/outlet/financials/daily-sales${prevDailyParams}`),
      ]);

      if (pnlRes.status === 'fulfilled' && pnlRes.value.ok) {
        const { data } = await pnlRes.value.json();
        setPnl(data);
      }
      if (prevPnlRes.status === 'fulfilled' && prevPnlRes.value.ok) {
        const { data } = await prevPnlRes.value.json();
        setPrevPnl(data);
      }
      if (dailyRes.status === 'fulfilled' && dailyRes.value.ok) {
        const { data } = await dailyRes.value.json();
        setDailySales(
          Array.isArray(data) ? data.sort((a, b) => a.date?.localeCompare(b.date)) : [],
        );
      }
      if (prevDailyRes.status === 'fulfilled' && prevDailyRes.value.ok) {
        const { data } = await prevDailyRes.value.json();
        setPrevDailySales(
          Array.isArray(data) ? data.sort((a, b) => a.date?.localeCompare(b.date)) : [],
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [preset, customRange, getDateRange]);

  useEffect(() => {
    fetchPnL();
  }, [fetchPnL]);

  const renderChange = (current, previous) => {
    if (!previous) return null;
    const diff = current - previous;
    const pct = previous !== 0 ? ((diff / previous) * 100).toFixed(1) : '0';
    const isUp = diff >= 0;
    return (
      <span
        style={{
          color: isUp ? '#38a169' : '#e53e3e',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {Math.abs(diff).toFixed(0)} ({pct}%)
      </span>
    );
  };

  if (loading)
    return (
      <div className="outlet-loading">
        <div className="outlet-loading-spinner" />
        <p>Loading P&L...</p>
      </div>
    );

  return (
    <div>
      <div className="outlet-page-header">
        <div>
          <h1>Profit & Loss</h1>
          <p className="outlet-page-subtitle">Financial performance overview</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="outlet-tabs" style={{ margin: 0 }}>
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                className={`outlet-tab ${preset.label === p.label ? 'active' : ''}`}
                onClick={() => setPreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
          {preset.label === 'Custom' && (
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="date"
                className="form-control"
                style={{ width: 140 }}
                value={customRange.start}
                onChange={(e) => setCustomRange((p) => ({ ...p, start: e.target.value }))}
              />
              <input
                type="date"
                className="form-control"
                style={{ width: 140 }}
                value={customRange.end}
                onChange={(e) => setCustomRange((p) => ({ ...p, end: e.target.value }))}
              />
            </div>
          )}
          <button className="outlet-btn outline sm" onClick={fetchPnL}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && <div className="outlet-error-banner">{error}</div>}

      <div className="outlet-stats-grid">
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="outlet-stat-info">
            <h3>{formatCurrency(pnl?.totalRevenue || 0)}</h3>
            <p>Total Revenue {renderChange(pnl?.totalRevenue || 0, prevPnl?.totalRevenue || 0)}</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon blue">
            <TrendingDown size={24} />
          </div>
          <div className="outlet-stat-info">
            <h3>{formatCurrency(pnl?.cogs || 0)}</h3>
            <p>COGS {renderChange(pnl?.cogs || 0, prevPnl?.cogs || 0)}</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon purple">
            <TrendingUp size={24} />
          </div>
          <div className="outlet-stat-info">
            <h3>{formatCurrency(pnl?.grossProfit || 0)}</h3>
            <p>Gross Profit</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon orange">
            <TrendingDown size={24} />
          </div>
          <div className="outlet-stat-info">
            <h3>{formatCurrency(pnl?.totalExpenses || 0)}</h3>
            <p>Expenses {renderChange(pnl?.totalExpenses || 0, prevPnl?.totalExpenses || 0)}</p>
          </div>
        </div>
      </div>

      <div className="outlet-grid-2">
        <div className="outlet-card">
          <h2>Revenue Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #edf2f7',
              }}
            >
              <span>Total Sales</span>
              <span style={{ fontWeight: 700 }}>{formatCurrency(pnl?.totalRevenue || 0)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #edf2f7',
                fontSize: 13,
                color: '#718096',
              }}
            >
              <span>Tax Collected</span>
              <span>{formatCurrency(pnl?.totalTax || 0)}</span>
            </div>
          </div>
        </div>
        <div className="outlet-card">
          <h2>COGS Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #edf2f7',
              }}
            >
              <span>Cost of Goods Sold</span>
              <span style={{ fontWeight: 700 }}>{formatCurrency(pnl?.cogs || 0)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #edf2f7',
                fontSize: 13,
                color: '#718096',
              }}
            >
              <span>COGS % of Revenue</span>
              <span>
                {pnl?.totalRevenue > 0 ? ((pnl.cogs / pnl.totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="outlet-card" style={{ marginBottom: 24 }}>
        <h2>Profit Summary</h2>
        <div className="outlet-grid-2" style={{ marginBottom: 0 }}>
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #edf2f7',
              }}
            >
              <span>Revenue</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(pnl?.totalRevenue || 0)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #edf2f7',
              }}
            >
              <span style={{ color: '#718096' }}>COGS</span>
              <span style={{ color: '#e53e3e' }}>- {formatCurrency(pnl?.cogs || 0)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '2px solid #e2e8f0',
                fontWeight: 600,
              }}
            >
              <span>Gross Profit</span>
              <span>{formatCurrency(pnl?.grossProfit || 0)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #edf2f7',
              }}
            >
              <span style={{ color: '#718096' }}>Labor Cost</span>
              <span style={{ color: '#e53e3e' }}>- {formatCurrency(pnl?.laborCost || 0)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #edf2f7',
              }}
            >
              <span style={{ color: '#718096' }}>Rent Allocated</span>
              <span style={{ color: '#e53e3e' }}>- {formatCurrency(pnl?.rentAllocated || 0)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #edf2f7',
              }}
            >
              <span style={{ color: '#718096' }}>Other Expenses</span>
              <span style={{ color: '#e53e3e' }}>- {formatCurrency(pnl?.totalExpenses || 0)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '14px 0',
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              <span>Net Profit</span>
              <span style={{ color: (pnl?.netProfit || 0) >= 0 ? '#38a169' : '#e53e3e' }}>
                {formatCurrency(pnl?.netProfit || 0)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>Profit Margin</span>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 20,
                  color: (pnl?.profitMargin || 0) >= 0 ? '#38a169' : '#e53e3e',
                }}
              >
                {pnl?.profitMargin || 0}%
              </span>
            </div>
          </div>
          <div>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { name: 'Revenue', value: pnl?.totalRevenue || 0 },
                    { name: 'Gross Profit', value: pnl?.grossProfit || 0 },
                    { name: 'Net Profit', value: Math.max(0, pnl?.netProfit || 0) },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ReTooltip />
                  <Area type="monotone" dataKey="value" stroke="#3182ce" fill="#ebf8ff" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {dailySales.length > 0 && (
        <div className="outlet-chart-container">
          <h2>Daily Revenue vs Expenses Trend</h2>
          <div className="outlet-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey={(d) =>
                    new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  }
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => '₹' + v} />
                <ReTooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="total_revenue" name="Revenue" fill="#38a169" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey={(d) =>
                    parseFloat(d.total_expenses || 0) + parseFloat(d.total_labor || 0)
                  }
                  name="Expenses"
                  fill="#e53e3e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {prevDailySales.length > 0 && (
        <div className="outlet-chart-container">
          <h2>Previous Period Comparison</h2>
          <div className="outlet-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prevDailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey={(d) =>
                    new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  }
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => '₹' + v} />
                <ReTooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="total_revenue" name="Revenue" fill="#805ad5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  function formatCurrency(n) {
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }
}
