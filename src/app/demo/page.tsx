"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { User, Shield, Store, Coffee, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DemoAccessPage() {
  const router = useRouter();
  const { devBypassRole } = useAuth();

  const handleDemoLogin = (role: 'employee' | 'manager' | 'superadmin' | 'customer') => {
    devBypassRole(role);
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-bg-cream p-6 flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="w-full max-w-md space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
          <ArrowLeft size={14} />
          Back to Public Site
        </Link>

        <header className="space-y-2 text-center">
          <h1 className="text-4xl font-heading tracking-tighter">Janu Bhai OS</h1>
          <p className="text-sm opacity-50 font-medium uppercase tracking-widest text-accent-brown">Internal Access Portal</p>
        </header>

        <Card glass className="p-8 border-accent-brown/10 space-y-6 rounded-[40px] shadow-2xl">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 text-center">Select Role to Enter</h2>
            
            <div className="grid gap-3">
              <Button fullWidth size="lg" className="py-6 bg-accent-brown text-white rounded-3xl press-effect flex justify-between px-6" onClick={() => handleDemoLogin('customer')}>
                <div className="flex items-center gap-3">
                  <User size={20} />
                  <span>Customer App</span>
                </div>
              </Button>

              <Button fullWidth variant="outline" size="lg" className="py-6 border-accent-brown/20 rounded-3xl press-effect flex justify-between px-6" onClick={() => handleDemoLogin('employee')}>
                <div className="flex items-center gap-3">
                  <Coffee size={20} />
                  <span>POS Terminal</span>
                </div>
              </Button>

              <Button fullWidth variant="outline" size="lg" className="py-6 border-accent-brown/20 rounded-3xl press-effect flex justify-between px-6" onClick={() => handleDemoLogin('manager')}>
                <div className="flex items-center gap-3">
                  <Store size={20} />
                  <span>Manager Dashboard</span>
                </div>
              </Button>

              <Button fullWidth variant="ghost" size="lg" className="py-6 text-accent-red hover:bg-accent-red/5 rounded-3xl press-effect flex justify-between px-6" onClick={() => handleDemoLogin('superadmin')}>
                <div className="flex items-center gap-3">
                  <Shield size={20} />
                  <span>Superadmin HQ</span>
                </div>
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-black/5">
            <p className="text-[10px] text-center opacity-30 leading-relaxed">
              Development access portal for testing different user roles.<br/>
              In production, access is gated via Supabase Auth with proper credentials.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
