import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Activity, MapPin, Users } from 'lucide-react';

export const SuperadminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [outletsCount, setOutletsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetworkStats();
  }, [profile]);

  const fetchNetworkStats = async () => {
    if (!profile) return;
    
    // For demo
    if (profile.id === 'dev-bypass-id') {
      setTotalRevenue(84500);
      setOutletsCount(12);
      setLoading(false);
      return;
    }

    const { count: outlets } = await supabase.from('outlets').select('*', { count: 'exact', head: true }).eq('is_active', true);
    setOutletsCount(outlets || 0);

    const { data: orders } = await supabase.from('orders').select('total_amount').eq('status', 'completed');
    if (orders) {
      setTotalRevenue(orders.reduce((sum, o) => sum + Number(o.total_amount), 0));
    }
    
    setLoading(false);
  };

  if (loading) return <div>Loading HQ...</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="mb-1 text-2xl">Network HQ</h2>
        <p className="text-sm text-[var(--text-secondary)]">Janu Bhai Coffee - Global Overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card glass className="bg-[var(--accent-brown)] text-white">
          <p className="text-white/80 text-sm font-medium mb-1">Network Revenue</p>
          <h2 className="text-2xl">₹{(totalRevenue / 1000).toFixed(1)}k</h2>
        </Card>
        <Card glass>
          <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Active Outlets</p>
          <h2 className="text-2xl">{outletsCount}</h2>
        </Card>
      </div>

      <Card glass>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Top Outlets</h3>
          <Activity size={20} className="text-[var(--text-secondary)]" />
        </div>
        <div className="space-y-4">
          {['Connaught Place', 'Hauz Khas Village', 'Koramangala'].map((name, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[var(--accent-red)]" />
                <span className="text-sm font-medium">{name}</span>
              </div>
              <span className="text-sm font-bold">₹{(12 - i) * 4}.5k</span>
            </div>
          ))}
        </div>
      </Card>

      <Card glass>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">System Health</h3>
          <Users size={20} className="text-[var(--text-secondary)]" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">POS Nodes Online</span>
            <span className="font-semibold text-green-600">42 / 42</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Sync Latency</span>
            <span className="font-semibold">14ms</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
