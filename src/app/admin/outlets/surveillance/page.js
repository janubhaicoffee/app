'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SurveillanceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/outlets?tab=surveillance');
  }, [router]);

  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <span>Redirecting to Outlets Live Surveillance...</span>
    </div>
  );
}
