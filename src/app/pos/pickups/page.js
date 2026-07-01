"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Search, RefreshCw, Clock, CheckCircle, XCircle, Package } from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#856404", bg: "#fff3cd", next: "confirmed", nextLabel: "Confirm" },
  confirmed: { label: "Confirmed", color: "#004085", bg: "#cce5ff", next: "preparing", nextLabel: "Start Preparing" },
  preparing: { label: "Preparing", color: "#e65100", bg: "#ffe0b2", next: "ready", nextLabel: "Mark Ready" },
  ready: { label: "Ready for Pickup", color: "#155724", bg: "#d4edda", next: "picked_up", nextLabel: "Mark Collected" },
  picked_up: { label: "Collected", color: "#383d41", bg: "#e2e3e5", next: null, nextLabel: null },
  cancelled: { label: "Cancelled", color: "#721c24", bg: "#f8d7da", next: null, nextLabel: null },
};

export default function PickupPage() {
  const [loading, setLoading] = useState(true);
  const [pickups, setPickups] = useState([]);
  const [outletId, setOutletId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPickups = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: staff } = await supabase.from("outlet_staff").select("outlet_id").eq("user_id", session.user.id).maybeSingle();
      const oid = staff?.outlet_id;
      setOutletId(oid);

      if (!oid) { setLoading(false); return; }

      const params = new URLSearchParams({ outletId: oid });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateFilter) params.set("date", dateFilter);

      const res = await fetch(`/api/pos/pickups?${params}`);
      if (res.ok) {
        const { data } = await res.json();
        setPickups(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => { fetchPickups(); }, [fetchPickups]);

  useEffect(() => {
    const channel = supabase.channel("pickups-realtime");
    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "pickup_requests" }, () => fetchPickups())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchPickups]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch("/api/pos/pickups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        showToast(`Pickup ${STATUS_CONFIG[newStatus]?.label}`);
        fetchPickups();
      }
    } catch (err) {
      showToast("Failed to update", "error");
    }
  };

  const pendingCount = pickups.filter(p => !["picked_up", "cancelled"].includes(p.status)).length;
  const activeCount = pickups.filter(p => ["confirmed", "preparing"].includes(p.status)).length;

  return (
    <div className="pos-page">
      {toast && <div style={{ padding: "10px 16px", background: toast.type === "success" ? "#d4edda" : "#f8d7da", color: toast.type === "success" ? "#155724" : "#721c24", borderRadius: "8px", marginBottom: "12px" }}>{toast.msg}</div>}

      <div className="pos-header">
        <div>
          <h1>Pickup Orders</h1>
          <p className="pos-header-subtitle">Online orders for outlet pickup</p>
        </div>
        <button className="pos-btn-outline" onClick={fetchPickups}><RefreshCw size={16} /></button>
      </div>

      <div className="pos-stats-grid">
        <div className="pos-stat-card">
          <div className="pos-stat-value" style={{ color: "#e65100" }}>{pendingCount}</div>
          <div className="pos-stat-label">Pending / Active</div>
        </div>
        <div className="pos-stat-card">
          <div className="pos-stat-value" style={{ color: "#004085" }}>{activeCount}</div>
          <div className="pos-stat-label">In Progress</div>
        </div>
        <div className="pos-stat-card">
          <div className="pos-stat-value" style={{ color: "#155724" }}>{pickups.filter(p => p.status === "ready").length}</div>
          <div className="pos-stat-label">Ready</div>
        </div>
      </div>

      <div className="pos-filter-bar">
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="pos-filter-select">
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="pos-filter-select" />
        </div>
        <span style={{ fontSize: "0.85rem", color: "#718096" }}>{pickups.length} pickup(s)</span>
      </div>

      {loading ? (
        <div className="pos-loading"><p>Loading pickups...</p></div>
      ) : pickups.length === 0 ? (
        <div className="pos-empty">
          <Package size={48} />
          <h3>No Pickup Orders</h3>
          <p>Online orders set for outlet pickup will appear here.</p>
        </div>
      ) : (
        <div className="pos-orders-grid" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {pickups.map(pu => {
            const cfg = STATUS_CONFIG[pu.status] || STATUS_CONFIG.pending;
            const order = pu.orders || {};
            return (
              <div key={pu.id} className="pos-order-card pickup-card" style={{
                borderLeft: `4px solid ${cfg.color}`,
                padding: "1rem",
                background: "#fff",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <ShoppingBag size={16} style={{ color: "#718096" }} />
                      <strong>{pu.order_number}</strong>
                      <span style={{ fontSize: "0.75rem", color: "#a0aec0" }}>
                        {new Date(pu.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#4a5568" }}>
                      {pu.customer_name || order.customer_name || "Guest"}
                      {pu.customer_phone && <span style={{ marginLeft: "0.5rem", color: "#718096" }}>{pu.customer_phone}</span>}
                    </div>
                  </div>
                  <span style={{
                    padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem",
                    fontWeight: 600, background: cfg.bg, color: cfg.color, whiteSpace: "nowrap"
                  }}>
                    {cfg.label}
                  </span>
                </div>

                {order.total_amount && (
                  <div style={{ fontSize: "0.85rem", color: "#718096", marginBottom: "0.5rem" }}>
                    Order Total: <strong>₹{Number(order.total_amount).toLocaleString("en-IN")}</strong>
                  </div>
                )}

                {pu.items_summary?.length > 0 && (
                  <div style={{ fontSize: "0.8rem", color: "#718096", marginBottom: "0.75rem" }}>
                    {Array.isArray(pu.items_summary) ? pu.items_summary.map((item, i) => (
                      <span key={i}>{item.name || item} x{item.quantity || 1}{i < pu.items_summary.length - 1 ? ", " : ""}</span>
                    )) : <span>{typeof pu.items_summary === "string" ? pu.items_summary : JSON.stringify(pu.items_summary)}</span>}
                  </div>
                )}

                {cfg.next && (
                  <button
                    className="pos-btn"
                    onClick={() => handleUpdateStatus(pu.id, cfg.next)}
                    style={{
                      background: cfg.color,
                      color: "#fff",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    {cfg.nextLabel}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .pos-btn { background: var(--primary-color); color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
        .pos-btn-outline { background: transparent; border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
        .pos-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .pos-header h1 { margin: 0; font-size: 1.5rem; }
        .pos-header-subtitle { margin: 0.25rem 0 0; color: #718096; font-size: 0.9rem; }
        .pos-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .pos-stat-card { background: #fff; padding: 1.25rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .pos-stat-value { font-size: 1.75rem; font-weight: 700; }
        .pos-stat-label { font-size: 0.85rem; color: #718096; margin-top: 0.25rem; }
        .pos-filter-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
        .pos-filter-select { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.85rem; background: #fff; }
        .pos-loading { display: flex; justify-content: center; align-items: center; min-height: 200px; color: #718096; }
        .pos-empty { text-align: center; padding: 3rem 1rem; color: #718096; }
        .pos-empty h3 { margin: 1rem 0 0.5rem; }
        .pos-empty p { margin: 0; font-size: 0.9rem; }
        .pickup-card { transition: all 0.15s; }
        .pickup-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
      `}</style>
    </div>
  );
}
