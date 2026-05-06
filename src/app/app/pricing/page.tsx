"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IndianRupee, TrendingUp } from "lucide-react";

const tiers = [
  { name: "Standard", markup: "0%", applies: "Neighborhood hubs", status: "Default" },
  { name: "Premium", markup: "+12%", applies: "High-rent locations", status: "Active" },
  { name: "Transit", markup: "+18%", applies: "Stations and airports", status: "Draft" },
];

export default function PricingPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading tracking-tight">Pricing Tiers</h1>
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Network price controls</p>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        {tiers.map((tier) => (
          <Card key={tier.name} className="p-6 bg-white border-black/5 space-y-5">
            <div className="flex items-center justify-between">
              <IndianRupee className="opacity-30" />
              <span className="rounded-full bg-accent-brown/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{tier.status}</span>
            </div>
            <div>
              <h2 className="text-2xl font-heading">{tier.name}</h2>
              <p className="text-sm opacity-50">{tier.applies}</p>
            </div>
            <div className="flex items-end justify-between border-t border-black/5 pt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Markup</p>
                <p className="text-3xl text-number">{tier.markup}</p>
              </div>
              <Button variant="outline" className="px-4">
                <TrendingUp size={16} className="mr-2" />
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
