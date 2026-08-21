'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StockTransfersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/outlets?tab=transfers');
  }, [router]);

  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <span>Redirecting to Outlets Stock Transfers...</span>
    </div>
  );
}
