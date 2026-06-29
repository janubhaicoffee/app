"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    store_name: '',
    support_email: '',
    free_shipping_threshold: 0,
    razorpay_mode: 'test',
    flat_shipping_rate: 50,
    support_phone: '',
    store_address: '',
    gstin: '',
    admin_notification_emails: '',
    maintenance_mode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchSettings();
  }, []);

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
            razorpay_mode: settings.razorpay_mode,
            flat_shipping_rate: parseFloat(settings.flat_shipping_rate),
            support_phone: settings.support_phone,
            store_address: settings.store_address,
            gstin: settings.gstin,
            admin_notification_emails: settings.admin_notification_emails,
            maintenance_mode: settings.maintenance_mode
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
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Support Phone</label>
                <input type="text" value={settings.support_phone} onChange={e => setSettings({...settings, support_phone: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="+91 9999999999" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 2 }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Store Address</label>
                <input type="text" value={settings.store_address} onChange={e => setSettings({...settings, store_address: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="123 Coffee Street, Mumbai, MH" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>GSTIN</label>
                <input type="text" value={settings.gstin} onChange={e => setSettings({...settings, gstin: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="27XXXXX0000X1Z5" />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Shipping Rules</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Free Shipping Threshold (₹)</label>
                <input required type="number" value={settings.free_shipping_threshold} onChange={e => setSettings({...settings, free_shipping_threshold: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Orders above this qualify for free shipping.</p>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Flat Shipping Rate (₹)</label>
                <input required type="number" value={settings.flat_shipping_rate} onChange={e => setSettings({...settings, flat_shipping_rate: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Delivery fee for orders below the threshold.</p>
              </div>
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

          <div>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Notifications</h3>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Admin Notification Emails (comma separated)</label>
              <input type="text" value={settings.admin_notification_emails} onChange={e => setSettings({...settings, admin_notification_emails: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="founder@janubhai.com, orders@janubhai.com" />
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>These emails will receive alerts for new orders.</p>
            </div>
          </div>

          <div>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Store Operations</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="maintenance_mode" checked={settings.maintenance_mode} onChange={e => setSettings({...settings, maintenance_mode: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }} />
              <label htmlFor="maintenance_mode" style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Enable Maintenance Mode</label>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px', marginLeft: '30px' }}>When enabled, the storefront checkout will be temporarily disabled.</p>
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
