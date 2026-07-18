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
  Image,
  Truck,
  Shield,
  ChevronDown,
  ChevronRight,
  Store,
  Users2,
  ClipboardList,
  Audit,
  Building2,
  DollarSign,
  Link2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SidebarNav() {
  const [pendingOrders, setPendingOrders] = useState(0);
  const [expandedMenus, setExpandedMenus] = useState({});
  const pathname = usePathname();

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch('/api/admin/data?type=orders', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const pendingCount = (json.data || []).filter((o) => o.status === 'pending').length;
          setPendingOrders(pendingCount);
        }
      } catch (err) {}
    };
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (path) => pathname?.startsWith(path);

  return (
    <nav className="admin-nav">
      <div className="admin-nav-group">
        <span className="admin-nav-group-title">MAIN</span>
        <Link href="/admin" className="admin-nav-link">
          <LayoutDashboard size={20} /> Dashboard
        </Link>
      </div>

      <div className="admin-nav-group">
        <span className="admin-nav-group-title">OUTLETS</span>
        <Link
          href="/admin/outlets"
          className={`admin-nav-link ${isActive('/admin/outlets') ? 'active' : ''}`}
        >
          <Store size={20} /> All Outlets
        </Link>
        <Link
          href="/admin/partners"
          className={`admin-nav-link ${isActive('/admin/partners') ? 'active' : ''}`}
        >
          <Users2 size={20} /> Partners
        </Link>
        <Link
          href="/admin/outlets/commissions"
          className={`admin-nav-link ${isActive('/admin/outlets/commissions') ? 'active' : ''}`}
        >
          <DollarSign size={20} /> Commissions
        </Link>
      </div>

      <div className="admin-nav-group">
        <span className="admin-nav-group-title">CATALOG</span>
        <Link href="/admin/products" className="admin-nav-link">
          <Package size={20} /> Products
        </Link>
        <Link href="/admin/inventory" className="admin-nav-link">
          <Package size={20} /> Inventory
        </Link>
      </div>

      <div className="admin-nav-group">
        <span className="admin-nav-group-title">SALES</span>
        <Link
          href="/admin/orders"
          className="admin-nav-link"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingCart size={20} /> Orders
          </div>
          {pendingOrders > 0 && <span className="admin-badge">{pendingOrders}</span>}
        </Link>
        <Link href="/admin/coupons" className="admin-nav-link">
          <Tag size={20} /> Coupons
        </Link>
      </div>

      <div className="admin-nav-group">
        <span className="admin-nav-group-title">CUSTOMERS</span>
        <Link href="/admin/customers" className="admin-nav-link">
          <Users size={20} /> Customers
        </Link>
        <Link href="/admin/reviews" className="admin-nav-link">
          <Star size={20} /> Reviews
        </Link>
      </div>

      <div className="admin-nav-group">
        <span className="admin-nav-group-title">CONTENT</span>
        <Link href="/admin/articles" className="admin-nav-link">
          <FileText size={20} /> Articles (AI)
        </Link>
        <Link href="/admin/media" className="admin-nav-link">
          <Image size={20} /> Media Library
        </Link>
      </div>

      <div className="admin-nav-group">
        <span className="admin-nav-group-title">ANALYTICS</span>
        <Link
          href="/admin/analytics"
          className={`admin-nav-link ${isActive('/admin/analytics') && !isActive('/admin/analytics/consolidated') && !isActive('/admin/analytics/comparison') ? 'active' : ''}`}
        >
          <BarChart3 size={20} /> Reports
        </Link>
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
      </div>

      <div className="admin-nav-group">
        <span className="admin-nav-group-title">SYSTEM</span>
        <Link
          href="/admin/staff"
          className={`admin-nav-link ${isActive('/admin/staff') ? 'active' : ''}`}
        >
          <Shield size={20} /> Staff
        </Link>
        <Link
          href="/admin/system/audit-logs"
          className={`admin-nav-link ${isActive('/admin/system/audit-logs') ? 'active' : ''}`}
        >
          <ClipboardList size={20} /> Audit Logs
        </Link>
        <Link href="/admin/settings" className="admin-nav-link">
          <Settings size={20} /> Store Settings
        </Link>
        <Link href="/admin/cafe-settings" className="admin-nav-link">
          <Building2 size={20} /> Cafe Settings
        </Link>
        <Link href="/admin/shipping" className="admin-nav-link">
          <Truck size={20} /> Shipping Zones
        </Link>
      </div>

      <div className="admin-footer-nav">
        <Link href="/" className="admin-nav-link text-danger">
          <LogOut size={20} /> Exit Admin
        </Link>
      </div>

      <style jsx global>{`
        .admin-nav-link.active {
          background-color: rgba(255, 255, 255, 0.15);
          color: var(--accent-gold);
        }
      `}</style>
    </nav>
  );
}
