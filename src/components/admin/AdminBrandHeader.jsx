'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const getSiteUrls = () => {
  if (typeof window === 'undefined') return { admin: '/admin', outlet: '/outlet', pos: '/pos' };
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;

  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const base = `${protocol}//${hostname}${port ? ':' + port : ''}`;
    return {
      admin: `${base}/admin`,
      outlet: `${base}/outlet`,
      pos: `${base}/pos`,
    };
  } else {
    return {
      admin: 'https://admin.janubhai.com',
      outlet: 'https://outlet.janubhai.com',
      pos: 'https://pos.janubhai.com',
    };
  }
};

export default function AdminBrandHeader() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [outletsList, setOutletsList] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const siteUrls = getSiteUrls();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        try {
          const res = await fetch(`/api/pos/outlets?userId=${session.user.id}`);
          if (res.ok) {
            const body = await res.json();
            setOutletsList(body.data || []);
            setIsSuperAdmin(!!body.isSuperAdmin);

            const storedId = sessionStorage.getItem('selected_outlet_id');
            if (storedId) {
              setSelectedOutletId(storedId);
            } else if (body.data && body.data.length > 0) {
              setSelectedOutletId(body.data[0].id);
            }
          }
        } catch (err) {
          console.error('Failed to fetch outlets in admin header:', err);
        }
      }
    };
    fetchData();
  }, []);

  const handleOutletChange = (e) => {
    const newId = e.target.value;
    if (newId === 'create-new') {
      window.location.href = `${siteUrls.admin}/outlets`;
      return;
    }
    sessionStorage.setItem('selected_outlet_id', newId);
    setSelectedOutletId(newId);
    window.location.reload();
  };

  return (
    <div
      className="admin-brand-header"
      style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="/logo.png"
            alt="Janu Bhai Logo"
            style={{ width: '36px', height: '36px', objectFit: 'contain' }}
          />
          {!isSuperAdmin && (
            <div className="brand-text-container">
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Janu Bhai
              </h2>
              <p style={{ fontSize: '11px', margin: 0, opacity: 0.7, color: '#ffffff' }}>
                Admin Portal
              </p>
            </div>
          )}
        </div>

        {isSuperAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Site Switcher */}
            <select
              value={siteUrls.admin}
              onChange={(e) => {
                window.location.href = e.target.value;
              }}
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: '700',
                borderRadius: '8px',
                border: '1px solid rgba(245, 240, 234, 0.15)',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'var(--accent-gold, #d89a1e)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={siteUrls.admin} style={{ background: '#1e1210', color: '#f5f0ea' }}>ADMIN</option>
              <option value={siteUrls.outlet} style={{ background: '#1e1210', color: '#f5f0ea' }}>OUTLET</option>
              <option value={siteUrls.pos} style={{ background: '#1e1210', color: '#f5f0ea' }}>POS</option>
            </select>

            {/* Outlet Switcher */}
            <select
              value={selectedOutletId}
              onChange={handleOutletChange}
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: '700',
                borderRadius: '8px',
                border: '1px solid rgba(245, 240, 234, 0.15)',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'var(--text-primary, #f5f0ea)',
                outline: 'none',
                cursor: 'pointer',
                maxWidth: '120px',
              }}
            >
              <option value="create-new" style={{ background: '#1e1210', color: '#f5f0ea' }}>➕ CREATE NEW</option>
              {outletsList.map((o) => (
                <option key={o.id} value={o.id} style={{ background: '#1e1210', color: '#f5f0ea' }}>
                  {o.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
