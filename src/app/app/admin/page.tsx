"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/motion/AnimatedCounter';
import { Card } from '@/components/ui/Card';
import { SEO } from '@/components/ui/SEO';
import { Button } from '@/components/ui/Button';
import { MapPin, TrendingUp, Zap, ServerCrash } from 'lucide-react';

// MOCK DATA for layout
const MOCK_OUTLETS = [
  { id: '1', name: 'Ghafoor Nagar Hub', volume: 1450, tier: 'premium' },
  { id: '2', name: 'Indiranagar Express', volume: 1200, tier: 'standard' },
  { id: '3', name: 'Koramangala Block 5', volume: 980, tier: 'standard' },
  { id: '4', name: 'HSR Layout Sector 2', volume: 840, tier: 'standard' },
  { id: '5', name: 'BTM Lake Road', volume: 720, tier: 'standard' },
];

export default function SuperadminCommandCenter() {
  const [outlets, setOutlets] = useState(MOCK_OUTLETS);

  const toggleTier = (id: string) => {
    setOutlets(outlets.map(o => {
      if (o.id === id) {
        return { ...o, tier: o.tier === 'standard' ? 'premium' : 'standard' };
      }
      return o;
    }));
  };

  return (
    <div className="min-h-screen bg-espresso-900 text-bg-cream p-6 md:p-12 font-sans selection:bg-accent-red selection:text-white">
      <SEO title="Superadmin OS | Janu Bhai" description="Global Command Center" />

      <header className="mb-12 flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tighter uppercase text-white flex items-center gap-3">
            <ServerCrash className="text-accent-red" /> Global Command Center
          </h1>
          <p className="text-accent-gold font-bold tracking-widest uppercase text-xs mt-2">Level 4 Clearance Authorized</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Network Status</p>
          <div className="flex items-center justify-end gap-2 text-accent-red font-bold">
            <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" /> Live & Nominal
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Metrics & Map */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Master Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-black/40 border border-white/10 p-6">
              <p className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-2">Total Active Addas</p>
              <div className="text-4xl text-white font-black font-number flex items-baseline gap-2">
                <AnimatedCounter value={42} /> 
                <span className="text-sm text-white/30">NODES</span>
              </div>
            </Card>
            
            <Card className="bg-black/40 border border-white/10 p-6">
              <p className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-2">Live Cups Today</p>
              <div className="text-4xl text-accent-gold font-black font-number flex items-baseline gap-2">
                <AnimatedCounter value={18450} />
              </div>
            </Card>

            <Card className="bg-black/40 border border-white/10 p-6">
              <p className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-2">Global Revenue</p>
              <div className="text-4xl text-accent-red font-black font-number flex items-baseline gap-2">
                <AnimatedCounter value={645000} prefix="₹" />
              </div>
            </Card>
          </div>

          {/* Abstract SVG Node Map */}
          <Card className="bg-black/40 border border-white/10 p-8 relative overflow-hidden h-[400px] flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-6 left-6 z-10">
              <h3 className="text-white/50 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                <MapPin size={14} /> Live Expansion Grid
              </h3>
            </div>
            
            <svg viewBox="0 0 800 400" className="w-full h-full opacity-60">
              {/* Abstract Connections */}
              <path d="M 200 150 L 350 200 L 450 100 L 600 250" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M 350 200 L 400 300 L 600 250" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
              
              {/* Nodes (Active = Red, Pending = Yellow) */}
              <motion.circle cx="200" cy="150" r="6" fill="#E23744" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <motion.circle cx="350" cy="200" r="8" fill="#E23744" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2.5, repeat: Infinity }} />
              <motion.circle cx="450" cy="100" r="5" fill="#E23744" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
              <motion.circle cx="600" cy="250" r="10" fill="#E23744" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 3, repeat: Infinity }} />
              
              <motion.circle cx="400" cy="300" r="6" fill="#FFB800" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
              <motion.circle cx="550" cy="150" r="4" fill="#FFB800" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
            </svg>
            
            <div className="absolute bottom-6 right-6 flex gap-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-red" /> Active Adda</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-gold" /> Pending Blueprint</span>
            </div>
          </Card>
        </div>

        {/* Right Column: Leaderboard & God Switch */}
        <div className="space-y-8">
          
          <Card className="bg-black/40 border border-white/10 p-6">
            <h3 className="text-white/50 text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
              <TrendingUp size={14} /> Volume Leaderboard
            </h3>
            
            <div className="space-y-4">
              {outlets.map((outlet, idx) => (
                <div key={outlet.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`font-black font-number text-lg ${idx === 0 ? 'text-accent-gold' : 'text-white/30'}`}>
                      0{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-sm text-white">{outlet.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-white/50">{outlet.volume} CUPS</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* The God Switch */}
          <Card className="bg-accent-red/10 border border-accent-red/20 p-6">
            <h3 className="text-accent-red text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
              <Zap size={14} /> The God Switch (Tier Control)
            </h3>
            
            <div className="space-y-4">
              {outlets.map((outlet) => (
                <div key={outlet.id} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-black">
                  <p className="font-bold text-sm text-white w-1/2 truncate pr-2">{outlet.name}</p>
                  <Button
                    size="md"
                    onClick={() => toggleTier(outlet.id)}
                    className={`w-28 text-[10px] tracking-widest uppercase font-bold py-2 ${
                      outlet.tier === 'premium' 
                        ? 'bg-accent-gold text-espresso-900 hover:bg-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {outlet.tier}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
