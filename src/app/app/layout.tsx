"use client";

import { BottomNav } from "@/components/ui/BottomNav";
import { TopBar } from "@/components/ui/TopBar";
import { useAuth } from "@/context/AuthContext";
import { Coffee } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-accent-brown/10 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center text-accent-brown animate-bounce duration-1000">
            <Coffee size={32} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-heading tracking-tight animate-pulse">Syncing Janu Bhai OS</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">Connecting to Global HQ</p>
        </div>
      </div>
    );
  }

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
