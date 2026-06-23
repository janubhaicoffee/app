"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function AnimatedNumber({ value, isCurrency = false }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    
    // Duration of animation in ms
    const duration = 1500;
    const incrementTime = 30; // ms per frame
    const steps = duration / incrementTime;
    const stepValue = end / steps;

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  if (isCurrency) {
    return <>₹ {displayValue.toLocaleString('en-IN')}</>;
  }
  return <>{displayValue}</>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    articles: 0,
    revenue: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch("/api/admin/data?type=dashboard", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setStats({
              products: json.data.products || 0,
              customers: json.data.customers || 0,
              orders: json.data.orders || 0,
              articles: json.data.articles || 0,
              revenue: json.data.revenue || 0
            });
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
    
    // Auto-refresh stats every 30 seconds for a real-time feel
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard Overview</h1>
        {loading && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Live syncing...</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="admin-card" style={{ textAlign: 'center', borderTop: '4px solid #4caf50' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Total Revenue</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: '#2e7d32' }}>
            <AnimatedNumber value={stats.revenue} isCurrency={true} />
          </p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Total Orders</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>
            <AnimatedNumber value={stats.orders} />
          </p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Customers</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>
            <AnimatedNumber value={stats.customers} />
          </p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Total Products</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>
            <AnimatedNumber value={stats.products} />
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <h2>Live Business Activity</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to your command center. Navigate using the sidebar to manage products, view order statuses fetched from Razorpay/Nimbuspost, and generate SEO articles using NVIDIA AI.</p>
        
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', borderLeft: '4px solid var(--accent-red)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Real-time Sync Active</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Your dashboard automatically syncs with Supabase and payment gateways every 30 seconds to bring you the latest revenue and order counts.</p>
        </div>
      </div>
    </div>
  );
}
