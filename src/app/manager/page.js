'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Camera,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Upload,
  Phone,
  FileText,
  DollarSign,
  Coffee,
  Calendar,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Eye,
  AlertCircle,
  Send,
  Building,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './manager.css';

const DEFAULT_CHECKPOINTS = [
  { id: 'shop_cleanliness', num: 1, name: 'Shop Cleanliness', check: 'Floor, tables, counters, dustbin empty', status: 'ok', remarks: '' },
  { id: 'kitchen_cleanliness', num: 2, name: 'Kitchen Cleanliness', check: 'Clean, no grease build-up, properly arranged', status: 'ok', remarks: '' },
  { id: 'machines_equipment', num: 3, name: 'Machines / Equipment', check: 'Coffee machine, grinder, induction working fine', status: 'ok', remarks: '' },
  { id: 'water_leakage', num: 4, name: 'Water Leakage', check: 'Taps, pipes, sink, water connections intact', status: 'ok', remarks: '' },
  { id: 'drainage_outside', num: 5, name: 'Drainage & Outside Area', check: 'Drain clean and flowing, outside area neat', status: 'ok', remarks: '' },
  { id: 'dust_dirt', num: 6, name: 'Dust / Dirt', check: 'Corners, shelves, top of equipment, walls clean', status: 'ok', remarks: '' },
  { id: 'product_packets', num: 7, name: 'Product Packets & Stacking', check: 'Facing front, arranged neatly, no tears', status: 'ok', remarks: '' },
  { id: 'sauces_condiments', num: 8, name: 'Sauces & Condiments', check: 'All bottles/jars above 50% level', status: 'ok', remarks: '' },
  { id: 'fridge_freezer', num: 9, name: 'Fridge / Freezer', check: 'Working properly, no off smell, within temp', status: 'ok', remarks: '' },
  { id: 'staff_hygiene', num: 10, name: 'Staff Hygiene & Uniform', check: 'Clean uniform, hair covered, good hygiene', status: 'ok', remarks: '' },
  { id: 'customer_greeting', num: 11, name: 'Greeting & Customer Behavior', check: 'Greet with smile, polite, courteous', status: 'ok', remarks: '' },
  { id: 'background_music', num: 12, name: 'Music', check: 'Soft background music is ON', status: 'ok', remarks: '' },
  { id: 'overall_shop', num: 13, name: 'Overall Shop & Surroundings', check: 'Shop looks good, branding visible, area clean', status: 'ok', remarks: '' },
];

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'checklist' | 'issues' | 'cash' | 'contacts' | 'events'
  const [loading, setLoading] = useState(false);

  // Store metadata
  const [outletName, setOutletName] = useState('Janu Bhai Cafe - Gafoor Nagar');
  const [managerName, setManagerName] = useState('Arsalan Azad');
  const [observationDate, setObservationDate] = useState(new Date().toISOString().split('T')[0]);
  const [observationTime, setObservationTime] = useState('10:00 AM');
  const [visitType, setVisitType] = useState('daily');
  const [priority, setPriority] = useState('medium');

  // AI Scan State
  const [scannedImage, setScannedImage] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [checkpoints, setCheckpoints] = useState(DEFAULT_CHECKPOINTS);
  const [attachedPhotos, setAttachedPhotos] = useState([]); // [{ category, photo_url, caption, severity }]
  const [missingPhotosPrompts, setMissingPhotosPrompts] = useState([]);

  // Observations history
  const [recentObservations, setRecentObservations] = useState([]);

  // Issue & Action Form State
  const [issuesList, setIssuesList] = useState([]);
  const [newIssueForm, setNewIssueForm] = useState({
    issue_description: '',
    action_taken: '',
    vendor_contacted: '',
    vendor_contact_phone: '',
    approved_vendor_used: true,
    vendor_name: 'Anis (Electrician) / In-House',
    resolution_status: 'pending',
    pending_work: '',
    expected_completion_date: '',
    cost_required: false,
    estimated_cost: 0,
    actual_cost: 0,
    whatsapp_sent_to_oh: false,
    oh_informed: false,
    follow_up_required: false,
    follow_up_date: '',
  });

  // Cash Register State
  const [withdrawals, setWithdrawals] = useState([]);
  const [newWithdrawal, setNewWithdrawal] = useState({
    reason: '',
    amount: '',
    paid_to: '',
    cash_given_by: 'Arsalan',
    receipt_url: '',
    employee_sign: '',
  });

  const [staffConsumptions, setStaffConsumptions] = useState([]);
  const [newConsumption, setNewConsumption] = useState({
    item_name: 'Classic Espresso Single',
    amount_worth: 120,
    consumed_by: '',
    designation: 'Barista',
    purpose: 'Shift refreshment',
  });

  const [dailySalesEntries, setDailySalesEntries] = useState([]);
  const [newDailySale, setNewDailySale] = useState({
    opening_cash: 2000,
    closing_cash: '',
    cash_sales: '',
    upi_sales: '',
    total_orders: '',
    notes: '',
  });

  // Events & RSVPs (View-Only)
  const [eventsList, setEventsList] = useState([]);
  const [selectedEventRsvps, setSelectedEventRsvps] = useState(null);

  const fileInputRef = useRef(null);
  const defectPhotoInputRef = useRef(null);
  const [targetCheckpointForPhoto, setTargetCheckpointForPhoto] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchObservations();
    fetchIssues();
    fetchCashRegisters();
    fetchEvents();
  }, []);

  const fetchObservations = async () => {
    try {
      const res = await fetch('/api/manager/observations');
      const data = await res.json();
      if (data.success) {
        setRecentObservations(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/manager/issues');
      const data = await res.json();
      if (data.success) {
        setIssuesList(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCashRegisters = async () => {
    try {
      const [wRes, cRes, sRes] = await Promise.all([
        fetch('/api/manager/cash-registers?type=withdrawals'),
        fetch('/api/manager/cash-registers?type=staff_consumption'),
        fetch('/api/manager/cash-registers?type=daily_sales'),
      ]);
      const wData = await wRes.json();
      const cData = await cRes.json();
      const sData = await sRes.json();
      if (wData.success) setWithdrawals(wData.data || []);
      if (cData.success) setStaffConsumptions(cData.data || []);
      if (sData.success) setDailySalesEntries(sData.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/growth/events');
      const data = await res.json();
      if (data.success) {
        setEventsList(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Handle Main Observation Register / Inspection Image Upload
  const handleImageSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      setScannedImage(base64);
      runAiScan(base64);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Vision Scan
  const runAiScan = async (base64) => {
    setAiAnalyzing(true);
    try {
      const res = await fetch('/api/manager/ai-scan-observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          outletName,
          managerName,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiResult(data.data);
        toast.success('AI Observation Scan Complete!');

        // Update Checkpoints with AI parsed statuses
        if (data.data.checkpoints && data.data.checkpoints.length > 0) {
          setCheckpoints(data.data.checkpoints);
        }
        if (data.data.priority) setPriority(data.data.priority);

        // Check for missing photo prompts (e.g. gandagi / dirty area / leakage)
        if (data.data.missing_photos_requested && data.data.missing_photos_requested.length > 0) {
          setMissingPhotosPrompts(data.data.missing_photos_requested);
          toast(
            `📸 Defect/Issue detected! Photo proof requested for Operations Head Bilal.`,
            { icon: '⚠️', duration: 6000 }
          );
        }
      } else {
        toast.error(data.error || 'AI scan encountered an issue');
      }
    } catch (err) {
      toast.error('Failed to run AI observation scan');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Handle specific defect photo upload
  const triggerDefectPhotoCapture = (checkpointId) => {
    setTargetCheckpointForPhoto(checkpointId);
    defectPhotoInputRef.current?.click();
  };

  const handleDefectPhotoUploaded = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      try {
        // Upload photo securely without compression/distortion
        const uploadRes = await fetch('/api/upload/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: base64,
            fileName: `defect_${targetCheckpointForPhoto}_${Date.now()}.jpg`,
            bucket: 'observation-photos',
          }),
        });
        const uploadData = await uploadRes.json();
        const finalUrl = uploadData.url || base64;

        const cp = checkpoints.find((c) => c.id === targetCheckpointForPhoto);
        const newPhotoItem = {
          category: targetCheckpointForPhoto || 'issue_proof',
          photo_url: finalUrl,
          caption: `Photo Proof for ${cp?.name || targetCheckpointForPhoto}`,
          severity: cp?.status === 'not_ok' ? 'high' : 'medium',
        };

        setAttachedPhotos((prev) => [...prev, newPhotoItem]);
        // Remove from missing prompt list
        setMissingPhotosPrompts((prev) =>
          prev.filter((p) => p.checkpoint_id !== targetCheckpointForPhoto)
        );
        toast.success(`Photo proof attached for ${cp?.name || 'defect'}!`);
      } catch (err) {
        toast.error('Failed to upload photo proof');
      }
    };
    reader.readAsDataURL(file);
  };

  // Checkpoint status toggle
  const updateCheckpointStatus = (id, newStatus) => {
    setCheckpoints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, status: newStatus };
          // If marked not ok or needs attention and not yet prompted, add to missing photos prompt
          if (newStatus !== 'ok') {
            const alreadyPrompted = missingPhotosPrompts.some((p) => p.checkpoint_id === id);
            const alreadyHasPhoto = attachedPhotos.some((p) => p.category === id);
            if (!alreadyPrompted && !alreadyHasPhoto) {
              setMissingPhotosPrompts((pList) => [
                ...pList,
                {
                  checkpoint_id: id,
                  checkpoint_name: c.name,
                  reason: `Marked "${newStatus === 'not_ok' ? 'Not OK' : 'Needs Attention'}". Photographic evidence required for Operations Head review.`,
                },
              ]);
            }
          } else {
            // Remove prompt if marked OK
            setMissingPhotosPrompts((pList) => pList.filter((p) => p.checkpoint_id !== id));
          }
          return updated;
        }
        return c;
      })
    );
  };

  const updateCheckpointRemarks = (id, text) => {
    setCheckpoints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, remarks: text } : c))
    );
  };

  // Submit Observation
  const handleSubmitObservation = async () => {
    setLoading(true);
    try {
      // Calculate score based on checkpoints
      const okCount = checkpoints.filter((c) => c.status === 'ok').length;
      const calculatedScore = Math.round((okCount / checkpoints.length) * 100);

      const issuesFound = checkpoints
        .filter((c) => c.status !== 'ok')
        .map((c) => ({
          checkpoint_id: c.id,
          title: c.name,
          description: c.remarks || `Marked ${c.status}`,
          severity: c.status === 'not_ok' ? 'high' : 'medium',
        }));

      const res = await fetch('/api/manager/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet_name: outletName,
          manager_name: managerName,
          observation_date: observationDate,
          observation_time: observationTime,
          visit_type: visitType,
          checklist_items: checkpoints,
          issues_found: issuesFound,
          overall_score: calculatedScore,
          priority,
          raw_ai_analysis: aiResult,
          scanned_image_url: scannedImage,
          manager_signature: managerName,
          photos: attachedPhotos,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Observation Checklist successfully reported to Operations Head Bilal!');
        fetchObservations();
        // Reset or switch tab
        setActiveTab('checklist');
      } else {
        toast.error(data.error || 'Failed to submit observation');
      }
    } catch (err) {
      toast.error('Network error submitting observation');
    } finally {
      setLoading(false);
    }
  };

  // Submit Issue Record
  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!newIssueForm.issue_description) {
      toast.error('Please describe the issue');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/manager/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newIssueForm,
          manager_name: managerName,
          outlet_name: outletName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Issue & Action Record registered!');
        setNewIssueForm({
          issue_description: '',
          action_taken: '',
          vendor_contacted: '',
          vendor_contact_phone: '',
          approved_vendor_used: true,
          vendor_name: 'Anis (Electrician) / In-House',
          resolution_status: 'pending',
          pending_work: '',
          expected_completion_date: '',
          cost_required: false,
          estimated_cost: 0,
          actual_cost: 0,
          whatsapp_sent_to_oh: false,
          oh_informed: false,
          follow_up_required: false,
          follow_up_date: '',
        });
        fetchIssues();
      } else {
        toast.error(data.error || 'Failed to save issue record');
      }
    } catch (err) {
      toast.error('Failed to submit issue record');
    } finally {
      setLoading(false);
    }
  };

  // Submit Cash Withdrawal
  const handleAddWithdrawal = async (e) => {
    e.preventDefault();
    if (!newWithdrawal.reason || !newWithdrawal.amount || !newWithdrawal.paid_to) {
      toast.error('Fill required withdrawal fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/manager/cash-registers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'withdrawal',
          ...newWithdrawal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Cash withdrawal recorded with audit trail!');
        setNewWithdrawal({
          reason: '',
          amount: '',
          paid_to: '',
          cash_given_by: 'Arsalan',
          receipt_url: '',
          employee_sign: '',
        });
        fetchCashRegisters();
      } else {
        toast.error(data.error || 'Failed to record withdrawal');
      }
    } catch (err) {
      toast.error('Failed to submit withdrawal');
    } finally {
      setLoading(false);
    }
  };

  // Submit Staff Consumption
  const handleAddConsumption = async (e) => {
    e.preventDefault();
    if (!newConsumption.item_name || !newConsumption.consumed_by) {
      toast.error('Enter item name and staff member');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/manager/cash-registers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'staff_consumption',
          ...newConsumption,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Staff consumption logged!');
        setNewConsumption({
          item_name: 'Classic Espresso Single',
          amount_worth: 120,
          consumed_by: '',
          designation: 'Barista',
          purpose: 'Shift refreshment',
        });
        fetchCashRegisters();
      } else {
        toast.error(data.error || 'Failed to save staff consumption');
      }
    } catch (err) {
      toast.error('Failed to log consumption');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-dashboard-container">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelected}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={defectPhotoInputRef}
        onChange={handleDefectPhotoUploaded}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* 1. Header Card */}
      <motion.div
        className="manager-header-card"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="manager-brand-title">
            <Coffee size={28} color="#d4a359" />
            <span>Janu Bhai Cafe · Manager Hub</span>
            <span className="manager-badge">Store Control Register</span>
          </div>
          <p className="outlet-tag">
            <strong>Outlet:</strong> {outletName} &nbsp;|&nbsp; <strong>Manager:</strong> {managerName}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="ai-scan-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={aiAnalyzing}
          >
            <Camera size={18} />
            <span>{aiAnalyzing ? 'AI Scanning Register...' : 'Snap & Digest Register Photo'}</span>
          </button>
          <Link
            href="/operations"
            className="btn-glass-secondary"
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              color: '#d4a359',
              border: '1px solid rgba(212, 163, 89, 0.4)',
              textDecoration: 'none',
              fontSize: '0.86rem',
              fontWeight: 600,
            }}
          >
            Switch to Operations Head →
          </Link>
        </div>
      </motion.div>

      {/* 2. Navigation Tabs Bar */}
      <div className="manager-tabs-bar">
        <button
          className={`manager-tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          <Sparkles size={16} />
          <span>AI Observation Scanner</span>
        </button>
        <button
          className={`manager-tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          <CheckCircle2 size={16} />
          <span>Daily 13-Point Checklist</span>
        </button>
        <button
          className={`manager-tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          <AlertTriangle size={16} />
          <span>Issue & Action Record ({issuesList.length})</span>
        </button>
        <button
          className={`manager-tab-btn ${activeTab === 'cash' ? 'active' : ''}`}
          onClick={() => setActiveTab('cash')}
        >
          <DollarSign size={16} />
          <span>Sales & Cash Registers</span>
        </button>
        <button
          className={`manager-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          <ShieldAlert size={16} />
          <span>Emergency & Store Directory</span>
        </button>
        <button
          className={`manager-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={16} />
          <span>Events & RSVPs (View Only)</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: AI OBSERVATION SCANNER */}
      {activeTab === 'scan' && (
        <div className="manager-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
                AI Vision Store Observation Reader
              </h3>
              <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
                Snap a photo of your paper register or cafe inspection. Gemini Vision will read handwritten ticks, marks, defects, and prepare an audit for Operations Head Bilal.
              </p>
            </div>
            {aiResult && (
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  border: '1px solid #10b981',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                Store Health Score: {aiResult.overall_score}%
              </span>
            )}
          </div>

          {!scannedImage ? (
            <div
              className="ai-dropzone-box"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={44} color="#d4a359" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ color: '#f5f0eb', margin: '0 0 6px', fontSize: '1.1rem' }}>
                Tap to Capture or Upload Register Photo
              </h4>
              <p style={{ color: '#a89f91', fontSize: '0.84rem', margin: 0 }}>
                Supports camera snapshots, handwritten checklist logs, or area defect photos
              </p>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '16px',
                  borderRadius: '14px',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(212,163,89,0.4)' }}>
                  <Image src={scannedImage} alt="Scanned Register" fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#d4a359', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Captured Observation Image
                  </span>
                  <p style={{ margin: '4px 0 8px', fontSize: '0.9rem', color: '#e5dfd8' }}>
                    {aiAnalyzing ? '✨ AI analyzing all 13 checkpoints...' : 'Scanned & parsed successfully'}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#f5f0eb',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    Retake / Upload New Photo
                  </button>
                </div>
              </div>

              {/* Contextual Missing Photo Alert Prompt (e.g. agar gandagi pe tick hai toh uska photo maangliya) */}
              {missingPhotosPrompts.length > 0 && (
                <div className="contextual-photo-alert">
                  <AlertTriangle size={24} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <h4>Photo Proof Required for Operations Head Review</h4>
                    <p>
                      The following checkpoints have defects/issues marked. Please take a clear photograph of the defect so Operations Head Bilal can inspect and authorize vendor action:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {missingPhotosPrompts.map((item) => (
                        <button
                          key={item.checkpoint_id}
                          onClick={() => triggerDefectPhotoCapture(item.checkpoint_id)}
                          style={{
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          <Camera size={14} />
                          <span>Attach Photo Proof for: {item.checkpoint_name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Attached Photos Gallery */}
              {attachedPhotos.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#d4a359', fontSize: '0.9rem', marginBottom: '10px' }}>
                    Attached Unmodified High-Resolution Defect Proofs ({attachedPhotos.length}):
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {attachedPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(212,163,89,0.3)',
                          borderRadius: '10px',
                          padding: '8px',
                          width: '140px',
                        }}
                      >
                        <div style={{ position: 'relative', width: '100%', height: '90px', borderRadius: '6px', overflow: 'hidden' }}>
                          <Image src={photo.photo_url} alt="Proof" fill style={{ objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#a89f91', display: 'block', marginTop: '4px' }}>
                          {photo.caption}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checkpoints extracted */}
              <h4 style={{ color: '#f7e7ce', fontSize: '1.05rem', margin: '24px 0 12px' }}>
                Extracted Checkpoints & Manager Verifications:
              </h4>
              <div className="checkpoints-grid">
                {checkpoints.map((cp) => (
                  <div
                    key={cp.id}
                    className={`checkpoint-card ${
                      cp.status === 'needs_attention'
                        ? 'needs-attention'
                        : cp.status === 'not_ok'
                        ? 'not-ok'
                        : ''
                    }`}
                  >
                    <div className="checkpoint-header">
                      <span className="checkpoint-num-title">
                        #{cp.num}. {cp.name}
                      </span>
                      {cp.status === 'ok' && <CheckCircle2 size={16} color="#10b981" />}
                      {cp.status === 'needs_attention' && <AlertTriangle size={16} color="#f59e0b" />}
                      {cp.status === 'not_ok' && <XCircle size={16} color="#ef4444" />}
                    </div>
                    <div className="checkpoint-desc">{cp.check}</div>

                    <div className="status-toggle-group">
                      <button
                        type="button"
                        className={`status-btn ${cp.status === 'ok' ? 'selected-ok' : ''}`}
                        onClick={() => updateCheckpointStatus(cp.id, 'ok')}
                      >
                        ✓ OK
                      </button>
                      <button
                        type="button"
                        className={`status-btn ${cp.status === 'needs_attention' ? 'selected-attention' : ''}`}
                        onClick={() => updateCheckpointStatus(cp.id, 'needs_attention')}
                      >
                        ⚠ Attention
                      </button>
                      <button
                        type="button"
                        className={`status-btn ${cp.status === 'not_ok' ? 'selected-notok' : ''}`}
                        onClick={() => updateCheckpointStatus(cp.id, 'not_ok')}
                      >
                        ✕ Not OK
                      </button>
                    </div>

                    <input
                      type="text"
                      className="checkpoint-input"
                      placeholder="Remarks / Action required..."
                      value={cp.remarks || ''}
                      onChange={(e) => updateCheckpointRemarks(cp.id, e.target.value)}
                    />

                    {cp.status !== 'ok' && (
                      <button
                        type="button"
                        onClick={() => triggerDefectPhotoCapture(cp.id)}
                        style={{
                          marginTop: '8px',
                          background: 'rgba(212,163,89,0.15)',
                          color: '#d4a359',
                          border: '1px dashed #d4a359',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.72rem',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <Camera size={12} />
                        <span>Upload Defect Photo</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit to Operations Head */}
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="ai-scan-btn"
                  onClick={handleSubmitObservation}
                  disabled={loading}
                >
                  <Send size={16} />
                  <span>{loading ? 'Sending...' : 'Report Observation to Operations Head'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIGITAL 13-POINT CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="manager-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Manager Observation Checklist
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Simple daily / visit checklist to keep the outlet clean, ready, and profitable.
            </p>
          </div>

          <div className="manager-form-row">
            <div>
              <label className="manager-label">Outlet Name</label>
              <input
                type="text"
                className="manager-input"
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
              />
            </div>
            <div>
              <label className="manager-label">Manager Name</label>
              <input
                type="text"
                className="manager-input"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
              />
            </div>
            <div>
              <label className="manager-label">Date & Time</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  className="manager-input"
                  value={observationDate}
                  onChange={(e) => setObservationDate(e.target.value)}
                />
                <input
                  type="text"
                  className="manager-input"
                  value={observationTime}
                  onChange={(e) => setObservationTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="manager-label">Visit Type</label>
              <select
                className="manager-select"
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
              >
                <option value="daily">Daily Morning Check</option>
                <option value="visit">Mid-Day Visit Inspection</option>
                <option value="other">Night Closing Check</option>
              </select>
            </div>
          </div>

          <div className="checkpoints-grid">
            {checkpoints.map((cp) => (
              <div
                key={cp.id}
                className={`checkpoint-card ${
                  cp.status === 'needs_attention'
                    ? 'needs-attention'
                    : cp.status === 'not_ok'
                    ? 'not-ok'
                    : ''
                }`}
              >
                <div className="checkpoint-header">
                  <span className="checkpoint-num-title">
                    #{cp.num}. {cp.name}
                  </span>
                  {cp.status === 'ok' && <CheckCircle2 size={16} color="#10b981" />}
                  {cp.status === 'needs_attention' && <AlertTriangle size={16} color="#f59e0b" />}
                  {cp.status === 'not_ok' && <XCircle size={16} color="#ef4444" />}
                </div>
                <div className="checkpoint-desc">{cp.check}</div>

                <div className="status-toggle-group">
                  <button
                    type="button"
                    className={`status-btn ${cp.status === 'ok' ? 'selected-ok' : ''}`}
                    onClick={() => updateCheckpointStatus(cp.id, 'ok')}
                  >
                    ✓ OK
                  </button>
                  <button
                    type="button"
                    className={`status-btn ${cp.status === 'needs_attention' ? 'selected-attention' : ''}`}
                    onClick={() => updateCheckpointStatus(cp.id, 'needs_attention')}
                  >
                    ⚠ Attention
                  </button>
                  <button
                    type="button"
                    className={`status-btn ${cp.status === 'not_ok' ? 'selected-notok' : ''}`}
                    onClick={() => updateCheckpointStatus(cp.id, 'not_ok')}
                  >
                    ✕ Not OK
                  </button>
                </div>

                <input
                  type="text"
                  className="checkpoint-input"
                  placeholder="Remarks / Action required..."
                  value={cp.remarks || ''}
                  onChange={(e) => updateCheckpointRemarks(cp.id, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="manager-label" style={{ margin: 0 }}>Priority Level:</span>
              <select
                className="manager-select"
                style={{ width: 'auto' }}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority (Urgent)</option>
              </select>
            </div>

            <button
              type="button"
              className="ai-scan-btn"
              onClick={handleSubmitObservation}
              disabled={loading}
            >
              <Check size={16} />
              <span>Submit & Sync with Operations Head</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: ISSUE & ACTION RECORD */}
      {activeTab === 'issues' && (
        <div className="manager-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Manager Issue & Action Record
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Use this register only when there is an issue / problem or any action required.
            </p>
          </div>

          {/* New Issue Form */}
          <form onSubmit={handleCreateIssue} style={{ background: 'rgba(0,0,0,0.35)', padding: '20px', borderRadius: '14px', marginBottom: '28px' }}>
            <h4 style={{ color: '#d4a359', margin: '0 0 14px', fontSize: '0.95rem' }}>
              Log New Outlet Issue
            </h4>

            <div className="manager-form-row">
              <div style={{ gridColumn: 'span 2' }}>
                <label className="manager-label">Issue / Problem Found (Describe in detail) *</label>
                <textarea
                  rows={2}
                  className="manager-textarea"
                  placeholder="e.g. Grinder burr vibration causing inconsistent espresso grind size..."
                  value={newIssueForm.issue_description}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, issue_description: e.target.value })}
                  required
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="manager-label">Action Taken Immediately</label>
                <textarea
                  rows={2}
                  className="manager-textarea"
                  placeholder="e.g. Switched to backup grinder, cleaned burr chamber, informed electrician Anis..."
                  value={newIssueForm.action_taken}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, action_taken: e.target.value })}
                />
              </div>
            </div>

            <div className="manager-form-row">
              <div>
                <label className="manager-label">Vendor Contacted Name</label>
                <input
                  type="text"
                  className="manager-input"
                  placeholder="e.g. Anis (Electrician)"
                  value={newIssueForm.vendor_contacted}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, vendor_contacted: e.target.value })}
                />
              </div>
              <div>
                <label className="manager-label">Vendor Contact Number</label>
                <input
                  type="tel"
                  className="manager-input"
                  placeholder="+91 99533 77152"
                  value={newIssueForm.vendor_contact_phone}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, vendor_contact_phone: e.target.value })}
                />
              </div>
              <div>
                <label className="manager-label">Approved Vendor Used?</label>
                <select
                  className="manager-select"
                  value={newIssueForm.approved_vendor_used ? 'yes' : 'no'}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, approved_vendor_used: e.target.value === 'yes' })}
                >
                  <option value="yes">Yes (Approved Vendor Only)</option>
                  <option value="no">No (Requires OH Approval)</option>
                </select>
              </div>
              <div>
                <label className="manager-label">Resolution Status</label>
                <select
                  className="manager-select"
                  value={newIssueForm.resolution_status}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, resolution_status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="partially_resolved">Partially Resolved</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="manager-form-row">
              <div>
                <label className="manager-label">Pending Work (If Any)</label>
                <input
                  type="text"
                  className="manager-input"
                  placeholder="e.g. Replacement gasket delivery"
                  value={newIssueForm.pending_work}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, pending_work: e.target.value })}
                />
              </div>
              <div>
                <label className="manager-label">Cost / Payment Requirement (₹)</label>
                <input
                  type="number"
                  className="manager-input"
                  placeholder="0"
                  value={newIssueForm.estimated_cost}
                  onChange={(e) =>
                    setNewIssueForm({
                      ...newIssueForm,
                      estimated_cost: e.target.value,
                      cost_required: Number(e.target.value) > 0,
                    })
                  }
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
                <input
                  type="checkbox"
                  id="whatsappSent"
                  checked={newIssueForm.whatsapp_sent_to_oh}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, whatsapp_sent_to_oh: e.target.checked })}
                />
                <label htmlFor="whatsappSent" style={{ fontSize: '0.85rem', color: '#e5dfd8' }}>
                  WhatsApp / Photos sent to Operations Head Bilal
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" className="ai-scan-btn" disabled={loading}>
                <Plus size={16} />
                <span>Save Issue Record</span>
              </button>
            </div>
          </form>

          {/* Existing Issues Table */}
          <h4 style={{ color: '#f7e7ce', margin: '0 0 12px', fontSize: '1rem' }}>
            Registered Issues & Progress ({issuesList.length})
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="manager-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Issue Description</th>
                  <th>Action Taken</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Cost (₹)</th>
                  <th>OH Informed</th>
                </tr>
              </thead>
              <tbody>
                {issuesList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#a89f91' }}>
                      No open issues registered. Outlet running smoothly!
                    </td>
                  </tr>
                ) : (
                  issuesList.map((issue) => (
                    <tr key={issue.id}>
                      <td>{issue.record_date}</td>
                      <td><strong>{issue.issue_description}</strong></td>
                      <td>{issue.action_taken || 'In progress'}</td>
                      <td>{issue.vendor_contacted || 'In-house'}</td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background:
                              issue.resolution_status === 'resolved'
                                ? 'rgba(16,185,129,0.2)'
                                : issue.resolution_status === 'partially_resolved'
                                ? 'rgba(245,158,11,0.2)'
                                : 'rgba(239,68,68,0.2)',
                            color:
                              issue.resolution_status === 'resolved'
                                ? '#34d399'
                                : issue.resolution_status === 'partially_resolved'
                                ? '#fbbf24'
                                : '#f87171',
                          }}
                        >
                          {issue.resolution_status.toUpperCase()}
                        </span>
                      </td>
                      <td>₹{issue.estimated_cost || 0}</td>
                      <td>{issue.whatsapp_sent_to_oh ? '✓ Yes' : 'Pending'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SALES & CASH REGISTERS */}
      {activeTab === 'cash' && (
        <div className="manager-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Sales, Counter Withdrawals & Staff Consumptions
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Accurate records for cash counter reconciliation and zero kitchen wastage.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {/* 1. Counter Cash Withdrawal */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px' }}>
              <h4 style={{ color: '#d4a359', margin: '0 0 12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} /> Counter Cash Withdrawal Entry
              </h4>
              <form onSubmit={handleAddWithdrawal}>
                <div style={{ marginBottom: '10px' }}>
                  <label className="manager-label">Reason / Item Details *</label>
                  <input
                    type="text"
                    className="manager-input"
                    placeholder="e.g. Milk & dairy delivery cash settlement"
                    value={newWithdrawal.reason}
                    onChange={(e) => setNewWithdrawal({ ...newWithdrawal, reason: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="manager-label">Amount (₹) *</label>
                    <input
                      type="number"
                      className="manager-input"
                      placeholder="0"
                      value={newWithdrawal.amount}
                      onChange={(e) => setNewWithdrawal({ ...newWithdrawal, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="manager-label">Paid To / Vendor *</label>
                    <input
                      type="text"
                      className="manager-input"
                      placeholder="e.g. Amul Vendor"
                      value={newWithdrawal.paid_to}
                      onChange={(e) => setNewWithdrawal({ ...newWithdrawal, paid_to: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="ai-scan-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  Log Cash Withdrawal
                </button>
              </form>

              <h5 style={{ color: '#e5dfd8', margin: '18px 0 8px', fontSize: '0.85rem' }}>Recent Withdrawals:</h5>
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {withdrawals.slice(0, 4).map((w) => (
                  <div key={w.id} className="photo-proof-item">
                    <div>
                      <strong style={{ fontSize: '0.84rem' }}>{w.reason}</strong>
                      <span style={{ fontSize: '0.74rem', color: '#a89f91', display: 'block' }}>
                        Paid to: {w.paid_to} · {w.withdrawal_date}
                      </span>
                    </div>
                    <span style={{ color: '#d4a359', fontWeight: 700 }}>₹{w.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Staff Consumption Register */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px' }}>
              <h4 style={{ color: '#d4a359', margin: '0 0 12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coffee size={18} /> Staff Consumption Register
              </h4>
              <form onSubmit={handleAddConsumption}>
                <div style={{ marginBottom: '10px' }}>
                  <label className="manager-label">Item / Beverage Name *</label>
                  <input
                    type="text"
                    className="manager-input"
                    value={newConsumption.item_name}
                    onChange={(e) => setNewConsumption({ ...newConsumption, item_name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="manager-label">Consumed By (Staff Name) *</label>
                    <input
                      type="text"
                      className="manager-input"
                      placeholder="e.g. Rahul"
                      value={newConsumption.consumed_by}
                      onChange={(e) => setNewConsumption({ ...newConsumption, consumed_by: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="manager-label">Amount Worth (₹)</label>
                    <input
                      type="number"
                      className="manager-input"
                      value={newConsumption.amount_worth}
                      onChange={(e) => setNewConsumption({ ...newConsumption, amount_worth: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="ai-scan-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  Log Staff Drink / Food
                </button>
              </form>

              <h5 style={{ color: '#e5dfd8', margin: '18px 0 8px', fontSize: '0.85rem' }}>Recent Consumptions:</h5>
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {staffConsumptions.slice(0, 4).map((c) => (
                  <div key={c.id} className="photo-proof-item">
                    <div>
                      <strong style={{ fontSize: '0.84rem' }}>{c.item_name}</strong>
                      <span style={{ fontSize: '0.74rem', color: '#a89f91', display: 'block' }}>
                        Consumed by: {c.consumed_by} ({c.designation})
                      </span>
                    </div>
                    <span style={{ color: '#a89f91', fontWeight: 600 }}>₹{c.amount_worth}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EMERGENCY & STORE DIRECTORY */}
      {activeTab === 'contacts' && (
        <div className="manager-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
              Store Emergency & Important Information
            </h3>
            <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
              Keep this sheet updated at all times. In emergency or police inspection, follow escalation rules.
            </p>
          </div>

          <div className="emergency-grid">
            <div className="emergency-card critical">
              <div>
                <strong style={{ color: '#f87171', display: 'block' }}>Police Emergency</strong>
                <span style={{ fontSize: '0.84rem', color: '#a89f91' }}>National Emergency Helpline</span>
              </div>
              <a href="tel:112" className="call-btn" style={{ background: '#ef4444' }}>
                <Phone size={14} /> 112
              </a>
            </div>

            <div className="emergency-card critical">
              <div>
                <strong style={{ color: '#f87171', display: 'block' }}>Fire Brigade</strong>
                <span style={{ fontSize: '0.84rem', color: '#a89f91' }}>Emergency Response</span>
              </div>
              <a href="tel:101" className="call-btn" style={{ background: '#ef4444' }}>
                <Phone size={14} /> 101
              </a>
            </div>

            <div className="emergency-card critical">
              <div>
                <strong style={{ color: '#f87171', display: 'block' }}>Ambulance</strong>
                <span style={{ fontSize: '0.84rem', color: '#a89f91' }}>Medical Services</span>
              </div>
              <a href="tel:102" className="call-btn" style={{ background: '#ef4444' }}>
                <Phone size={14} /> 102
              </a>
            </div>

            <div className="emergency-card">
              <div>
                <strong style={{ color: '#d4a359', display: 'block' }}>Bilal (Operations Head)</strong>
                <span style={{ fontSize: '0.84rem', color: '#a89f91' }}>Best Time: 10:00 AM – 7:00 PM</span>
              </div>
              <a href="https://wa.me/918527976791" target="_blank" rel="noreferrer" className="call-btn">
                <Phone size={14} /> WhatsApp
              </a>
            </div>

            <div className="emergency-card">
              <div>
                <strong style={{ color: '#d4a359', display: 'block' }}>Electrician (Anis)</strong>
                <span style={{ fontSize: '0.84rem', color: '#a89f91' }}>Approved Store Electrician</span>
              </div>
              <a href="tel:9953377152" className="call-btn">
                <Phone size={14} /> 99533 77152
              </a>
            </div>

            <div className="emergency-card">
              <div>
                <strong style={{ color: '#d4a359', display: 'block' }}>Janu Bhai (Founder)</strong>
                <span style={{ fontSize: '0.84rem', color: '#a89f91' }}>Leadership & Escalation</span>
              </div>
              <a href="https://wa.me/918527976791" target="_blank" rel="noreferrer" className="call-btn">
                <Phone size={14} /> Contact
              </a>
            </div>
          </div>

          {/* Legal and License info */}
          <div style={{ marginTop: '28px', background: 'rgba(0,0,0,0.35)', padding: '20px', borderRadius: '14px' }}>
            <h4 style={{ color: '#d4a359', margin: '0 0 14px', fontSize: '1rem' }}>
              License & Shop Registration Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#a89f91' }}>FSSAI Registration No.</span>
                <strong style={{ display: 'block', color: '#f5f0eb' }}>23326010002405</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#a89f91' }}>GSTIN</span>
                <strong style={{ display: 'block', color: '#f5f0eb' }}>07AAXFJ0386M1ZK</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#a89f91' }}>Udyam Registration No.</span>
                <strong style={{ display: 'block', color: '#f5f0eb' }}>UDYAM-DL-10-0124874</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#a89f91' }}>Shop Address</span>
                <strong style={{ display: 'block', color: '#f5f0eb' }}>Shop 16, Building A1-16, Gafoor Nagar, Okhla / Kalkaji Delhi 110025</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: EVENTS & RSVPs (VIEW-ONLY FOR MANAGERS) */}
      {activeTab === 'events' && (
        <div className="manager-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#f7e7ce', margin: '0 0 6px' }}>
                Upcoming Events & Guest RSVPs
              </h3>
              <p style={{ color: '#a89f91', fontSize: '0.88rem', margin: 0 }}>
                View-only event roster created by Growth & Operations. Keep outlet seating and baristas prepped!
              </p>
            </div>
            <span className="manager-badge">Manager View-Only Mode</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
            {eventsList.map((event) => (
              <div
                key={event.id}
                style={{
                  background: 'rgba(36, 26, 19, 0.7)',
                  border: '1px solid rgba(212, 163, 89, 0.25)',
                  borderRadius: '14px',
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span
                    style={{
                      background: 'rgba(212, 163, 89, 0.2)',
                      color: '#d4a359',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {event.event_type}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>
                    {event.rsvp_count || 0} / {event.capacity} Confirmed
                  </span>
                </div>

                <h4 style={{ color: '#f5f0eb', margin: '0 0 4px', fontSize: '1.05rem' }}>
                  {event.title}
                </h4>
                {event.featuring_name && (
                  <p style={{ color: '#d4a359', fontSize: '0.82rem', margin: '0 0 8px', fontWeight: 600 }}>
                    Featuring: {event.featuring_name}
                  </p>
                )}

                <div style={{ fontSize: '0.8rem', color: '#a89f91', marginBottom: '12px', lineHeight: 1.4 }}>
                  📅 {event.event_date} · ⏰ {event.start_time} - {event.end_time || 'Late'}<br />
                  📍 {event.location_name}
                </div>

                {/* RSVP Guest Roster */}
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#d4a359', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    RSVP Guest Roster (Non-Editable):
                  </span>
                  {event.event_rsvps && event.event_rsvps.length > 0 ? (
                    <div style={{ maxHeight: '110px', overflowY: 'auto' }}>
                      {event.event_rsvps.map((rsvp) => (
                        <div key={rsvp.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#e5dfd8', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span>{rsvp.customer_name} ({rsvp.guest_count} guests)</span>
                          <span style={{ color: '#34d399' }}>Confirmed</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: '#a89f91' }}>No RSVPs yet.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
