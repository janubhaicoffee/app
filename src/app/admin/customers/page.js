'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCustomersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users?tab=customers');
  }, [router]);

  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <span>Redirecting to Users & Customers Hub...</span>
    </div>
  );
}
