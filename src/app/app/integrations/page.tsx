"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plug, RefreshCw } from "lucide-react";

const initialIntegrations = [
  { name: "Zomato", status: "connected", orders: 18, enabled: true },
  { name: "Swiggy", status: "connected", orders: 22, enabled: true },
  { name: "Uengage", status: "syncing", orders: 6, enabled: true },
  { name: "POS Terminal", status: "connected", orders: 41, enabled: true },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(initialIntegrations);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading tracking-tight">Integrations</h1>
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Delivery and order channels</p>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.name} className="p-6 bg-white border-black/5 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-accent-brown/5 p-4">
                  <Plug size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-heading">{integration.name}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{integration.status}</p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={integration.enabled}
                className={`h-7 w-12 rounded-full p-1 transition-colors ${integration.enabled ? "bg-accent-green" : "bg-accent-brown/10"}`}
                onClick={() =>
                  setIntegrations((items) =>
                    items.map((item) =>
                      item.name === integration.name ? { ...item, enabled: !item.enabled } : item
                    )
                  )
                }
              >
                <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${integration.enabled ? "translate-x-5" : ""}`} />
              </button>
            </div>
            <div className="flex items-end justify-between border-t border-black/5 pt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Orders today</p>
                <p className="text-2xl text-number">{integration.orders}</p>
              </div>
              <Button variant="outline" className="px-4">
                <RefreshCw size={16} className="mr-2" />
                Sync
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
