"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, TrendingUp, AlertTriangle, PackageSearch } from 'lucide-react';
import { Button } from './Button';
import { twMerge } from 'tailwind-merge';

const ALERTS = [
  {
    id: 1,
    icon: TrendingUp,
    text: "Zomato traffic is up 40% in your area. Prep 10 extra liters of milk now.",
    actionText: "Acknowledge",
    actionType: "neutral"
  },
  {
    id: 2,
    icon: AlertTriangle,
    text: "Cashier 'Rahul' has voided 3 transactions in the last hour. Verify terminal 1.",
    actionText: "View Logs",
    actionType: "danger"
  },
  {
    id: 3,
    icon: PackageSearch,
    text: "Inventory Alert: Sugar drops below critical levels tomorrow based on current burn rate.",
    actionText: "Order Inventory",
    actionType: "warning"
  }
];

export function AIAdvisor() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 bg-[#2C231F] border border-accent-red/20 rounded-3xl shadow-2xl z-50 overflow-hidden font-sans flex flex-col"
          >
            {/* Header */}
            <div className="bg-espresso-900 p-4 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-red flex items-center justify-center text-white shadow-[0_0_15px_rgba(226,55,68,0.5)]">
                  <Bot size={16} />
                </div>
                <div>
                  <h4 className="text-white font-bold tracking-widest uppercase text-xs">Janu Bhai AI</h4>
                  <p className="text-white/50 text-[10px] tracking-widest uppercase">Proactive Monitoring</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {ALERTS.map((alert, idx) => {
                const Icon = alert.icon;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-[#1A1412] p-4 rounded-xl border border-white/5 relative group"
                  >
                    <div className="flex gap-3">
                      <div className={twMerge(
                        "mt-1 shrink-0",
                        alert.actionType === 'danger' && "text-accent-red",
                        alert.actionType === 'warning' && "text-accent-gold",
                        alert.actionType === 'neutral' && "text-white/70"
                      )}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-white/90 text-sm leading-relaxed mb-3 font-medium">
                          {alert.text}
                        </p>
                        <Button 
                          size="md"
                          className={twMerge(
                            "text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full",
                            alert.actionType === 'danger' && "bg-accent-red text-white hover:bg-white hover:text-accent-red",
                            alert.actionType === 'warning' && "bg-accent-gold text-espresso-900 hover:bg-white hover:text-espresso-900",
                            alert.actionType === 'neutral' && "bg-white/10 text-white hover:bg-white/20"
                          )}
                        >
                          {alert.actionText}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-espresso-900 rounded-full flex items-center justify-center text-accent-red border-2 border-accent-red/30 shadow-[0_10px_30px_rgba(226,55,68,0.3)] z-50 transition-colors hover:border-accent-red"
      >
        <Bot size={24} />
        
        {/* Unread dot */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-accent-red rounded-full border-2 border-bg-cream flex items-center justify-center text-[8px] text-white font-bold">
            3
          </span>
        )}
      </motion.button>
    </>
  );
}
