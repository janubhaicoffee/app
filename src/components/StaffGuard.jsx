'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ShieldAlert, Lock, Coffee, ArrowRight, LogOut, Loader2 } from 'lucide-react';

export default function StaffGuard({ children, allowedRoles = [], title = 'Operations Hub' }) {
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
    role: null,
    staffName: null,
    isAuthorized: false,
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    async function checkStaffSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (isMounted) {
            setAuthState({
              loading: false,
              user: null,
              role: 'guest',
              staffName: null,
              isAuthorized: false,
            });
            // Automatically redirect to staff login
            router.push(`/auth/staff?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }

        const res = await fetch('/api/auth/check-role', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Role check failed');
        }

        const data = await res.json();
        const userRole = data.role || 'customer';

        const hasPermission =
          userRole === 'superadmin' ||
          (allowedRoles.length > 0 ? allowedRoles.includes(userRole) : userRole !== 'customer' && userRole !== 'guest');

        if (isMounted) {
          setAuthState({
            loading: false,
            user: session.user,
            role: userRole,
            staffName: data.staffName || session.user.email?.split('@')[0],
            isAuthorized: hasPermission,
          });

          if (!hasPermission && userRole === 'guest') {
            router.push(`/auth/staff?redirect=${encodeURIComponent(pathname)}`);
          }
        }
      } catch (err) {
        console.error('StaffGuard auth check error:', err);
        if (isMounted) {
          setAuthState({
            loading: false,
            user: null,
            role: 'error',
            staffName: null,
            isAuthorized: false,
          });
        }
      }
    }

    checkStaffSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkStaffSession();
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [pathname, router, allowedRoles]);

  if (authState.loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at top, #1c130d 0%, #0c0805 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f5f0eb',
          fontFamily: 'system-ui, sans-serif',
          padding: '24px',
        }}
      >
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Coffee size={42} color="#d4a359" />
          <Loader2
            size={56}
            color="#d4a359"
            style={{
              position: 'absolute',
              top: '-7px',
              left: '-7px',
              animation: 'spin 1.5s linear infinite',
              opacity: 0.7,
            }}
          />
        </div>
        <h3 style={{ color: '#f7e7ce', margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 700 }}>
          Authenticating Janu Bhai Operations
        </h3>
        <p style={{ color: '#a89f91', fontSize: '0.85rem', margin: 0 }}>
          Verifying encrypted staff credentials & outlet role permissions...
        </p>
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Not authorized
  if (!authState.isAuthorized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at top, #1a0f0a 0%, #0a0604 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          color: '#f5f0eb',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            background: 'linear-gradient(135deg, rgba(38,26,18,0.95) 0%, rgba(20,14,10,0.98) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '20px',
            padding: '36px 30px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Lock size={30} color="#ef4444" />
          </div>

          <span
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'inline-block',
              marginBottom: '14px',
            }}
          >
            Restricted Staff Portal
          </span>

          <h2 style={{ color: '#f7e7ce', fontSize: '1.45rem', margin: '0 0 10px', fontWeight: 800 }}>
            Access Restricted to Janu Bhai Cafe Staff
          </h2>

          <p style={{ color: '#a89f91', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 24px' }}>
            {authState.user
              ? `You are logged in as "${authState.user.email}", which is not assigned an active [${allowedRoles.join(', ')}] role for this operations hub.`
              : 'This operational workspace requires active Janu Bhai Cafe staff authorization.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href={`/auth/staff?redirect=${encodeURIComponent(pathname)}`}
              style={{
                background: 'linear-gradient(135deg, #d4a359 0%, #b8863b 100%)',
                color: '#120b06',
                fontWeight: 800,
                padding: '12px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Lock size={16} /> Sign In with Staff Credentials
            </Link>

            {authState.user && (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push(`/auth/staff?redirect=${encodeURIComponent(pathname)}`);
                }}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#f5f0eb',
                  padding: '10px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <LogOut size={15} /> Switch to Worker / Staff Account
              </button>
            )}

            <Link
              href="/"
              style={{
                color: '#a89f91',
                fontSize: '0.82rem',
                marginTop: '6px',
                textDecoration: 'underline',
              }}
            >
              Return to Storefront Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
