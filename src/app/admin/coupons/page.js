"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const defaultForm = {
  code: "", description: "", discount_type: "percentage", discount_value: "",
  min_order_amount: "", max_discount_amount: "", usage_limit: "0",
  applies_to: "all", is_active: false, start_date: "", expiry_date: ""
};

function discountPreview(form) {
  const val = parseFloat(form.discount_value) || 0;
  if (form.discount_type === "percentage") return `${val}% off`;
  if (form.discount_type === "free_shipping") return "Free Shipping";
  return `₹${val} off`;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => { fetchCoupons(); }, []);

  async function fetchCoupons() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data?type=coupons", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setCoupons(json.data || []);
      }
    } catch (e) { console.error(e); }
  }

  async function apiCall(action, payload = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload })
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Request failed");
      return false;
    }
    return true;
  }

  function openModal(coupon = null) {
    if (coupon) {
      setEditing(coupon);
      setFormData({
        code: coupon.code || "",
        description: coupon.description || "",
        discount_type: coupon.discount_type || "percentage",
        discount_value: coupon.discount_value?.toString() || "",
        min_order_amount: coupon.min_order_amount?.toString() || "",
        max_discount_amount: coupon.max_discount_amount?.toString() || "",
        usage_limit: coupon.usage_limit?.toString() || "0",
        applies_to: coupon.applies_to || "all",
        is_active: !!coupon.is_active,
        start_date: coupon.start_date ? coupon.start_date.split("T")[0] : "",
        expiry_date: coupon.expiry_date ? coupon.expiry_date.split("T")[0] : ""
      });
    } else {
      setEditing(null);
      setFormData(defaultForm);
    }
    setIsModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value) || 0,
      min_order_amount: parseFloat(formData.min_order_amount) || 0,
      max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
      usage_limit: parseInt(formData.usage_limit) || 0,
      applies_to: formData.applies_to,
      is_active: formData.is_active,
      start_date: formData.start_date || null,
      expiry_date: formData.expiry_date || null
    };
    const ok = await apiCall(
      editing ? "update_coupon" : "create_coupon",
      editing ? { id: editing.id, payload } : { payload }
    );
    if (ok) { setIsModalOpen(false); fetchCoupons(); }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this coupon? This cannot be undone.")) return;
    if (await apiCall("delete_coupon", { id })) fetchCoupons();
  }

  function getStatus(coupon) {
    if (!coupon.is_active) return { label: "Inactive", cls: "status-badge", style: { background: "#f8d7da", color: "#721c24" } };
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) return { label: "Expired", cls: "status-badge", style: { background: "#e9ecef", color: "#6c757d" } };
    return { label: "Active", cls: "status-badge", style: { background: "#d4edda", color: "#155724" } };
  }

  function typeLabel(t) {
    const m = { percentage: "%", fixed_amount: "₹", free_shipping: "🚚" };
    return m[t] || t;
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Coupons & Discounts</h1>
        <button className="admin-btn" onClick={() => openModal()}>+ Add Coupon</button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Type</th>
              <th>Min Order</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: "center", color: "var(--text-secondary)" }}>No coupons found.</td></tr>
            ) : (
              coupons.map(c => {
                const st = getStatus(c);
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, fontFamily: "monospace", fontSize: "0.85rem" }}>{c.code}</td>
                    <td>{c.discount_type === "percentage" ? `${c.discount_value}%` : c.discount_type === "free_shipping" ? "Free Shipping" : `₹${c.discount_value}`}</td>
                    <td>{typeLabel(c.discount_type)}</td>
                    <td>{c.min_order_amount ? `₹${c.min_order_amount}` : "—"}</td>
                    <td>{c.used_count || 0}{c.usage_limit > 0 ? ` / ${c.usage_limit}` : ""}</td>
                    <td><span className={st.cls} style={st.style}>{st.label}</span></td>
                    <td style={{ fontSize: "0.82rem" }}>{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : "—"}</td>
                    <td>
                      <button className="admin-btn-outline admin-btn-sm" style={{ marginRight: "0.4rem" }} onClick={() => openModal(c)}>Edit</button>
                      <button className="admin-btn-outline admin-btn-sm" style={{ borderColor: "var(--accent-red)", color: "var(--accent-red)" }} onClick={() => handleDelete(c.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editing ? "Edit Coupon" : "Add Coupon"}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Code</label>
                    <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. JBC50" />
                  </div>
                  <div className="form-group">
                    <label>Discount Type</label>
                    <select value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})}>
                      <option value="percentage">Percentage</option>
                      <option value="fixed_amount">Fixed Amount</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Discount Value</label>
                    <input required type="number" step="0.01" min="0" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} placeholder={formData.discount_type === "percentage" ? "e.g. 20" : "e.g. 100"} />
                  </div>
                  <div className="form-group">
                    <label>Min Order Amount (₹)</label>
                    <input type="number" step="0.01" min="0" value={formData.min_order_amount} onChange={e => setFormData({...formData, min_order_amount: e.target.value})} placeholder="0 = no minimum" />
                  </div>
                </div>
                {formData.discount_type === "percentage" && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Max Discount Amount (₹)</label>
                      <input type="number" step="0.01" min="0" value={formData.max_discount_amount} onChange={e => setFormData({...formData, max_discount_amount: e.target.value})} placeholder="Leave empty for no cap" />
                    </div>
                    <div className="form-group">
                      <label>Usage Limit</label>
                      <input type="number" min="0" value={formData.usage_limit} onChange={e => setFormData({...formData, usage_limit: e.target.value})} />
                      <span className="form-hint">0 = unlimited</span>
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label>Applies To</label>
                  <select value={formData.applies_to} onChange={e => setFormData({...formData, applies_to: e.target.value})}>
                    <option value="all">All Products</option>
                    <option value="specific_products">Specific Products</option>
                    <option value="specific_categories">Specific Categories</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Internal note about this coupon" />
                </div>
                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                  <label htmlFor="is_active" style={{ margin: 0 }}>Is Active</label>
                </div>
                {formData.code && formData.discount_value && (
                  <div style={{ background: "rgba(46, 125, 50, 0.08)", padding: "0.75rem", borderRadius: "6px", marginTop: "0.5rem" }}>
                    <span className="form-hint-sale">Discount Preview: </span>
                    <strong>{formData.code.toUpperCase()}</strong> &rarr; {discountPreview(formData)}
                    {formData.min_order_amount && parseFloat(formData.min_order_amount) > 0 && <span> (min. ₹{formData.min_order_amount})</span>}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn">{editing ? "Update Coupon" : "Create Coupon"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
