"use client";

import { RoleGuard } from "@/components/ui/RoleGuard";
import { Card } from "@/components/ui/Card";
import { TrendingUp, Coffee, Link as LinkIcon, Download } from "lucide-react";

export default function FinancesPage() {
  return (
    <RoleGuard allowedRoles={["manager", "outlet_owner", "superadmin"]}>
      <div className="space-y-6 pb-24">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-heading font-black tracking-tighter uppercase">
              Finances
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 mt-1">
              Okhla Hub • Today
            </p>
          </div>
          <button className="bg-accent-brown/10 text-accent-brown px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-accent-brown/20 transition-colors">
            <Download size={14} />
            Export
          </button>
        </header>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-accent-green text-white border-4 border-black/10 rounded-[32px] shadow-[4px_4px_0_0_#000]">
            <TrendingUp size={24} className="mb-4 opacity-80" />
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Today's Revenue</p>
            <h2 className="text-4xl font-black tracking-tighter mt-1">₹12,450</h2>
          </Card>
          
          <Card className="p-6 bg-accent-brown text-white border-4 border-black/10 rounded-[32px] shadow-[4px_4px_0_0_#000]">
            <Coffee size={24} className="mb-4 opacity-80" />
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Cups Sold</p>
            <h2 className="text-4xl font-black tracking-tighter mt-1">342</h2>
          </Card>

          <Card className="p-6 bg-accent-yellow text-accent-brown border-4 border-accent-brown rounded-[32px] shadow-[4px_4px_0_0_#4A3022]">
            <LinkIcon size={24} className="mb-4 opacity-80" />
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Active Integrations</p>
            <div className="flex items-end gap-2 mt-1">
              <h2 className="text-4xl font-black tracking-tighter">2</h2>
              <span className="text-sm font-bold uppercase tracking-widest opacity-60 mb-1">(Zomato, Swiggy)</span>
            </div>
          </Card>
        </div>

        {/* Chart Placeholder */}
        <div className="pt-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 mb-4">Weekly Trend</h2>
          <Card className="p-8 bg-white border-4 border-black/10 rounded-[32px] overflow-hidden">
            <div className="h-64 w-full relative flex items-end justify-between px-4 pb-8">
              {/* Simple CSS-based bar chart for the week */}
              {[120, 150, 130, 200, 280, 240, 180].map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-4 w-12 group">
                  <div className="w-full bg-accent-brown/10 rounded-t-xl group-hover:bg-accent-brown/20 transition-colors relative flex items-end justify-center" style={{ height: '200px' }}>
                    <div 
                      className="w-full bg-accent-red rounded-t-xl transition-all duration-1000 group-hover:bg-accent-brown" 
                      style={{ height: `${(val / 300) * 100}%` }}
                    />
                    <span className="absolute -top-8 text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{val}0
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
