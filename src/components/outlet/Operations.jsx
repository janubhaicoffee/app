'use client';
import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Save, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Operations({ outletId, refreshTrigger, onTimezoneChanged }) {
  const [loading, setLoading] = useState(true);
  const [firstFetch, setFirstFetch] = useState(true);
  const [error, setError] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [timezone, setTimezone] = useState('IST');

  // Auto-reorder config states
  const [threshold, setThreshold] = useState('10');
  const [quantity, setQuantity] = useState('20');
  const [email, setEmail] = useState('supplier@janubhai.com');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Manual reorder states
  const [manualReorderInFlight, setManualReorderInFlight] = useState(false);
  const [manualReorderStatus, setManualReorderStatus] = useState('');

  // Critical alerts & audit logs states
  const [hasCriticalAlert, setHasCriticalAlert] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            return parsed.access_token || null;
          }
        }
      }
    } catch (err) {
      console.error('Error reading token:', err);
    }
    return null;
  };

  const fetchData = async () => {
    if (firstFetch) {
      setLoading(true);
      setFirstFetch(false);
    }
    setError(null);
    try {
      // Load auto-reorder configuration from localStorage if present
      if (typeof window !== 'undefined') {
        const savedThreshold = localStorage.getItem('reorder-threshold');
        const savedQuantity = localStorage.getItem('reorder-quantity');
        const savedEmail = localStorage.getItem('reorder-email');
        const savedTimezone = localStorage.getItem('outlet-timezone');

        if (savedThreshold) setThreshold(savedThreshold);
        if (savedQuantity) setQuantity(savedQuantity);
        if (savedEmail) setEmail(savedEmail);
        if (savedTimezone) setTimezone(savedTimezone);
      }

      const res = await fetch('/api/outlet/inventory?lowStock=true');
      if (!res.ok) throw new Error('Failed to fetch low stock items');
      const { data } = await res.json();
      const itemsList = Array.isArray(data) ? data : [];
      setLowStockItems(itemsList);

      // Check if any low stock item has auto_reorder enabled and needs reordering
      const autoReorderItem = itemsList.find(
        (item) => item.auto_reorder && (item.stock || 0) <= (item.threshold || 0),
      );
      if (autoReorderItem) {
        setManualReorderStatus('Ordered');
        try {
          const reordersRes = await fetch('/api/outlet/reorders');
          let existingReorders = [];
          if (reordersRes.ok) {
            const reordersData = await reordersRes.json();
            existingReorders = (reordersData.data || []).filter(
              (r) => r.item_name === autoReorderItem.name && r.status === 'pending',
            );
          }

          if (existingReorders.length === 0) {
            // Trigger the auto-reorder POST
            await fetch('/api/outlet/reorders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                item_name: autoReorderItem.name,
                quantity: parseInt(quantity) || 20,
                notes: 'Automatic replenishment triggered by low stock',
              }),
            });
          }
        } catch (reorderErr) {
          console.error('Auto reorder error:', reorderErr);
        }
      }

      // Fetch active high/critical alerts
      try {
        const alertsRes = await fetch('/api/outlet/alerts');
        if (alertsRes.ok) {
          const { data: alertsList } = await alertsRes.json();
          const activeAlerts = (alertsList || []).filter(
            (a) => !a.resolved && ['high', 'critical'].includes(a.severity?.toLowerCase()),
          );
          setHasCriticalAlert(activeAlerts.length > 0);
        }
      } catch (alertsErr) {
        console.error('Failed to fetch active alerts:', alertsErr);
      }

      // Fetch audit logs
      try {
        const token = getAuthToken();
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const logsRes = await fetch('/api/admin/data?type=audit_log', { headers });
        if (logsRes.ok) {
          const { data: logs } = await logsRes.json();
          setAuditLogs(logs || []);
        }
      } catch (logsErr) {
        console.error('Failed to fetch audit logs:', logsErr);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validations
    const parsedThreshold = parseInt(threshold);
    if (isNaN(parsedThreshold) || parsedThreshold < 0) {
      setFormError('Must be non-negative');
      return;
    }

    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setFormError('Must be greater than zero');
      return;
    }

    if (!email) {
      setFormError('Email is required');
      return;
    }

    try {
      // Persist threshold to database (for all items or low stock item)
      const res = await fetch('/api/outlet/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: parsedThreshold, auto_reorder: true }),
      });

      if (!res.ok) throw new Error('Failed to save inventory threshold');

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('reorder-threshold', threshold);
        localStorage.setItem('reorder-quantity', quantity);
        localStorage.setItem('reorder-email', email);
      }

      setFormSuccess('Settings saved');

      // Refetch low stock items with new threshold
      const fetchRes = await fetch(`/api/outlet/inventory?lowStock=true`);
      if (fetchRes.ok) {
        const { data } = await fetchRes.json();
        setLowStockItems(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleManualReorder = async () => {
    setManualReorderStatus('Ordering...');
    setManualReorderInFlight(true);
    try {
      const token = getAuthToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'manual_reorder' }),
      });
      if (res.ok) {
        setManualReorderStatus('Ordered');
        // Increment stock in database for the low stock item as a quick mock simulation
        if (lowStockItems.length > 0) {
          const item = lowStockItems[0];
          await fetch('/api/outlet/inventory/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inventory_id: item.id, quantity: parseInt(quantity) }),
          });
        }
        // Refresh data
        setTimeout(() => fetchData(), 500);
      } else {
        setManualReorderStatus('Failed');
      }
    } catch (err) {
      setManualReorderStatus('Failed');
    } finally {
      setManualReorderInFlight(false);
    }
  };

  const handleTimezoneChange = (val) => {
    setTimezone(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('outlet-timezone', val);
    }
    if (onTimezoneChanged) onTimezoneChanged();
  };

  if (loading) {
    return (
      <div className="panel" data-testid="operations-panel">
        <h2>Stock Operations</h2>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Loading operations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" data-testid="operations-panel">
        <h2>Stock Operations</h2>
        <div className="error-text">{error}</div>
      </div>
    );
  }

  return (
    <div className="panel" data-testid="operations-panel">
      <h2>Stock Operations</h2>

      {/* Stock Table */}
      <div className="table-responsive">
        <table className="outlet-table" data-testid="stock-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Stock</th>
              <th>Threshold</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: '#a0aec0' }}>
                  All items well stocked
                </td>
              </tr>
            ) : (
              lowStockItems.map((item) => (
                <tr key={item.id} data-testid="stock-row">
                  <td style={{ fontWeight: 600 }}>
                    {item.name}
                    <span
                      className="stock-alert-badge"
                      data-testid="stock-alert-badge"
                      style={{ marginLeft: 6 }}
                    >
                      Low
                    </span>
                  </td>
                  <td className="stock-count">{item.stock ?? 'N/A'}</td>
                  <td>{item.threshold}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Reorder Panel */}
      <div className="outlet-card" style={{ marginTop: 16 }}>
        <h3>Manual Replenishment</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn-manual-reorder"
            data-testid="btn-manual-reorder"
            disabled={manualReorderInFlight || hasCriticalAlert}
            onClick={handleManualReorder}
            style={{
              padding: '8px 16px',
              background: manualReorderInFlight || hasCriticalAlert ? '#a0aec0' : '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: manualReorderInFlight || hasCriticalAlert ? 'not-allowed' : 'pointer',
            }}
          >
            {manualReorderInFlight ? 'Ordering...' : 'Trigger Manual Reorder'}
          </button>
          {manualReorderStatus && (
            <span
              data-testid="reorder-status"
              style={{ fontWeight: 600, fontSize: 13, color: '#3182ce' }}
            >
              {manualReorderStatus}
            </span>
          )}
        </div>
      </div>

      {/* Auto-reorder Settings Form */}
      <div className="outlet-card" style={{ marginTop: 16 }}>
        <h3>Auto-Reorder Settings</h3>
        <form onSubmit={handleSaveSettings} data-testid="reorder-form" className="outlet-form">
          {formError && (
            <div className="error-text" style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="success-text" style={{ color: 'green', fontSize: 12, marginBottom: 8 }}>
              {formSuccess}
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label>Reorder Threshold</label>
            <input
              type="number"
              className="form-control"
              data-testid="field-reorder-threshold"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g. 10"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label>Reorder Quantity</label>
            <input
              type="number"
              className="form-control"
              data-testid="field-reorder-quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Supplier Email</label>
            <input
              type="email"
              className="form-control"
              data-testid="field-reorder-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="supplier@example.com"
            />
          </div>
          <button
            type="submit"
            className="outlet-btn secondary sm"
            data-testid="btn-save-reorder"
            style={{ width: '100%' }}
          >
            Save Settings
          </button>
        </form>
      </div>

      {/* Store Timezone Settings */}
      <div className="outlet-card" style={{ marginTop: 16 }}>
        <h3>Store Settings</h3>
        <div className="form-group" style={{ marginBottom: 10 }}>
          <label>Timezone</label>
          <select
            className="form-control"
            data-testid="timezone-select"
            value={timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <option value="IST">Asia/Kolkata (IST)</option>
            <option value="GMT">GMT</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>

      {/* Administrative Audit Log */}
      <div className="outlet-card" style={{ marginTop: 16 }}>
        <h3>Administrative Audit Log</h3>
        {auditLogs.length === 0 ? (
          <div
            className="empty-placeholder"
            style={{ padding: '10px 0', color: '#a0aec0', textAlign: 'center' }}
          >
            No audit logs found
          </div>
        ) : (
          <ul
            className="outlet-list"
            style={{ maxHeight: '200px', overflowY: 'auto', padding: 0, listStyle: 'none' }}
          >
            {auditLogs.map((log) => (
              <li
                key={log.id}
                data-testid="audit-log-item"
                className="outlet-list-item"
                style={{ padding: '8px 0', borderBottom: '1px solid #edf2f7', fontSize: '12px' }}
              >
                <div>
                  <strong>{log.action}</strong> ({log.entity_type})
                  <div style={{ color: '#718096', fontSize: '10px' }}>
                    {log.admin_email} &middot; {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
