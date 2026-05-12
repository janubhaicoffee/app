"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/ui/SEO';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { Hash, Clock, Wallet, Leaf, Factory, Truck, CheckCircle2, ExternalLink } from 'lucide-react';

const LEDGER_NODES = [
  {
    id: 1,
    title: 'Farmed in Chikkamagaluru',
    subtitle: 'Hassan District, Karnataka',
    description: 'AAA Grade Arabica beans handpicked at 4,500ft elevation. Fairpay disbursed directly to farmer wallet.',
    icon: Leaf,
    hash: '0x7a3f...d82e',
    timestamp: '2026-04-28 06:14:22 IST',
    walletAddress: '0xFarmer...3kJ9',
    fairpay: '₹42/kg',
    status: 'verified',
  },
  {
    id: 2,
    title: 'Roasted at Central Hub',
    subtitle: 'Janu Bhai Processing Unit, Bangalore',
    description: 'Dry vacuum processed within 48 hours of harvest. Zero chemical additives. Batch sealed and tagged.',
    icon: Factory,
    hash: '0x1b9c...f41a',
    timestamp: '2026-04-30 14:22:08 IST',
    walletAddress: '0xJanuBhaiHQ...9xR2',
    fairpay: null,
    status: 'verified',
  },
  {
    id: 3,
    title: 'Delivered to Outlet',
    subtitle: 'Ghafoor Nagar Hub, Delhi',
    description: 'Cold-chain delivery verified. Batch integrity intact. Inventory synced to Janu Bhai OS.',
    icon: Truck,
    hash: '0x5e2d...a93b',
    timestamp: '2026-05-02 09:45:33 IST',
    walletAddress: '0xGhafoorHub...7pQ4',
    fairpay: null,
    status: 'verified',
  },
];

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-espresso-900 text-bg-cream font-sans selection:bg-accent-red selection:text-white overflow-hidden">
      <SEO
        title="Transparency Ledger | Janu Bhai"
        description="Track every bean from Chikkamagaluru to your cup. Full supply chain transparency."
      />

      <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10 mix-blend-overlay pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-16 text-center space-y-6">
        <FadeIn direction="up">
          <p className="text-accent-gold font-bold uppercase tracking-[0.4em] text-xs">On-Chain Provenance</p>
          <h1 className="text-5xl md:text-8xl font-heading tracking-tighter uppercase leading-[0.85]">
            From Soil<br/>to <span className="text-accent-gold">Soul</span>.
          </h1>
          <p className="text-bg-cream/40 font-bold uppercase tracking-widest text-sm max-w-md mx-auto leading-relaxed">
            Every bean is tracked. Every farmer is paid. Every step is verified. No secrets.
          </p>
        </FadeIn>
      </header>

      {/* Timeline */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-32">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-12 top-0 bottom-0 w-px bg-accent-gold/20" />

          <div className="space-y-0">
            {LEDGER_NODES.map((node, idx) => {
              const Icon = node.icon;
              return (
                <FadeIn key={node.id} delay={0.15 * idx} direction="up">
                  <div className="relative pl-20 md:pl-28 pb-16 group">
                    {/* Node Dot */}
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 0px rgba(255,184,0,0.3)',
                          '0 0 20px rgba(255,184,0,0.6)',
                          '0 0 0px rgba(255,184,0,0.3)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                      className="absolute left-5 md:left-9 top-2 w-6 h-6 bg-accent-gold rounded-full border-4 border-espresso-900 z-10"
                    />

                    {/* Content Card */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 hover:border-accent-gold/20 transition-colors">
                      {/* Title Row */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-accent-gold/10 border border-accent-gold/20 rounded-xl flex items-center justify-center text-accent-gold shrink-0">
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold uppercase tracking-wider text-white">{node.title}</h3>
                          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">{node.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-1 text-green-400 text-[10px] font-bold uppercase tracking-widest shrink-0">
                          <CheckCircle2 size={12} /> {node.status}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-white/60 text-sm leading-relaxed font-medium">{node.description}</p>

                      {/* On-Chain Data */}
                      <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-white/30 flex items-center gap-2"><Hash size={10} /> TX Hash</span>
                          <span className="text-accent-gold font-bold">{node.hash}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/30 flex items-center gap-2"><Clock size={10} /> Timestamp</span>
                          <span className="text-white/70">{node.timestamp}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/30 flex items-center gap-2"><Wallet size={10} /> Wallet</span>
                          <span className="text-white/70">{node.walletAddress}</span>
                        </div>
                        {node.fairpay && (
                          <div className="flex justify-between items-center border-t border-white/5 pt-3">
                            <span className="text-accent-gold flex items-center gap-2 font-bold"><ExternalLink size={10} /> Fairpay Rate</span>
                            <span className="text-accent-gold font-black">{node.fairpay}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
