"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MapPin, Star, History } from "lucide-react";
import { RoleGuard } from "@/components/ui/RoleGuard";

export default function CustomerHome() {
  const router = useRouter();

  return (
    <RoleGuard allowedRoles={["customer", "superadmin"]}>
      <div className="space-y-8 pb-32 animate-in fade-in duration-700">
        <header className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading tracking-tight">
              Welcome back to the adda,
              <br />
              <span className="text-accent-red">Rahul.</span>
            </h1>
          </div>
          <div className="w-12 h-12 bg-accent-brown rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent-brown/20">
            <img src="/favicon.png" alt="Janu Bhai Logo" className="w-8 h-8 object-contain" />
          </div>
        </header>

        {/* The Action Button */}
        <section>
          <button 
            className="w-full bg-accent-yellow text-accent-brown p-8 rounded-[40px] shadow-[8px_8px_0_0_#4A3022] border-4 border-accent-brown transition-transform hover:-translate-y-1 active:translate-y-1 active:shadow-[2px_2px_0_0_#4A3022] flex flex-col items-center justify-center gap-2 group animate-pulse-slow"
            onClick={() => router.push("/app/outlet/okhla")}
          >
            <h2 className="text-4xl font-heading font-black tracking-tighter uppercase group-hover:scale-110 transition-transform">Order Now</h2>
            <span className="text-xs font-bold uppercase tracking-widest bg-white/50 px-4 py-1 rounded-full">( Pickup )</span>
          </button>
        </section>

        {/* Nearest Adda */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Closest Adda</h2>
          <Card
            className="p-6 border-4 border-black/10 flex justify-between items-center bg-white cursor-pointer rounded-[32px] hover:border-accent-brown transition-colors"
            onClick={() => router.push("/app/outlet/okhla")}
          >
            <div className="flex gap-4 items-center">
              <div className="p-4 bg-accent-brown text-white rounded-2xl">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-xl font-heading uppercase">Okhla Hub</h3>
                <p className="text-xs font-bold opacity-50 flex items-center gap-1 uppercase tracking-widest mt-1">
                  <Star size={12} className="fill-accent-brown text-accent-brown" />
                  4.8 • 0.2km away
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Recent Order */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Jump Back In</h2>
          <Card className="p-5 flex justify-between items-center bg-white border-2 border-black/5 rounded-[24px]">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-accent-brown/5 rounded-xl text-accent-brown">
                <History size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-tight">1x Hot Coffee</h3>
                <p className="text-[10px] opacity-40 uppercase tracking-widest">Ordered 2 days ago</p>
              </div>
            </div>
            <Button variant="ghost" className="text-accent-red font-bold text-xs uppercase tracking-widest">
              Reorder
            </Button>
          </Card>
        </section>
      </div>
    </RoleGuard>
  );
}
