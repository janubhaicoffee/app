'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Coffee } from 'lucide-react';

export default function CustomerUnifiedHub() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account');
  }, [router]);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: '#f5f0eb',
        background: 'radial-gradient(circle at center, #1c120c 0%, #0d0805 100%)',
      }}
    >
      <Coffee size={40} color="#d4a359" />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d4a359', fontSize: '0.95rem' }}>
        <RefreshCw size={16} className="animate-spin" />
        <span>Redirecting to your Unified Account Hub...</span>
      </div>
    </div>
  );
}


