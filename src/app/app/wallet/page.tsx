"use client";

import { RoleGuard } from "@/components/ui/RoleGuard";
import { Card } from "@/components/ui/Card";
import { Coffee, QrCode } from "lucide-react";

export default function WalletPage() {
  return (
    <RoleGuard allowedRoles={["customer", "superadmin"]}>
      <div className="space-y-8 animate-in fade-in duration-700 pb-32">
        <header className="space-y-2">
          <h1 className="text-4xl font-heading font-black tracking-tighter uppercase drop-shadow-[2px_2px_0_0_#E23744]">
            Loyalty Wallet
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">
            Earn rewards with every cup
          </p>
        </header>

        {/* Digital Card */}
        <section>
          <div className="w-full aspect-[1.6/1] bg-accent-yellow rounded-[40px] border-4 border-accent-brown shadow-[8px_8px_0_0_#4A3022] p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute -right-10 -top-10 text-white/30 rotate-12">
              <Coffee size={200} strokeWidth={1} />
            </div>

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Janu Credits</p>
                <h2 className="text-6xl font-black font-heading tracking-tighter text-accent-brown mt-1">₹450</h2>
              </div>
              <img src="/favicon.png" alt="Logo" className="w-12 h-12 object-contain grayscale contrast-200" />
            </div>

            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="font-bold uppercase tracking-widest text-sm">Rahul T.</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Member since 2026</p>
              </div>
              <button className="bg-white/50 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent-brown hover:bg-white transition-colors">
                Add Funds
              </button>
            </div>
          </div>
        </section>

        {/* Poshtik Points */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Poshtik Points</h2>
          <Card className="p-6 bg-white border-4 border-black/10 rounded-[32px]">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold uppercase tracking-widest text-sm">Next Free Coffee</span>
              <span className="bg-accent-red text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">7/10 Cups</span>
            </div>
            
            {/* Progress Bar */}
            <div className="flex gap-2 w-full">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 h-3 rounded-full ${i < 7 ? 'bg-accent-red' : 'bg-black/5'}`}
                />
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-center mt-4">
              3 more cups for a free Cold Coffee
            </p>
          </Card>
        </section>

        {/* Scan to Pay */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Pay at Adda</h2>
          <Card className="p-8 bg-white border-2 border-black/5 rounded-[32px] flex flex-col items-center justify-center text-center gap-4">
            <div className="p-6 bg-bg-cream rounded-3xl border-2 border-dashed border-black/10">
              <QrCode size={100} className="text-accent-brown/20" />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-widest">Scan to Pay / Earn</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">Show this code at the terminal</p>
            </div>
          </Card>
        </section>
      </div>
    </RoleGuard>
  );
}
