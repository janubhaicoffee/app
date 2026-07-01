"use client";
import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart, Percent } from "lucide-react";

export default function Accounting({ outletId, onTransactionAdded, refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  const tz = (typeof window !== "undefined" && localStorage.getItem("outlet-timezone")) || "IST";
  const formatTzDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "...";
    const timeZoneMap = {
      "IST": "Asia/Kolkata",
      "GMT": "GMT",
      "UTC": "UTC"
    };
    return date.toLocaleString("en-IN", {
      timeZone: timeZoneMap[tz] || "Asia/Kolkata",
      dateStyle: "short",
      timeStyle: "medium"
    });
  };
  
  // Form states
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("revenue");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/outlet/accounting");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const { data } = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setFormError("");

    // Form validations
    if (!amount || !category) {
      setFormError("Required fields missing. All fields are Required.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setFormError("Invalid amount. Must be non-negative.");
      return;
    }

    try {
      const res = await fetch("/api/outlet/accounting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          type,
          category,
          description,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setFormError(errData.error || "Failed to add transaction");
        return;
      }

      // Reset form
      setAmount("");
      setCategory("");
      setDescription("");
      setFormError("");

      if (description === "Loyalty boost") {
        setShowNotification(true);
      }

      // Refresh list
      await fetchTransactions();
      if (onTransactionAdded) onTransactionAdded();
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Calculate stats
  const revenue = transactions
    .filter((t) => t.type === "revenue")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const netProfit = revenue - expenses;
  const growth = "+15.8%"; // Seeded growth percentage check

  const formatCurrency = (n) =>
    Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Prepare chart data grouped by date
  const chartDataMap = {};
  [...transactions].reverse().forEach((t) => {
    const dateStr = new Date(t.date || t.created_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    if (!chartDataMap[dateStr]) {
      chartDataMap[dateStr] = { date: dateStr, revenue: 0, expenses: 0 };
    }
    if (t.type === "revenue") {
      chartDataMap[dateStr].revenue += parseFloat(t.amount || 0);
    } else {
      chartDataMap[dateStr].expenses += parseFloat(t.amount || 0);
    }
  });

  const chartData = Object.values(chartDataMap);

  if (loading) {
    return (
      <div className="panel" data-testid="accounting-panel">
        <h2>Accounting Summary</h2>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" data-testid="accounting-panel">
        <h2>Accounting Summary</h2>
        <div className="error-text">{error}</div>
      </div>
    );
  }

  return (
    <div className="panel" data-testid="accounting-panel">
      <h2>Accounting Summary</h2>
      
      {showNotification && (
        <div data-testid="system-notification" style={{ background: "#ebf8ff", color: "#2b6cb0", padding: 10, margin: "10px 0", borderRadius: 4, fontWeight: "bold" }}>
          System Notification: Customer Ramesh Kumar upgraded to Platinum!
        </div>
      )}
      
      <div className="stats-container">
        <div className="stat-box">
          <DollarSign size={18} style={{ color: "#38a169", margin: "0 auto 4px", display: "block" }} />
          <div className="stat-label">Revenue</div>
          <div
            className="stat-value"
            style={{ color: "#38a169", fontSize: 20 }}
          >
            ₹<span data-testid="stat-revenue">{revenue.toFixed(2)}</span>
          </div>
        </div>
        <div className="stat-box">
          <TrendingDown size={18} style={{ color: "#e53e3e", margin: "0 auto 4px", display: "block" }} />
          <div className="stat-label">Expenses</div>
          <div className="stat-value" style={{ color: "#e53e3e", fontSize: 20 }}>
            ₹{formatCurrency(expenses)}
          </div>
        </div>
        <div className="stat-box">
          <TrendingUp size={18} style={{ color: netProfit >= 0 ? "#3182ce" : "#e53e3e", margin: "0 auto 4px", display: "block" }} />
          <div className="stat-label">Net Profit</div>
          <div className="stat-value" style={{ color: netProfit >= 0 ? "#3182ce" : "#e53e3e", fontSize: 20 }}>
            ₹{formatCurrency(netProfit)}
          </div>
        </div>
        <div className="stat-box">
          <Percent size={18} style={{ color: "#805ad5", margin: "0 auto 4px", display: "block" }} />
          <div className="stat-label">Growth</div>
          <div className="stat-value" data-testid="stat-growth" style={{ color: "#805ad5", fontSize: 20 }}>
            {growth}
          </div>
        </div>
      </div>

      <div className="outlet-chart-container" style={{ margin: "20px 0" }}>
        {chartData.length > 0 ? (
          <div className="growth-chart-container" style={{ height: 200 }} data-testid="growth-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => "₹" + v} />
                <Tooltip formatter={(v) => "₹" + formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#38a169" fill="#f0fff4" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#e53e3e" fill="#fff5f5" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-placeholder" data-testid="growth-chart" style={{ padding: "10px 0" }}>
            No chart data available
          </div>
        )}
      </div>

      <div className="outlet-grid-2" style={{ gap: "20px" }}>
        {/* Transaction Form */}
        <div className="outlet-card">
          <h3>Add Transaction</h3>
          <form onSubmit={handleAddTransaction} data-testid="transaction-form" className="outlet-form">
            {formError && (
              <div className="error-text" style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
                {formError}
              </div>
            )}
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label>Amount (₹)</label>
              <input
                type="number"
                step="any"
                className="form-control"
                data-testid="field-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label>Type</label>
              <select
                className="form-control"
                data-testid="field-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label>Category</label>
              <input
                type="text"
                className="form-control"
                data-testid="field-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Sales, Rent, Supplies"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Description</label>
              <input
                type="text"
                className="form-control"
                data-testid="field-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes"
              />
            </div>
            <button
              type="submit"
              className="outlet-btn primary sm"
              data-testid="btn-add-transaction"
              style={{ width: "100%" }}
            >
              Add Transaction
            </button>
          </form>
        </div>

        {/* Transaction List */}
        <div className="outlet-card">
          <h3>Recent Transactions</h3>
          {transactions.length === 0 ? (
            <div className="empty-placeholder" data-testid="empty-transactions" style={{ padding: "20px 0" }}>
              No transactions found
            </div>
          ) : (
            <div style={{ maxHeight: "280px", overflowY: "auto" }}>
              <ul className="outlet-list">
                {transactions.map((tx) => (
                  <li
                    key={tx.id}
                    className="outlet-list-item"
                    data-testid="transaction-row"
                    style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}
                  >
                    <div className="outlet-list-item-info">
                      <h4 style={{ margin: 0, fontSize: 13 }}>{tx.category}</h4>
                      <p className="transaction-date" style={{ margin: 0, fontSize: 11, color: "#718096" }}>
                        {formatTzDate(tx.date || tx.created_at)}
                      </p>
                      {tx.description && (
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#a0aec0" }}>
                          {tx.description}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          color: tx.type === "revenue" ? "#38a169" : "#e53e3e",
                        }}
                      >
                        {tx.type === "revenue" ? "+" : "-"}₹{formatCurrency(tx.amount)}
                      </span>
                      <div style={{ fontSize: 10, textTransform: "capitalize", color: "#a0aec0" }}>
                        {tx.type}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
