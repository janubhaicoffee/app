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
        const redirectTo = searchParams.get('redirect') || '/account';
        router.push(redirectTo);
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
