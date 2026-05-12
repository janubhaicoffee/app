"use client";

import { BottomNav } from "@/components/ui/BottomNav";
import { TopBar } from "@/components/ui/TopBar";
import { DashboardSidebar } from "@/components/ui/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { Store } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, profile } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-accent-brown/10 border-t-accent-red rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-2 animate-pulse">
          <h2 className="text-xl font-heading tracking-tight text-accent-brown">Syncing Janu Bhai OS</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Connecting to Global HQ</p>
        </div>
      </div>
    );
  }

  // Fallback if somehow not authenticated but loaded (should be caught by middleware or login guards)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-cream">
        <button onClick={() => router.push('/login')} className="bg-accent-red text-white px-6 py-3 font-bold">
          Login Required
        </button>
      </div>
    );
  }

  const isCustomer = profile.role === "customer";

  if (isCustomer) {
    return (
      <div className="min-h-screen bg-bg-cream text-accent-brown">
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <TopBar />
        </div>
        <main className="max-w-4xl mx-auto p-6 md:p-10 pb-40">
          {children}
        </main>
        <BottomNav />
      </div>
    );
  }

  // Franchise Shell
  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown flex">
      {/* Sidebar - Hidden on very small screens, assumed desktop/tablet for OS */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <DashboardSidebar />
      </div>

      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Top Data Ribbon */}
        <header className="h-16 bg-white border-b-4 border-black/10 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Store className="text-accent-red" size={20} />
            <span className="font-bold uppercase tracking-widest text-xs">Okhla Hub (Active)</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[8px] uppercase tracking-widest font-bold opacity-40 block leading-none">Live Revenue</span>
              <span className="font-bold text-accent-green leading-none">₹12,450</span>
            </div>
            <div className="md:hidden">
              {/* Mobile menu toggle could go here, but POS is usually tablet/desktop */}
            </div>
          </div>
        </header>

        {/* Main Content Pane */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
