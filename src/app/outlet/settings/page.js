"use client";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Settings, Save, Store, Clock, DollarSign, Bell, Building
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [outletId, setOutletId] = useState(null);

  const [form, setForm] = useState({
    name: "", address: "", phone: "", email: "", gstin: "",
    opening_time: "08:00", closing_time: "22:00",
    rent_amount: "", electricity_amount: "",
    cogs_percentage: "35",
    notifications: { low_stock: true, daily_report: true, new_orders: true },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: staff } = await supabase
          .from("outlet_staff")
          .select("outlet_id, outlet:outlets(*)")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (staff) {
          setOutletId(staff.outlet_id);
          const o = staff.outlet || {};
          setForm(prev => ({
            ...prev,
            name: o.name || "",
            address: o.address || "",
            phone: o.phone || "",
            email: o.email || "",
            gstin: o.gstin || "",
            opening_time: o.opening_time || "08:00",
            closing_time: o.closing_time || "22:00",
            rent_amount: o.rent_amount?.toString() || "",
            electricity_amount: o.electricity_amount?.toString() || "",
            cogs_percentage: o.cogs_percentage?.toString() || "35",
          }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const updates = {
        name: form.name,
        address: form.address,
        phone: form.phone,
        email: form.email,
        gstin: form.gstin,
        opening_time: form.opening_time,
        closing_time: form.closing_time,
        rent_amount: form.rent_amount ? parseFloat(form.rent_amount) : null,
        electricity_amount: form.electricity_amount ? parseFloat(form.electricity_amount) : null,
        cogs_percentage: form.cogs_percentage ? parseFloat(form.cogs_percentage) : null,
      };

      const { error: updateError } = await supabase
        .from("outlets")
        .update(updates)
        .eq("id", outletId);

      if (updateError) throw updateError;
      setSuccess("Settings saved");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="outlet-loading"><div className="outlet-loading-spinner" /><p>Loading settings...</p></div>;

  return (
    <div>
      <div className="outlet-page-header">
        <div>
          <h1>Outlet Settings</h1>
          <p className="outlet-page-subtitle">Manage your outlet configuration</p>
        </div>
      </div>

      {success && <div className="outlet-success-banner">{success}</div>}
      {error && <div className="outlet-error-banner">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="outlet-card" style={{ marginBottom: 20 }}>
          <h2><Store size={16} /> Outlet Information</h2>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Outlet Name</label>
              <input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>GSTIN</label>
              <input className="form-control" value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea className="form-control" rows={2} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          </div>
        </div>

        <div className="outlet-grid-2">
          <div className="outlet-card">
            <h2><Clock size={16} /> Operating Hours</h2>
            <div className="outlet-form-row">
              <div className="form-group">
                <label>Opening Time</label>
                <input type="time" className="form-control" value={form.opening_time} onChange={e => setForm(p => ({ ...p, opening_time: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Closing Time</label>
                <input type="time" className="form-control" value={form.closing_time} onChange={e => setForm(p => ({ ...p, closing_time: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="outlet-card">
            <h2><DollarSign size={16} /> Financial Settings</h2>
            <div className="outlet-form-row">
              <div className="form-group">
                <label>Rent Amount (₹/month)</label>
                <input type="number" step="0.01" className="form-control" value={form.rent_amount} onChange={e => setForm(p => ({ ...p, rent_amount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Electricity (₹/month)</label>
                <input type="number" step="0.01" className="form-control" value={form.electricity_amount} onChange={e => setForm(p => ({ ...p, electricity_amount: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>COGS Percentage (%)</label>
              <input type="number" step="0.1" className="form-control" value={form.cogs_percentage} onChange={e => setForm(p => ({ ...p, cogs_percentage: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="outlet-card" style={{ marginBottom: 20 }}>
          <h2><Bell size={16} /> Notification Preferences</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { key: "low_stock", label: "Low Stock Alerts" },
              { key: "daily_report", label: "Daily Report" },
              { key: "new_orders", label: "New Orders" },
            ].map(n => (
              <label key={n.key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={form.notifications[n.key]} onChange={e => setForm(p => ({ ...p, notifications: { ...p.notifications, [n.key]: e.target.checked } }))} />
                <span style={{ fontSize: 14 }}>{n.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="outlet-btn primary" disabled={saving} style={{ maxWidth: 200 }}>
          <Save size={16} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
