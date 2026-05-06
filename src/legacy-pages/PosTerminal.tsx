import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { MenuItem } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useCountUp } from '../hooks/useCountUp';
import { Coffee, CheckCircle, ShoppingBag, CreditCard, Banknote, Trash2 } from 'lucide-react';

export const PosTerminal = () => {
  const { profile } = useAuth();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<{item: MenuItem, qty: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const total = orderItems.reduce((acc, curr) => acc + (curr.item.price * curr.qty), 0);
  const animatedTotal = useCountUp(total);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    // Simulate cinematic delay
    await new Promise(r => setTimeout(r, 600));
    
    try {
      const response = await fetch('/api/catalog?type=menu');
      if (response.ok) {
        const data = await response.json();
        setMenu(data as MenuItem[]);
        setLoading(false);
        return;
      }
    } catch {
      console.warn("Netlify API unavailable, using fallback.");
    }
    
    setMenu([
      { id: '1', name: 'Strong Filter Kaapi', category: 'Hot Coffee', price: 45, is_available: true, image_url: null },
      { id: '2', name: 'Classic Adrak Chai', category: 'Tea', price: 30, is_available: true, image_url: null },
      { id: '3', name: 'Cold Coffee (Thick)', category: 'Cold Beverages', price: 80, is_available: true, image_url: null },
      { id: '4', name: 'Bun Maska', category: 'Snacks', price: 40, is_available: true, image_url: null },
      { id: '5', name: 'Vada Pav', category: 'Snacks', price: 35, is_available: true, image_url: null },
    ]);
    setLoading(false);
  };

  const addToOrder = (item: MenuItem) => {
    setOrderItems(prev => {
      const existing = prev.find(p => p.item.id === item.id);
      if (existing) {
        return prev.map(p => p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const removeFromOrder = (itemId: string) => {
    setOrderItems(prev => prev.filter(p => p.item.id !== itemId));
  };

  const confirmOrder = async (method: 'cash' | 'online') => {
    if (orderItems.length === 0) return;
    
    try {
      if (profile?.outlet_id && profile.id !== 'dev-bypass-id') {
         await supabase.from('orders').insert({
            outlet_id: profile.outlet_id,
            user_id: profile.id,
            total_amount: total,
            payment_method: method,
            status: 'completed'
         });
      }
    } catch {
      console.warn("Order insert skipped for demo.");
    }
    
    setSuccess(true);
    setTimeout(() => {
      setOrderItems([]);
      setSuccess(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40 mb-8" />
        <div className="pos-grid">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-bg-cream flex flex-col items-center justify-center z-50 animate-fade-in">
        <div className="w-24 h-24 bg-accent-green/10 rounded-full flex items-center justify-center text-accent-green mb-6 animate-scale-in">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-3xl font-heading mb-2">Paisa Aagaya! ✅</h2>
        <p className="text-lg opacity-60">₹{total} collected successfully</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-40">
      <div className="flex justify-between items-end mb-8 px-1">
        <div>
          <h2 className="text-3xl font-heading mb-1">New Order</h2>
          <p className="text-sm opacity-60">Sab ka favorite coffee serve karo</p>
        </div>
        <div className="bg-accent-brown-muted p-2 rounded-xl text-accent-brown">
          <ShoppingBag size={24} />
        </div>
      </div>

      <div className="pos-grid mb-8">
        {menu.map(item => (
          <button 
            key={item.id} 
            className="pos-item press-effect hover-lift flex flex-col items-start p-4 text-left border-none"
            onClick={() => addToOrder(item)}
          >
            <div className="pos-item-icon mb-4">
              <Coffee size={20} />
            </div>
            <h4 className="text-sm font-bold leading-tight mb-1">{item.name}</h4>
            <span className="text-lg text-number">₹{item.price}</span>
          </button>
        ))}
      </div>

      {orderItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-bg-cream via-bg-cream to-transparent pb-nav">
          <Card className="shadow-2xl border-none p-5 overflow-hidden">
            {/* Items List - Compact Preview */}
            <div className="mb-4 space-y-2 max-h-32 overflow-y-auto">
              {orderItems.map(({ item, qty }) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-accent-brown">x{qty}</span>
                    <span className="font-medium opacity-70">{item.name}</span>
                  </div>
                  <button 
                    onClick={() => removeFromOrder(item.id)}
                    className="p-1.5 bg-accent-red-muted text-accent-red rounded-lg"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t border-black/5">
              <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest">Total Bill</h3>
              <span className="text-3xl text-number">₹{animatedTotal}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => confirmOrder('cash')} 
                variant="outline"
                className="py-6 flex flex-col items-center gap-1 border-accent-brown/20 press-effect"
              >
                <Banknote size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Cash Pay</span>
              </Button>
              <Button 
                onClick={() => confirmOrder('online')}
                className="py-6 flex flex-col items-center gap-1 press-effect shadow-lg"
              >
                <CreditCard size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Online QR</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
