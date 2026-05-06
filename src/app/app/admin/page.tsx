"use client";

import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  Store, 
  BarChart3, 
  Map as MapIcon, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  TrendingUp,
  Power
} from 'lucide-react';

export default function SuperadminDashboard() {
  const { profile } = useAuth();

  if (profile?.role !== 'superadmin') {
    return <div className="p-10 text-center">Unauthorized. Superadmin access only.</div>;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-heading tracking-tighter">HQ Command Center</h1>
          <p className="text-sm opacity-50 font-medium uppercase tracking-widest">Global Network Status • Live</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-accent-red/20 text-accent-red bg-accent-red/5 hover:bg-accent-red hover:text-white press-effect">
            <Power size={18} className="mr-2" />
            Global Emergency Stop
          </Button>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Outlets', value: '142', sub: '+3 this week', icon: <Store /> },
          { label: 'Total Revenue', value: '₹12.4L', sub: 'Today', icon: <TrendingUp /> },
          { label: 'Active Orders', value: '24', sub: 'Across 12 cities', icon: <BarChart3 /> },
          { label: 'Pending Apps', value: '8', sub: 'Franchise review', icon: <FileText /> }
        ].map((stat, i) => (
          <Card key={i} glass className="p-6 space-y-4">
            <div className="flex justify-between items-start opacity-40">
              <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl text-number">{stat.value}</h4>
              <p className="text-[10px] font-bold text-accent-green">{stat.sub}</p>
            </div>
          </Card>
        ))}
      </section>

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Live Network Map Placeholder */}
        <Card glass className="md:col-span-2 aspect-video relative overflow-hidden bg-accent-brown/5 flex items-center justify-center">
          <div className="absolute inset-0 opacity-10 grayscale contrast-150">
            <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80" alt="Map Grid" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 text-center space-y-4">
            <MapIcon size={48} className="mx-auto opacity-20" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">Live Network Visualization</p>
          </div>
        </Card>

        {/* Urgent Actions */}
        <div className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Action Required</h2>
          <div className="space-y-3">
            {[
              { title: 'Franchise App: Okhla', time: '2h ago', type: 'approval', icon: <ShieldCheck className="text-accent-green" /> },
              { title: 'Inventory Alert: Saket', time: '4h ago', type: 'alert', icon: <AlertCircle className="text-accent-red" /> },
              { title: 'Staff Audit: CP Hub', time: '1d ago', type: 'task', icon: <Users className="text-accent-brown" /> }
            ].map((action, i) => (
              <Card key={i} className="p-4 flex items-center gap-4 bg-white/50 border-black/5 hover:bg-white transition-colors cursor-pointer">
                <div className="p-2 rounded-xl bg-bg-cream shadow-inner">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-bold">{action.title}</h5>
                  <p className="text-[10px] opacity-40 uppercase tracking-wider">{action.time}</p>
                </div>
              </Card>
            ))}
          </div>
          <Button fullWidth variant="outline" className="border-accent-brown/10 text-[10px] font-bold uppercase tracking-widest py-4">
            View All Notifications
          </Button>
        </div>
      </div>

      {/* Centralized Controls */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">System Controls</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Global Menu', icon: <FileText /> },
            { label: 'Pricing Tiers', icon: <TrendingUp /> },
            { label: 'Regional Admins', icon: <Users /> },
            { label: 'Platform Settings', icon: <ShieldCheck /> }
          ].map((control, i) => (
            <Button key={i} variant="outline" className="h-32 flex flex-col items-center justify-center gap-3 border-accent-brown/5 bg-white/30 hover:bg-white hover:border-accent-brown/20 press-effect">
              <div className="opacity-40">{control.icon}</div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{control.label}</span>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
