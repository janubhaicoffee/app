"use client";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { ROLE_LABELS } from "@/lib/roles";
import { Gift, MapPin, Star, User } from "lucide-react";

export default function ProfilePage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading tracking-tight">Profile</h1>
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Customer rewards and account</p>
      </header>

      <Card glass className="p-8 text-center space-y-4">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-accent-brown text-white flex items-center justify-center">
          <User size={34} />
        </div>
        <div>
          <h2 className="text-2xl font-heading">{profile?.full_name || "Dev User"}</h2>
          <p className="text-xs font-bold uppercase tracking-widest opacity-40">
            {profile?.role ? ROLE_LABELS[profile.role] : "Coffee regular"}
          </p>
        </div>
      </Card>

      <section className="grid grid-cols-2 gap-4">
        <Card className="p-6 bg-white border-black/5">
          <Star className="mb-4 text-accent-gold fill-accent-gold" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Points</p>
          <h2 className="text-3xl text-number">240</h2>
        </Card>
        <Card className="p-6 bg-white border-black/5">
          <Gift className="mb-4 text-accent-red" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Rewards</p>
          <h2 className="text-3xl text-number">2</h2>
        </Card>
      </section>

      <Card className="p-5 bg-white border-black/5 flex items-center gap-4">
        <MapPin className="opacity-40" />
        <div>
          <h2 className="text-sm font-bold">Default pickup</h2>
          <p className="text-xs opacity-50">Okhla Hub, 1.2km away</p>
        </div>
      </Card>
    </div>
  );
}
