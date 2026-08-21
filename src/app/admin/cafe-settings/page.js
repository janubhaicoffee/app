'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CafeSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/outlets?tab=settings');
  }, [router]);

  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <span>Redirecting to Cafe & Outlet Settings...</span>
    </div>
  );
}
