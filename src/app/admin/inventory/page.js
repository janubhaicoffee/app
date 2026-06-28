"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";

const REASON_OPTIONS = [
  { value: "manual_adjustment", label: "Manual Adjustment" },
  { value: "restock", label: "Restock" },
  { value: "return", label: "Return" },
  { value: "damage", label: "Damage" },
];

const STATUS_OPTIONS = ["all", "in_stock", "low_stock", "out_of_stock"];

export default function AdminInventory() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ new_stock: "", reason: "manual_adjustment", note: "" });
  const [historyModal, setHistoryModal] = useState(null);
  const [historyLog, setHistoryLog] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const [prodRes, lowRes] = await Promise.all([
        fetch("/api/admin/data?type=products", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        }),
        fetch("/api/admin/data?type=low_stock", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        })
      ]);
      if (prodRes.ok) {
        const json = await prodRes.json();
        setAllProducts(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory(productId) {
    setHistoryLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`/api/admin/data?type=inventory_log&product_id=${productId}`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setHistoryLog(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  }

  const openAdjust = (product) => {
    setAdjustModal(product);
    setAdjustForm({ new_stock: String(product.stock), reason: "manual_adjustment", note: "" });
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!adjustModal) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_inventory",
          id: adjustModal.id,
          payload: {
            new_stock: parseInt(adjustForm.new_stock),
            reason: adjustForm.reason,
            note: adjustForm.note
          }
        })
      });
      if (res.ok) {
        setAdjustModal(null);
        fetchData();
        showToast("Stock updated");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to update stock", "error");
      }
    } catch (e) {
      showToast("Error updating stock", "error");
    }
  };

  const openHistory = (product) => {
    setHistoryModal(product);
    fetchHistory(product.id);
  };

  const getStockStatus = (product) => {
    if (product.stock <= 0) return "out_of_stock";
    if (product.stock < (product.low_stock_threshold || 10)) return "low_stock";
    return "in_stock";
  };

  const getStockColor = (product) => {
    const status = getStockStatus(product);
    if (status === "out_of_stock") return "#f8d7da";
    if (status === "low_stock") return "#fff3cd";
    return "#d4edda";
  };

  const getStockTextColor = (product) => {
    const status = getStockStatus(product);
    if (status === "out_of_stock") return "#721c24";
    if (status === "low_stock") return "#856404";
    return "#155724";
  };

  const filteredProducts = allProducts.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) && !p.sku?.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "all") {
      const status = getStockStatus(p);
      if (status !== statusFilter) return false;
    }
    return true;
  });

  return (
    <div className="admin-inventory-page">
      {toast && (
        <div className={`admin-toast ${toast.type === "error" ? "admin-toast-error" : ""}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <h1>Inventory Management</h1>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admin-filter-tabs">
          {STATUS_OPTIONS.map(s => (
            <button key={s} className={`filter-tab ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}>
              {s === "all" ? "All" : s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </button>
          ))}
        </div>
        <span className="product-count">{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Low Stock Threshold</th>
                <th>Status</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>Loading...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                  {search ? "No products match your search." : "No products found."}
                </td></tr>
              ) : (
                filteredProducts.map(product => {
                  const bg = getStockColor(product);
                  const color = getStockTextColor(product);
                  const status = getStockStatus(product);
                  return (
                    <tr key={product.id} style={{ background: bg }}>
                      <td><strong>{product.name}</strong></td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{product.sku || "—"}</td>
                      <td style={{ fontWeight: 700, color }}>{product.stock}</td>
                      <td>{product.low_stock_threshold || 10}</td>
                      <td>
                        <span className="status-badge" style={{ background: color, color: "#fff" }}>
                          {status === "in_stock" ? "In Stock" : status === "low_stock" ? "Low Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td>
                        <div className="cell-actions">
                          <button className="admin-btn-sm" onClick={() => openAdjust(product)}>Adjust Stock</button>
                          <button className="admin-btn-sm" onClick={() => openHistory(product)}>History</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {adjustModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Adjust Stock</h2>
              <button className="modal-close" onClick={() => setAdjustModal(null)}>&times;</button>
            </div>
            <form onSubmit={handleAdjust}>
              <div className="modal-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", padding: "1rem", background: "#f5f5f5", borderRadius: 6 }}>
                  <div>
                    <strong style={{ fontSize: "1.1rem" }}>{adjustModal.name}</strong>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 4 }}>SKU: {adjustModal.sku || "—"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Current Stock</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: getStockTextColor(adjustModal) }}>{adjustModal.stock}</div>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Stock Quantity</label>
                  <input required type="number" min="0" value={adjustForm.new_stock}
                    onChange={e => setAdjustForm({ ...adjustForm, new_stock: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Reason</label>
                  <select value={adjustForm.reason}
                    onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}>
                    {REASON_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Note</label>
                  <textarea rows="3" value={adjustForm.note}
                    onChange={e => setAdjustForm({ ...adjustForm, note: e.target.value })}
                    placeholder="Optional notes about this adjustment..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setAdjustModal(null)}>Cancel</button>
                <button type="submit" className="admin-btn">Save Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>Stock History — {historyModal.name}</h2>
              <button className="modal-close" onClick={() => setHistoryModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {historyLoading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>Loading history...</div>
              ) : historyLog.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>No history records found.</div>
              ) : (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Previous</th>
                        <th>New</th>
                        <th>Reason</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyLog.map((log, i) => (
                        <tr key={log.id || i}>
                          <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td>{log.previous_stock}</td>
                          <td style={{ fontWeight: 700 }}>{log.new_stock}</td>
                          <td>
                            <span className="status-badge" style={{ background: "#eee", color: "#333" }}>
                              {(log.reason || "manual_adjustment").replace(/_/g, " ")}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.85rem", maxWidth: 200 }}>{log.note || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="admin-btn-outline" onClick={() => setHistoryModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .admin-inventory-page { position: relative; }
        .admin-table-wrap { overflow-x: auto; }
        .product-count { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; white-space: nowrap; }
        .cell-actions { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
      `}</style>
    </div>
  );
}
