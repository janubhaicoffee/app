"use client";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PlusCircle, Clock, ArrowLeft } from "lucide-react";
import { fetchOrders } from "@/lib/offlineApi";
import "../pos.css";

function PosOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [outlet, setOutlet] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [sourceFilter, setSourceFilter] = useState(searchParams.get("source") || "all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("pos_outlet");
    if (!stored) { router.push("/pos"); return; }
    setOutlet(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    const s = searchParams.get("source");
    if (s) setSourceFilter(s);
  }, [searchParams]);

  const loadOrders = useCallback(async () => {
    if (!outlet) return;
    try {
      const params = {};
      if (sourceFilter !== "all") {
        params.source = sourceFilter;
      } else {
        params.status = activeTab === "active" ? "pending,preparing,ready" : "completed,cancelled,served";
      }
      const result = await fetchOrders(outlet.id, params);
      setOrders(result.data || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  }, [outlet, sourceFilter, activeTab]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!outlet) return;
    const channel = supabase.channel("pos-orders-realtime");
    channel
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "pos_orders",
        filter: `outlet_id=eq.${outlet.id}`,
      }, () => loadOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [outlet, loadOrders]);

  const statusLabel = (s) => {
    const map = { pending: "Pending", preparing: "Preparing", ready: "Ready", served: "Served", completed: "Completed", cancelled: "Cancelled", pending_sync: "Pending Sync" };
    return map[s] || s;
  };

  const sourceLabel = (s) => {
    if (s === 'qr_menu') return { label: 'QR Menu', cls: 'source-qr' };
    if (s === 'online') return { label: 'Online', cls: 'source-online' };
    return { label: 'POS', cls: 'source-pos' };
  };

  return (
    <div className="pos-fullscreen">
      <div className="pos-top-bar">
        <button onClick={() => router.push("/pos/dashboard")}><ArrowLeft size={16} /> Back</button>
        <h1>Orders</h1>
        <button onClick={() => router.push("/pos/orders/new")}><PlusCircle size={16} /> New</button>
      </div>

      <div className="pos-orders-container" style={{ overflow: "auto", flex: 1 }}>
        <div className="pos-tabs">
          <button className={`pos-tab ${activeTab === "active" ? "active" : ""}`} onClick={() => { setActiveTab("active"); setLoading(true); }}>
            Active
          </button>
          <button className={`pos-tab ${activeTab === "history" ? "active" : ""}`} onClick={() => { setActiveTab("history"); setLoading(true); }}>
            History
          </button>
        </div>
        <div className="pos-source-filters" style={{ display: 'flex', gap: 6, padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
          {['all', 'qr_menu', 'pos', 'online'].map(src => (
            <button key={src} className={`pos-source-btn ${sourceFilter === src ? 'active' : ''}`}
              onClick={() => { setSourceFilter(src); setLoading(true); }}>
              {src === 'all' ? 'All' : src === 'qr_menu' ? 'QR Menu' : src.charAt(0).toUpperCase() + src.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="pos-loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="pos-empty">
            <Clock size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>No {activeTab} orders</p>
            {activeTab === "active" && (
              <button className="pos-btn primary" style={{ marginTop: 12 }} onClick={() => router.push("/pos/orders/new")}>
                Create New Order
              </button>
            )}
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="pos-order-card"
              onClick={() => router.push(`/pos/orders/${order.id}`)}
            >
              <div className="pos-order-number">#{order.order_number || order.id.toString().slice(-8)}</div>
              <div className="pos-order-info">
                <div className="pos-order-customer">{order.customer_name || "Walk-in"}</div>
                <div className="pos-order-meta">
                  {order.source && <span className={`pos-source-badge ${sourceLabel(order.source).cls}`}>{sourceLabel(order.source).label}</span>}
                  {order.table_number && `Table ${order.table_number} · `}
                  {order.type || "dine-in"} · {order.created_at ? new Date(order.created_at).toLocaleTimeString() : ""}
                </div>
              </div>
              <div>
                <span className={`pos-badge ${order.status}`}>{statusLabel(order.status)}</span>
              </div>
              <div className="pos-order-total">₹{parseFloat(order.total || 0).toFixed(2)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function PosOrders() {
  return <Suspense><PosOrdersContent /></Suspense>;
}
