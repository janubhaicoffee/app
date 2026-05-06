"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Package, Plus } from "lucide-react";

const stock = [
  { name: "Coffee Beans (Dark Roast)", unit: "kg", current: 1.2, min: 5, level: "critical" },
  { name: "Full Cream Milk", unit: "L", current: 4, min: 10, level: "low" },
  { name: "Paper Cups", unit: "pcs", current: 420, min: 200, level: "safe" },
  { name: "Chocolate Syrup", unit: "L", current: 7, min: 3, level: "safe" },
];

export default function InventoryPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading tracking-tight">Inventory</h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Okhla stock control</p>
        </div>
        <Button className="bg-accent-brown text-white px-4">
          <Plus size={18} />
        </Button>
      </header>

      <Card glass className="p-6 flex items-start gap-4 border-accent-red/20 bg-accent-red/5">
        <AlertTriangle className="text-accent-red shrink-0" />
        <div>
          <h2 className="text-lg font-heading">2 items need attention</h2>
          <p className="text-sm opacity-60">Restock beans and milk before the evening rush.</p>
        </div>
      </Card>

      <section className="grid gap-4">
        {stock.map((item) => {
          const percent = Math.min(100, Math.round((item.current / item.min) * 100));
          const tone = item.level === "critical" ? "bg-accent-red" : item.level === "low" ? "bg-accent-gold" : "bg-accent-green";
          return (
            <Card key={item.name} className="p-5 bg-white border-black/5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-accent-brown/5 p-3">
                    <Package size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">{item.name}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      Min {item.min} {item.unit}
                    </p>
                  </div>
                </div>
                <p className="text-xl text-number">
                  {item.current}
                  <span className="text-xs font-bold opacity-40"> {item.unit}</span>
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-accent-brown/5">
                <div className={`h-full ${tone}`} style={{ width: `${percent}%` }} />
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
