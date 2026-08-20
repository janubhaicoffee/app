'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

if (typeof window !== 'undefined' && !window.__outlet_fetch_monkeypatched) {
  window.__outlet_fetch_monkeypatched = true;
  const originalFetch = window.fetch;
  let outletCheckPromise = null;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input?.url;
    if (url && url.includes('/api/outlet/auth/check')) {
      if (outletCheckPromise) {
        return outletCheckPromise.then((res) => res.clone());
      }
      outletCheckPromise = originalFetch
        .apply(this, arguments)
        .then((res) => {
          setTimeout(() => {
            outletCheckPromise = null;
          }, 100);
          return res;
        })
        .catch((err) => {
          outletCheckPromise = null;
          throw err;
        });
      return outletCheckPromise.then((res) => res.clone());
    }
    return originalFetch.apply(this, arguments);
  };
}

export default function OutletGuard({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const verifiedTokenRef = useRef('');
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let subscription = null;

    const handleSession = async (session) => {
      if (!active) return;
      if (!session) {
        setIsAuthorized(false);
        verifiedTokenRef.current = '';
        router.push('/outlet');
        return;
      }

      const token = session.access_token;
      if (token === verifiedTokenRef.current) {
        setIsAuthorized(true);
        return;
      }

      try {
        const response = await fetch('/api/auth/check-role', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!active) return;

        if (response.status === 401) {
          setIsAuthorized(false);
          verifiedTokenRef.current = '';
          router.push('/outlet');
          return;
        }

        if (response.status === 403) {
          setIsAuthorized(false);
          verifiedTokenRef.current = '';
          router.push('/');
          return;
        }

        if (!response.ok) {
          setErrorBanner('Failed to verify credentials.');
          return;
        }

        const data = await response.json();
        if (!active) return;

        if (['superadmin', 'owner', 'operations_head', 'operations', 'manager', 'growth', 'staff'].includes(data.role)) {
          verifiedTokenRef.current = token;
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          verifiedTokenRef.current = '';
          router.push('/');
        }
      } catch (err) {
        console.error('Outlet auth check failed', err);
        if (active) {
          setErrorBanner('Internal Server Error during verification.');
        }
      }
    };

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        handleSession(session);
      }
    });

    // 2. Listen for auth state changes
    const {
      data: { subscription: sub },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        handleSession(session);
      }
    });
    subscription = sub;

    return () => {
      active = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
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
          background: 'var(--bg-primary, #F8F1E4)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-playfair), serif',
            color: 'var(--primary-color, #3E2723)',
          }}
        >
          Checking Admin Credentials...
        </h2>
      </div>
    );
  }

  return children;
}
