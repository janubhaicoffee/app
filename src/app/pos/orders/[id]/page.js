"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Printer, Download, WifiOff } from "lucide-react";
import PaymentModal from "@/components/pos/PaymentModal";
import { fetchOrderById, updateOrderStatus, processPayment } from "@/lib/offlineApi";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import toast from "react-hot-toast";
import "../../pos.css";

export default function PosOrderDetail() {
  const router = useRouter();
  const params = useParams();
  const online = useOnlineStatus();
  const [outlet, setOutlet] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("pos_outlet");
    if (!stored) { router.push("/pos"); return; }
    setOutlet(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    if (!params.id) return;

    const loadOrder = async () => {
      try {
        const result = await fetchOrderById(params.id);
        if (result.error) throw new Error(result.error);
        setOrder(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();

    const channel = supabase.channel(`pos-order-${params.id}`);
    channel
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "pos_orders",
        filter: `id=eq.${params.id}`,
      }, (payload) => {
        setOrder((prev) => prev ? { ...prev, ...payload.new } : prev);
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "pos_order_items",
        filter: `order_id=eq.${params.id}`,
      }, () => {
        fetchOrderById(params.id)
          .then((r) => setOrder(r.data))
          .catch(() => {});
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [params.id]);

  const updateItemStatus = async (itemId, newStatus) => {
    setUpdating(true);
    try {
      const result = await updateOrderStatus(params.id, { item_id: itemId, item_status: newStatus });
      if (result.offline) {
        toast("Status will sync when online", { icon: "📦", duration: 2000 });
      }
    } catch (err) {
      console.error("Update item error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleOrderStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const result = await updateOrderStatus(params.id, { status: newStatus });
      if (result.offline) {
        toast("Update will sync when online", { icon: "📦", duration: 2000 });
      }
      setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      console.error("Update order error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentComplete = async (paymentData) => {
    try {
      const result = await processPayment({
        order_id: params.id,
        outlet_id: outlet?.id,
        amount: order.total,
        ...paymentData,
      });

      if (result.offline) {
        toast.success("Payment recorded offline — will sync when connected");
        setOrder((prev) => prev ? { ...prev, payment_status: "paid", status: "completed" } : prev);
      } else {
        await handleOrderStatusUpdate("completed");
      }
      setShowPayment(false);
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  const handleRefund = async () => {
    if (!confirm("Refund this order?")) return;
    setUpdating(true);
    try {
      await updateOrderStatus(params.id, { status: "cancelled", refunded: true });
      setOrder((prev) => prev ? { ...prev, status: "cancelled", refunded: true } : prev);
    } finally {
      setUpdating(false);
    }
  };

  const statusLabel = (s) => {
    const map = { pending: "Pending", preparing: "Preparing", ready: "Ready", served: "Served", completed: "Completed", cancelled: "Cancelled", pending_sync: "Pending Sync" };
    return map[s] || s;
  };

  if (loading) {
    return (
      <div className="pos-fullscreen">
        <div className="pos-top-bar"><h1>Order Detail</h1></div>
        <div className="pos-loading">Loading order...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="pos-fullscreen">
        <div className="pos-top-bar">
          <button onClick={() => router.push("/pos/orders")}><ArrowLeft size={16} /> Back</button>
        </div>
        <div className="pos-error">{error || "Order not found"}</div>
      </div>
    );
  }

  const isPaid = order.payment_status === "paid" || order.status === "completed";
  const items = order.items || [];
  const isOffline = order.status === "pending_sync" || order._offline;

  return (
    <div className="pos-fullscreen">
      {isOffline && (
        <div style={{
          padding: "4px 8px", background: "var(--accent-gold-light)", color: "var(--accent-gold)",
          fontSize: 11, textAlign: "center",
        }}>
          <WifiOff size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
          This order is saved locally and will sync when online
        </div>
      )}
      <div className="pos-top-bar">
        <button onClick={() => router.push("/pos/orders")}><ArrowLeft size={16} /> Back</button>
        <h1>Order #{order.order_number || order.id.toString().slice(-8)}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button><Printer size={16} /> Print</button>
          <button onClick={() => router.push("/pos/orders/new")}>New Order</button>
        </div>
      </div>

      <div className="pos-order-detail" style={{ overflow: "auto", flex: 1 }}>
        <div className="pos-detail-header">
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>
              {order.customer_name || "Walk-in Customer"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
              {order.type === "dine-in" && order.table_number ? `Table ${order.table_number} · ` : ""}
              {order.type} · {order.created_at ? new Date(order.created_at).toLocaleString() : "Just now"}
            </p>
            {order.notes && (
              <p style={{ fontStyle: "italic", fontSize: 13, marginTop: 4, color: "var(--text-secondary)" }}>
                Note: {order.notes}
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent-gold)" }}>
              ₹{parseFloat(order.total || 0).toFixed(2)}
            </div>
            <span className={`pos-badge ${order.status}`} style={{ marginTop: 4, display: "inline-block" }}>
              {statusLabel(order.status)}
            </span>
          </div>
        </div>

        <div className="pos-detail-items">
          <div style={{ padding: "10px 16px", background: "var(--bg-espresso)", fontWeight: 600, fontSize: 14, borderBottom: "1px solid var(--border-color)" }}>
            Items
          </div>
          {(!items || items.length === 0) ? (
            <div className="pos-empty">No items</div>
          ) : (
            items.map((item, idx) => {
              const iStatus = item.status || "pending";
              return (
                <div key={item.id || idx} className="pos-detail-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.product_name || item.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      ₹{parseFloat(item.unit_price || item.price || 0).toFixed(2)} x {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    ₹{parseFloat((item.unit_price || item.price || 0) * item.quantity).toFixed(2)}
                  </div>
                  <select
                    className="pos-item-status-select"
                    value={iStatus}
                    onChange={(e) => updateItemStatus(item.id, e.target.value)}
                    disabled={updating || order.status === "cancelled" || order.status === "completed" || isOffline}
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="served">Served</option>
                  </select>
                </div>
              );
            })
          )}
        </div>

        <div style={{ background: "var(--bg-chocolate)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div className="pos-total-row"><span>Subtotal</span><span>₹{parseFloat(order.subtotal || 0).toFixed(2)}</span></div>
          <div className="pos-total-row"><span>Tax</span><span>₹{parseFloat(order.tax || 0).toFixed(2)}</span></div>
          <div className="pos-total-row grand-total" style={{ fontSize: 20 }}><span>Total</span><span>₹{parseFloat(order.total || 0).toFixed(2)}</span></div>
          {order.tip && parseFloat(order.tip) > 0 && (
            <div className="pos-total-row"><span>Tip</span><span>₹{parseFloat(order.tip).toFixed(2)}</span></div>
          )}
        </div>

        <div className="pos-detail-actions">
          {!isPaid && order.status !== "cancelled" && !isOffline && (
            <button className="pos-btn primary" onClick={() => setShowPayment(true)}>
              Collect Payment
            </button>
          )}
          {!isPaid && isOffline && online && (
            <button className="pos-btn primary" onClick={() => handleOrderStatusUpdate("pending")}>
              Sync & Continue
            </button>
          )}
          {isPaid && (
            <button className="pos-btn danger" onClick={handleRefund} disabled={updating}>
              Refund Order
            </button>
          )}
          {order.status === "pending" && !isOffline && (
            <button className="pos-btn secondary" onClick={() => handleOrderStatusUpdate("preparing")} disabled={updating}>
              Start Preparing
            </button>
          )}
          {order.status === "preparing" && (
            <button className="pos-btn secondary" onClick={() => handleOrderStatusUpdate("ready")} disabled={updating}>
              Mark Ready
            </button>
          )}
          {order.status === "ready" && (
            <button className="pos-btn secondary" onClick={() => handleOrderStatusUpdate("served")} disabled={updating}>
              Mark Served
            </button>
          )}
          {(order.status === "pending" || order.status === "preparing") && !isOffline && (
            <button className="pos-btn danger" onClick={() => handleOrderStatusUpdate("cancelled")} disabled={updating}>
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        total={parseFloat(order.total || 0)}
        onPaymentComplete={handlePaymentComplete}
        order={order}
      />
    </div>
  );
}
