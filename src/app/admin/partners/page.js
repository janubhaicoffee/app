'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPartnersDeprecated() {
  const router = useRouter();

  useEffect(() => {
    // Partner management has been removed in favor of direct Staff & Operational Command
    router.replace('/admin/staff');
  }, [router]);

  return (
    <div style={{ padding: '40px', color: '#a89f91', textAlign: 'center' }}>
      Redirecting to Staff Command...
    </div>
  );
}
