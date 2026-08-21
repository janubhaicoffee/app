'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  LogOut,
  Tag,
  Star,
  BarChart3,
  Image as ImageIcon,
  Truck,
  Shield,
  Store,
  ClipboardList,
  Building2,
  DollarSign,
  Activity,
  ArrowLeftRight,
  ClipboardCheck,
  Camera,
  ShoppingBag,
  Calendar,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SidebarNav() {
  const [pendingOrders, setPendingOrders] = useState(0);
  const [userRole, setUserRole] = useState('superadmin'); // default until loaded
  const [roleLoaded, setRoleLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchAdminContext = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch role & check
        const checkRes = await fetch('/api/admin/data?type=check', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.role) {
            setUserRole(checkData.role);
          }
        }
        setRoleLoaded(true);

        // Fetch orders count
        const ordersRes = await fetch('/api/admin/data?type=orders', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (ordersRes.ok) {
          const json = await ordersRes.json();
          const pendingCount = (json.data || []).filter((o) => o.status === 'pending').length;
          setPendingOrders(pendingCount);
        }
      } catch (err) {
        setRoleLoaded(true);
      }
    };

    fetchAdminContext();
    const interval = setInterval(fetchAdminContext, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => pathname === path || (path !== '/admin' && pathname?.startsWith(path));

  const isSuperAdmin = ['superadmin', 'owner'].includes(userRole);
  const isOperations = isSuperAdmin || ['operations_head', 'operations', 'operation_manager', 'operations_manager', 'area_manager'].includes(userRole);
  const isGrowth = isSuperAdmin || ['growth', 'brand_leader'].includes(userRole);
  const isManager = isSuperAdmin || ['manager', 'store_manager'].includes(userRole);

  const getRoleBadgeInfo = () => {
    if (isSuperAdmin) {
      return { label: 'Super Admin', icon: <Shield size={12} />, color: 'var(--accent-gold, #d89a1e)', bg: 'rgba(216, 154, 30, 0.15)', border: 'rgba(216, 154, 30, 0.3)' };
    }
    if (['operations_head', 'operations', 'operation_manager', 'operations_manager', 'area_manager'].includes(userRole)) {
      return { label: 'Operations Head', icon: <Shield size={12} />, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
    }
    if (userRole === 'growth' || userRole === 'brand_leader') {
      return { label: 'Growth & Strategy', icon: <Sparkles size={12} />, color: '#f472b6', bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.3)' };
    }
    if (userRole === 'manager' || userRole === 'store_manager') {
      return { label: 'Store Manager', icon: <Store size={12} />, color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' };
    }
    return { label: userRole.replace('_', ' '), icon: <UserCheck size={12} />, color: 'var(--accent-gold, #d89a1e)', bg: 'rgba(216, 154, 30, 0.15)', border: 'rgba(216, 154, 30, 0.3)' };
  };

  const badgeInfo = getRoleBadgeInfo();

  return (
    <nav className="admin-nav">
      {/* Role Badge Indicator */}
      <div style={{ padding: '0.4rem 0.5rem 0.75rem', borderBottom: '1px solid rgba(245, 240, 234, 0.08)', marginBottom: '0.6rem' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: badgeInfo.bg,
            color: badgeInfo.color,
            border: `1px solid ${badgeInfo.border}`,
            padding: '3px 10px',
            borderRadius: '100px',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {badgeInfo.icon} {badgeInfo.label}
        </span>
      </div>

      {/* 1. MAIN / DASHBOARD (Super Admin) */}
      {isSuperAdmin && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">MAIN</span>
          <Link href="/admin" className={`admin-nav-link ${pathname === '/admin' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
        </div>
      )}

      {/* 2. OPERATIONS COMMAND (Consolidated Outlets & Operations Hub) */}
      {(isOperations || isManager) && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">OPERATIONS & OUTLETS</span>
          <Link
            href="/admin/outlets"
            className={`admin-nav-link ${isActive('/admin/outlets') || isActive('/admin/cafe-settings') ? 'active' : ''}`}
          >
            <Store size={20} /> Outlets & Cafes
          </Link>
          <Link
            href="/admin/operations"
            className={`admin-nav-link ${isActive('/admin/operations') ? 'active' : ''}`}
          >
            <Shield size={20} /> Operations Control Book
          </Link>
          <Link
            href="/admin/manager"
            className={`admin-nav-link ${isActive('/admin/manager') ? 'active' : ''}`}
          >
            <Store size={20} /> Manager Observation Feed
          </Link>
        </div>
      )}

      {/* 4. BRAND, GROWTH & EVENTS */}
      {(isGrowth || isOperations) && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">GROWTH & ACTIVATIONS</span>
          {isGrowth && (
            <Link
              href="/admin/growth"
              className={`admin-nav-link ${isActive('/admin/growth') ? 'active' : ''}`}
            >
              <Activity size={20} /> Growth & BD Hub
            </Link>
          )}
          <Link
            href="/admin/events"
            className={`admin-nav-link ${isActive('/admin/events') ? 'active' : ''}`}
          >
            <Calendar size={20} /> Events & RSVP Engine
          </Link>
        </div>
      )}

      {/* 5. CATALOG & INVENTORY (Super Admin / Operations) */}
      {isSuperAdmin && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">CATALOG</span>
          <Link href="/admin/products" className={`admin-nav-link ${isActive('/admin/products') ? 'active' : ''}`}>
            <Package size={20} /> Products
          </Link>
          <Link href="/admin/inventory" className={`admin-nav-link ${isActive('/admin/inventory') ? 'active' : ''}`}>
            <Package size={20} /> Inventory
          </Link>
        </div>
      )}

      {/* 6. SALES & ORDERS (Super Admin) */}
      {isSuperAdmin && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">SALES</span>
          <Link
            href="/admin/orders"
            className={`admin-nav-link ${isActive('/admin/orders') ? 'active' : ''}`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShoppingCart size={20} /> Orders
            </div>
            {pendingOrders > 0 && <span className="admin-badge">{pendingOrders}</span>}
          </Link>
          <Link href="/admin/coupons" className={`admin-nav-link ${isActive('/admin/coupons') ? 'active' : ''}`}>
            <Tag size={20} /> Coupons
          </Link>
        </div>
      )}

      {/* 7. USERS & ACCESS (Single Master Hub for Customers, Staff, and Admins) */}
      {(isSuperAdmin || isOperations || isGrowth || isManager) && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">USER MANAGEMENT</span>
          <Link
            href="/admin/users"
            className={`admin-nav-link ${isActive('/admin/users') || isActive('/admin/customers') || isActive('/admin/staff') ? 'active' : ''}`}
          >
            <Users size={20} /> Users & Customers
          </Link>
        </div>
      )}

      {/* 8. CONTENT & REVIEWS (Super Admin & Growth) */}
      {(isSuperAdmin || isGrowth) && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">CONTENT & REVIEWS</span>
          <Link href="/admin/reviews" className={`admin-nav-link ${isActive('/admin/reviews') ? 'active' : ''}`}>
            <Star size={20} /> Customer Reviews
          </Link>
          <Link href="/admin/articles" className={`admin-nav-link ${isActive('/admin/articles') ? 'active' : ''}`}>
            <FileText size={20} /> Articles (AI)
          </Link>
          <Link href="/admin/media" className={`admin-nav-link ${isActive('/admin/media') ? 'active' : ''}`}>
            <ImageIcon size={20} /> Media Library
          </Link>
        </div>
      )}

      {/* 9. ANALYTICS & REPORTS (Super Admin & Operations) */}
      {(isSuperAdmin || isOperations) && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">ANALYTICS</span>
          <Link
            href="/admin/analytics"
            className={`admin-nav-link ${isActive('/admin/analytics') && !isActive('/admin/analytics/consolidated') && !isActive('/admin/analytics/comparison') ? 'active' : ''}`}
          >
            <BarChart3 size={20} /> Reports
          </Link>
          {isSuperAdmin && (
            <>
              <Link
                href="/admin/analytics/consolidated"
                className={`admin-nav-link ${isActive('/admin/analytics/consolidated') ? 'active' : ''}`}
              >
                <BarChart3 size={20} /> Consolidated
              </Link>
              <Link
                href="/admin/analytics/comparison"
                className={`admin-nav-link ${isActive('/admin/analytics/comparison') ? 'active' : ''}`}
              >
                <BarChart3 size={20} /> Outlet Comparison
              </Link>
            </>
          )}
        </div>
      )}

      {/* 10. SYSTEM CONFIGURATION (Super Admin only) */}
      {isSuperAdmin && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">SYSTEM</span>
          <Link
            href="/admin/system/audit-logs"
            className={`admin-nav-link ${isActive('/admin/system/audit-logs') ? 'active' : ''}`}
          >
            <ClipboardList size={20} /> Audit Logs
          </Link>
          <Link href="/admin/settings" className={`admin-nav-link ${isActive('/admin/settings') ? 'active' : ''}`}>
            <Settings size={20} /> Store Settings
          </Link>
          <Link href="/admin/shipping" className={`admin-nav-link ${isActive('/admin/shipping') ? 'active' : ''}`}>
            <Truck size={20} /> Shipping Zones
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="admin-footer-nav" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <Link href="/" className="admin-nav-link text-danger">
          <LogOut size={20} /> Exit Admin
        </Link>
      </div>

      <style jsx global>{`
        .admin-nav-link.active {
          background-color: rgba(255, 255, 255, 0.12);
          color: var(--accent-gold, #d89a1e);
          font-weight: 600;
        }
      `}</style>
    </nav>
  );
}
