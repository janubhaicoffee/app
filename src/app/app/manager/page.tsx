"use client";

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIAdvisor } from '@/components/ui/AIAdvisor';
import { 
  Zap, 
  TrendingUp, 
  Package, 
  Users, 
  Plus, 
  ArrowRight,
  ClipboardList,
  Coffee
} from 'lucide-react';

export default function ManagerDashboard() {
  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading tracking-tight">Okhla Branch <span className="opacity-40">#042</span></h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">System Online • Live Metrics</p>
          </div>
        </div>
        <Link href="/app/add-expense">
          <Button variant="outline" className="p-4 bg-white/50 border-accent-brown/10 rounded-2xl">
            <Plus size={20} />
          </Button>
        </Link>
      </header>

      {/* AI Intelligence */}
      <AIAdvisor />

      {/* Real-time Sales Pulse */}
      <section className="grid grid-cols-2 gap-4">
        <Card className="p-6 bg-accent-brown text-white space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <TrendingUp size={120} />
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sales Today</p>
            <h2 className="text-4xl text-number">₹6,420</h2>
          </div>
          <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-accent-green bg-white/10 w-fit px-2 py-1 rounded-lg">
            <Zap size={10} />
            +12% VS YESTERDAY
          </div>
        </Card>

        <Card glass className="p-6 space-y-4 border-accent-brown/10">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Expenses</p>
            <h2 className="text-4xl text-number text-accent-red">₹1,250</h2>
          </div>
          <Link href="/app/expenses" className="block text-[10px] font-bold opacity-40 uppercase tracking-widest hover:opacity-70">
            3 LOGS TODAY
          </Link>
        </Card>
      </section>

      {/* Quick Ops */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'POS Hub', icon: <Coffee />, color: 'bg-accent-brown', href: '/app/terminal' },
          { label: 'Inventory', icon: <Package />, color: 'bg-accent-brown-light', href: '/app/inventory' },
          { label: 'Staff', icon: <Users />, color: 'bg-accent-brown', href: '/app/users' },
          { label: 'Reports', icon: <ClipboardList />, color: 'bg-accent-brown-light', href: '/app/profit' }
        ].map((op, i) => (
          <div key={i} className="space-y-2 text-center">
            <Link href={op.href} className={`${op.color} text-white p-5 rounded-2xl shadow-lg press-effect mx-auto flex items-center justify-center w-full aspect-square`}>
                {op.icon}
            </Link>
            <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">{op.label}</span>
          </div>
        ))}
      </div>

      {/* Inventory Alerts */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Stock Status</h3>
          <span className="text-[10px] font-bold text-accent-red">2 LOW STOCK</span>
        </div>
        <div className="space-y-3">
          {[
            { item: 'Coffee Beans (Dark Roast)', status: 'critical', val: '1.2kg left', color: 'text-accent-red' },
            { item: 'Full Cream Milk', status: 'warning', val: '4L left', color: 'text-accent-brown' },
          ].map((item, i) => (
            <Card key={i} className="p-4 flex justify-between items-center bg-white/50 border-black/5">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'critical' ? 'bg-accent-red' : 'bg-accent-brown'}`} />
                <span className="text-sm font-medium">{item.item}</span>
              </div>
              <span className={`text-xs font-bold ${item.color}`}>{item.val}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Live Order Queue Preview */}
      <Card glass className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-heading">Kitchen Queue</h3>
          <Link href="/app/orders">
            <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest opacity-40">View All <ArrowRight size={14} className="ml-2" /></Button>
          </Link>
        </div>
        <div className="space-y-4">
          {[
            { id: '#892', items: '2x Cold Brew, 1x Sandwich', time: '4m ago', status: 'preparing' },
            { id: '#891', items: '1x Hot Latte', time: '12m ago', status: 'ready' },
          ].map((order, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{order.id}</span>
                  <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${order.status === 'ready' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-brown/10 text-accent-brown'}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs opacity-60">{order.items}</p>
              </div>
              <span className="text-[10px] opacity-30 font-medium">{order.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
