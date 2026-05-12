"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ShoppingBag, 
  Trash2,
  Coffee,
  CheckCircle2,
  Wallet,
  QrCode,
  Banknote
} from 'lucide-react';
import { RoleGuard } from '@/components/ui/RoleGuard';
import { motion, AnimatePresence } from 'framer-motion';
import { formatINR } from '@/lib/utils/currency';

const MENU_ITEMS = [
  { id: 'hot-coffee', name: 'HOT COFFEE', price: 20, type: 'hot', color: 'bg-accent-red', text: 'text-white' },
  { id: 'cold-coffee', name: 'COLD COFFEE', price: 50, type: 'cold', color: 'bg-accent-yellow', text: 'text-accent-brown' },
];

export default function POSTerminal() {
  const [cart, setCart] = useState<{id: string, name: string, price: number, qty: number}[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const addToCart = (item: typeof MENU_ITEMS[0]) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? {...i, qty: i.qty + 1} : i);
      return [...prev, {...item, qty: 1}];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const clearCart = () => setCart([]);

  const handleCheckout = (method: string) => {
    if (cart.length === 0) return;
    
    // Simulate checkout
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      clearCart();
    }, 1500);
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <RoleGuard allowedRoles={["cashier", "manager", "outlet_owner", "superadmin"]}>
      <div className="h-[calc(100vh-140px)] flex gap-6 relative">
        
        {/* Success Overlay Animation */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 z-50 bg-accent-green text-white rounded-[40px] flex flex-col items-center justify-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <CheckCircle2 size={120} strokeWidth={3} className="mb-6 drop-shadow-xl" />
              </motion.div>
              <h1 className="text-6xl font-heading font-black tracking-tighter uppercase drop-shadow-lg">Order Paid</h1>
              <p className="text-xl font-bold mt-4 opacity-80 uppercase tracking-widest">Clearing Terminal...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEFT: Menu Board */}
        <div className="flex-[2] flex flex-col gap-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Menu Board</h2>
          <div className="flex-1 grid grid-cols-1 gap-6">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className={`w-full flex-1 rounded-[40px] flex flex-col items-center justify-center transition-transform hover:scale-[1.02] active:scale-95 shadow-xl border-4 border-black/10 ${item.color} ${item.text}`}
              >
                <Coffee size={80} strokeWidth={3} className="mb-6 opacity-80" />
                <h2 className="text-5xl md:text-7xl font-heading font-black tracking-tighter leading-none mb-4">{item.name}</h2>
                <div className="bg-white/20 px-6 py-2 rounded-full backdrop-blur-md">
                  <span className="text-3xl font-bold tracking-widest">{formatINR(item.price)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Order Ledger */}
        <div className="flex-[1.5] flex flex-col gap-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Order Ledger</h2>
          <Card className="flex-1 flex flex-col bg-white border-4 border-accent-brown shadow-[8px_8px_0_0_#4A3022] rounded-[32px] overflow-hidden">
            <div className="bg-accent-brown text-white p-6 flex justify-between items-center">
              <h3 className="text-2xl font-heading uppercase">Current Ticket</h3>
              <ShoppingBag size={24} className="opacity-50" />
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-bg-cream">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
                  <Coffee size={64} />
                  <p className="font-bold uppercase tracking-widest">Ticket Empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex flex-col bg-white p-4 rounded-2xl border-2 border-black/5 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-lg font-bold uppercase tracking-tight">{item.name}</h4>
                      <span className="text-lg font-bold">{formatINR(item.price * item.qty)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 bg-bg-cream rounded-xl p-1 border border-black/5">
                        <button onClick={() => updateQty(item.id, -1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-xl hover:bg-accent-red hover:text-white transition-colors">-</button>
                        <span className="w-6 text-center font-bold text-xl">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-xl hover:bg-accent-green hover:text-white transition-colors">+</button>
                      </div>
                      <button onClick={() => updateQty(item.id, -item.qty)} className="p-3 text-accent-red hover:bg-accent-red/10 rounded-xl transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-white border-t-4 border-black/5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">Grand Total</span>
                <span className="text-5xl font-black tracking-tighter text-accent-brown">{formatINR(total)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: Payment Actions */}
        <div className="flex-[1] flex flex-col gap-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Payment</h2>
          <div className="flex-1 flex flex-col gap-4">
            <button 
              onClick={() => handleCheckout('CASH')}
              disabled={cart.length === 0}
              className="flex-1 flex flex-col items-center justify-center bg-accent-green text-white rounded-[32px] border-4 border-black/10 shadow-[4px_4px_0_0_#000] disabled:opacity-50 disabled:grayscale transition-transform hover:translate-y-1 hover:shadow-none"
            >
              <Banknote size={48} className="mb-4" />
              <span className="text-3xl font-heading font-black uppercase">CASH</span>
            </button>

            <button 
              onClick={() => handleCheckout('UPI')}
              disabled={cart.length === 0}
              className="flex-1 flex flex-col items-center justify-center bg-white text-accent-brown rounded-[32px] border-4 border-accent-brown shadow-[4px_4px_0_0_#4A3022] disabled:opacity-50 transition-transform hover:translate-y-1 hover:shadow-none"
            >
              <QrCode size={48} className="mb-4 text-accent-brown" />
              <span className="text-2xl font-heading font-black uppercase">UPI / QR</span>
            </button>

            <button 
              onClick={() => handleCheckout('WALLET')}
              disabled={cart.length === 0}
              className="flex-1 flex flex-col items-center justify-center bg-accent-yellow text-accent-brown rounded-[32px] border-4 border-accent-brown shadow-[4px_4px_0_0_#4A3022] disabled:opacity-50 transition-transform hover:translate-y-1 hover:shadow-none"
            >
              <Wallet size={48} className="mb-4" />
              <span className="text-2xl font-heading font-black uppercase text-center">LOYALTY<br/>WALLET</span>
            </button>
          </div>
        </div>

      </div>
    </RoleGuard>
  );
}
