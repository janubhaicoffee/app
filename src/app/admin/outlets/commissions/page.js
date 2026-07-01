"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { DollarSign, CheckCircle, XCircle, Search, FileDown, Filter, Store } from "lucide-react";

const statusColors = {
  pending: { bg: "#fff3cd", color: "#856404" },
  approved: { bg: "#cce5ff", color: "#004085" },
  paid: { bg: "#d4edda", color: "#155724" },
  cancelled: { bg: "#f8d7da", color: "#721c24" }
};

export default function AdminCommissions() {
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filterOutlet, setFilterOutlet] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState("summary");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const headers = { "Authorization": `Bearer ${session.access_token}` };
      const [outletsRes] = await Promise.all([
        fetch("/api/admin/outlets", { headers })
      ]);
      if (outletsRes.ok) {
        const j = await outletsRes.json();
        setOutlets(j.data || []);
      }
      await fetchData(session);
    };
    load();
  }, []);

  async function fetchData(session) {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${session.access_token}` };
      const params = new URLSearchParams();
      if (filterOutlet) params.set("outlet_id", filterOutlet);
      if (filterStatus) params.set("status", filterStatus);

      const [commRes, summRes] = await Promise.all([
        fetch(`/api/admin/data?type=commissions&${params}`, { headers }),
        fetch(`/api/admin/data?type=commission_summary&${params}`, { headers })
      ]);

      if (commRes.ok) {
        const j = await commRes.json();
        setCommissions(j.data || []);
      }
      if (summRes.ok) {
        const j = await summRes.json();
        setSummary(j.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchData(session);
    });
  }, [filterOutlet, filterStatus]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const doAction = async (action, ids) => {
    const { data: { session } } = await supabase.auth.getSession();
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload: { ids } })
      });
      if (res.ok) {
        showToast(`${ids.length} commission(s) updated`);
        setSelected(new Set());
        fetchData(session);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === commissions.length) setSelected(new Set());
    else setSelected(new Set(commissions.map(c => c.id)));
  };

  if (loading && commissions.length === 0) {
    return <div className="admin-loading">Loading commissions...</div>;
  }

  const totalPending = commissions.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.total_commission), 0);
  const totalApproved = commissions.filter(c => c.status === "approved").reduce((s, c) => s + Number(c.total_commission), 0);
  const totalPaid = commissions.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.total_commission), 0);

  return (
    <div>
      {toast && <div style={{ padding: "10px 16px", background: toast.type === "success" ? "#d4edda" : "#f8d7da", color: toast.type === "success" ? "#155724" : "#721c24", borderRadius: "8px", marginBottom: "16px" }}>{toast.msg}</div>}

      <div className="admin-header">
        <div>
          <h1>Outlet Commissions</h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
            Track and manage per-packet commissions earned by outlets
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/admin/outlets" className="admin-btn outline">
            <Store size={16} /> Outlets
          </Link>
        </div>
      </div>

      <div className="admin-card" style={{ display: "flex", gap: "1.5rem", padding: "1.25rem", marginBottom: "1rem" }}>
        <div><span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Pending</span><div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#856404" }}>₹{totalPending.toLocaleString()}</div></div>
        <div><span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Approved</span><div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#004085" }}>₹{totalApproved.toLocaleString()}</div></div>
        <div><span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Paid</span><div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#155724" }}>₹{totalPaid.toLocaleString()}</div></div>
        <div><span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Total</span><div style={{ fontSize: "1.25rem", fontWeight: 700 }}>₹{(totalPending + totalApproved + totalPaid).toLocaleString()}</div></div>
      </div>

      <div className="admin-toolbar">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <select value={filterOutlet} onChange={e => { setFilterOutlet(e.target.value); setSelected(new Set()); }} style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
            <option value="">All Outlets</option>
            {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setSelected(new Set()); }} style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            {commissions.length} transaction(s)
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="admin-btn outline sm" onClick={() => setView(view === "summary" ? "list" : "summary")}>
            <Filter size={14} /> {view === "summary" ? "Detailed View" : "Summary View"}
          </button>
          {selected.size > 0 && (
            <>
              <button className="admin-btn sm" onClick={() => doAction("bulk_approve_commissions", Array.from(selected))} disabled={actionLoading} style={{ background: "#004085" }}>
                <CheckCircle size={14} /> Approve ({selected.size})
              </button>
              <button className="admin-btn sm" onClick={() => doAction("bulk_pay_commissions", Array.from(selected))} disabled={actionLoading} style={{ background: "#155724" }}>
                <DollarSign size={14} /> Pay ({selected.size})
              </button>
            </>
          )}
        </div>
      </div>

      {view === "summary" ? (
        <div className="admin-card" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Outlet</th>
                <th>Period</th>
                <th>Pending</th>
                <th>Approved</th>
                <th>Paid</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", color: "var(--text-secondary)" }}>No commission data</td></tr>
              ) : summary.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{s.outlet_name}</td>
                  <td>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][s.period_month - 1]} {s.period_year}</td>
                  <td style={{ color: "#856404" }}>₹{s.pending.toLocaleString()}</td>
                  <td style={{ color: "#004085" }}>₹{s.approved.toLocaleString()}</td>
                  <td style={{ color: "#155724" }}>₹{s.paid.toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>₹{s.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selected.size === commissions.length && commissions.length > 0} onChange={toggleAll} /></th>
                <th>Outlet</th>
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
                <tr><td colSpan="10" style={{ textAlign: "center", color: "var(--text-secondary)" }}>No commissions found</td></tr>
              ) : commissions.map(c => (
                <tr key={c.id}>
                  <td><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                  <td style={{ fontSize: "0.85rem" }}>{c.outlet_id?.slice(0, 8)}...</td>
                  <td style={{ fontSize: "0.85rem" }}>{c.pos_orders?.order_number || "-"}</td>
                  <td>{c.pos_products?.name || "Deleted"}</td>
                  <td>{c.quantity}</td>
                  <td>₹{Number(c.commission_per_unit).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>₹{Number(c.total_commission).toLocaleString()}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][c.period_month - 1]} {c.period_year}
                  </td>
                  <td>
                    <span style={{
                      display: "inline-block", padding: "0.15rem 0.5rem", borderRadius: "4px",
                      fontSize: "0.8rem", fontWeight: 600,
                      ...(statusColors[c.status] || { bg: "#e2e3e5", color: "#383d41" })
                    }}>{c.status}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      {c.status === "pending" && (
                        <button className="admin-btn sm" onClick={async () => {
                          const { data: { session } } = await supabase.auth.getSession();
                          await fetch("/api/admin/data", {
                            method: "POST",
                            headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "approve_commission", id: c.id })
                          });
                          fetchData(await supabase.auth.getSession().then(s => s.data.session));
                          showToast("Commission approved");
                        }} style={{ background: "#004085", color: "#fff", fontSize: "0.75rem" }}>
                          <CheckCircle size={12} /> Approve
                        </button>
                      )}
                      {c.status === "approved" && (
                        <button className="admin-btn sm" onClick={async () => {
                          const { data: { session } } = await supabase.auth.getSession();
                          await fetch("/api/admin/data", {
                            method: "POST",
                            headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "pay_commission", id: c.id })
                          });
                          fetchData(await supabase.auth.getSession().then(s => s.data.session));
                          showToast("Commission marked paid");
                        }} style={{ background: "#155724", color: "#fff", fontSize: "0.75rem" }}>
                          <DollarSign size={12} /> Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
