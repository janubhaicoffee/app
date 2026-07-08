'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import '../login/auth.css';

export default function ConfirmPage() {
  const [status, setStatus] = useState('confirming');
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Supabase automatically parses the hash fragment and stores the session.
    // We just wait for the auth state change to trigger, or check if we already have a session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (mounted) {
          setStatus('confirmed');
          setTimeout(() => {
            router.push('/account');
          }, 1500);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (mounted) {
          setStatus('confirmed');
          setTimeout(() => {
            router.push('/account');
          }, 1500);
        }
      }
    });

    // Timeout fallback just in case
    const timeout = setTimeout(() => {
      if (mounted && status === 'confirming') {
        router.push('/auth/login');
      }
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, status]);

  return (
    <main className="auth-page">
      <div className="container auth-container">
        <div
          className="auth-box vintage-border"
          style={{ textAlign: 'center', padding: '3rem 2rem' }}
        >
          <div
            className="animation-container"
            style={{
              minHeight: '150px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {status === 'confirming' ? (
              <div className="fade-in">
                <Loader2
                  className="spin"
                  size={48}
                  color="var(--primary-color)"
                  style={{ marginBottom: '1rem' }}
                />
                <h2 className="auth-title">Confirming your email...</h2>
                <p className="auth-subtitle">Please wait a moment while we securely log you in.</p>
              </div>
            ) : (
              <div className="fade-in pop-in">
                <CheckCircle2
                  size={64}
                  color="var(--accent-red)"
                  style={{ marginBottom: '1rem' }}
                />
                <h2 className="auth-title">Email Confirmed!</h2>
                <p className="auth-subtitle">Taking you to your dashboard...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
