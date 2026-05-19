"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SEO } from '@/components/ui/SEO';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Minus, Plus, ArrowLeft, Truck, Shield, Package } from 'lucide-react';
import { formatINR } from '@/lib/utils/currency';

export default function ProductPage() {
  const [qty, setQty] = useState(1);
  const unitPrice = 3000;
  const total = unitPrice * qty;

  return (
    <div className="min-h-screen bg-bg-cream text-espresso-900 font-sans selection:bg-accent-red selection:text-white">
      <SEO title="1kg Commercial Pouch | Janu Bhai Coffee" description="Heavy-duty AAA Grade instant coffee for commercial operators." />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-24">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-espresso-900/40 hover:text-espresso-900 transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* LEFT: Product Image */}
          <FadeIn direction="right">
            <div className="bg-espresso-900/5 rounded-3xl overflow-hidden aspect-square relative group">
              <img src="/vacuum.png" alt="Janu Bhai 1kg Commercial Pouch" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-accent-red text-white px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px]">
                Commercial Grade
              </div>
            </div>
          </FadeIn>

          {/* RIGHT: Product Details */}
          <FadeIn direction="left" delay={0.1}>
            <div className="space-y-8 lg:sticky lg:top-28">
              <div className="space-y-3">
                <p className="text-accent-red text-xs font-bold uppercase tracking-[0.3em]">B2B / Franchise Supply</p>
                <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase">
                  Janu Bhai<br/>1kg Commercial Pouch
                </h1>
              </div>

              <div className="flex items-end gap-3">
                <span className="text-5xl font-heading font-black text-accent-gold">{formatINR(unitPrice)}</span>
                <span className="text-espresso-900/40 font-bold uppercase tracking-widest text-xs mb-2">per kg</span>
              </div>

              <p className="text-espresso-900/60 font-medium leading-relaxed">
                Heavy-duty standup pouch for heavy-duty hustlers. AAA Grade Arabica beans from Chikkamagaluru, 
                dry vacuum processed. Zero chemicals. Designed for cafes, hotels, bakeries, and Janu Bhai franchise outlets.
              </p>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Package, label: '1000g Net', sub: 'Weight' },
                  { icon: Truck, label: 'Pan India', sub: 'Shipping' },
                  { icon: Shield, label: '100% Pure', sub: 'No Additives' },
                ].map((spec, i) => {
                  const Icon = spec.icon;
                  return (
                    <div key={i} className="bg-espresso-900/5 rounded-2xl p-4 text-center space-y-2">
                      <Icon size={20} className="text-accent-gold mx-auto" />
                      <p className="text-xs font-bold uppercase tracking-wider text-espresso-900">{spec.label}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-espresso-900/40">{spec.sub}</p>
                    </div>
                  );
                })}
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-espresso-900/40">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white border-2 border-espresso-900/10 rounded-full">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-12 h-12 flex items-center justify-center hover:bg-espresso-900/5 rounded-full transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-heading font-black text-xl">{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="w-12 h-12 flex items-center justify-center hover:bg-espresso-900/5 rounded-full transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-espresso-900/40 font-bold text-sm">= {formatINR(total)}</span>
                </div>
              </div>

              {/* Add to Cart */}
              <MagneticButton intensity={0.2} className="w-full">
                <button className="w-full flex items-center justify-center gap-3 bg-accent-gold text-espresso-900 py-5 rounded-full font-bold uppercase tracking-widest shadow-[0_10px_30px_rgba(255,184,0,0.3)] hover:bg-espresso-900 hover:text-bg-cream transition-all text-sm">
                  <ShoppingCart size={18} /> Add to Cart — {formatINR(total)}
                </button>
              </MagneticButton>

              {/* B2B Link */}
              <div className="text-center pt-2">
                <Link href="/b2b" className="text-accent-red text-xs font-bold uppercase tracking-widest hover:underline">
                  Need bulk supply? Talk to our commercial team →
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
