'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  Camera,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Store,
  Video,
  X,
  Trash2,
  RefreshCw,
  Eye,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

export default function AdminSurveillance() {
  const [cameras, setCameras] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutlet, setSelectedOutlet] = useState('all');
  const [showAddCamera, setShowAddCamera] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [cameraForm, setCameraForm] = useState({
    name: '',
    url: '',
    outlet_id: '',
  });

  const [incidentForm, setIncidentForm] = useState({
    outlet_id: '',
    title: '',
    description: '',
    severity: 'medium',
    dispatched: true,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const [camsRes, outletsRes, incRes] = await Promise.all([
        fetch('/api/outlet/cameras', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/admin/outlets', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/outlet/incidents', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (camsRes.ok) {
        const json = await camsRes.json();
        setCameras(json.data || []);
      }

      if (outletsRes.ok) {
        const json = await outletsRes.json();
        setOutlets(json.data || []);
      }

      if (incRes.ok) {
        const json = await incRes.json();
        setIncidents(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load surveillance data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleCameraActive(id, currentActive) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/outlet/cameras', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, active: !currentActive }),
      });

      if (res.ok) {
        showToast(`Camera stream ${!currentActive ? 'activated' : 'paused'}`);
        loadData();
      }
    } catch (err) {
      showToast('Failed to toggle camera', 'error');
    }
  }

  async function handleDeleteCamera(id) {
    if (!confirm('Are you sure you want to remove this camera stream?')) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/outlet/cameras?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        showToast('Camera stream deleted');
        loadData();
      }
    } catch (err) {
      showToast('Failed to delete camera', 'error');
    }
  }

  async function handleAddCamera(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/outlet/cameras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(cameraForm),
      });

      if (res.ok) {
        showToast('Camera feed added successfully');
        setShowAddCamera(false);
        setCameraForm({ name: '', url: '', outlet_id: '' });
        loadData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add camera', 'error');
      }
    } catch (err) {
      showToast('Error adding camera', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateIncident(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/outlet/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(incidentForm),
      });

      if (res.ok) {
        showToast('Incident logged and notification dispatched');
        setShowIncidentModal(false);
        setIncidentForm({ outlet_id: '', title: '', description: '', severity: 'medium', dispatched: true });
        loadData();
      } else {
        showToast('Failed to log incident', 'error');
      }
    } catch (err) {
      showToast('Error logging incident', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResolveIncident(id) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/outlet/incidents', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id,
          status: 'resolved',
          resolution_notes: 'Resolved by Operations Manager from Surveillance Hub',
        }),
      });

      if (res.ok) {
        showToast('Incident marked as resolved');
        loadData();
      }
    } catch (err) {
      showToast('Failed to resolve incident', 'error');
    }
  }

  const filteredCameras = cameras.filter((c) => {
    if (selectedOutlet === 'all') return true;
    return c.outlet_id === selectedOutlet;
  });

  const onlineCams = cameras.filter((c) => c.active !== false).length;
  const openIncidents = incidents.filter((i) => ['open', 'investigating'].includes(i.status || 'open'));

  return (
    <div>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            background: toast.type === 'error' ? '#c62828' : '#2e7d32',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
          }}
        >
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/admin/outlets/operations" style={{ color: 'var(--text-secondary)' }}>
              Operations Hub
            </Link>
            <span style={{ color: 'var(--text-secondary)' }}>/</span>
            <h1 style={{ margin: 0 }}>Multi-Outlet Live Surveillance</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Live visual monitoring across cafe counters, espresso bars, dining areas, and incident ticketing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="admin-btn-outline admin-btn-sm" onClick={loadData}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            className="admin-btn admin-btn-sm"
            style={{ background: '#c62828', borderColor: '#c62828' }}
            onClick={() => setShowIncidentModal(true)}
          >
            <ShieldAlert size={14} /> Log Incident
          </button>
          <button className="admin-btn admin-btn-sm" onClick={() => setShowAddCamera(true)}>
            <Plus size={16} /> Add Camera Feed
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card green">
          <h3>
            <Video size={14} style={{ display: 'inline', marginRight: 4 }} /> Online Feeds
          </h3>
          <p className="stat-value">{onlineCams} / {cameras.length}</p>
          <p className="stat-sub">Active streams</p>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #c62828' }}>
          <h3>
            <AlertTriangle size={14} style={{ display: 'inline', marginRight: 4 }} /> Open Incidents
          </h3>
          <p className="stat-value">{openIncidents.length}</p>
          <p className="stat-sub">Requires resolution</p>
        </div>
        <div className="stat-card blue">
          <h3>
            <Store size={14} style={{ display: 'inline', marginRight: 4 }} /> Monitored Cafes
          </h3>
          <p className="stat-value">{outlets.length}</p>
          <p className="stat-sub">Connected locations</p>
        </div>
      </div>

      {/* Filter by Outlet */}
      <div className="admin-toolbar" style={{ marginTop: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter by Cafe:</span>
          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
            }}
          >
            <option value="all">All Outlets ({cameras.length} cameras)</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Cameras on Left (2 cols), Incidents on Right (1 col) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Camera Grid */}
        <div>
          {filteredCameras.length === 0 ? (
            <div className="admin-card empty-state" style={{ padding: '3rem' }}>
              <Camera size={48} />
              <h3>No camera feeds configured</h3>
              <p>Add CCTV RTSP/HLS streams to monitor espresso bars and dining spaces.</p>
              <button className="admin-btn admin-btn-sm" onClick={() => setShowAddCamera(true)} style={{ marginTop: '1rem' }}>
                <Plus size={14} /> Add First Camera
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {filteredCameras.map((cam) => {
                const isHls = cam.url && (cam.url.endsWith('.m3u8') || cam.url.includes('stream') || cam.url.includes('live'));

                return (
                  <div
                    key={cam.id}
                    className="admin-card"
                    style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                  >
                    {/* Simulated / Real Video Player Area */}
                    <div
                      style={{
                        position: 'relative',
                        height: 180,
                        background: '#111',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                      }}
                    >
                      {cam.active ? (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                          <Video size={36} color="#4caf50" style={{ marginBottom: '0.5rem' }} />
                          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>LIVE FEED ACTIVE</div>
                          <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '0.2rem' }}>
                            {cam.url.length > 30 ? `${cam.url.slice(0, 30)}...` : cam.url}
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#777' }}>
                          <Pause size={36} style={{ marginBottom: '0.5rem' }} />
                          <div style={{ fontSize: '0.8rem' }}>FEED PAUSED</div>
                        </div>
                      )}

                      {/* Live Indicator Pill */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '0.6rem',
                          left: '0.6rem',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 4,
                          background: cam.active ? 'rgba(46, 125, 50, 0.9)' : 'rgba(100, 100, 100, 0.9)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: cam.active ? '#00e676' : '#bbb',
                          }}
                        />
                        {cam.active ? 'LIVE' : 'OFFLINE'}
                      </span>
                    </div>

                    {/* Camera Metadata & Controls */}
                    <div style={{ padding: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{cam.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {cam.outlets?.name || 'Main Outlet'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteCamera(cam.id)}
                          style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <button
                          className={`admin-btn-sm ${cam.active ? 'admin-btn-outline' : 'admin-btn'}`}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => toggleCameraActive(cam.id, cam.active)}
                        >
                          {cam.active ? 'Pause Feed' : 'Resume Feed'}
                        </button>
                        <button
                          className="admin-btn-outline admin-btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderColor: '#c62828', color: '#c62828' }}
                          onClick={() => {
                            setIncidentForm((prev) => ({
                              ...prev,
                              outlet_id: cam.outlet_id || '',
                              title: `Incident via ${cam.name}`,
                            }));
                            setShowIncidentModal(true);
                          }}
                        >
                          Report Issue
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Incident Tickets Feed */}
        <div className="admin-card" style={{ height: 'fit-content' }}>
          <div className="admin-card-header" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={18} color="#c62828" /> Incident Log ({openIncidents.length} open)
            </h3>
          </div>

          {incidents.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ✓ No incidents recorded. All cafe systems operational.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {incidents.slice(0, 10).map((inc) => {
                const isResolved = inc.status === 'resolved' || inc.status === 'closed';

                return (
                  <div
                    key={inc.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 6,
                      background: 'var(--bg-secondary)',
                      borderLeft: `4px solid ${isResolved ? '#2e7d32' : inc.severity === 'critical' ? '#c62828' : '#f57c00'}`,
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>{inc.title || inc.description}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          color: isResolved ? '#2e7d32' : inc.severity === 'critical' ? '#c62828' : '#f57c00',
                        }}
                      >
                        {isResolved ? 'RESOLVED' : inc.severity}
                      </span>
                    </div>

                    <p style={{ margin: '0.3rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {inc.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>{inc.outlets?.name || 'All Cafes'}</span>
                      {!isResolved ? (
                        <button
                          className="admin-btn admin-btn-sm"
                          style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: '#2e7d32', borderColor: '#2e7d32' }}
                          onClick={() => handleResolveIncident(inc.id)}
                        >
                          Resolve
                        </button>
                      ) : (
                        <span style={{ color: '#2e7d32', fontWeight: 600 }}>✓ Resolved</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Add Camera Modal */}
      {showAddCamera && (
        <div className="modal-overlay" onClick={() => setShowAddCamera(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Add Camera Stream</h2>
              <button className="modal-close" onClick={() => setShowAddCamera(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCamera}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Outlet Location</label>
                  <select
                    value={cameraForm.outlet_id}
                    onChange={(e) => setCameraForm({ ...cameraForm, outlet_id: e.target.value })}
                  >
                    <option value="">Select outlet...</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Camera Name *</label>
                  <input
                    required
                    placeholder="e.g. Espresso Bar Cam 1, Cashier POS Counter, Dining Floor"
                    value={cameraForm.name}
                    onChange={(e) => setCameraForm({ ...cameraForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Stream URL (HLS / RTSP / WebRTC / Video) *</label>
                  <input
                    required
                    type="url"
                    placeholder="https://stream.janubhai.com/live/camera1.m3u8"
                    value={cameraForm.url}
                    onChange={(e) => setCameraForm({ ...cameraForm, url: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setShowAddCamera(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Camera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Incident Modal */}
      {showIncidentModal && (
        <div className="modal-overlay" onClick={() => setShowIncidentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Log Operational Incident</h2>
              <button className="modal-close" onClick={() => setShowIncidentModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateIncident}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Outlet</label>
                    <select
                      value={incidentForm.outlet_id}
                      onChange={(e) => setIncidentForm({ ...incidentForm, outlet_id: e.target.value })}
                    >
                      <option value="">All / General Outlet</option>
                      {outlets.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Severity</label>
                    <select
                      value={incidentForm.severity}
                      onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical (Immediate Action)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Incident Title *</label>
                  <input
                    required
                    placeholder="e.g. Grinder 2 Motor Overheating / Water Filtration Low Pressure"
                    value={incidentForm.title}
                    onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Detailed Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide incident details, machine error codes, technician ETA, or mitigation steps taken."
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setShowIncidentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn" style={{ background: '#c62828', borderColor: '#c62828' }} disabled={submitting}>
                  {submitting ? 'Dispatching...' : 'Log & Dispatch Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
