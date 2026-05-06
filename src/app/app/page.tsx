"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardRouter() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.push('/');
        return;
      }

      // Role-based redirection
      switch (profile.role) {
        case 'superadmin':
          router.push('/app/admin');
          break;
        case 'manager':
        case 'outlet_owner':
          router.push('/app/manager');
          break;
        case 'employee':
        case 'cashier':
        case 'kitchen':
          router.push('/app/terminal');
          break;
        case 'customer':
          router.push('/app/home');
          break;
        case 'franchise_applicant':
          router.push('/app/onboarding');
          break;
        default:
          router.push('/');
      }
    }
  }, [profile, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-cream">
      <div className="animate-pulse space-y-4 text-center">
        <div className="w-12 h-12 border-4 border-accent-brown border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Syncing Janu Bhai OS...</p>
      </div>
    </div>
  );
}
