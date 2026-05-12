"use client";

import { RoleGuard } from "@/components/ui/RoleGuard";
import { Card } from "@/components/ui/Card";
import { Coffee, MapPin, Store } from "lucide-react";

// Mock data representing omnichannel orders
const LIVE_ORDERS = [
  { id: "#890", source: "Walk-in", time: "2m", items: ["2x Hot Coffee", "1x Cold Coffee"], status: "NEW", customer: "Rahul T." },
  { id: "#891", source: "Zomato", time: "5m", items: ["4x Cold Coffee"], status: "PREPARING", customer: "Sneha M." },
  { id: "#892", source: "Swiggy", time: "8m", items: ["1x Hot Coffee"], status: "PREPARING", customer: "Karan P." },
  { id: "#893", source: "Walk-in", time: "12m", items: ["3x Hot Coffee"], status: "READY", customer: "Anita D." },
  { id: "#894", source: "Zomato", time: "1m", items: ["1x Cold Coffee"], status: "NEW", customer: "Vikram S." },
];

const SOURCE_COLORS: Record<string, string> = {
  "Walk-in": "bg-accent-brown text-white",
  "Zomato": "bg-accent-red text-white",
  "Swiggy": "bg-[#FC8019] text-white", // Swiggy Orange
};

const STATUS_COLUMNS = ["NEW", "PREPARING", "READY"];

export default function OmnichannelOrders() {
  
  return (
    <RoleGuard allowedRoles={["cashier", "manager", "outlet_owner", "superadmin"]}>
      <div className="flex flex-col h-[calc(100vh-140px)] space-y-6">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-heading font-black uppercase tracking-tighter drop-shadow-[2px_2px_0_0_#FFB800]">
              Omnichannel Feed
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 mt-2">
              Live Order Synchronization
            </p>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          {STATUS_COLUMNS.map(status => {
            const columnOrders = LIVE_ORDERS.filter(o => o.status === status);
            return (
              <div key={status} className="flex flex-col bg-white border-4 border-accent-brown shadow-[8px_8px_0_0_#4A3022] rounded-[32px] overflow-hidden">
                <div className={`p-4 border-b-4 border-accent-brown flex justify-between items-center ${status === 'READY' ? 'bg-accent-green text-white' : 'bg-accent-brown text-bg-cream'}`}>
                  <h2 className="font-heading text-2xl tracking-tight uppercase">{status}</h2>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                    {columnOrders.length}
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-bg-cream">
                  {columnOrders.map(order => (
                    <Card key={order.id} className="p-0 overflow-hidden border-2 border-black/10 bg-white hover:border-accent-brown transition-colors cursor-pointer group">
                      <div className="p-4 flex justify-between items-start border-b border-black/5">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-xl">{order.id}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${SOURCE_COLORS[order.source]}`}>
                              {order.source}
                            </span>
                          </div>
                          <span className="text-xs font-bold opacity-60 uppercase">{order.customer}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-accent-red block">{order.time}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-black/[0.02]">
                        <ul className="space-y-2">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-sm font-bold flex items-center gap-2 text-accent-brown">
                              <Coffee size={14} className="opacity-40" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Action Bar */}
                      <div className="p-3 bg-white border-t border-black/5 text-center group-hover:bg-accent-yellow transition-colors">
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {status === 'NEW' && 'Start Preparing →'}
                          {status === 'PREPARING' && 'Mark Ready →'}
                          {status === 'READY' && 'Complete Order ✓'}
                        </span>
                      </div>
                    </Card>
                  ))}
                  
                  {columnOrders.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-6">
                      <Store size={48} className="mb-4" />
                      <p className="font-bold uppercase tracking-widest">No {status} Orders</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </RoleGuard>
  );
}
