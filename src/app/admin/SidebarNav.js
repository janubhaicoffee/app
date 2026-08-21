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

  const isSuperAdmin = userRole === 'superadmin' || userRole === 'owner';
  const isOperations = isSuperAdmin || ['operations_head', 'operations', 'operation_manager', 'operations_manager', 'area_manager'].includes(userRole);
  const isGrowth = isSuperAdmin || ['growth', 'brand_leader'].includes(userRole);
  const isManager = isSuperAdmin || ['manager', 'store_manager'].includes(userRole);

  const getRoleBadgeInfo = () => {
    if (isSuperAdmin) {
      return { label: 'Superadmin', icon: <Shield size={12} />, color: 'var(--accent-gold, #d89a1e)', bg: 'rgba(216, 154, 30, 0.15)', border: 'rgba(216, 154, 30, 0.3)' };
    }
    if (['operations_head', 'operations', 'operation_manager', 'operations_manager', 'area_manager'].includes(userRole)) {
      return { label: 'Operations Head', icon: <Shield size={12} />, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
    }
    if (userRole === 'growth' || userRole === 'brand_leader') {
      return { label: 'Growth', icon: <Sparkles size={12} />, color: '#f472b6', bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.3)' };
    }
    if (userRole === 'manager' || userRole === 'store_manager') {
      return { label: 'Manager', icon: <Store size={12} />, color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' };
    }
    if (userRole === 'employee' || userRole === 'staff') {
      return { label: 'Employee', icon: <UserCheck size={12} />, color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)' };
    }
    return { label: 'Customer', icon: <UserCheck size={12} />, color: '#cbb9a8', bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(245, 240, 234, 0.12)' };
  };

  const badgeInfo = getRoleBadgeInfo();

  return (
    <nav className="admin-nav">
      {/* 1. MAIN COMMAND */}
      {(isSuperAdmin || isOperations || isGrowth || isManager) && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">COMMAND</span>
          <Link href="/admin" className={`admin-nav-link ${pathname === '/admin' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>
              {isSuperAdmin
                ? 'Dashboard (God Mode)'
                : isOperations
                ? 'Operations Command'
                : isGrowth
                ? 'Growth Command'
                : 'Cafe Manager Desk'}
            </span>
          </Link>
        </div>
      )}

      {/* 2. JANU BHAI CAFE OPERATIONS & OUTLETS (Operations Head & Superadmin) */}
      {(isSuperAdmin || (isOperations && !isManager)) && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">CAFE OPERATIONS</span>
          <Link
            href="/admin/outlets"
            className={`admin-nav-link ${isActive('/admin/outlets') && !isActive('/admin/outlets/checklists') && !isActive('/admin/outlets/transfers') ? 'active' : ''}`}
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
          <Link
            href="/admin/outlets/checklists"
            className={`admin-nav-link ${isActive('/admin/outlets/checklists') ? 'active' : ''}`}
          >
            <ClipboardCheck size={20} /> SOP Audits & Checklists
          </Link>
          <Link
            href="/admin/outlets/transfers"
            className={`admin-nav-link ${isActive('/admin/outlets/transfers') ? 'active' : ''}`}
          >
            <ArrowLeftRight size={20} /> Stock Transfers & POs
          </Link>
          <Link
            href="/admin/staff"
            className={`admin-nav-link ${isActive('/admin/staff') ? 'active' : ''}`}
          >
            <UserCheck size={20} /> Cafe Staff & Rosters
          </Link>
        </div>
      )}

      {/* 3. STORE MANAGER OPERATIONS (Store Manager Only) */}
      {isManager && !isSuperAdmin && !isOperations && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">STORE DESK</span>
          <Link
            href="/admin/manager"
            className={`admin-nav-link ${isActive('/admin/manager') ? 'active' : ''}`}
          >
            <Store size={20} /> Manager Shift Feed
          </Link>
          <Link
            href="/admin/outlets/checklists"
            className={`admin-nav-link ${isActive('/admin/outlets/checklists') ? 'active' : ''}`}
          >
            <ClipboardCheck size={20} /> Daily SOP Checklists
          </Link>
          <Link
            href="/admin/outlets/transfers"
            className={`admin-nav-link ${isActive('/admin/outlets/transfers') ? 'active' : ''}`}
          >
            <ArrowLeftRight size={20} /> Stock Transfers & Reorders
          </Link>
          <Link
            href="/admin/staff"
            className={`admin-nav-link ${isActive('/admin/staff') ? 'active' : ''}`}
          >
            <UserCheck size={20} /> Store Staff on Shift
          </Link>
          <Link
            href="/admin/events"
            className={`admin-nav-link ${isActive('/admin/events') ? 'active' : ''}`}
          >
            <Calendar size={20} /> Cafe Events in Store
          </Link>
          <Link
            href="/pos"
            className="admin-nav-link"
            style={{ color: '#69f0ae' }}
          >
            <ShoppingCart size={20} /> Launch POS Register
          </Link>
        </div>
      )}

      {/* 4. JANU BHAI CAFE GROWTH & ACTIVATIONS (Growth, Operations Head, Superadmin) */}
      {(isGrowth || isOperations || isSuperAdmin) && !isManager && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">GROWTH & ACTIVATIONS</span>
          <Link
            href="/admin/events"
            className={`admin-nav-link ${isActive('/admin/events') ? 'active' : ''}`}
          >
            <Calendar size={20} /> Events & RSVP Engine
          </Link>
          {(isGrowth || isSuperAdmin) && (
            <Link
              href="/admin/growth"
              className={`admin-nav-link ${isActive('/admin/growth') ? 'active' : ''}`}
            >
              <Activity size={20} /> Growth & BD Hub
            </Link>
          )}
          <Link
            href="/admin/reviews"
            className={`admin-nav-link ${isActive('/admin/reviews') ? 'active' : ''}`}
          >
            <Star size={20} /> Guest Experience Reviews
          </Link>
          {(isGrowth || isSuperAdmin) && (
            <Link
              href="/admin/articles"
              className={`admin-nav-link ${isActive('/admin/articles') ? 'active' : ''}`}
            >
              <FileText size={20} /> Articles & AI Lore
            </Link>
          )}
          <Link
            href="/admin/media"
            className={`admin-nav-link ${isActive('/admin/media') ? 'active' : ''}`}
          >
            <ImageIcon size={20} /> Media Asset Vault
          </Link>
        </div>
      )}

      {/* 5. JANU BHAI COFFEE E-COMMERCE & D2C (STRICTLY SUPERADMIN ONLY) */}
      {isSuperAdmin && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">ECOMMERCE & D2C</span>
          <Link href="/admin/products" className={`admin-nav-link ${isActive('/admin/products') ? 'active' : ''}`}>
            <Package size={20} /> D2C Products
          </Link>
          <Link href="/admin/inventory" className={`admin-nav-link ${isActive('/admin/inventory') ? 'active' : ''}`}>
            <Package size={20} /> Roastery Inventory
          </Link>
          <Link
            href="/admin/orders"
            className={`admin-nav-link ${isActive('/admin/orders') ? 'active' : ''}`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShoppingCart size={20} /> Online Orders
            </div>
            {pendingOrders > 0 && <span className="admin-badge">{pendingOrders}</span>}
          </Link>
          <Link href="/admin/coupons" className={`admin-nav-link ${isActive('/admin/coupons') ? 'active' : ''}`}>
            <Tag size={20} /> Discount Coupons
          </Link>
          <Link href="/admin/abandoned-carts" className={`admin-nav-link ${isActive('/admin/abandoned-carts') ? 'active' : ''}`}>
            <ShoppingBag size={20} /> Abandoned Carts
          </Link>
          <Link href="/admin/customers" className={`admin-nav-link ${isActive('/admin/customers') ? 'active' : ''}`}>
            <Users size={20} /> Online Customers
          </Link>
        </div>
      )}

      {/* 6. SYSTEM, GOVERNANCE & GLOBAL CONFIG (STRICTLY SUPERADMIN ONLY) */}
      {isSuperAdmin && (
        <div className="admin-nav-group">
          <span className="admin-nav-group-title">SYSTEM & GOVERNANCE</span>
          <Link
            href="/admin/users"
            className={`admin-nav-link ${isActive('/admin/users') ? 'active' : ''}`}
          >
            <Shield size={20} /> Master Access Control
          </Link>
          <Link
            href="/admin/analytics/consolidated"
            className={`admin-nav-link ${isActive('/admin/analytics/consolidated') ? 'active' : ''}`}
          >
            <BarChart3 size={20} /> Consolidated P&L
          </Link>
          <Link
            href="/admin/system/audit-logs"
            className={`admin-nav-link ${isActive('/admin/system/audit-logs') ? 'active' : ''}`}
          >
            <ClipboardList size={20} /> Security Audit Logs
          </Link>
          <Link href="/admin/settings" className={`admin-nav-link ${isActive('/admin/settings') ? 'active' : ''}`}>
            <Settings size={20} /> Store Settings
          </Link>
          <Link href="/admin/shipping" className={`admin-nav-link ${isActive('/admin/shipping') ? 'active' : ''}`}>
            <Truck size={20} /> Courier & Shipping
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
