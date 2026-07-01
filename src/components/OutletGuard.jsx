"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

if (typeof window !== 'undefined' && !window.__outlet_fetch_monkeypatched) {
  window.__outlet_fetch_monkeypatched = true;
  const originalFetch = window.fetch;
  let outletCheckPromise = null;
  window.fetch = function(input, init) {
    const url = typeof input === 'string' ? input : input?.url;
    if (url && url.includes('/api/outlet/auth/check')) {
      if (outletCheckPromise) {
        return outletCheckPromise.then(res => res.clone());
      }
      outletCheckPromise = originalFetch.apply(this, arguments).then(res => {
        setTimeout(() => { outletCheckPromise = null; }, 100);
        return res;
      }).catch(err => {
        outletCheckPromise = null;
        throw err;
      });
      return outletCheckPromise.then(res => res.clone());
    }
    return originalFetch.apply(this, arguments);
  };
}

export default function OutletGuard({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      let session = null;
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        session = s;
      } catch (_) {}

      if (!session) {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
              const raw = localStorage.getItem(key);
              if (raw) {
                session = JSON.parse(raw);
                break;
              }
            }
          }
        } catch (_) {}
      }

      if (!session) {
        router.push("/auth/login?redirect=/outlet");
        return;
      }

      try {
        const response = await fetch('/api/admin/data?type=check', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.status === 401) {
          router.push("/auth/login?redirect=/outlet");
          return;
        }

        if (response.status === 403) {
          router.push("/");
          return;
        }

        if (!response.ok) {
          setErrorBanner("Failed to verify admin credentials.");
          return;
        }

        const data = await response.json();
        if (data.isAdmin) {
          setIsAuthorized(true);
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Outlet auth check failed", err);
        setErrorBanner("Internal Server Error during verification.");
      }
    };

    checkAuth();
  }, [router]);

  if (errorBanner) {
    return (
      <div data-testid="auth-error-banner"
        style={{
          padding: '20px', margin: '20px', background: '#ffdddd',
          color: '#dd0000', border: '1px solid #dd0000',
          borderRadius: '4px', textAlign: 'center', fontWeight: 'bold'
        }}
      >
        {errorBanner}
      </div>
    );
  }

  if (!isAuthorized) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <h2>Checking Admin Credentials...</h2>
    </div>;
  }

  return children;
}
