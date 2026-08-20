'use client';
import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setError(error.message);
        return;
      }
      if (data?.session) {
        try {
          const res = await fetch('/api/auth/check-role', {
            headers: { Authorization: `Bearer ${data.session.access_token}` }
          });
          const { role } = await res.json();
          
          if (searchParams.get('redirect')) {
            router.push(searchParams.get('redirect'));
          } else if (role === 'superadmin') {
            router.push('/admin');
          } else if (role === 'operations_head' || role === 'operations') {
            router.push('/operations');
          } else if (role === 'growth') {
            router.push('/growth');
          } else if (role === 'manager') {
            router.push('/manager');
          } else if (role === 'staff') {
            router.push('/pos/dashboard');
          } else {
            router.push('/account');
          }
        } catch (err) {
          console.error('Role check failed:', err);
          const redirectTo = searchParams.get('redirect') || '/account';
          router.push(redirectTo);
        }
      }
    };
    handleCallback();
  }, [router, searchParams]);

  if (error)
    return (
      <div className="auth-page">
        <p>Error: {error}</p>
      </div>
    );
  return (
    <div className="auth-page">
      <p>Completing sign in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}
