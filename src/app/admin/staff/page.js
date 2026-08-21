'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminStaffRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users?tab=staff');
  }, [router]);

  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <span>Redirecting to Store Staff & Team Hub...</span>
    </div>
  );
}
