"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    store_name: '',
    support_email: '',
    free_shipping_threshold: 0,
    razorpay_mode: 'test'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data?type=settings", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setSettings(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "update_settings",
          payload: {
            store_name: settings.store_name,
            support_email: settings.support_email,
            free_shipping_threshold: parseFloat(settings.free_shipping_threshold),
            razorpay_mode: settings.razorpay_mode
          }
        })
      });

      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="admin-header">
        <h1>Global Store Settings</h1>
      </div>

      <div className="admin-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>General Information</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Store Name</label>
                <input required type="text" value={settings.store_name} onChange={e => setSettings({...settings, store_name: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Support Email</label>
                <input required type="email" value={settings.support_email} onChange={e => setSettings({...settings, support_email: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Shipping Rules</h3>
            <div style={{ flex: 1, maxWidth: '50%' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Free Shipping Threshold (₹)</label>
              <input required type="number" value={settings.free_shipping_threshold} onChange={e => setSettings({...settings, free_shipping_threshold: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Orders above this amount will automatically qualify for free shipping via Nimbuspost.</p>
            </div>
          </div>

          <div>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Payment Gateway</h3>
            <div style={{ flex: 1, maxWidth: '50%' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Razorpay Environment</label>
              <select value={settings.razorpay_mode} onChange={e => setSettings({...settings, razorpay_mode: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="test">Test Mode</option>
                <option value="live">Live Mode</option>
              </select>
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Keys are securely loaded from environment variables.</p>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="admin-btn" disabled={saving} style={{ padding: '12px 24px' }}>
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
