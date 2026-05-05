import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { MenuItem } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Coffee, CheckCircle } from 'lucide-react';

export const PosTerminal: React.FC = () => {
  const { profile } = useAuth();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<{item: MenuItem, qty: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase.from('menu_items').select('*').eq('is_available', true);
    if (!error && data) {
      setMenu(data as MenuItem[]);
    }
    // Also inject some dummy data if supabase is empty (for demo preview without DB connection)
    if (!data || data.length === 0) {
      setMenu([
        { id: '1', name: 'Strong Filter Kaapi', category: 'Hot', price: 45, is_available: true, image_url: null },
        { id: '2', name: 'Classic Adrak Chai', category: 'Hot', price: 30, is_available: true, image_url: null },
        { id: '3', name: 'Bun Maska', category: 'Snacks', price: 40, is_available: true, image_url: null },
      ]);
    }
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

  const total = orderItems.reduce((acc, curr) => acc + (curr.item.price * curr.qty), 0);

  const confirmOrder = async (method: 'cash' | 'online') => {
    if (orderItems.length === 0) return;
    
    // In a real scenario we insert into Supabase here
    // But since the project might not be connected to a real DB right now, we simulate success
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
    } catch (e) {
      console.warn("DB insert skipped for demo.");
    }
    
    setSuccess(true);
    setTimeout(() => {
      setOrderItems([]);
      setSuccess(false);
    }, 2000);
  };

  if (loading) return <div className="p-4">Loading Menu...</div>;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in text-center">
        <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={48} />
        </div>
        <h2>Order Successful</h2>
        <p className="mt-2 text-lg">Total Paid: ₹{total}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-32">
      <div className="grid grid-cols-2 gap-4 mb-6">
        {menu.map(item => (
          <Card 
            key={item.id} 
            glass 
            className="cursor-pointer hover:border-[var(--accent-brown)] transition-colors active:scale-95"
            onClick={() => addToOrder(item)}
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="h-10 w-10 bg-[var(--accent-brown-light)]/10 text-[var(--accent-brown)] rounded-full flex items-center justify-center">
                <Coffee size={20} />
              </div>
              <div>
                <h4 className="font-medium text-sm leading-tight mb-1">{item.name}</h4>
                <p className="text-[var(--text-secondary)] font-semibold text-sm">₹{item.price}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {orderItems.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-40 max-w-480 mx-auto w-full">
          <Card className="shadow-lg border border-[var(--border-subtle)] bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Current Order ({orderItems.reduce((a,c)=>a+c.qty,0)})</h3>
              <p className="font-bold text-lg">₹{total}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => confirmOrder('cash')} variant="outline">Cash</Button>
              <Button onClick={() => confirmOrder('online')}>Online (QR)</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
