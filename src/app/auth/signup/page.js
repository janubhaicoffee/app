'use client';

import { Suspense } from 'react';
import UnifiedAuthCard from '@/components/auth/UnifiedAuthCard';
import '../login/auth.css';

export default function SignupPage() {
  return (
    <main className="unified-auth-page-wrapper">
      <Suspense fallback={<div className="auth-card-apple" style={{ minHeight: '300px' }} />}>
        <UnifiedAuthCard defaultTab="phone" defaultMode="signup" />
      </Suspense>
    </main>
  );
}
