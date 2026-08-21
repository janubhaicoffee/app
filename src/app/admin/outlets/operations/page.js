'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OutletsOperationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/outlets?tab=all');
  }, [router]);

  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <span>Redirecting to Outlets Operations Hub...</span>
    </div>
  );
}
