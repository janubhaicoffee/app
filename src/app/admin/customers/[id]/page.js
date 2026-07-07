"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tagsInput, setTagsInput] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }

        const res = await fetch(`/api/admin/data?type=customer_detail&id=${params.id}`, {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });

        const json = await res.json();
        if (res.ok) {
          setCustomer(json.data);
          setNotes(json.data.notes || "");
          setTagsInput((json.data.tags || []).join(", "));
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError("Failed to load customer");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [params.id]);

  const orders = customer?.orders || [];
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const lastOrderDate = totalOrders > 0 ? orders[0].created_at : null;

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);

      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: "update_customer",
          id: params.id,
          payload: { tags, notes }
        })
      });

      const json = await res.json();
      if (res.ok) {
        setSaveMsg("Saved successfully");
        setCustomer(prev => ({ ...prev, tags, notes }));
      } else {
        setSaveMsg("Error: " + json.error);
      }
    } catch (err) {
      setSaveMsg("Error saving");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  if (loading) return <div className="admin-loading">Loading customer...</div>;
  if (error) return <div className="admin-loading" style={{ color: "#c62828" }}>Error: {error}</div>;
  if (!customer) return <div className="admin-loading">Customer not found</div>;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>{customer.name}</h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
            Customer since {new Date(customer.created_at).toLocaleDateString()}
          </p>
        </div>
        <button className="admin-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {saveMsg && (
        <div style={{
          padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "4px",
          background: saveMsg.startsWith("Error") ? "rgba(198,40,40,0.2)" : "rgba(46,125,50,0.2)",
          color: saveMsg.startsWith("Error") ? "#ef5350" : "#4caf50"
        }}>
          {saveMsg}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card green">
          <h3>Total Orders</h3>
          <p className="stat-value">{totalOrders}</p>
        </div>
        <div className="stat-card gold">
          <h3>Total Spent</h3>
          <p className="stat-value">₹{totalSpent.toLocaleString()}</p>
        </div>
        <div className="stat-card blue">
          <h3>Last Order</h3>
          <p className="stat-value">{lastOrderDate ? new Date(lastOrderDate).toLocaleDateString() : "N/A"}</p>
        </div>
        <div className="stat-card">
          <h3>Email</h3>
          <p className="stat-value" style={{ fontSize: "1.1rem" }}>{customer.email}</p>
        </div>
        <div className="stat-card">
          <h3>Phone</h3>
          <p className="stat-value" style={{ fontSize: "1.1rem" }}>{customer.phone || "-"}</p>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ marginTop: 0 }}>Tags</h3>
        <input
          type="text"
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="Enter tags separated by commas"
          style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "4px", marginBottom: "0.5rem", background: "var(--bg-espresso)", color: "var(--text-warm-white)" }}
        />
        {customer.tags?.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {customer.tags.map((tag, i) => (
              <span key={i} style={{
                background: "var(--accent-gold)", color: "#1a1a1a",
                padding: "0.25rem 0.75rem", borderRadius: "12px", fontSize: "0.85rem", fontWeight: 600
              }}>{tag}</span>
            ))}
          </div>
        )}
        {(!customer.tags || customer.tags.length === 0) && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>No tags added yet.</p>
        )}
      </div>

      <div className="admin-card">
        <h3 style={{ marginTop: 0 }}>Notes</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add internal notes about this customer..."
          rows={4}
          style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "4px", resize: "vertical", fontFamily: "inherit", background: "var(--bg-espresso)", color: "var(--text-warm-white)" }}
        />
      </div>

      <div className="admin-card">
        <h3 style={{ marginTop: 0 }}>Order History ({totalOrders})</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {totalOrders === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary)" }}>No orders yet.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/admin/orders/${order.id}`)}>
                  <td style={{ fontWeight: 600 }}>#{order.id.slice(0, 8)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{(order.order_items || []).length} items</td>
                  <td>₹{order.total_amount?.toLocaleString()}</td>
                  <td>
                    <span style={{
                      textTransform: "capitalize", padding: "0.15rem 0.5rem", borderRadius: "4px",
                      fontSize: "0.85rem", fontWeight: 600,
                      background: order.status === "delivered" ? "rgba(46,125,50,0.2)" : order.status === "cancelled" ? "rgba(198,40,40,0.2)" : order.status === "paid" ? "rgba(255,179,0,0.15)" : "rgba(106,27,154,0.15)",
                      color: order.status === "delivered" ? "#4caf50" : order.status === "cancelled" ? "#ef5350" : order.status === "paid" ? "var(--accent-gold)" : "#ce93d8"
                    }}>{order.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
