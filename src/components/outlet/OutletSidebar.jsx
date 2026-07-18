'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Settings,
  ChevronDown,
  ChevronLeft,
  LogOut,
  Coffee,
  TrendingUp,
  Receipt,
  ClipboardList,
  Menu,
  X,
  FileText,
  Store,
  Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navItems = [
  {
    section: 'Main',
    items: [
      { href: '/outlet/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/outlet/outlets', label: 'Manage Outlets', icon: Store }
    ],
  },
  {
    section: 'Analytics',
    items: [
      { href: '/outlet/analytics/sales', label: 'Sales Analytics', icon: TrendingUp },
      { href: '/outlet/analytics/financial', label: 'Financial Analytics', icon: BarChart3 },
    ],
  },
  {
    section: 'Operations',
    items: [
      { href: '/outlet/operations/inventory', label: 'Inventory', icon: Package },
      { href: '/outlet/operations/expenses', label: 'Expenses', icon: DollarSign },
      { href: '/outlet/operations/staff', label: 'Staff', icon: Users },
      { href: '/outlet/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    section: 'Financials',
    items: [
      { href: '/outlet/financials/pnl', label: 'Profit & Loss', icon: Receipt },
      { href: '/outlet/financials/commissions', label: 'Commissions', icon: DollarSign },
    ],
  },
  {
    section: 'POS Management',
    items: [
      { href: '/outlet/pos-management/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/outlet/pos-management/menu', label: 'Menu', icon: ClipboardList },
    ],
  },
  {
    section: 'Reports',
    items: [{ href: '/outlet/reports/daily', label: 'Daily Report', icon: FileText }],
  },
  {
    section: 'Settings',
    items: [{ href: '/outlet/settings', label: 'Settings', icon: Settings }],
  },
];

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
export default function OutletSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [outletName, setOutletName] = useState('');
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [outletsList, setOutletsList] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [impersonatedStaffId, setImpersonatedStaffId] = useState('self');
  const [activeRole, setActiveRole] = useState('superuser');

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserName(session.user.email?.split('@')[0] || 'User');

        try {
          const roleRes = await fetch('/api/auth/check-role', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (roleRes.ok) {
            const roleData = await roleRes.json();
            if (!sessionStorage.getItem('impersonated_role')) {
              const realRole = roleData.role === 'superadmin' ? 'superuser' : (roleData.staffRole || 'staff');
              setActiveRole(realRole);
              sessionStorage.setItem('impersonated_role', realRole);
            }
          }
        } catch (err) {
          console.error('Failed to fetch role in sidebar:', err);
        }

        try {
          const res = await fetch(`/api/pos/outlets?userId=${session.user.id}`);
          if (res.ok) {
            const body = await res.json();
            const list = body.data || [];
            setOutletsList(list);
            setIsSuperAdmin(!!body.isSuperAdmin);

            let storedId = sessionStorage.getItem('selected_outlet_id');
            let activeId = '';
            if (storedId && list.some((o) => o.id === storedId)) {
              setSelectedOutletId(storedId);
              activeId = storedId;
              const activeOutlet = list.find((o) => o.id === storedId);
              setOutletName(activeOutlet.name);
            } else if (list.length > 0) {
              const defaultId = list[0].id;
              sessionStorage.setItem('selected_outlet_id', defaultId);
              setSelectedOutletId(defaultId);
              activeId = defaultId;
              setOutletName(list[0].name);
              // Trigger a reload so all other pages on first load can read the newly set selected_outlet_id
              window.location.reload();
            }

            if (body.isSuperAdmin && activeId) {
              try {
                const staffRes = await fetch(`/api/outlet/staff?outletId=${activeId}`);
                if (staffRes.ok) {
                  const staffBody = await staffRes.json();
                  setStaffList(staffBody.data || []);
                }
              } catch (err) {
                console.error('Failed to query staff list:', err);
              }
            }
          }
        } catch (err) {
          console.error('Failed to query outlets in sidebar:', err);
        }
      }
    };
    fetchData();

    if (typeof window !== 'undefined') {
      const impId = sessionStorage.getItem('impersonated_staff_id') || 'self';
      const impRole = sessionStorage.getItem('impersonated_role') || 'superuser';
      setImpersonatedStaffId(impId);
      setActiveRole(impRole);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login?redirect=/outlet');
  };

  const handleOutletChange = (e) => {
    const newId = e.target.value;
    if (newId === 'create-new') {
      router.push('/outlet/outlets');
      return;
    }
    sessionStorage.setItem('selected_outlet_id', newId);
    setSelectedOutletId(newId);
    const activeOutlet = outletsList.find((o) => o.id === newId);
    if (activeOutlet) setOutletName(activeOutlet.name);
    window.location.reload();
  };

  const handleStaffChange = (e) => {
    const value = e.target.value;
    if (value === 'self') {
      sessionStorage.removeItem('impersonated_staff_id');
      sessionStorage.removeItem('impersonated_role');
      setImpersonatedStaffId('self');
      setActiveRole('superuser');
    } else {
      const staffMember = staffList.find((s) => s.id === value);
      if (staffMember) {
        sessionStorage.setItem('impersonated_staff_id', staffMember.id);
        sessionStorage.setItem('impersonated_role', staffMember.role);
        setImpersonatedStaffId(staffMember.id);
        setActiveRole(staffMember.role);
      }
    }
    window.location.reload();
  };

  const getFilteredNavItems = (role) => {
    if (!role || ['superuser', 'manager', 'superadmin', 'owner', 'partner'].includes(role)) {
      return navItems;
    }
    const restrictedSections = ['Analytics', 'Operations', 'Financials', 'Settings'];
    return navItems.filter((group) => !restrictedSections.includes(group.section));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };
  const sidebarContent = (
    <>
      <div className="outlet-sidebar-header" style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          {/* LEFT PILL: Logo + Role text */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #2a1a17, #1f1210)', padding: '8px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <img src="/logo.png" alt="Janu Bhai Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>{isSuperAdmin ? 'ADMIN:' : 'ROLE:'}</span>
              <span style={{ fontSize: '12px', color: '#F8F1E4', fontWeight: 'bold' }}>{isSuperAdmin ? 'SELF' : activeRole.toUpperCase()}</span>
            </div>
            {isSuperAdmin && <span style={{ marginLeft: 'auto', paddingRight: '4px' }}>👑</span>}
          </div>

          {/* RIGHT COLUMN: Time + Site Switcher */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', color: 'var(--accent-gold)', fontSize: '13px', fontWeight: 'bold' }}>
              <Clock size={12} /> <span>{currentTime || '...'}</span>
            </div>
            {/* Site Switcher Select */}
            {(isSuperAdmin || activeRole === 'owner' || activeRole === 'partner') && (
              <select
                value={getSiteUrls().outlet}
                onChange={(e) => { window.location.href = e.target.value; }}
                style={{
                  padding: '6px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '30px',
                  border: '1px solid rgba(255, 215, 0, 0.3)', background: 'linear-gradient(135deg, #2a1a17, #1a0f0d)',
                  color: '#F8F1E4', outline: 'none', cursor: 'pointer', appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffb300' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center'
                }}
              >
                <option value={getSiteUrls().outlet}>OUTLET</option>
                {isSuperAdmin && <option value={getSiteUrls().admin}>ADMIN</option>}
                <option value={getSiteUrls().pos}>POS</option>
              </select>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: Staff Switcher + Outlet Switcher */}
        {isSuperAdmin && (
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            {/* Staff Switcher */}
            <select
              value={impersonatedStaffId}
              onChange={handleStaffChange}
              style={{
                flex: 1, padding: '6px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '30px',
                border: '1px solid rgba(255, 215, 0, 0.3)', background: 'linear-gradient(135deg, #3a221f, #221411)',
                color: '#F8F1E4', outline: 'none', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffb300' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
                width: '50%', textOverflow: 'ellipsis', overflow: 'hidden'
              }}
            >
              <option value="self">👑 SELF</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  👤 {s.display_name.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Outlet Switcher / Create New */}
            <select
              value={selectedOutletId}
              onChange={handleOutletChange}
              style={{
                flex: 1, padding: '6px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '30px',
                border: '1px solid rgba(255, 215, 0, 0.3)', background: 'linear-gradient(135deg, #3a221f, #221411)',
                color: '#F8F1E4', outline: 'none', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffb300' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
                width: '50%', textOverflow: 'ellipsis', overflow: 'hidden'
              }}
            >
              <option value="create-new">＋ CREATE NEW</option>
              {outletsList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isSuperAdmin && (
          <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
            {outletsList.length > 1 ? (
              <select
                value={selectedOutletId}
                onChange={handleOutletChange}
                style={{
                  flex: 1, padding: '6px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '30px',
                  border: '1px solid rgba(255, 215, 0, 0.3)', background: 'linear-gradient(135deg, #3a221f, #221411)',
                  color: '#F8F1E4', outline: 'none', cursor: 'pointer', appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffb300' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                  width: '100%', textOverflow: 'ellipsis', overflow: 'hidden'
                }}
              >
                {outletsList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name.toUpperCase()}
                  </option>
                ))}
              </select>
            ) : outletName ? (
              <div style={{ 
                flex: 1, padding: '6px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '30px', 
                border: '1px solid rgba(255, 215, 0, 0.3)', background: 'linear-gradient(135deg, #3a221f, #221411)', 
                color: '#F8F1E4', display: 'flex', alignItems: 'center', gap: '6px' 
              }}>
                <Store size={14} color="var(--accent-gold)" />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{outletName.toUpperCase()}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <nav className="outlet-sidebar-nav">
        {getFilteredNavItems(activeRole).map((group) => (
          <div key={group.section} className="outlet-sidebar-group">
            <button
              className="outlet-sidebar-section-toggle"
              onClick={() => toggleSection(group.section)}
            >
              <span className="outlet-sidebar-section-label">{group.section}</span>
              <ChevronDown
                size={14}
                className={`outlet-sidebar-chevron ${expandedSections[group.section] !== false ? 'open' : ''}`}
              />
            </button>
            <div
              className={`outlet-sidebar-items ${expandedSections[group.section] === false ? 'collapsed' : ''}`}
            >
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`outlet-sidebar-link ${active ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="outlet-sidebar-footer">
        <div className="outlet-sidebar-user">
          <div className="outlet-sidebar-user-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="outlet-sidebar-user-info">
            <span className="outlet-sidebar-user-name">{userName}</span>
            <span className="outlet-sidebar-user-role">Manager</span>
          </div>
        </div>
        <button
          className="outlet-sidebar-logout"
          onClick={handleLogout}
          title="Logout"
          data-testid="btn-logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </>
  );

  return (
    <>
      <button className="outlet-mobile-menu-btn" onClick={() => setMobileOpen(true)}>
        <Menu size={24} />
      </button>

      <div
        className={`outlet-mobile-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={`outlet-mobile-sidebar ${mobileOpen ? 'open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="outlet-mobile-close" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
          {sidebarContent}
        </div>
      </div>

      <aside className="outlet-sidebar">{sidebarContent}</aside>

      <style jsx global>{`
        .outlet-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background: var(--primary-color, #3e2723);
          color: #e0e0e0;
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow: hidden;
          border-right: 1px solid var(--border-color, #d7ccc8);
        }
        .outlet-sidebar-header {
          padding: 20px 16px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .outlet-sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .outlet-sidebar-brand svg {
          color: var(--accent-gold, #ffb300);
        }
        .outlet-sidebar-brand-text {
          display: flex;
          flex-direction: column;
        }
        .outlet-sidebar-title {
          font-family: var(--font-playfair), serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--accent-gold, #ffb300);
          line-height: 1.2;
        }
        .outlet-sidebar-subtitle {
          font-size: 11px;
          color: #ccc;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .outlet-sidebar-outlet-name {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #fff;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          margin-bottom: 8px;
        }
        .outlet-sidebar-outlet-name svg {
          color: var(--accent-gold, #ffb300);
          flex-shrink: 0;
        }
        .outlet-sidebar-selector {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #fff;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          margin-bottom: 8px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .outlet-sidebar-selector svg {
          color: var(--accent-gold, #ffb300);
          flex-shrink: 0;
        }
        .outlet-select-dropdown {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          width: 100%;
          outline: none;
          cursor: pointer;
        }
        .outlet-select-dropdown option {
          background: var(--primary-color, #3e2723);
          color: #fff;
        }
        .outlet-sidebar-time {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          font-variant-numeric: tabular-nums;
        }
        .outlet-sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 12px 0;
        }
        .outlet-sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        .outlet-sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .outlet-sidebar-group {
          margin-bottom: 4px;
        }
        .outlet-sidebar-section-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.4);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          font-weight: 700;
        }
        .outlet-sidebar-section-toggle:hover {
          color: #fff;
        }
        .outlet-sidebar-chevron {
          transition: transform 0.2s;
        }
        .outlet-sidebar-chevron.open {
          transform: rotate(0deg);
        }
        .outlet-sidebar-items {
          overflow: hidden;
          max-height: 500px;
          transition: max-height 0.3s ease;
        }
        .outlet-sidebar-items.collapsed {
          max-height: 0;
        }
        .outlet-sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px 10px 24px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 14px;
          transition: all 0.15s;
          border-left: 3px solid transparent;
          position: relative;
        }
        .outlet-sidebar-link:hover {
          color: var(--accent-gold, #ffb300);
          background: rgba(255, 255, 255, 0.06);
        }
        .outlet-sidebar-link.active {
          color: var(--accent-gold, #ffb300);
          background: rgba(255, 255, 255, 0.15);
          border-left-color: var(--accent-gold, #ffb300);
          font-weight: 600;
        }
        .outlet-sidebar-link.active::before {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: var(--accent-gold, #ffb300);
          border-radius: 0 4px 4px 0;
        }
        .outlet-sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .outlet-sidebar-user {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .outlet-sidebar-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-gold, #ffb300);
          color: var(--primary-color, #3e2723);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
        }
        .outlet-sidebar-user-info {
          display: flex;
          flex-direction: column;
        }
        .outlet-sidebar-user-name {
          font-size: 13px;
          color: #e0e0e0;
          font-weight: 600;
        }
        .outlet-sidebar-user-role {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }
        .outlet-sidebar-logout {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: rgba(255, 255, 255, 0.6);
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .outlet-sidebar-logout:hover {
          background: rgba(255, 107, 107, 0.1);
          color: #ff6b6b;
        }
        .outlet-mobile-menu-btn {
          display: none;
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 200;
          background: var(--primary-color, #3e2723);
          color: #fff;
          border: 1px solid var(--border-color, #d7ccc8);
          width: 40px;
          height: 40px;
          border-radius: 8px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .outlet-mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 300;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        .outlet-mobile-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
        .outlet-mobile-sidebar {
          width: 280px;
          height: 100vh;
          height: 100dvh;
          background: var(--primary-color, #3e2723);
          position: relative;
          border-right: 1px solid var(--border-color, #d7ccc8);
          transform: translateX(-100%);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          overscroll-behavior: contain;
          overflow-y: auto;
        }
        .outlet-mobile-sidebar.open {
          transform: translateX(0);
        }
        .outlet-mobile-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
        }
        @media (max-width: 768px) {
          .outlet-sidebar {
            display: none;
          }
          .outlet-mobile-menu-btn {
            display: flex;
          }
        }
        @media (min-width: 769px) {
          .outlet-mobile-overlay {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
