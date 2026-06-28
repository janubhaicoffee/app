"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar", "Chandigarh", "Dadra & Nagar Haveli",
  "Daman & Diu", "Delhi", "Jammu & Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry"
];

const STATUS_STYLES = {
  active: { bg: "#d4edda", color: "#155724" },
  inactive: { bg: "#f8d7da", color: "#721c24" },
};

export default function AdminShipping() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [showStates, setShowStates] = useState(false);
  const [formData, setFormData] = useState({
    name: "", description: "", pincodes: "", states: "",
    base_rate: "", rate_per_kg: "", free_shipping_threshold: "",
    estimated_days: "", is_active: true
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchZones(); }, []);

  async function fetchZones() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data?type=shipping_zones", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setZones(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const openModal = (zone = null) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name || "",
        description: zone.description || "",
        pincodes: (zone.pincodes || []).join(", "),
        states: (zone.states || []).join(", "),
        base_rate: zone.base_rate || "",
        rate_per_kg: zone.rate_per_kg || "",
        free_shipping_threshold: zone.free_shipping_threshold || "",
        estimated_days: zone.estimated_days || "",
        is_active: zone.is_active !== false
      });
    } else {
      setEditingZone(null);
      setFormData({
        name: "", description: "", pincodes: "", states: "",
        base_rate: "", rate_per_kg: "", free_shipping_threshold: "",
        estimated_days: "", is_active: true
      });
    }
    setShowStates(false);
    setIsModalOpen(true);
  };

  const handleStatesToggle = (state) => {
    const current = formData.states ? formData.states.split(", ").filter(s => s) : [];
    const idx = current.indexOf(state);
    if (idx > -1) current.splice(idx, 1);
    else current.push(state);
    setFormData({ ...formData, states: current.join(", ") });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      pincodes: formData.pincodes.split(",").map(s => s.trim()).filter(Boolean),
      states: formData.states.split(",").map(s => s.trim()).filter(Boolean),
      base_rate: parseFloat(formData.base_rate) || 0,
      rate_per_kg: parseFloat(formData.rate_per_kg) || 0,
      free_shipping_threshold: formData.free_shipping_threshold ? parseFloat(formData.free_shipping_threshold) : null,
      estimated_days: formData.estimated_days,
      is_active: formData.is_active
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingZone ? "update_shipping_zone" : "create_shipping_zone",
          id: editingZone?.id,
          payload
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchZones();
        showToast(editingZone ? "Zone updated" : "Zone created");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save zone", "error");
      }
    } catch (e) {
      showToast("Error saving zone", "error");
    }
  };

  const handleDelete = async (zone) => {
    if (!confirmDelete || confirmDelete.id !== zone.id) {
      setConfirmDelete(zone);
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_shipping_zone", id: zone.id })
      });
      if (res.ok) {
        fetchZones();
        showToast("Zone deleted");
      }
    } catch (e) {
      showToast("Error deleting zone", "error");
    }
    setConfirmDelete(null);
  };

  const toggleActive = async (zone) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_shipping_zone",
          id: zone.id,
          payload: { is_active: !zone.is_active }
        })
      });
      if (res.ok) {
        fetchZones();
        showToast(`Zone ${zone.is_active ? "deactivated" : "activated"}`);
      }
    } catch (e) {
      showToast("Error toggling zone", "error");
    }
  };

  return (
    <div className="admin-shipping-page">
      {toast && (
        <div className={`admin-toast ${toast.type === "error" ? "admin-toast-error" : ""}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <h1>Shipping Zones</h1>
        <button className="admin-btn" onClick={() => openModal()}>+ Add Zone</button>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Pincodes / States</th>
                <th>Base Rate</th>
                <th>Rate/kg</th>
                <th>Free Threshold</th>
                <th>Est. Days</th>
                <th>Status</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>Loading...</td></tr>
              ) : zones.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>No shipping zones yet.</td></tr>
              ) : (
                zones.map(zone => {
                  const st = zone.is_active ? STATUS_STYLES.active : STATUS_STYLES.inactive;
                  return (
                    <tr key={zone.id}>
                      <td><strong>{zone.name}</strong></td>
                      <td style={{ fontSize: "0.8rem", maxWidth: 200 }}>
                        <div>{zone.pincodes?.length || 0} pincodes</div>
                        <div style={{ color: "var(--text-secondary)" }}>{(zone.states || []).join(", ")}</div>
                      </td>
                      <td>₹{zone.base_rate}</td>
                      <td>₹{zone.rate_per_kg}</td>
                      <td>{zone.free_shipping_threshold ? `₹${zone.free_shipping_threshold}` : "—"}</td>
                      <td>{zone.estimated_days || "—"}</td>
                      <td>
                        <span className="status-badge" style={{ background: st.bg, color: st.color }}>
                          {zone.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="cell-actions">
                          <button className="admin-btn-sm" onClick={() => openModal(zone)}>Edit</button>
                          <button className="admin-btn-sm" onClick={() => toggleActive(zone)}>
                            {zone.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button className={`admin-btn-sm ${confirmDelete?.id === zone.id ? "btn-confirming" : ""}`}
                            onClick={() => handleDelete(zone)}>
                            {confirmDelete?.id === zone.id ? "Sure?" : "Delete"}
                          </button>
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>{editingZone ? "Edit Shipping Zone" : "Add Shipping Zone"}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Name</label>
                    <input required type="text" value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Est. Days</label>
                    <input type="text" value={formData.estimated_days}
                      onChange={e => setFormData({ ...formData, estimated_days: e.target.value })}
                      placeholder="e.g. 3-5" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="2" value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Base Rate (₹)</label>
                    <input required type="number" step="0.01" min="0" value={formData.base_rate}
                      onChange={e => setFormData({ ...formData, base_rate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Rate Per Kg (₹)</label>
                    <input required type="number" step="0.01" min="0" value={formData.rate_per_kg}
                      onChange={e => setFormData({ ...formData, rate_per_kg: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Free Threshold (₹)</label>
                    <input type="number" step="0.01" min="0" value={formData.free_shipping_threshold}
                      onChange={e => setFormData({ ...formData, free_shipping_threshold: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Pincodes (comma-separated)</label>
                  <input type="text" value={formData.pincodes}
                    onChange={e => setFormData({ ...formData, pincodes: e.target.value })}
                    placeholder="e.g. 560001, 560002, 560003" />
                  <span className="form-hint">Leave empty if zone covers entire states.</span>
                </div>

                <div className="form-group">
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <span>States (comma-separated)</span>
                    <button type="button" className="admin-btn-sm" onClick={e => { e.preventDefault(); setShowStates(!showStates); }}>
                      {showStates ? "Hide Picker" : "Pick States"}
                    </button>
                  </label>
                  <input type="text" value={formData.states}
                    onChange={e => setFormData({ ...formData, states: e.target.value })}
                    placeholder="e.g. Karnataka, Tamil Nadu, Kerala"
                    style={{ marginBottom: showStates ? "0.5rem" : 0 }} />
                  {showStates && (
                    <div className="states-picker">
                      {INDIAN_STATES.map(state => {
                        const selected = formData.states.split(", ").includes(state);
                        return (
                          <label key={state} className={`state-chip ${selected ? "selected" : ""}`}
                            onClick={() => handleStatesToggle(state)}>
                            <input type="checkbox" checked={selected} readOnly style={{ display: "none" }} />
                            {state}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                    Is Active
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn">Save Zone</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .admin-shipping-page { position: relative; }
        .admin-table-wrap { overflow-x: auto; }
        .cell-actions { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
        .admin-btn-sm.btn-confirming { background: #c62828 !important; color: #fff !important; border-color: #c62828 !important; }
        .states-picker { display: flex; flex-wrap: wrap; gap: 4px; max-height: 200px; overflow-y: auto; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; background: #fafafa; }
        .state-chip { padding: 0.3rem 0.6rem; font-size: 0.78rem; border: 1px solid var(--border-color); border-radius: 4px; cursor: pointer; background: #fff; transition: all 0.15s; user-select: none; }
        .state-chip.selected { background: var(--primary-color); color: #fff; border-color: var(--primary-color); }
        .state-chip:hover { border-color: var(--primary-color); }
      `}</style>
    </div>
  );
}
