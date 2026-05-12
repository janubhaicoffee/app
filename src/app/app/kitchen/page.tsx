"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/ui/SEO';
import { Clock, MonitorSmartphone, UtensilsCrossed } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type OrderSource = 'POS' | 'ZOMATO' | 'SWIGGY';

interface KitchenOrder {
  id: string;
  source: OrderSource;
  timestamp: string;
  items: { hot: number; cold: number };
  status: 'pending' | 'ready';
}

const MOCK_ORDERS: KitchenOrder[] = [
  { id: '#1042', source: 'POS', timestamp: '10:42 AM', items: { hot: 2, cold: 0 }, status: 'pending' },
  { id: '#1043', source: 'ZOMATO', timestamp: '10:44 AM', items: { hot: 1, cold: 2 }, status: 'pending' },
  { id: '#1044', source: 'POS', timestamp: '10:45 AM', items: { hot: 0, cold: 4 }, status: 'pending' },
  { id: '#1045', source: 'SWIGGY', timestamp: '10:46 AM', items: { hot: 1, cold: 1 }, status: 'pending' },
  { id: '#1046', source: 'POS', timestamp: '10:48 AM', items: { hot: 3, cold: 0 }, status: 'pending' },
];

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState<KitchenOrder[]>(MOCK_ORDERS);

  const handleComplete = (id: string) => {
    // 1. Mark as ready to trigger Yellow state
    setOrders((prev) => 
      prev.map((order) => order.id === id ? { ...order, status: 'ready' } : order)
    );

    // 2. Remove after 1 second
    setTimeout(() => {
      setOrders((prev) => prev.filter((order) => order.id !== id));
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-espresso-900 text-bg-cream p-4 font-sans selection:bg-accent-red selection:text-white overflow-hidden">
      <SEO title="KDS | Janu Bhai OS" description="Live Kitchen Display System" />

      {/* Header (Minimal, Glare-free) */}
      <header className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-heading font-black tracking-tighter uppercase text-white flex items-center gap-3">
          <UtensilsCrossed className="text-accent-gold" /> LIVE KITCHEN FEED
        </h1>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50">
            <MonitorSmartphone size={14} /> Screen Active
          </span>
          <div className="text-xl font-number font-black text-accent-gold">
            {orders.filter(o => o.status === 'pending').length} PENDING
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AnimatePresence>
          {orders.map((order) => {
            const isReady = order.status === 'ready';

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={() => !isReady && handleComplete(order.id)}
                className={twMerge(
                  "cursor-pointer aspect-square rounded-2xl flex flex-col justify-between overflow-hidden relative shadow-2xl transition-colors duration-300",
                  isReady ? "bg-accent-gold" : "bg-black/60 border border-white/10 hover:border-white/30"
                )}
              >
                {/* Top Bar */}
                <div className={twMerge(
                  "px-4 py-3 flex justify-between items-center border-b font-bold tracking-widest uppercase text-xs",
                  isReady ? "border-espresso-900/10 text-espresso-900" : "border-white/10 text-white/50"
                )}>
                  <div className="flex items-center gap-2">
                    <div className={twMerge(
                      "w-2 h-2 rounded-full",
                      !isReady && order.source === 'POS' ? "bg-accent-gold" : "",
                      !isReady && order.source === 'ZOMATO' ? "bg-red-500" : "",
                      !isReady && order.source === 'SWIGGY' ? "bg-orange-500" : "",
                      isReady ? "bg-espresso-900" : ""
                    )} />
                    {order.source}
                  </div>
                  <span>{order.id}</span>
                </div>

                {/* Center Content (MASSIVE TEXT) */}
                <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4">
                  {order.items.hot > 0 && (
                    <div className={twMerge(
                      "text-5xl md:text-6xl font-black font-number flex items-baseline gap-2",
                      isReady ? "text-espresso-900" : "text-white"
                    )}>
                      {order.items.hot}<span className="text-2xl font-heading tracking-tighter">x HOT</span>
                    </div>
                  )}
                  {order.items.cold > 0 && (
                    <div className={twMerge(
                      "text-5xl md:text-6xl font-black font-number flex items-baseline gap-2",
                      isReady ? "text-espresso-900" : "text-accent-gold"
                    )}>
                      {order.items.cold}<span className="text-2xl font-heading tracking-tighter">x COLD</span>
                    </div>
                  )}
                </div>

                {/* Bottom Bar */}
                <div className={twMerge(
                  "px-4 py-3 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest",
                  isReady ? "text-espresso-900/50" : "text-white/30"
                )}>
                  <span className="flex items-center gap-1"><Clock size={10} /> {order.timestamp}</span>
                  {isReady ? <span>Completed</span> : <span>Tap to Complete</span>}
                </div>
                
                {/* Ready Overlay */}
                {isReady && (
                  <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {orders.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="absolute inset-0 flex flex-col items-center justify-center text-white/20 pointer-events-none"
        >
          <UtensilsCrossed size={64} className="mb-4" />
          <h2 className="text-3xl font-heading tracking-tighter uppercase">Kitchen is Clear</h2>
        </motion.div>
      )}

    </div>
  );
}
