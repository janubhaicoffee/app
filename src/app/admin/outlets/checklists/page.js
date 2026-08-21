'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChecklistsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/outlets?tab=checklists');
  }, [router]);

  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <span>Redirecting to Outlets Checklists & Audits...</span>
    </div>
  );
}
