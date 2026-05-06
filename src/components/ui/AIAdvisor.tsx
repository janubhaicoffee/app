"use client";

import { Card } from './Card';
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

export const AIAdvisor = () => {
  return (
    <Card glass className="p-8 bg-gradient-to-br from-accent-brown to-accent-brown-light text-white border-0 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-[-40px] right-[-40px] text-white/5 group-hover:rotate-12 transition-transform duration-1000">
        <Sparkles size={240} />
      </div>
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Sparkles size={18} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Operations Intelligence</span>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-heading leading-tight">Advisor Suggestion</h3>
          
          <div className="grid gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex gap-4 items-start">
              <TrendingUp size={20} className="text-accent-green mt-1 shrink-0" />
              <p className="text-sm opacity-90 leading-relaxed">
                Sales peak expected at <strong>6 PM</strong> due to local event. Suggest prepping <strong>15 extra Cold Brews</strong> now.
              </p>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex gap-4 items-start">
              <AlertTriangle size={20} className="text-accent-red mt-1 shrink-0" />
              <p className="text-sm opacity-90 leading-relaxed">
                Milk consumption is <strong>20% higher</strong> than normal today. Check for wastage or leakage in station B.
              </p>
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 hover:opacity-100 transition-opacity">
          Full Performance Audit <ArrowRight size={14} />
        </button>
      </div>
    </Card>
  );
};
