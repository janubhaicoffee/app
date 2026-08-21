'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommissionsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/outlets?tab=menu');
  }, [router]);

  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <span>Redirecting to Outlets Master Menu...</span>
    </div>
  );
}
