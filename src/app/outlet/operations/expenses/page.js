"use client";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  DollarSign, Plus, Filter, Search, RefreshCw, Clock, CheckCircle, XCircle, Repeat
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip
} from "recharts";

const COLORS = ["#e53e3e", "#dd6b20", "#d69e2e", "#38a169", "#3182ce", "#805ad5", "#319795", "#b83280"];
const EXPENSE_CATEGORIES = ["Rent", "Electricity", "Salaries", "Raw Materials", "Packaging", "Marketing", "Maintenance", "Other"];

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [outletId, setOutletId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [form, setForm] = useState({
    category: "", amount: "", description: "", vendor: "", date: new Date().toISOString().split("T")[0],
    payment_method: "cash", recurring: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      let oid = sessionStorage.getItem("selected_outlet_id");
      if (!oid) {
        const { data: staff } = await supabase.from("outlet_staff").select("outlet_id").eq("user_id", session.user.id).maybeSingle();
        oid = staff?.outlet_id;
        if (oid) sessionStorage.setItem("selected_outlet_id", oid);
      }
      setOutletId(oid);

      const params = new URLSearchParams();
      if (oid) params.set("outletId", oid);
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/outlet/expenses?${params}`);
      if (res.ok) {
        const { data } = await res.json();
        setExpenses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/outlet/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlet_id: outletId, category: form.category, amount: parseFloat(form.amount),
          description: form.description, vendor: form.vendor, date: form.date,
          payment_method: form.payment_method, recurring: form.recurring,
        }),
      });
      if (!res.ok) { const b = await res.json(); throw new Error(b.error); }
      setSuccess("Expense added");
      setForm({ category: "", amount: "", description: "", vendor: "", date: new Date().toISOString().split("T")[0], payment_method: "cash", recurring: false });
      setShowForm(false);
      fetchExpenses();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const res = await fetch("/api/outlet/expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "paid" }),
      });
      if (res.ok) { fetchExpenses(); setSuccess("Marked as paid"); setTimeout(() => setSuccess(""), 3000); }
    } catch {}
  };

  const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const paidExpenses = expenses.filter(e => e.status === "paid").reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const pendingExpenses = expenses.filter(e => e.status === "pending").reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  const byCategory = {};
  expenses.forEach(e => {
    const cat = e.category || "Other";
    if (!byCategory[cat]) byCategory[cat] = 0;
    byCategory[cat] += parseFloat(e.amount || 0);
  });
  const pieData = Object.entries(byCategory).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));

  if (loading) return <div className="outlet-loading"><div className="outlet-loading-spinner" /><p>Loading expenses...</p></div>;

  return (
    <div>
      <div className="outlet-page-header">
        <div>
          <h1>Expenses</h1>
          <p className="outlet-page-subtitle">Track and manage outlet expenses</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="outlet-btn primary sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> {showForm ? "Cancel" : "Add Expense"}
          </button>
          <button className="outlet-btn outline sm" onClick={fetchExpenses}><RefreshCw size={14} /></button>
        </div>
      </div>

      {success && <div className="outlet-success-banner">{success}</div>}
      {error && <div className="outlet-error-banner">{error}</div>}

      <div className="outlet-stats-grid">
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon red"><DollarSign size={24} /></div>
          <div className="outlet-stat-info"><h3>{formatCurrency(totalExpenses)}</h3><p>Total Expenses</p></div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon green"><CheckCircle size={24} /></div>
          <div className="outlet-stat-info"><h3>{formatCurrency(paidExpenses)}</h3><p>Paid</p></div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon orange"><Clock size={24} /></div>
          <div className="outlet-stat-info"><h3>{formatCurrency(pendingExpenses)}</h3><p>Pending</p></div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon blue"><Filter size={24} /></div>
          <div className="outlet-stat-info"><h3>{expenses.length}</h3><p>Total Entries</p></div>
        </div>
      </div>

      {showForm && (
        <form className="outlet-form" onSubmit={handleAddExpense}>
          <h3>Add New Expense</h3>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Category *</label>
              <select className="form-control" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required>
                <option value="">Select category</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Amount *</label>
              <input type="number" step="0.01" className="form-control" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
            </div>
          </div>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Description</label>
              <input className="form-control" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Vendor</label>
              <input className="form-control" value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} />
            </div>
          </div>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Bill Date</label>
              <input type="date" className="form-control" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select className="form-control" value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" id="recurring" checked={form.recurring} onChange={e => setForm(p => ({ ...p, recurring: e.target.checked }))} />
            <label htmlFor="recurring" style={{ margin: 0 }}>Recurring expense</label>
          </div>
          <button type="submit" className="outlet-btn primary" disabled={submitting}>
            {submitting ? "Adding..." : "Add Expense"}
          </button>
        </form>
      )}

      <div className="outlet-grid-2">
        <div className="outlet-card">
          <h2>Expense Summary by Category</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pieData.map(({ name, value, color }) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f7fafc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: 13 }}>{name}</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{formatCurrency(value)}</span>
              </div>
            ))}
            {pieData.length === 0 && <div className="outlet-empty"><p>No expenses</p></div>}
          </div>
        </div>
        <div className="outlet-card">
          <h2>Recurring Expenses</h2>
          <div style={{ padding: 12, background: "#fffbeb", borderRadius: 8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Repeat size={16} color="#d69e2e" />
            <span style={{ fontSize: 13, color: "#92400e" }}>Rent & utilities are tracked here</span>
          </div>
          <ul className="outlet-list">
            {["Rent", "Electricity"].map(cat => {
              const catExpenses = expenses.filter(e => e.category === cat && e.recurring);
              const total = catExpenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
              const nextDue = catExpenses.length > 0 ? new Date(catExpenses[0].date) : new Date();
              return (
                <li key={cat} className="outlet-list-item">
                  <div className="outlet-list-item-info">
                    <h4>{cat}</h4>
                    <p>Next due: {nextDue.toLocaleDateString()} &middot; {catExpenses.length} entries</p>
                  </div>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(total)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="outlet-filter-bar">
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="outlet-card">
        <h2>Expense List</h2>
        <div className="table-responsive" style={{ maxHeight: 400 }}>
          <table className="outlet-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={7}><div className="outlet-empty"><p>No expenses found</p></div></td></tr>
              ) : expenses.map(exp => (
                <tr key={exp.id}>
                  <td>{new Date(exp.date || exp.created_at).toLocaleDateString()}</td>
                  <td><span className="outlet-badge blue">{exp.category}</span></td>
                  <td>{exp.description || "-"}</td>
                  <td>{exp.vendor || "-"}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(exp.amount)}</td>
                  <td>
                    <span className={`outlet-badge ${exp.status === "paid" ? "green" : "yellow"}`}>
                      {exp.status || "pending"}
                    </span>
                  </td>
                  <td>
                    {exp.status !== "paid" && (
                      <button className="outlet-btn success sm" onClick={() => handleMarkPaid(exp.id)}>
                        <CheckCircle size={12} /> Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  function formatCurrency(n) {
    return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  }
}
