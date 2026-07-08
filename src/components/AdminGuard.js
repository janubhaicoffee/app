'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
          // Keep it cached for a tiny window to handle concurrent requests
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
  const [errorBanner, setErrorBanner] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Use the secure server API to check if the user is an admin
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
          background: '#ffdddd',
          color: '#dd0000',
          border: '1px solid #dd0000',
          borderRadius: '4px',
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
          height: '100vh',
          background: 'var(--bg-primary)',
        }}
      >
        <h2>Checking Admin Credentials...</h2>
      </div>
    );
  }

  return children;
}
