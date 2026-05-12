"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';
import { Mascot } from './motion/Mascot';

export const Footer = () => {
  return (
    <footer className="bg-espresso-brown text-bg-cream pt-32 pb-16 px-6 border-t-[12px] border-saffron-yellow relative overflow-hidden">
      {/* Top Hook Section */}
      <div className="max-w-7xl mx-auto mb-24 text-center">
        <h2 className="text-5xl md:text-8xl font-heading font-black uppercase tracking-tighter text-saffron-yellow mb-6 drop-shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]">
          Join The Revolution.
          <br /> Drink <span className="text-vibrant-red">Poshtik.</span>
        </h2>
        <p className="text-xl md:text-2xl font-bold opacity-90 max-w-2xl mx-auto">
          India runs on Janu Bhai. No corporate bullshit, just strong coffee.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
          
          {/* Column 1: Brand Manifesto */}
          <div className="space-y-8 bg-black/20 p-8 rounded-3xl border border-white/10">
            <Link href="/" className="flex items-center gap-4 group">
              <Mascot size={60} />
              <span className="font-heading font-black text-3xl uppercase tracking-tighter text-bg-cream">Janu Bhai</span>
            </Link>
            <p className="text-lg font-medium leading-relaxed opacity-90">
              Born in Old Delhi, built for the real India. We are taking back the coffee culture from overpriced minimalist cafes and returning it to the streets. 
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <ShieldCheck size={24} className="text-saffron-yellow" />
              <p className="font-black uppercase tracking-widest text-saffron-yellow">100% Indian Owned</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white text-espresso-brown px-3 py-1 font-bold text-xs uppercase rounded">FSSAI Lic.</div>
              <p className="font-bold opacity-60 text-sm">#12345678901234</p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-8 md:pl-12">
            <h4 className="text-2xl font-black text-saffron-yellow uppercase tracking-tight">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'The ₹20/₹50 Menu', 'Our Story', 'Adda Locations', 'App', 'Franchise OS'].map((link) => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="text-lg font-bold uppercase tracking-widest hover:text-saffron-yellow transition-colors hover:translate-x-2 inline-block">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal & App Stores */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h4 className="text-2xl font-black text-saffron-yellow uppercase tracking-tight">Get The App</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex items-center justify-center gap-3 bg-bg-cream text-espresso-brown rounded-2xl px-6 py-4 font-black uppercase tracking-widest hover:bg-saffron-yellow hover:scale-105 transition-all shadow-[4px_4px_0_0_#000]">
                  <Smartphone size={24} />
                  iOS
                </button>
                <button className="flex items-center justify-center gap-3 bg-bg-cream text-espresso-brown rounded-2xl px-6 py-4 font-black uppercase tracking-widest hover:bg-saffron-yellow hover:scale-105 transition-all shadow-[4px_4px_0_0_#000]">
                  <Smartphone size={24} />
                  Android
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold opacity-50 uppercase tracking-[0.2em]">Legal Hub</h4>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                <li><Link href="/privacy" className="text-sm font-bold hover:text-saffron-yellow underline underline-offset-4 decoration-white/30">Privacy</Link></li>
                <li><Link href="/terms" className="text-sm font-bold hover:text-saffron-yellow underline underline-offset-4 decoration-white/30">Terms</Link></li>
                <li><Link href="/refund" className="text-sm font-bold hover:text-saffron-yellow underline underline-offset-4 decoration-white/30">Refund</Link></li>
                <li><Link href="/shipping" className="text-sm font-bold hover:text-saffron-yellow underline underline-offset-4 decoration-white/30">Shipping</Link></li>
                <li><Link href="/disclosure" className="text-sm font-bold hover:text-saffron-yellow underline underline-offset-4 decoration-white/30">Disclosure</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Payment Trust Banner */}
        <div className="mb-16 bg-white/5 border border-white/10 rounded-[2rem] p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-saffron-yellow">
              <CreditCard size={28} />
              <span className="font-black uppercase tracking-widest">100% Secure Payments</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 opacity-80">
              {['UPI', 'Paytm', 'PhonePe', 'Google Pay', 'Razorpay', 'RuPay', 'Visa', 'Mastercard'].map((method) => (
                <span key={method} className="font-heading font-black text-xl italic tracking-tighter text-bg-cream px-3 py-1 bg-white/10 rounded-md">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <p className="text-sm font-bold opacity-50 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Janu Bhai Coffee. Ekdum Jhakaas.
          </p>
          <div className="flex items-center gap-4 text-sm font-bold opacity-50 uppercase tracking-widest">
            <span>Made in Delhi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

