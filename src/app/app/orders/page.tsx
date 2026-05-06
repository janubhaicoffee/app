"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ClipboardList, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";

const initialOrders = [
  { id: "#892", source: "POS", items: "2x Cold Brew, 1x Sandwich", total: 580, status: "preparing" },
  { id: "#891", source: "Swiggy", items: "1x Hot Latte", total: 160, status: "ready" },
  { id: "#890", source: "Zomato", items: "3x Cold Brew", total: 540, status: "new" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);

  const advanceOrder = (id: string) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === id
          ? { ...order, status: order.status === "new" ? "preparing" : "ready" }
          : order
      )
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading tracking-tight">Unified Orders</h1>
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">
          POS, delivery, and counter queue
        </p>
      </header>

      <section className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-5 bg-white border-black/5 space-y-4">
            <div className="flex justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="opacity-40" />
                  <h2 className="text-lg font-heading">{order.id}</h2>
                  <span className="rounded-full bg-accent-brown/5 px-2 py-1 text-[9px] font-bold uppercase tracking-widest opacity-60">
                    {order.source}
                  </span>
                </div>
                <p className="text-sm opacity-60">{order.items}</p>
              </div>
              <div className="text-right">
                <p className="text-xl text-number">Rs {order.total}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">4m ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-black/5 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                {order.status === "ready" ? <CheckCircle2 size={16} className="text-accent-green" /> : <Clock size={16} className="opacity-40" />}
                <span className={order.status === "ready" ? "text-accent-green" : "opacity-50"}>{order.status}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="px-3 text-accent-red">
                  <XCircle size={16} />
                </Button>
                <Button className="px-4 bg-accent-brown text-white" onClick={() => advanceOrder(order.id)}>
                  <Truck size={16} className="mr-2" />
                  Update
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
