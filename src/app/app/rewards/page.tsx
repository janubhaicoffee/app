"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/ui/SEO';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Lock, Unlock, Zap, Moon, Flame, Trophy, MapPin } from 'lucide-react';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';
import { FadeIn } from '@/components/ui/motion/FadeIn';

const BADGES = [
  { id: 'night_owl', name: 'Night Owl', description: 'Bought coffee after 11 PM', unlocked: true, icon: Moon },
  { id: 'regular', name: 'The Regular', description: '7-day walk-in streak', unlocked: false, icon: Flame, progress: '4/7' },
  { id: 'purist', name: 'Poshtik Purist', description: '50 Hot Coffees consumed', unlocked: false, icon: Zap, progress: '32/50' },
  { id: 'god_mode', name: 'God Mode', description: 'Buy a coffee for a stranger', unlocked: false, icon: Trophy, progress: '0/1' },
];

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-bg-cream text-espresso-900 pb-24 font-sans selection:bg-accent-red selection:text-white">
      <SEO title="Cult Status | Janu Bhai" description="Your Coffee. Your Rank." />

      {/* Header */}
      <header className="bg-espresso-900 text-bg-cream p-6 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tighter uppercase drop-shadow-lg">
              Cult Status
            </h1>
            <p className="text-accent-gold font-bold tracking-widest uppercase text-sm mt-2 flex items-center gap-2">
              <Trophy size={16} /> Rank #4 at Ghafoor Nagar Hub
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Lifetime Volume</p>
            <p className="text-3xl font-black font-number text-accent-red">142 CUPS</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-16">
        
        {/* Daily Poshtik Pass (Subscription) */}
        <section>
          <FadeIn>
            <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-espresso-900/50 mb-6 flex items-center gap-2">
              <Zap size={14} className="text-accent-gold" /> Active Protocols
            </h2>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-accent-gold rounded-[2rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(255,184,0,0.3)] relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <div className="inline-block px-4 py-1 bg-espresso-900 text-accent-gold text-[10px] font-bold uppercase tracking-widest rounded-full mb-2">
                    Premium Tier
                  </div>
                  <h3 className="text-4xl font-heading font-black uppercase tracking-tight text-espresso-900">
                    The Adda Pass
                  </h3>
                  <p className="font-bold text-espresso-900/80 max-w-sm">
                    Pre-buy 30 Hot Coffees for ₹500. Save ₹100. Never pull out your wallet at the counter again.
                  </p>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-espresso-900/50">Credits Remaining</p>
                    <p className="text-6xl font-black font-number text-espresso-900">12</p>
                  </div>
                  <MagneticButton intensity={0.2}>
                    <Button className="bg-espresso-900 text-bg-cream hover:bg-black rounded-full px-8 py-6 font-bold uppercase tracking-widest shadow-2xl">
                      Recharge ₹500
                    </Button>
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </FadeIn>
        </section>

        {/* Badge System */}
        <section>
          <FadeIn delay={0.2}>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-espresso-900/50 flex items-center gap-2">
                <Lock size={14} className="text-espresso-900" /> Achievement Grid
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BADGES.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    whileHover={{ y: -5 }}
                    className={`p-6 rounded-2xl border-2 flex items-center gap-6 transition-all ${
                      badge.unlocked 
                        ? 'bg-white border-accent-red/20 shadow-lg' 
                        : 'bg-transparent border-espresso-900/10 grayscale opacity-70'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner ${
                      badge.unlocked ? 'bg-accent-red text-white shadow-[0_0_20px_rgba(226,55,68,0.3)]' : 'bg-espresso-900/10 text-espresso-900/50'
                    }`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-bold uppercase tracking-wider text-sm ${badge.unlocked ? 'text-espresso-900' : 'text-espresso-900/50'}`}>
                          {badge.name}
                        </h4>
                        {!badge.unlocked && <Lock size={12} className="text-espresso-900/30" />}
                        {badge.unlocked && <Unlock size={12} className="text-accent-red" />}
                      </div>
                      <p className="text-xs font-medium text-espresso-900/60 leading-relaxed mb-2">
                        {badge.description}
                      </p>
                      
                      {/* Progress Bar for Locked */}
                      {!badge.unlocked && badge.progress && (
                        <div className="w-full h-1.5 bg-espresso-900/10 rounded-full overflow-hidden mt-3 relative">
                          <div 
                            className="absolute top-0 left-0 h-full bg-espresso-900/30 rounded-full"
                            style={{ 
                              width: `${(parseInt(badge.progress.split('/')[0]) / parseInt(badge.progress.split('/')[1])) * 100}%` 
                            }} 
                          />
                          <span className="absolute -top-5 right-0 text-[8px] font-bold tracking-widest text-espresso-900/40">
                            {badge.progress}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </FadeIn>
        </section>

      </main>
    </div>
  );
}
