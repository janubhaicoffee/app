import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useCountUp } from '../hooks/useCountUp';
import { RevenueBar } from '../components/ui/RevenueBar';
import type { RevenueBySource } from '../lib/types';
import { Activity, MapPin, Users, ChevronRight, AlertTriangle, Store, Globe } from 'lucide-react';

interface OutletInfo {
  id?: string;
  name: string;
  location: string;
}

const DEMO_REVENUE: RevenueBySource[] = [
  { source: 'pos', label: 'POS', amount: 34500, color: '#4A3022', orders: 245 },
  { source: 'zomato', label: 'Zomato', amount: 22800, color: '#E23744', orders: 134 },
  { source: 'swiggy', label: 'Swiggy', amount: 18200, color: '#FC8019', orders: 98 },
  { source: 'uengage', label: 'Uengage', amount: 9000, color: '#6C5CE7', orders: 42 },
];

export const SuperadminDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [outletsCount, setOutletsCount] = useState(0);
  const [outletsList, setOutletsList] = useState<OutletInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const animatedRevenue = useCountUp(totalRevenue);
  const animatedOutlets = useCountUp(outletsCount, 800);

  useEffect(() => {
    fetchNetworkStats();
  }, [profile]);

  const fetchNetworkStats = async () => {
    if (!profile) return;
    
    // Simulate delay for cinematic feel
    await new Promise(r => setTimeout(r, 800));

    if (profile.id === 'dev-bypass-id') {
      setTotalRevenue(84500);
      setOutletsCount(12);
      setOutletsList([
        { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Connaught Place', location: 'Inner Circle, CP, New Delhi' },
        { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Hauz Khas Village', location: 'HKV Main Road, New Delhi' },
        { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', name: 'Koramangala', location: '1st Block, Bangalore' },
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/catalog?type=outlets');
      if (res.ok) {
        const data = await res.json();
        setOutletsCount(data.length);
        setOutletsList(data);
      }
    } catch {
      setOutletsCount(3);
      setOutletsList([
        { name: 'Connaught Place', location: 'New Delhi' },
        { name: 'Hauz Khas Village', location: 'New Delhi' },
        { name: 'Koramangala', location: 'Bangalore' },
      ]);
    }

    const { data: orders } = await supabase.from('orders').select('total_amount').eq('status', 'completed');
    if (orders) {
      setTotalRevenue(orders.reduce((sum, o) => sum + Number(o.total_amount), 0));
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-48" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-heading mb-1">Network HQ</h2>
          <p className="text-sm opacity-60">Global operations are stable today</p>
        </div>
        <div className="p-2 bg-accent-brown-muted rounded-xl text-accent-brown">
          <Globe size={24} />
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="stat-card-brown shadow-lg">
          <p className="stat-label">Network Revenue</p>
          <div className="stat-value text-number">₹{(animatedRevenue / 1000).toFixed(1)}k</div>
          <div className="stat-badge">
            <Activity size={10} />
            <span>Aaj ka sale strong hai</span>
          </div>
        </Card>
        <Card glass pressEffect className="flex flex-col justify-between">
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Active Nodes</p>
          <h2 className="text-4xl text-number">{animatedOutlets}</h2>
          <p className="text-[10px] font-bold text-accent-green mt-1">100% ONLINE</p>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card glass hoverLift>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-heading">Revenue Streams</h3>
          <span className="text-[10px] font-bold px-2 py-1 bg-accent-brown-muted rounded text-accent-brown uppercase tracking-wider">Live</span>
        </div>
        <RevenueBar data={DEMO_REVENUE} />
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          className="btn btn-primary press-effect flex items-center justify-center gap-2 py-4 shadow-xl"
          onClick={() => navigate('/app/outlets')}
        >
          <Store size={18} />
          <span className="text-sm">Outlets</span>
        </button>
        <button 
          className="btn btn-secondary press-effect flex items-center justify-center gap-2 py-4 shadow-xl"
          onClick={() => navigate('/app/users')}
        >
          <Users size={18} />
          <span className="text-sm">Team</span>
        </button>
      </div>

      {/* Alerts Banner */}
      {totalRevenue > 0 && (
        <Card glass className="bg-amber-50/30 border-amber-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full text-amber-600">
              <AlertTriangle size={16} />
            </div>
            <span className="text-xs font-medium">
              Swiggy sync delayed at Connaught Place
            </span>
          </div>
        </Card>
      )}

      {/* Outlets List — Tappable */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold px-1 opacity-40 uppercase tracking-widest">Active Outlets</h3>
        <Card glass className="p-0 overflow-hidden divide-y divide-black/5">
          {outletsList.map((outlet, i) => (
            <button
              key={i}
              className="w-full outlet-row px-4 py-4 flex items-center gap-4 hover:bg-black/5 transition-colors text-left"
              onClick={() => navigate(`/app/outlet/${outlet.id || 'demo'}`)}
            >
              <div className="w-10 h-10 rounded-xl bg-accent-brown-muted text-accent-brown flex items-center justify-center font-bold">
                {outlet.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold truncate block">{outlet.name}</span>
                <div className="flex items-center gap-1 opacity-50">
                  <MapPin size={10} />
                  <span className="text-[10px] truncate">{outlet.location}</span>
                </div>
              </div>
              <ChevronRight size={16} className="opacity-20" />
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
};
