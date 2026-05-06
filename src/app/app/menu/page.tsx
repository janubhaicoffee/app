"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Coffee, Plus } from "lucide-react";

const items = [
  { name: "Signature Cold Brew", category: "Coffee", price: 180, availability: "All outlets" },
  { name: "Masala Chai Latte", category: "Tea", price: 120, availability: "Delhi NCR" },
  { name: "Filter Coffee", category: "Coffee", price: 90, availability: "All outlets" },
  { name: "Paneer Tikka Sandwich", category: "Snack", price: 220, availability: "Selected hubs" },
];

export default function MenuManagementPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading tracking-tight">Global Menu</h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Central catalog and outlet availability</p>
        </div>
        <Button className="bg-accent-brown text-white px-4">
          <Plus size={18} className="mr-2" />
          Item
        </Button>
      </header>

      <section className="grid gap-4">
        {items.map((item) => (
          <Card key={item.name} className="p-5 bg-white border-black/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-accent-brown/5 p-3">
                <Coffee size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold">{item.name}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{item.category} - {item.availability}</p>
              </div>
            </div>
            <span className="text-xl text-number">Rs {item.price}</span>
          </Card>
        ))}
      </section>
    </div>
  );
}
