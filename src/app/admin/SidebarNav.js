"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Settings, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SidebarNav() {
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch("/api/admin/data?type=orders", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const json = await res.json();
          const pendingCount = (json.data || []).filter(o => o.status === 'pending').length;
          setPendingOrders(pendingCount);
        }
      } catch (err) {}
    };
    
    fetchPendingOrders();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="admin-nav">
      <Link href="/admin" className="admin-nav-link">
        <LayoutDashboard size={20} /> Dashboard
      </Link>
      <Link href="/admin/products" className="admin-nav-link">
        <Package size={20} /> Products
      </Link>
      <Link href="/admin/orders" className="admin-nav-link" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={20} /> Orders
        </div>
        {pendingOrders > 0 && (
          <span style={{ background: 'var(--accent-red)', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 'bold' }}>
            {pendingOrders}
          </span>
        )}
      </Link>
      <Link href="/admin/customers" className="admin-nav-link">
        <Users size={20} /> Customers
      </Link>
      <Link href="/admin/articles" className="admin-nav-link">
        <FileText size={20} /> Articles (AI)
      </Link>
      <Link href="/admin/settings" className="admin-nav-link">
        <Settings size={20} /> Settings
      </Link>
    </nav>
  );
}
