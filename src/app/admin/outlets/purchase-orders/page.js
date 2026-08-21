'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PurchaseOrdersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/outlets?tab=purchase-orders');
  }, [router]);

  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <span>Redirecting to Outlets Purchase Orders...</span>
    </div>
  );
}
