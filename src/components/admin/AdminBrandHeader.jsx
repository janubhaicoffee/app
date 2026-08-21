'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Store, Globe, ChevronDown, UserCheck, Shield, Sparkles, Building2 } from 'lucide-react';

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
  const [userRole, setUserRole] = useState('superadmin');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [canSwitchOutlets, setCanSwitchOutlets] = useState(false);
  const [outletsList, setOutletsList] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const siteUrls = getSiteUrls();

  useEffect(() => {
    const fetchAdminContext = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        // 1. Fetch role info from admin check
        const checkRes = await fetch('/api/admin/data?type=check', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        let role = 'superadmin';
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.role) {
            role = checkData.role;
            setUserRole(checkData.role);
          }
        }

        // 2. Fetch outlets list
        const res = await fetch(`/api/pos/outlets?userId=${session.user.id}`);
        if (res.ok) {
          const body = await res.json();
          const outlets = body.data || [];
          setOutletsList(outlets);

          const isSuper = !!body.isSuperAdmin || ['superadmin', 'owner'].includes(role);
          setIsSuperAdmin(isSuper);

          const canSwitch =
            isSuper ||
            ['operations_head', 'operations', 'operation_manager', 'operations_manager', 'area_manager', 'growth', 'brand_leader', 'manager', 'store_manager'].includes(role) ||
            outlets.length > 0;
          setCanSwitchOutlets(canSwitch);

          const storedId = sessionStorage.getItem('selected_outlet_id');
          if (storedId && outlets.some((o) => o.id === storedId)) {
            setSelectedOutletId(storedId);
          } else if (outlets.length > 0) {
            setSelectedOutletId(outlets[0].id);
            if (!storedId) sessionStorage.setItem('selected_outlet_id', outlets[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch admin brand header data:', err);
      }
    };

    fetchAdminContext();
  }, []);

  const handleOutletChange = (e) => {
    const newId = e.target.value;
    if (newId === 'all-outlets' || newId === 'create-new') {
      window.location.href = `${siteUrls.admin}/outlets`;
      return;
    }
    sessionStorage.setItem('selected_outlet_id', newId);
    setSelectedOutletId(newId);
    window.location.reload();
  };

  const getRoleBadge = () => {
    if (['superadmin', 'owner'].includes(userRole)) {
      return { label: 'Super Admin', icon: <Shield size={12} color="#d89a1e" />, color: '#d89a1e' };
    }
    if (['operations_head', 'operations', 'operations_manager', 'operation_manager', 'area_manager'].includes(userRole)) {
      return { label: 'Operations Head', icon: <Shield size={12} color="#fbbf24" />, color: '#fbbf24' };
    }
    if (['growth', 'brand_leader'].includes(userRole)) {
      return { label: 'Growth & Strategy', icon: <Sparkles size={12} color="#f472b6" />, color: '#f472b6' };
    }
    if (['manager', 'store_manager'].includes(userRole)) {
      return { label: 'Store Manager', icon: <Store size={12} color="#60a5fa" />, color: '#60a5fa' };
    }
    return { label: userRole.replace('_', ' '), icon: <UserCheck size={12} color="#d89a1e" />, color: '#d89a1e' };
  };

  const roleBadge = getRoleBadge();

  return (
    <div
      className="admin-brand-header"
      style={{
        padding: '1.25rem 1rem 0.85rem',
        borderBottom: '1px solid rgba(245, 240, 234, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      {/* 1. Prominent Logo & Brand Presentation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(216, 154, 30, 0.25) 0%, rgba(58, 36, 31, 0.9) 100%)',
            border: '1.5px solid rgba(216, 154, 30, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            flexShrink: 0,
          }}
        >
          <img
            src="/logo.png"
            alt="Janu Bhai Coffee"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: '1.15rem',
              fontWeight: 800,
              fontFamily: 'var(--font-playfair, serif)',
              color: 'var(--accent-gold, #d89a1e)',
              letterSpacing: '0.5px',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            JANU BHAI
          </h2>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'var(--text-secondary, #cbb9a8)',
              lineHeight: 1,
            }}
          >
            Roastery Command
          </p>
        </div>
      </div>

      {/* 2. Workspace & Outlet Control Toggles (For Superadmin, Operations Head, Growth, Store Managers) */}
      {canSwitchOutlets && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '0.6rem',
            borderRadius: '10px',
            border: '1px solid rgba(245, 240, 234, 0.08)',
          }}
        >
          {/* Row 1: Workspace / Portal Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', width: '100%' }}>
            <div
              style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Globe
                size={13}
                color="var(--accent-gold, #d89a1e)"
                style={{ position: 'absolute', left: '8px', pointerEvents: 'none', zIndex: 1 }}
              />
              <select
                value={siteUrls.admin}
                onChange={(e) => {
                  window.location.href = e.target.value;
                }}
                style={{
                  width: '100%',
                  padding: '5px 8px 5px 26px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  borderRadius: '6px',
                  border: '1px solid rgba(216, 154, 30, 0.3)',
                  background: 'rgba(30, 18, 16, 0.9)',
                  color: 'var(--accent-gold, #d89a1e)',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                <option value={siteUrls.admin} style={{ background: '#1e1210', color: '#f5f0ea' }}>
                  ADMIN HQ
                </option>
                <option value={siteUrls.outlet} style={{ background: '#1e1210', color: '#f5f0ea' }}>
                  OUTLET DESK
                </option>
                <option value={siteUrls.pos} style={{ background: '#1e1210', color: '#f5f0ea' }}>
                  POS REGISTER
                </option>
              </select>
              <ChevronDown
                size={12}
                color="var(--accent-gold, #d89a1e)"
                style={{ position: 'absolute', right: '8px', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Row 2: Outlet / Branch Switcher */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
            <Store
              size={13}
              color="var(--text-secondary, #cbb9a8)"
              style={{ position: 'absolute', left: '8px', pointerEvents: 'none', zIndex: 1 }}
            />
            <select
              value={selectedOutletId}
              onChange={handleOutletChange}
              style={{
                width: '100%',
                padding: '5px 22px 5px 26px',
                fontSize: '0.74rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid rgba(245, 240, 234, 0.15)',
                background: 'rgba(20, 12, 10, 0.85)',
                color: 'var(--text-primary, #f5f0ea)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {outletsList.length > 1 && (
                <option value="all-outlets" style={{ background: '#1e1210', color: '#d89a1e', fontWeight: 700 }}>
                  🏢 ALL OUTLETS (OVERVIEW)
                </option>
              )}
              {outletsList.map((o) => (
                <option key={o.id} value={o.id} style={{ background: '#1e1210', color: '#f5f0ea' }}>
                  📍 {o.name.toUpperCase()} {o.code ? `(${o.code})` : ''}
                </option>
              ))}
              {isSuperAdmin && (
                <option value="create-new" style={{ background: '#1e1210', color: '#69f0ae', fontWeight: 700 }}>
                  ➕ MANAGE / ADD OUTLETS
                </option>
              )}
            </select>
            <ChevronDown
              size={12}
              color="var(--text-secondary, #cbb9a8)"
              style={{ position: 'absolute', right: '8px', pointerEvents: 'none' }}
            />
          </div>

          {/* Row 3: Role Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(216, 154, 30, 0.12)',
              border: `1px solid ${roleBadge.color}40`,
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: roleBadge.color,
            }}
          >
            {roleBadge.icon}
            <span>{roleBadge.label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
