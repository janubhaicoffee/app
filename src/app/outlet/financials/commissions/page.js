"use client";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { DollarSign, TrendingUp, Filter, RefreshCw, Clock, CheckCircle, Search } from "lucide-react";

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Paid"];

const STATUS_BADGE = {
  pending: "yellow",
  approved: "green",
  paid: "blue",
};

const STATUS_LABEL = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
};

export default function CommissionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [outletId, setOutletId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: staff, error: staffErr } = await supabase
        .from("outlet_staff")
        .select("outlet_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (staffErr) throw staffErr;
      if (!staff?.outlet_id) {
        setError("No outlet assigned to your account");
        setLoading(false);
        return;
      }

      const oid = staff.outlet_id;
      setOutletId(oid);

      const authHeaders = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };

      const params = new URLSearchParams({ outletId: oid });
      if (statusFilter !== "All") params.set("status", statusFilter.toLowerCase());

      const [listRes, summaryRes] = await Promise.all([
        fetch(`/api/outlet/commissions?${params}`, { headers: authHeaders }),
        fetch(`/api/outlet/commissions?outletId=${oid}&summary=true`, { headers: authHeaders }),
      ]);

      if (listRes.ok) {
        const { data } = await listRes.json();
        setCommissions(Array.isArray(data) ? data : []);
      } else {
        const errData = await listRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load commissions");
      }

      if (summaryRes.ok) {
        const { data } = await summaryRes.json();
        setSummary(data?.summary || null);
        setMonthlyTotals(data?.monthlyTotals || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="outlet-loading">
        <div className="outlet-loading-spinner" />
        <p>Loading commissions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="outlet-page-header">
        <div>
          <h1>Commissions Earned</h1>
          <p className="outlet-page-subtitle">Commission from Janu Bhai products sold at your outlet</p>
        </div>
        <button className="outlet-btn outline sm" onClick={fetchData}>
          <RefreshCw size={14} />
        </button>
      </div>

      {error && <div className="outlet-error-banner">{error}</div>}

      <div className="outlet-stats-grid">
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon orange"><Clock size={24} /></div>
          <div className="outlet-stat-info">
            <h3>{formatCurrency(summary?.pending_total || 0)}</h3>
            <p>Pending ({summary?.pending_count || 0})</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon green"><CheckCircle size={24} /></div>
          <div className="outlet-stat-info">
            <h3>{formatCurrency(summary?.approved_total || 0)}</h3>
            <p>Approved ({summary?.approved_count || 0})</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon blue"><DollarSign size={24} /></div>
          <div className="outlet-stat-info">
            <h3>{formatCurrency(summary?.paid_total || 0)}</h3>
            <p>Paid ({summary?.paid_count || 0})</p>
          </div>
        </div>
        <div className="outlet-stat-card">
          <div className="outlet-stat-icon purple"><TrendingUp size={24} /></div>
          <div className="outlet-stat-info">
            <h3>{formatCurrency((summary?.pending_total || 0) + (summary?.approved_total || 0) + (summary?.paid_total || 0))}</h3>
            <p>Total Commission</p>
          </div>
        </div>
      </div>

      {summary && summary.total_count > 0 && (
        <div className="outlet-card" style={{ marginBottom: 24 }}>
          <h2>Progress</h2>
          <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 8 }}>
            {summary.pending_count > 0 && (
              <div
                style={{ flex: summary.pending_count, height: 8, backgroundColor: "#ecc94b", borderRadius: 4, minWidth: 4 }}
                title={`Pending: ${summary.pending_count}`}
              />
            )}
            {summary.approved_count > 0 && (
              <div
                style={{ flex: summary.approved_count, height: 8, backgroundColor: "#38a169", borderRadius: 4, minWidth: 4 }}
                title={`Approved: ${summary.approved_count}`}
              />
            )}
            {summary.paid_count > 0 && (
              <div
                style={{ flex: summary.paid_count, height: 8, backgroundColor: "#3182ce", borderRadius: 4, minWidth: 4 }}
                title={`Paid: ${summary.paid_count}`}
              />
            )}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "#718096" }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, backgroundColor: "#ecc94b", borderRadius: "50%", marginRight: 4 }} /> Pending</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, backgroundColor: "#38a169", borderRadius: "50%", marginRight: 4 }} /> Approved</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, backgroundColor: "#3182ce", borderRadius: "50%", marginRight: 4 }} /> Paid</span>
          </div>
        </div>
      )}

      <div className="outlet-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Commission Transactions</h2>
          <div className="outlet-filter-bar" style={{ margin: 0 }}>
            <Filter size={14} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 140, marginLeft: 4 }}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {commissions.length === 0 ? (
          <div className="outlet-empty">
            <div className="outlet-empty-icon"><Search size={40} /></div>
            <h3>No commissions yet</h3>
            <p>Commissions from Janu Bhai product sales will appear here</p>
          </div>
        ) : (
          <table className="outlet-table">
            <thead>
              <tr>
                <th>Order#</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total</th>
                <th>Period</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.pos_order?.order_number || "-"}</td>
                  <td>{c.pos_product?.name || "-"}</td>
                  <td>{c.quantity}</td>
                  <td>{formatCurrency(c.commission_per_unit)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(c.total_commission)}</td>
                  <td>{getPeriodLabel(c.period_month, c.period_year)}</td>
                  <td>
                    <span className={`outlet-badge ${STATUS_BADGE[c.status] || "gray"}`}>
                      {STATUS_LABEL[c.status] || c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  function formatCurrency(n) {
    return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  }

  function getPeriodLabel(month, year) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[(month || 1) - 1]} ${year || ""}`;
  }
}
