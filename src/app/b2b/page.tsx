"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/ui/SEO';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';
import { Mascot } from '@/components/ui/motion/Mascot';
import { ArrowLeft, Building2, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const BUSINESS_TYPES = ['Cafe', 'Hotel', 'Bakery', 'Office', 'Restaurant', 'Cloud Kitchen', 'Other'];

export default function B2BPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    businessType: '',
    monthlyKg: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, POST to Supabase or API
    setSubmitted(true);
  };

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-bg-cream text-espresso-900 font-sans selection:bg-accent-red selection:text-white">
      <SEO title="B2B Supply | Janu Bhai Coffee" description="Power your cafe, hotel, or bakery with Janu Bhai's AAA Grade Chikkamagaluru instant coffee." />

      <div className="min-h-screen flex">
        {/* Left: Cinematic Visual */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-espresso-900">
          <div className="absolute inset-0">
            <img src="/vacuum.png" alt="Janu Bhai Commercial" className="w-full h-full object-cover opacity-20 grayscale" />
            <div className="absolute inset-0 bg-espresso-900/80" />
          </div>
          <div className="absolute inset-0 bg-[url('/grain.png')] opacity-20 mix-blend-overlay pointer-events-none" />

          <div className="relative z-10 p-16 max-w-lg space-y-8">
            <Mascot size={80} state="idle" />
            <h2 className="text-5xl md:text-6xl font-heading font-black tracking-tighter uppercase leading-[0.85] text-white">
              Power Your<br/>Cafe with<br/><span className="text-accent-gold italic">Janu Bhai</span>.
            </h2>
            <p className="text-white/40 font-bold uppercase tracking-widest text-sm leading-relaxed">
              Bulk pricing. Consistent quality. Pan-India delivery. Zero corporate nonsense.
            </p>
            <div className="flex gap-8 pt-4">
              {[
                { val: '₹2,500', label: 'Per KG (Bulk)' },
                { val: '48hr', label: 'Delivery' },
                { val: '100%', label: 'Pure Arabica' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-2xl font-heading font-black text-accent-gold">{item.val}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md space-y-10">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-espresso-900/40 hover:text-espresso-900 transition-opacity">
              <ArrowLeft size={14} /> Back home
            </Link>

            <div className="lg:hidden flex justify-center">
              <Mascot size={60} state="idle" />
            </div>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-accent-red">
                      <Building2 size={20} />
                      <p className="text-xs font-bold uppercase tracking-[0.3em]">Commercial Enquiry</p>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase">
                      Let's Talk <span className="text-accent-gold">Business</span>.
                    </h1>
                    <p className="text-espresso-900/40 font-medium text-sm">
                      Fill in your details. Our commercial team will call you today.
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-espresso-900/40 ml-4">Business Name</label>
                      <input
                        type="text"
                        required
                        value={form.businessName}
                        onChange={(e) => update('businessName', e.target.value)}
                        placeholder="e.g. Chai & Code Cafe"
                        className="w-full rounded-2xl border-4 border-espresso-900 bg-white px-6 py-5 text-sm font-black focus:outline-none focus:ring-8 focus:ring-accent-gold/10 shadow-janu-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-espresso-900/40 ml-4">Owner Name</label>
                      <input
                        type="text"
                        required
                        value={form.ownerName}
                        onChange={(e) => update('ownerName', e.target.value)}
                        placeholder="Enter your name"
                        className="w-full rounded-2xl border-4 border-espresso-900 bg-white px-6 py-5 text-sm font-black focus:outline-none focus:ring-8 focus:ring-accent-gold/10 shadow-janu-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-espresso-900/40 ml-4">Phone Number</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-espresso-900/40 font-black text-sm tracking-widest">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full rounded-2xl border-4 border-espresso-900 bg-white px-6 pl-16 py-5 text-sm font-black font-number focus:outline-none focus:ring-8 focus:ring-accent-gold/10 shadow-janu-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-espresso-900/40 ml-4">Business Type</label>
                      <div className="relative">
                        <select
                          required
                          value={form.businessType}
                          onChange={(e) => update('businessType', e.target.value)}
                          className="w-full rounded-2xl border-4 border-espresso-900 bg-white px-6 py-5 text-sm font-black focus:outline-none focus:ring-8 focus:ring-accent-gold/10 shadow-janu-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all appearance-none"
                        >
                          <option value="">Select type...</option>
                          {BUSINESS_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                          <Building2 size={18} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-espresso-900/40 ml-4">Monthly Requirement (kg)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={form.monthlyKg}
                        onChange={(e) => update('monthlyKg', e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full rounded-2xl border-4 border-espresso-900 bg-white px-6 py-5 text-sm font-black font-number focus:outline-none focus:ring-8 focus:ring-accent-gold/10 shadow-janu-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                      />
                    </div>

                    <MagneticButton intensity={0.15} className="w-full pt-4">
                      <button type="submit" className="w-full flex items-center justify-center gap-4 bg-accent-red text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] border-4 border-espresso-900 shadow-janu hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-sm">
                        <Send size={18} strokeWidth={3} /> Submit Enquiry
                      </button>
                    </MagneticButton>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-16 space-y-8"
                >
                  <Mascot size={140} state="success" />
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 text-accent-gold">
                      <CheckCircle2 size={20} />
                      <p className="text-xs font-bold uppercase tracking-[0.3em]">Enquiry Received</p>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tighter uppercase">
                      We got you, <span className="text-accent-gold">Bhai</span>.
                    </h2>
                    <p className="text-espresso-900/50 font-bold uppercase tracking-widest text-sm max-w-sm">
                      Our commercial team will call you today to discuss pricing and delivery.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
