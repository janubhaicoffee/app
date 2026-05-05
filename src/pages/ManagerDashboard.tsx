import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { TrendingUp, Coffee } from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [sales, setSales] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayStats();
  }, [profile]);

  const fetchTodayStats = async () => {
    if (!profile) return;
    
    // For demo, if we don't have a real DB connected, set mock data
    if (profile.id === 'dev-bypass-id') {
      setSales(12540);
      setOrdersCount(142);
      setLoading(false);
      return;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const { data, error } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('outlet_id', profile.outlet_id)
      .eq('status', 'completed')
      .gte('created_at', startOfDay.toISOString());

    if (!error && data) {
      const total = data.reduce((sum, order) => sum + Number(order.total_amount), 0);
      setSales(total);
      setOrdersCount(data.length);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="mb-1 text-2xl">Today's Overview</h2>
        <p className="text-sm text-[var(--text-secondary)]">Your outlet performance</p>
      </div>

      <Card glass className="bg-[var(--accent-brown)] text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10">
          <Coffee size={120} />
        </div>
        <p className="text-white/80 text-sm font-medium mb-1">Total Sales</p>
        <h1 className="text-4xl mb-4">₹{sales.toLocaleString()}</h1>
        <div className="flex items-center text-sm bg-white/20 inline-flex px-2 py-1 rounded-full">
          <TrendingUp size={16} className="mr-1" /> +14% vs yesterday
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card glass>
          <p className="text-sm text-[var(--text-secondary)] mb-1">Orders</p>
          <h2 className="text-2xl">{ordersCount}</h2>
        </Card>
        <Card glass>
          <p className="text-sm text-[var(--text-secondary)] mb-1">Expenses</p>
          <h2 className="text-2xl text-[var(--accent-red)]">₹2,450</h2>
        </Card>
      </div>

      <Card glass>
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center border-b border-black/5 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-black/5 flex items-center justify-center">
                  <Coffee size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">Order #{1024 + i}</p>
                  <p className="text-xs text-[var(--text-secondary)]">2 mins ago</p>
                </div>
              </div>
              <p className="font-semibold text-sm">₹{45 * i + 30}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
