'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Save, Clock, Bell, Printer } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [outletId, setOutletId] = useState(null);

  const [form, setForm] = useState({
    opening_time: '08:00',
    closing_time: '22:00',
    terminal_name: 'Main Register 1',
    auto_print_receipt: true,
    receipt_header: 'Welcome to Janu Bhai Cafe!',
    receipt_footer: 'Thank you! Visit again.',
    enable_tips: false,
    kitchen_printer_enabled: true,
    default_payment_method: 'CASH',
    notifications: { low_stock: true, daily_report: true, new_orders: true },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        let oid = sessionStorage.getItem('selected_outlet_id');
        let finalOid = oid;

        // If no outlet selected, try to find from staff record
        if (!finalOid) {
          const { data: staff } = await supabase
            .from('outlet_staff')
            .select('outlet_id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (staff) {
            finalOid = staff.outlet_id;
          }
        }

        if (finalOid) {
          setOutletId(finalOid);
          const res = await fetch(`/api/outlet/settings?outletId=${finalOid}`);
          if (res.ok) {
            const body = await res.json();
            if (body.data) {
              setForm({
                opening_time: body.data.operating_hours.opening_time || '08:00',
                closing_time: body.data.operating_hours.closing_time || '22:00',
                terminal_name: body.data.pos_config?.terminal_name || 'Main Register 1',
                auto_print_receipt: body.data.pos_config?.auto_print_receipt ?? true,
                receipt_header: body.data.pos_config?.receipt_header || 'Welcome to Janu Bhai Cafe!',
                receipt_footer: body.data.pos_config?.receipt_footer || 'Thank you! Visit again.',
                enable_tips: body.data.pos_config?.enable_tips ?? false,
                kitchen_printer_enabled: body.data.pos_config?.kitchen_printer_enabled ?? true,
                default_payment_method: body.data.pos_config?.default_payment_method || 'CASH',
                notifications: body.data.notifications || { low_stock: true, daily_report: true, new_orders: true },
              });
            }
          }
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
    if (!outletId) return;

    setSaving(true);
    setError(null);
    try {
      const payload = {
        outletId,
        operating_hours: {
          opening_time: form.opening_time,
          closing_time: form.closing_time,
        },
        pos_config: {
          terminal_name: form.terminal_name,
          auto_print_receipt: form.auto_print_receipt,
          receipt_header: form.receipt_header,
          receipt_footer: form.receipt_footer,
          enable_tips: form.enable_tips,
          kitchen_printer_enabled: form.kitchen_printer_enabled,
          default_payment_method: form.default_payment_method,
        },
        notifications: form.notifications,
      };

      const res = await fetch('/api/outlet/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="outlet-loading">
        <div className="outlet-loading-spinner" />
        <p>Loading settings...</p>
      </div>
    );

  return (
    <div>
      <div className="outlet-page-header">
        <div>
          <h1>Outlet Settings</h1>
          <p className="outlet-page-subtitle">Manage your local POS and operation preferences</p>
        </div>
      </div>

      {success && <div className="outlet-success-banner">{success}</div>}
      {error && <div className="outlet-error-banner">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="outlet-card" style={{ marginBottom: 20 }}>
          <h2>
            <Printer size={16} /> POS & Receipt Configuration
          </h2>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>POS Terminal Name</label>
              <input
                className="form-control"
                value={form.terminal_name}
                onChange={(e) => setForm((p) => ({ ...p, terminal_name: e.target.value }))}
                placeholder="e.g. Main Register 1"
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={form.auto_print_receipt}
                  onChange={(e) => setForm((p) => ({ ...p, auto_print_receipt: e.target.checked }))}
                />
                <span style={{ fontSize: 14 }}>Print Receipt Automatically</span>
              </label>
            </div>
          </div>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Default Payment Method</label>
              <select
                className="form-control"
                value={form.default_payment_method}
                onChange={(e) => setForm((p) => ({ ...p, default_payment_method: e.target.value }))}
              >
                <option value="CASH">CASH</option>
                <option value="CARD">CARD</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={form.enable_tips}
                  onChange={(e) => setForm((p) => ({ ...p, enable_tips: e.target.checked }))}
                />
                <span style={{ fontSize: 14 }}>Enable Tipping on Checkout</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={form.kitchen_printer_enabled}
                  onChange={(e) => setForm((p) => ({ ...p, kitchen_printer_enabled: e.target.checked }))}
                />
                <span style={{ fontSize: 14 }}>Send Orders to Kitchen Printer</span>
              </label>
            </div>
          </div>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Receipt Header Message</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.receipt_header}
                onChange={(e) => setForm((p) => ({ ...p, receipt_header: e.target.value }))}
                placeholder="e.g. Welcome to Janu Bhai Cafe!"
              />
            </div>
            <div className="form-group">
              <label>Receipt Footer Message</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.receipt_footer}
                onChange={(e) => setForm((p) => ({ ...p, receipt_footer: e.target.value }))}
                placeholder="e.g. Thank you! Visit again."
              />
            </div>
          </div>
        </div>

        <div className="outlet-grid-2">
          <div className="outlet-card">
            <h2>
              <Clock size={16} /> Operating Hours
            </h2>
            <div className="outlet-form-row">
              <div className="form-group">
                <label>Opening Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={form.opening_time}
                  onChange={(e) => setForm((p) => ({ ...p, opening_time: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Closing Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={form.closing_time}
                  onChange={(e) => setForm((p) => ({ ...p, closing_time: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="outlet-card" style={{ marginBottom: 20 }}>
            <h2>
              <Bell size={16} /> Notification Preferences
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'low_stock', label: 'Low Stock Alerts' },
                { key: 'daily_report', label: 'Daily Report' },
                { key: 'new_orders', label: 'New Orders' },
              ].map((n) => (
                <label
                  key={n.key}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={form.notifications[n.key]}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        notifications: { ...p.notifications, [n.key]: e.target.checked },
                      }))
                    }
                  />
                  <span style={{ fontSize: 14 }}>{n.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="outlet-btn primary"
          disabled={saving}
          style={{ maxWidth: 200, marginTop: '1rem' }}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
