"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MapPin, Plus, Store, ToggleRight } from "lucide-react";

const outlets = [
  { name: "Okhla Hub", city: "New Delhi", status: "Active", sales: "Rs 1.24L", health: "Strong" },
  { name: "Saket Hub", city: "New Delhi", status: "Active", sales: "Rs 98K", health: "Stable" },
  { name: "CP Hub", city: "New Delhi", status: "Review", sales: "Rs 87K", health: "Watch" },
  { name: "Koramangala Hub", city: "Bengaluru", status: "Suspended", sales: "Rs 0", health: "Blocked" },
];

export default function OutletsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading tracking-tight">Outlet Network</h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Create, suspend, and monitor hubs</p>
        </div>
        <Button className="bg-accent-brown text-white px-4">
          <Plus size={18} className="mr-2" />
          Outlet
        </Button>
      </header>

      <section className="grid gap-4">
        {outlets.map((outlet) => (
          <Card key={outlet.name} className="p-5 bg-white border-black/5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-accent-brown/5 p-3">
                  <Store size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-heading">{outlet.name}</h2>
                  <p className="flex items-center gap-1 text-xs opacity-50">
                    <MapPin size={12} />
                    {outlet.city}
                  </p>
                </div>
              </div>
              <ToggleRight className={outlet.status === "Suspended" ? "text-accent-red" : "text-accent-green"} />
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-black/5 pt-4 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Status</p>
                <p className="text-sm font-bold">{outlet.status}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Sales</p>
                <p className="text-sm font-bold">{outlet.sales}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Health</p>
                <p className="text-sm font-bold">{outlet.health}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
