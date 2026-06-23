"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    articles: 0
  });

  useEffect(() => {
    async function loadStats() {
      // In a real app, we would use Supabase Admin client or RPCs to get counts
      // For now, doing simple client-side count requests
      const [{ count: pCount }, { count: cCount }, { count: oCount }, { count: aCount }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        products: pCount || 0,
        customers: cCount || 0,
        orders: oCount || 0,
        articles: aCount || 0
      });
    }
    loadStats();
  }, []);

  return (
    <div>
      <div className="admin-header">
        <h1>Dashboard Overview</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Total Products</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>{stats.products}</p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Total Orders</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>{stats.orders}</p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Customers</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>{stats.customers}</p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>SEO Articles</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>{stats.articles}</p>
        </div>
      </div>

      <div className="admin-card">
        <h2>Recent Activity</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to the Janu Bhai Admin Portal. Navigate using the sidebar to manage products, orders, customers, and generate SEO articles using NVIDIA AI.</p>
      </div>
    </div>
  );
}
