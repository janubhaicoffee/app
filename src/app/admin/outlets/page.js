'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  Store,
  Plus,
  Search,
  Edit3,
  Power,
  PowerOff,
  MapPin,
  Users,
  DollarSign,
  X,
  Building2,
} from 'lucide-react';

const statusColors = {
  active: { bg: '#d4edda', color: '#155724' },
  inactive: { bg: '#e2e3e5', color: '#383d41' },
  closed: { bg: '#f8d7da', color: '#721c24' },
};

export default function AdminOutlets() {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editOutlet, setEditOutlet] = useState(null);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [saving, setSaving] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isExtractingFssai, setIsExtractingFssai] = useState(false);
  const [fssaiFile, setFssaiFile] = useState(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    fssai_number: '',
    fssai_certificate_url: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    rent: '',
    electricity: '',
    water: '',
    internet: '',
    cogs: '',
  });

  useEffect(() => {
    loadOutlets();
  }, []);

  useEffect(() => {
    if (form.pincode && form.pincode.length === 6 && /^\d+$/.test(form.pincode)) {
      fetchLocation(form.pincode);
    }
  }, [form.pincode]);

  async function fetchLocation(pin) {
    setIsFetchingLocation(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        setForm(prev => ({
          ...prev,
          city: prev.city || postOffice.District,
          state: prev.state || postOffice.State
        }));
      }
    } catch (err) {
      console.error('Failed to fetch pincode data', err);
    } finally {
      setIsFetchingLocation(false);
    }
  }

  const handleNameChange = (e) => {
    const newName = e.target.value;
    if (!editOutlet && !form.code) { // Only auto-gen if creating new and code isn't manually set yet, or we could just override it if it matches the pattern.
      // Auto generate code from name
      const words = newName.split(/[\s-]+/).filter(Boolean);
      let code = 'JBC-';
      if (words.length === 1) {
        code += words[0].substring(0, 3).toUpperCase();
      } else {
        // Last word or prominent word
        const lastWord = words[words.length - 1];
        if (lastWord.length <= 4) {
           code += lastWord.toUpperCase();
        } else {
           code += lastWord.substring(0, 3).toUpperCase();
        }
      }
      setForm({ ...form, name: newName, code: code !== 'JBC-' ? code : '' });
    } else {
      setForm({ ...form, name: newName });
    }
  };

  const handleFssaiUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFssaiFile(file);
    setIsExtractingFssai(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        
        const { data: { session } } = await supabase.auth.getSession();
        
        const res = await fetch('/api/admin/extract-fssai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ base64Image }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.fssai_number) {
            setForm(prev => ({ ...prev, fssai_number: data.fssai_number }));
            showToast('FSSAI Number extracted successfully!');
          } else {
            showToast('Could not find FSSAI Number in image', 'error');
          }
        } else {
          showToast('Failed to extract FSSAI details', 'error');
        }
        setIsExtractingFssai(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error extracting FSSAI:', err);
      showToast('Error extracting FSSAI', 'error');
      setIsExtractingFssai(false);
    }
  };

  async function loadOutlets() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const [outletsRes, staffRes] = await Promise.all([
        fetch('/api/admin/outlets', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/admin/staff', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (outletsRes.ok) {
        const json = await outletsRes.json();
        const data = json.data || [];
        setOutlets(data);
        setStats({
          total: data.length,
          active: data.filter((o) => o.status === 'active').length,
        });
      }
    } catch (err) {
      console.error('Failed to load outlets', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditOutlet(null);
    setForm({
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
      fssai_number: '',
      fssai_certificate_url: '',
      manager_name: '',
      manager_phone: '',
      manager_email: '',
      rent: '',
      electricity: '',
      water: '',
      internet: '',
      cogs: '',
    });
    setFssaiFile(null);
    setCurrentStep(1);
    setShowModal(true);
  }

  function openEditModal(outlet) {
    setEditOutlet(outlet);
    const settings = outlet.settings || {};
    setForm({
      name: outlet.name || '',
      code: outlet.code || '',
      address: outlet.address || '',
      city: outlet.city || '',
      state: outlet.state || '',
      pincode: outlet.pincode || '',
      phone: outlet.phone || '',
      email: outlet.email || '',
      fssai_number: settings.fssai_number || '',
      fssai_certificate_url: settings.fssai_certificate_url || '',
      manager_name: settings.manager_name || '',
      manager_phone: settings.manager_phone || '',
      manager_email: settings.manager_email || '',
      rent: settings.rent || '',
      electricity: settings.electricity || '',
      water: settings.water || '',
      internet: settings.internet || '',
      cogs: settings.cogs || '',
    });
    setFssaiFile(null);
    setCurrentStep(1);
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      let finalFssaiUrl = form.fssai_certificate_url;
      if (fssaiFile) {
        const fileExt = fssaiFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('outlet-documents')
          .upload(fileName, fssaiFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('outlet-documents')
          .getPublicUrl(fileName);
        
        finalFssaiUrl = publicUrlData.publicUrl;
      }

      const settings = {
        fssai_number: form.fssai_number,
        fssai_certificate_url: finalFssaiUrl,
        manager_name: form.manager_name,
        manager_phone: form.manager_phone,
        manager_email: form.manager_email,
        rent: form.rent ? parseFloat(form.rent) : 0,
        electricity: form.electricity ? parseFloat(form.electricity) : 0,
        water: form.water ? parseFloat(form.water) : 0,
        internet: form.internet ? parseFloat(form.internet) : 0,
        cogs: form.cogs ? parseFloat(form.cogs) : 0,
      };

      const body = {
        name: form.name,
        code: form.code,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone,
        email: form.email,
        settings,
      };

      let res;
      if (editOutlet) {
        res = await fetch('/api/admin/outlets', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ id: editOutlet.id, ...body }),
        });
      } else {
        res = await fetch('/api/admin/outlets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        showToast(editOutlet ? 'Outlet updated successfully' : 'Outlet created successfully');
        setShowModal(false);
        loadOutlets();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save outlet', 'error');
      }
    } catch (err) {
      showToast('Failed to save outlet', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(outlet) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const newStatus = outlet.status === 'active' ? 'inactive' : 'active';
      const res = await fetch('/api/admin/outlets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: outlet.id, status: newStatus }),
      });

      if (res.ok) {
        showToast(`Outlet ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        loadOutlets();
      }
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  }

  const filtered = outlets.filter(
    (o) =>
      !search ||
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.city?.toLowerCase().includes(search.toLowerCase()) ||
      o.code?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" /> Loading outlets...
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <div className={`admin-toast ${toast.type === 'error' ? 'admin-toast-error' : ''}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1>Outlet Management <span style={{ fontSize: '0.8rem', color: '#c62828', background: '#ffebee', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>READ-ONLY</span></h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            View all {stats.total} outlets ({stats.active} active)
          </p>
        </div>
        <a 
          href={typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) ? `http://outlet.localhost:${window.location.port}/outlets` : 'https://outlet.janubhai.com/outlets'}
          className="admin-btn"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Manage Outlets
        </a>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} color="var(--text-secondary)" />
          <input
            placeholder="Search by name, city or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{
        padding: '1rem',
        background: '#fff3cd',
        border: '1px solid #ffeeba',
        color: '#856404',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        fontWeight: 500
      }}>
        💡 Outlets can only be created, edited, or deleted on the <a href={typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) ? `http://outlet.localhost:${window.location.port}/outlets` : 'https://outlet.janubhai.com/outlets'} style={{ fontWeight: 700, color: 'var(--primary-color)', textDecoration: 'underline' }}>Outlet Management Portal</a>.
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Store size={48} />
          <h3>No outlets found</h3>
          <p>
            {search ? 'Try a different search term' : 'Create your first outlet to get started'}
          </p>
          {!search && (
            <button className="admin-btn" onClick={openCreateModal}>
              <Plus size={16} /> Create Outlet
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filtered.map((outlet) => {
            const s = outlet.settings || {};
            const staffCount = 0;
            return (
              <Link
                href={`/admin/outlets/${outlet.id}`}
                key={outlet.id}
                className="admin-card"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: 'var(--primary-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Building2 size={20} color="#fff" />
                    </div>
                    <div>
                      <div
                        style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-color)' }}
                      >
                        {outlet.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {outlet.code}
                      </div>
                    </div>
                  </div>
                  <span
                    className="status-badge"
                    style={{
                      background: (statusColors[outlet.status] || statusColors.inactive).bg,
                      color: (statusColors[outlet.status] || statusColors.inactive).color,
                    }}
                  >
                    {outlet.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} /> {outlet.city || outlet.address || 'No address'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <DollarSign size={14} /> Rent: ₹{Number(s.rent || 0).toLocaleString('en-IN')}
                    <span style={{ marginLeft: '0.5rem' }}>
                      Electricity: ₹{Number(s.electricity || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Users size={14} /> {staffCount} staff
                  </div>
                </div>

                {/* Controls Hidden - Read Only */}
              </Link>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editOutlet ? 'Edit Outlet' : 'Create New Outlet'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} style={{ height: '4px', flex: 1, backgroundColor: currentStep >= step ? 'var(--accent-gold)' : 'var(--border-color)', borderRadius: '2px', transition: 'background-color 0.3s' }} />
                  ))}
                </div>

                {currentStep === 1 && (
                  <div className="fade-in">
                    <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Step 1: Basic Information</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Outlet Name *</label>
                        <input required value={form.name} onChange={handleNameChange} placeholder="Janu Bhai Coffee - Indira Nagar" />
                      </div>
                      <div className="form-group">
                        <label>Outlet Code *</label>
                        <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="JBC-IND" style={{ textTransform: 'uppercase' }} />
                      </div>
                    </div>
                  
                    <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>FSSAI Details</h4>
                    <div className="form-row">
                      <div className="form-group">
                      <label>Upload FSSAI Certificate</label>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFssaiUpload}
                      />
                      {isExtractingFssai && <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>Analyzing with AI...</span>}
                      {form.fssai_certificate_url && !fssaiFile && (
                        <a href={form.fssai_certificate_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginTop: '4px', display: 'inline-block' }}>View Current Certificate</a>
                      )}
                    </div>
                    <div className="form-group">
                      <label>FSSAI Number</label>
                      <input 
                        value={form.fssai_number} 
                        onChange={(e) => setForm({ ...form, fssai_number: e.target.value })} 
                        placeholder="14-Digit Number" 
                      />
                    </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="fade-in">
                    <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Step 2: Location</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Pincode</label>
                        <div style={{ position: 'relative' }}>
                          <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="560001" maxLength={6} />
                          {isFetchingLocation && <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fetching...</span>}
                        </div>
                      </div>
                      <div className="form-group" style={{ flex: 2 }}>
                        <label>Address</label>
                        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123, Main Road" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Bengaluru" />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Karnataka" />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="fade-in">
                    <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Step 3: Contact & Manager</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Outlet Phone</label>
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
                      </div>
                      <div className="form-group">
                        <label>Outlet Email</label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="outlet@janubhaicoffee.com" />
                      </div>
                    </div>
                    <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manager Details</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input value={form.manager_name} onChange={(e) => setForm({ ...form, manager_name: e.target.value })} placeholder="Rahul Sharma" />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input value={form.manager_phone} onChange={(e) => setForm({ ...form, manager_phone: e.target.value })} placeholder="+91 9876543210" />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={form.manager_email} onChange={(e) => setForm({ ...form, manager_email: e.target.value })} placeholder="manager@example.com" />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="fade-in">
                    <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Step 4: Financial Settings</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Monthly Rent (₹)</label>
                        <input type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} placeholder="50000" />
                      </div>
                      <div className="form-group">
                        <label>Monthly Electricity (₹)</label>
                        <input type="number" value={form.electricity} onChange={(e) => setForm({ ...form, electricity: e.target.value })} placeholder="8000" />
                      </div>
                      <div className="form-group">
                        <label>Monthly Water (₹)</label>
                        <input type="number" value={form.water} onChange={(e) => setForm({ ...form, water: e.target.value })} placeholder="2000" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Monthly Internet (₹)</label>
                        <input type="number" value={form.internet} onChange={(e) => setForm({ ...form, internet: e.target.value })} placeholder="1500" />
                      </div>
                      <div className="form-group">
                        <label>COGS %</label>
                        <input type="number" value={form.cogs} onChange={(e) => setForm({ ...form, cogs: e.target.value })} placeholder="35" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => {
                    if (currentStep > 1) {
                      setCurrentStep(currentStep - 1);
                    } else {
                      setShowModal(false);
                    }
                  }}
                >
                  {currentStep > 1 ? 'Previous' : 'Cancel'}
                </button>
                {currentStep < 4 ? (
                  <button type="button" className="admin-btn" onClick={() => setCurrentStep(currentStep + 1)}>
                    Next Step
                  </button>
                ) : (
                  <button type="submit" className="admin-btn" disabled={saving}>
                    {saving ? 'Saving...' : editOutlet ? 'Update Outlet' : 'Create Outlet'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
