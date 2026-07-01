"use client";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp, TrendingDown, RefreshCw, Calendar
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Cell, Legend
} from "recharts";

const COLORS = ["#e53e3e", "#dd6b20", "#d69e2e", "#38a169", "#3182ce", "#805ad5"];

export default function FinancialAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [outletId, setOutletId] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [pnlData, setPnlData] = useState(null);
  const [prevPnl, setPrevPnl] = useState(null);
  const [period, setPeriod] = useState("month"); // month, quarter, year

  const getRange = useCallback((periodType) => {
    const end = new Date().toISOString().split("T")[0];
    const start = new Date();
    if (periodType === "month") start.setMonth(start.getMonth() - 1);
    else if (periodType === "quarter") start.setMonth(start.getMonth() - 3);
    else start.setFullYear(start.getFullYear() - 1);
    return { start: start.toISOString().split("T")[0], end };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: staff } = await supabase.from("outlet_staff").select("outlet_id").eq("user_id", session.user.id).maybeSingle();
      const oid = staff?.outlet_id;
      setOutletId(oid);

      const { start, end } = getRange(period);
      const rangeLen = new Date(end) - new Date(start);
      const prevStart = new Date(new Date(start).getTime() - rangeLen - 86400000).toISOString().split("T")[0];
      const prevEnd = new Date(new Date(start).getTime() - 86400000).toISOString().split("T")[0];

      const params = `?outletId=${oid || ""}&startDate=${start}&endDate=${end}`;
      const prevParams = `?outletId=${oid || ""}&startDate=${prevStart}&endDate=${prevEnd}`;

      const [dailyRes, pnlRes, prevPnlRes] = await Promise.allSettled([
        fetch(`/api/outlet/financials/daily-sales${params}`),
        fetch(`/api/outlet/financials/pnl${params}`),
        fetch(`/api/outlet/financials/pnl${prevParams}`),
      ]);

      if (dailyRes.status === "fulfilled" && dailyRes.value.ok) {
        const { data } = await dailyRes.value.json();
        setDailySales((Array.isArray(data) ? data : []).sort((a, b) => a.date?.localeCompare(b.date)));
      }
      if (pnlRes.status === "fulfilled" && pnlRes.value.ok) {
        const { data } = await pnlRes.value.json();
        setPnlData(data);
      }
      if (prevPnlRes.status === "fulfilled" && prevPnlRes.value.ok) {
        const { data } = await prevPnlRes.value.json();
        setPrevPnl(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [period, getRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const revExpChart = dailySales.map(d => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    revenue: parseFloat(d.total_revenue || 0),
    expenses: parseFloat(d.total_expenses || 0) + parseFloat(d.total_labor || 0),
    profit: parseFloat(d.total_revenue || 0) - parseFloat(d.total_expenses || 0) - parseFloat(d.total_labor || 0),
  }));

  const profitMarginTrend = dailySales.map(d => {
    const rev = parseFloat(d.total_revenue || 0);
    const exp = parseFloat(d.total_expenses || 0) + parseFloat(d.total_labor || 0) + parseFloat(d.total_cogs || 0);
    return {
      date: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      margin: rev > 0 ? ((rev - exp) / rev * 100) : 0,
    };
  });

  const expenseByCat = pnlData ? [
    { name: "Labor", value: pnlData.laborCost || 0 },
    { name: "Rent", value: pnlData.rentAllocated || 0 },
    { name: "Other Expenses", value: pnlData.totalExpenses || 0 },
    { name: "COGS", value: pnlData.cogs || 0 },
  ].filter(e => e.value > 0) : [];

  const cogsTrend = dailySales.map(d => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    cogs: parseFloat(d.total_cogs || 0),
    revenue: parseFloat(d.total_revenue || 0),
  }));

  if (loading) return <div className="outlet-loading"><div className="outlet-loading-spinner" /><p>Loading financial analytics...</p></div>;
  if (error) return <div className="outlet-error-banner">{error}</div>;

  return (
    <div>
      <div className="outlet-page-header">
        <div>
          <h1>Financial Analytics</h1>
          <p className="outlet-page-subtitle">Deep dive into revenue, expenses, and profitability</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="outlet-tabs" style={{ margin: 0 }}>
            {["month", "quarter", "year"].map(p => (
              <button key={p} className={`outlet-tab ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button className="outlet-btn outline sm" onClick={fetchData}><RefreshCw size={14} /></button>
        </div>
      </div>

      <div className="outlet-stats-grid">
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon green"><TrendingUp size={24} /></div>
          <div className="outlet-stat-info">
            <h3>{formatCurrency(pnlData?.totalRevenue || 0)}</h3>
            <p>Revenue {prevPnl && renderChange(pnlData?.totalRevenue, prevPnl?.totalRevenue)}</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon red"><TrendingDown size={24} /></div>
          <div className="outlet-stat-info">
            <h3>{formatCurrency((pnlData?.cogs || 0) + (pnlData?.totalExpenses || 0) + (pnlData?.laborCost || 0) + (pnlData?.rentAllocated || 0))}</h3>
            <p>Total Costs</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon purple"><TrendingUp size={24} /></div>
          <div className="outlet-stat-info">
            <h3>{formatCurrency(pnlData?.netProfit || 0)}</h3>
            <p>Net Profit {prevPnl && renderChange(pnlData?.netProfit, prevPnl?.netProfit)}</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon blue"><TrendingUp size={24} /></div>
          <div className="outlet-stat-info">
            <h3>{pnlData?.profitMargin || 0}%</h3>
            <p>Profit Margin</p>
          </div>
        </div>
      </div>

      <div className="outlet-chart-container">
        <h2>Revenue vs Expenses</h2>
        <div className="outlet-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revExpChart.length > 0 ? revExpChart : [{ date: "No data", revenue: 0, expenses: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => "₹" + v} />
              <ReTooltip formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#38a169" fill="#f0fff4" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="#e53e3e" fill="#fff5f5" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="outlet-grid-2">
        <div className="outlet-chart-container">
          <h2>Profit Margin Trend</h2>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitMarginTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v + "%"} domain={[0, "auto"]} />
                <ReTooltip formatter={(v) => v.toFixed(1) + "%"} />
                <Line type="monotone" dataKey="margin" stroke="#805ad5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="outlet-chart-container">
          <h2>Expense Breakdown</h2>
          <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {expenseByCat.length === 0 ? (
              <div className="outlet-empty"><p>No expense data</p></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseByCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {expenseByCat.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <ReTooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="outlet-chart-container">
        <h2>COGS vs Revenue Over Time</h2>
        <div className="outlet-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cogsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => "₹" + v} />
              <ReTooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="revenue" name="Revenue" fill="#38a169" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cogs" name="COGS" fill="#dd6b20" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  function formatCurrency(n) {
    return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  }

  function renderChange(current, previous) {
    const diff = current - previous;
    const pct = previous !== 0 ? ((diff / previous) * 100).toFixed(1) : "0";
    const isUp = diff >= 0;
    return (
      <span style={{ color: isUp ? "#38a169" : "#e53e3e", fontSize: 11, display: "flex", alignItems: "center", gap: 2 }}>
        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {Math.abs(diff).toFixed(0)} ({pct}%)
      </span>
    );
  }
}
