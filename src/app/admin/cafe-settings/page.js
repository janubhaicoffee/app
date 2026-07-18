'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, Save, Store, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function CafeSettingsPage() {
  const [settings, setSettings] = useState({
    cafe_name: '',
    global_gstin: '',
    central_fssai: '',
    support_email: '',
    support_phone: '',
    hq_address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCafeSettings();
  }, []);

  async function fetchCafeSettings() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/data?type=cafe_settings', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const json = await res.json();
        setSettings(json.data);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load cafe settings');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_cafe_settings',
          payload: {
            cafe_name: settings.cafe_name,
            global_gstin: settings.global_gstin,
            central_fssai: settings.central_fssai,
            support_email: settings.support_email,
            support_phone: settings.support_phone,
            hq_address: settings.hq_address,
          },
        }),
      });

      if (res.ok) {
        toast.success('Cafe settings updated successfully!');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to update settings');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-container fade-in">
      <Toaster position="top-right" />
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Cafe Business Settings</h1>
          <p className="admin-subtitle">Manage global configurations for Janu Bhai Cafe entity.</p>
        </div>
      </div>

      <div className="admin-card">
        <form onSubmit={handleSubmit}>
          
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} /> Entity Details
          </h3>
          
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Cafe Business Name</label>
              <div style={{ position: 'relative' }}>
                <Store size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-secondary)' }} />
                <input
                  required
                  style={{ paddingLeft: '35px' }}
                  value={settings.cafe_name || ''}
                  onChange={(e) => setSettings({ ...settings, cafe_name: e.target.value })}
                  placeholder="Janu Bhai Cafe Pvt Ltd"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Global GSTIN</label>
              <input
                value={settings.global_gstin || ''}
                onChange={(e) => setSettings({ ...settings, global_gstin: e.target.value })}
                placeholder="29ABCDE1234F1Z5"
              />
            </div>
            <div className="form-group">
              <label>Central FSSAI</label>
              <input
                value={settings.central_fssai || ''}
                onChange={(e) => setSettings({ ...settings, central_fssai: e.target.value })}
                placeholder="100XXXXXXXXXXX"
              />
            </div>
          </div>

          <h3 style={{ margin: '2rem 0 1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={18} /> Support & Contact
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label>Cafe Support Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  style={{ paddingLeft: '35px' }}
                  value={settings.support_email || ''}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  placeholder="support@janubhaicafe.com"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Cafe Support Phone</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-secondary)' }} />
                <input
                  style={{ paddingLeft: '35px' }}
                  value={settings.support_phone || ''}
                  onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Headquarters Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-secondary)' }} />
              <input
                style={{ paddingLeft: '35px' }}
                value={settings.hq_address || ''}
                onChange={(e) => setSettings({ ...settings, hq_address: e.target.value })}
                placeholder="123, Main Road, City, State"
              />
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              type="submit"
              className="admin-btn"
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
