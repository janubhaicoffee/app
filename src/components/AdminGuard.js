'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Store, ArrowLeft } from 'lucide-react';

// Routes restricted strictly to Superadmin (Janu Bhai Coffee eCommerce & Platform Governance)
const SUPERADMIN_ONLY_ROUTES = [
  '/admin/shipping',
  '/admin/coupons',
  '/admin/abandoned-carts',
  '/admin/settings',
  '/admin/system',
  '/admin/products',
  '/admin/orders',
  '/admin/customers',
  '/admin/users',
  '/admin/partners',
  '/admin/analytics/consolidated',
  '/admin/analytics/comparison',
];

// Global fetch single-flighting setup for admin check
if (typeof window !== 'undefined' && !window.__fetch_monkeypatched) {
  window.__fetch_monkeypatched = true;
  const originalFetch = window.fetch;
  let adminCheckPromise = null;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input?.url;
    if (url && url.includes('/api/admin/data?type=check')) {
      if (adminCheckPromise) {
        return adminCheckPromise.then((res) => res.clone());
      }
      adminCheckPromise = originalFetch
        .apply(this, arguments)
        .then((res) => {
          setTimeout(() => {
            adminCheckPromise = null;
          }, 100);
          return res;
        })
        .catch((err) => {
          adminCheckPromise = null;
          throw err;
        });
      return adminCheckPromise.then((res) => res.clone());
    }
    return originalFetch.apply(this, arguments);
  };
}

export default function AdminGuard({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [errorBanner, setErrorBanner] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      try {
        const res = await fetch('/api/admin/data?type=check', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.status === 500) {
          setErrorBanner('Internal Server Error: Could not verify admin status.');
          return;
        }

        if (res.status === 403 || res.status === 401) {
          setErrorBanner('Access Denied: This account does not have admin permissions.');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.isAdmin) {
            setUserRole(data.role || 'superadmin');
            setIsAuthorized(true);
            return;
          }
        }
      } catch (err) {
        console.error('Auth check failed', err);
      }

      router.push('/');
    };

    checkAuth();
  }, [router]);

  if (errorBanner) {
    return (
      <div
        data-testid="auth-error-banner"
        style={{
          padding: '20px',
          margin: '20px',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {errorBanner}
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh',
          background: 'transparent',
          color: 'var(--text-secondary, #cbb9a8)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="admin-spinner" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Verifying Credentials...</h3>
        </div>
      </div>
    );
  }

  // Domain Isolation: Check if a Cafe role is attempting to access eCommerce / Superadmin sections
  const isSuperAdmin = userRole === 'superadmin' || userRole === 'owner';
  const isAccessingEcommerceOrSystem = SUPERADMIN_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!isSuperAdmin && isAccessingEcommerceOrSystem) {
    return (
      <div
        style={{
          padding: '40px 24px',
          maxWidth: '620px',
          margin: '40px auto',
          background: 'linear-gradient(135deg, rgba(38,26,18,0.95) 0%, rgba(20,14,10,0.98) 100%)',
          border: '1px solid rgba(216, 154, 30, 0.3)',
          borderRadius: '18px',
          textAlign: 'center',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
        }}
      >
        <ShieldAlert size={48} color="#d89a1e" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ color: '#f5f0ea', fontFamily: 'var(--font-playfair)', margin: '0 0 8px', fontSize: '1.4rem' }}>
          eCommerce Access Restricted
        </h2>
        <p style={{ color: '#cbb9a8', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 24px' }}>
          This section manages online D2C orders, shipping zones, store settings, and platform governance. Your account is configured for <strong>Janu Bhai Cafe Chain Operations & Activations</strong>.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            href="/admin"
            className="admin-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Store size={16} />
            <span>Return to Cafe Command</span>
          </Link>
          <Link
            href="/admin/operations"
            className="admin-btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} />
            <span>Operations Book</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
