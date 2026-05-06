"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  Minus, 
  ShoppingBag, 
  ChevronRight, 
  Search,
  Clock,
  CheckCircle2,
  Trash2,
  Coffee
} from 'lucide-react';

const MENU_ITEMS = [
  { id: '1', name: 'Signature Cold Brew', category: 'Coffee', price: 180, img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
  { id: '2', name: 'Masala Chai Latte', category: 'Tea', price: 120, img: 'https://images.unsplash.com/photo-1544787210-2827448636b2?auto=format&fit=crop&w=400&q=80' },
  { id: '3', name: 'Filter Coffee', category: 'Coffee', price: 90, img: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&w=400&q=80' },
  { id: '4', name: 'Paneer Tikka Sandwich', category: 'Snacks', price: 220, img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80' },
  { id: '5', name: 'Vietnamese Iced Coffee', category: 'Coffee', price: 240, img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=400&q=80' },
];

export default function POSTerminal() {
  const [cart, setCart] = useState<{id: string, name: string, price: number, qty: number}[]>([]);
  const [view, setView] = useState<'pos' | 'kds'>('pos');

  const addToCart = (item: typeof MENU_ITEMS[0]) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? {...i, qty: i.qty + 1} : i);
      return [...prev, {...item, qty: 1}];
    });
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-black/5">
        <div className="flex gap-2">
          <Button 
            variant={view === 'pos' ? 'primary' : 'ghost'} 
            className="text-[10px] font-bold uppercase tracking-widest rounded-xl"
            onClick={() => setView('pos')}
          >
            Terminal
          </Button>
          <Button 
            variant={view === 'kds' ? 'primary' : 'ghost'} 
            className="text-[10px] font-bold uppercase tracking-widest rounded-xl"
            onClick={() => setView('kds')}
          >
            Kitchen Display
          </Button>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest">Okhla Terminal A</p>
          <p className="text-xs font-bold">10:42 AM</p>
        </div>
      </header>

      {view === 'pos' ? (
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Menu Selection */}
          <div className="flex-1 space-y-6 overflow-y-auto pr-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
              <input type="text" placeholder="Search menu..." className="w-full bg-white border border-black/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-brown/10" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {MENU_ITEMS.map((item) => (
                <Card 
                  key={item.id} 
                  pressEffect 
                  className="p-0 overflow-hidden flex flex-col h-56 bg-white hover:border-accent-brown/20 group"
                  onClick={() => addToCart(item)}
                >
                  <div className="h-24 overflow-hidden relative">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[8px] font-bold uppercase tracking-widest text-accent-brown">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="text-sm font-heading leading-tight">{item.name}</h4>
                    <p className="text-lg text-number">₹{item.price}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="w-80 flex flex-col gap-4">
            <Card glass className="flex-1 flex flex-col p-6 border-accent-brown/10 rounded-[32px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-heading">Order Info</h3>
                <ShoppingBag className="opacity-20" size={20} />
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 gap-3 text-center">
                    <Coffee size={40} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Cart is Empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center animate-in slide-in-from-right-4">
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold">{item.name}</h5>
                        <p className="text-[10px] opacity-40">₹{item.price} × {item.qty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-black/5 rounded" onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}>
                          <Trash2 size={12} className="text-accent-red opacity-40" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-black/5 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Total Amount</span>
                  <span className="text-3xl text-number">₹{total}</span>
                </div>
                <Button fullWidth size="lg" className="py-5 bg-accent-brown text-white shadow-xl rounded-2xl flex justify-between items-center px-6">
                  Checkout
                  <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6 overflow-y-auto">
          {[
            { id: '#892', type: 'DINE-IN', time: '4m', items: ['2x Cold Brew', '1x Paneer Sandwich'], status: 'preparing' },
            { id: '#891', type: 'TAKEAWAY', time: '12m', items: ['1x Hot Latte'], status: 'ready' },
            { id: '#890', type: 'ONLINE', time: '15m', items: ['3x Cold Brew'], status: 'preparing' },
          ].map((order, i) => (
            <Card key={i} glass className={`p-6 flex flex-col h-fit border-l-4 ${order.status === 'ready' ? 'border-l-accent-green' : 'border-l-accent-brown'} rounded-[32px]`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-heading leading-none">{order.id}</h4>
                  <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">{order.type}</span>
                </div>
                <div className="flex items-center gap-1 opacity-40">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold">{order.time}</span>
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {order.items.map((item, j) => (
                  <li key={j} className="text-sm font-medium flex items-center gap-2">
                    <div className="w-1 h-1 bg-black/20 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button fullWidth className={order.status === 'ready' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-brown text-white'}>
                {order.status === 'ready' ? <CheckCircle2 size={18} /> : 'Mark as Ready'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
