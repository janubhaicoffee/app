"use client";

import { RoleGuard } from "@/components/ui/RoleGuard";
import { Card } from "@/components/ui/Card";
import { Package, Plus } from "lucide-react";

const INVENTORY_ITEMS = [
  { id: 1, name: "AAA Coffee Beans", unit: "Kg", current: 4.2, max: 20 },
  { id: 2, name: "Whole Milk", unit: "Liters", current: 12, max: 50 },
  { id: 3, name: "Raw Sugar", unit: "Kg", current: 1.5, max: 10 }, // Below 20%
  { id: 4, name: "Paper Cups", unit: "Units", current: 450, max: 1000 },
];

export default function InventoryPage() {
  return (
    <RoleGuard allowedRoles={["manager", "outlet_owner", "superadmin"]}>
      <div className="space-y-6 relative min-h-[calc(100vh-140px)]">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-heading font-black tracking-tighter uppercase">
              Inventory
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 mt-1">
              Core Raw Materials
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
          {INVENTORY_ITEMS.map((item) => {
            const percentage = (item.current / item.max) * 100;
            const isLow = percentage <= 20;

            return (
              <Card key={item.id} className={`p-6 border-4 rounded-[32px] bg-white transition-colors ${isLow ? 'border-accent-red shadow-[4px_4px_0_0_#E23744]' : 'border-black/10'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${isLow ? 'bg-accent-red/10 text-accent-red' : 'bg-black/5 text-accent-brown'}`}>
                      <Package size={20} />
                    </div>
                    <h3 className="font-bold text-lg uppercase tracking-tight">{item.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-black tracking-tighter ${isLow ? 'text-accent-red' : 'text-accent-brown'}`}>
                      {item.current}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">
                      / {item.max} {item.unit}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-black/5 h-4 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-accent-red' : 'bg-accent-green'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {isLow && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent-red mt-3">
                    Critical Level! Restock immediately.
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        {/* Floating Action Button */}
        <button className="fixed bottom-8 right-8 md:bottom-12 md:right-12 w-16 h-16 bg-accent-brown text-white rounded-full shadow-[4px_4px_0_0_#FFB800] border-2 border-accent-yellow flex items-center justify-center hover:scale-105 active:scale-95 transition-transform group">
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </RoleGuard>
  );
}
