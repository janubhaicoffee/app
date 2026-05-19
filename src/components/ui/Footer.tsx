"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, Send, MessageCircle, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { Mascot } from './motion/Mascot';

export const Footer = () => {
  return (
    <footer className="bg-espresso-900 text-bg-cream pt-24 pb-12 px-6 relative overflow-hidden border-t-8 border-accent-gold">
      {/* Texture */}
      <div className="absolute inset-0 bg-[url('/grain.png')] opacity-15 mix-blend-overlay pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Left: Brand & CTA */}
          <div className="space-y-12">
            <div className="flex items-center gap-6">
              <Mascot size={120} state="idle" className="drop-shadow-[0_0_40px_rgba(255,184,0,0.3)]" />
              <div className="space-y-1">
                <p className="text-accent-gold font-black text-xs tracking-[0.3em]">MAID IN INDIA</p>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-md border border-white/10">
                  <ShieldCheck size={12} className="text-accent-red" />
                  <p className="text-[10px] font-bold text-white/60 tracking-widest">FSSAI NO: 12423999000134</p>
                </div>
              </div>
            </div>

            <h2 className="text-4xl md:text-6xl font-heading font-black uppercase tracking-tighter leading-[0.85] text-white/90">
              India's Smartest<br/>Cup is <span className="text-accent-gold italic">Decentralized</span>.
            </h2>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/franchise" className="bg-accent-red text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs border-4 border-espresso-900 shadow-janu hover:bg-white hover:text-espresso-900 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3 group">
                Open an Outlet <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right: Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <p className="text-accent-gold text-[10px] font-black uppercase tracking-[0.4em]">Company</p>
              <ul className="space-y-4">
                {['Our Story', 'Franchise', 'Transparency', 'Impact'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm font-bold text-white/50 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <p className="text-accent-gold text-[10px] font-black uppercase tracking-[0.4em]">Legal</p>
              <ul className="space-y-4">
                {['Privacy', 'Terms', 'Shipping', 'Returns'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm font-bold text-white/50 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 col-span-2 md:col-span-1">
              <p className="text-accent-gold text-[10px] font-black uppercase tracking-[0.4em]">Connect</p>
              <div className="flex gap-4">
                {[Globe, Send, MessageCircle].map((Icon, i) => (
                  <Link key={i} href="#" className="w-12 h-12 rounded-xl bg-white/5 border-2 border-white/10 flex items-center justify-center hover:bg-accent-gold hover:text-espresso-900 hover:border-accent-gold transition-all">
                    <Icon size={20} strokeWidth={3} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Icons Bar */}
        <div className="mt-20 pt-12 border-t border-white/5 flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          {['UPI', 'Paytm', 'PhonePe', 'Google Pay', 'Razorpay', 'NetBanking', 'Visa', 'Mastercard'].map((method) => (
            <span key={method} className="text-[10px] font-black uppercase tracking-[0.2em]">{method}</span>
          ))}
        </div>

        {/* Bottom Bar: STRICT LEFT/RIGHT LAYOUT */}
        <div className="pt-12 mt-12 border-t border-white/5 flex flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">
            A CHISHTI VENTURES PVT. LTD. COMPANY
          </p>
          <div className="flex items-center gap-3">
            <MapPin size={14} className="text-accent-gold" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">
              GROWN IN CHIKKAMAGALURU
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
