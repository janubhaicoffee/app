"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SEO } from '@/components/ui/SEO';
import { Coffee, Globe, Shield, TrendingUp, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Janu Bhai Coffee",
    "url": "https://janubhai.coffee",
    "logo": "https://janubhai.coffee/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-91111-22222",
      "contactType": "customer service"
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown selection:bg-accent-brown selection:text-white overflow-x-hidden">
      <SEO 
        title="Roz Ki Strong Kahaani" 
        description="Premium Indian coffee near you. Janu Bhai Coffee is a decentralized network of high-quality coffee outlets built for the real India. Order now or start your own outlet."
        keywords="coffee near me, affordable coffee India, start coffee outlet India, best cold brew India"
        schema={schemaMarkup}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Cinematic Ambient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent-brown/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-red/5 rounded-full blur-[100px] animate-pulse delay-700" />
        </div>

        <div className="max-w-6xl w-full mx-auto relative z-10 text-center space-y-12">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-brown/5 border border-accent-brown/10 mb-4">
              <div className="w-2 h-2 bg-accent-red rounded-full animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">Now Live: Okhla Hub</span>
            </div>
            <h1 className="text-7xl md:text-[120px] font-heading leading-[0.85] tracking-tighter">
              JANU BHAI<br/>
              <span className="text-accent-red">COFFEE OS</span>
            </h1>
            <p className="text-lg md:text-2xl opacity-40 font-medium tracking-tight max-w-2xl mx-auto leading-relaxed">
              India's first decentralized coffee brand. Powered by community, scaled by technology, brewed with obsession.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <Link href="/app">
              <Button size="lg" className="px-12 py-8 bg-[#3E2723] text-white text-sm font-bold uppercase tracking-[0.3em] rounded-[24px] shadow-2xl shadow-accent-brown/20 hover:scale-105 transition-transform active:scale-95 group">
                Order Coffee
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/franchise">
              <Button variant="outline" size="lg" className="px-12 py-8 border-accent-brown/20 text-sm font-bold uppercase tracking-[0.3em] rounded-[24px] hover:bg-white transition-colors">
                Start Your Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & SEO Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto space-y-24">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4 max-w-xl">
              <h2 className="text-5xl md:text-7xl font-heading tracking-tighter leading-none">Honest Growth.<br/>Local Hustle.</h2>
              <p className="text-xl opacity-50 leading-relaxed">Scaling local impact with central intelligence. Janu Bhai Coffee is more than a chain—it's an operating system for the next generation of Indian entrepreneurs.</p>
            </div>
            <div className="bg-accent-brown/5 p-8 rounded-[40px] border border-accent-brown/5 hidden md:block">
              <div className="text-sm font-bold opacity-30 uppercase tracking-[0.4em] mb-4">Network Pulse</div>
              <div className="flex items-center gap-6">
                <div className="space-y-1">
                  <div className="text-3xl text-number">142+</div>
                  <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Active Nodes</div>
                </div>
                <div className="w-px h-10 bg-accent-brown/10" />
                <div className="space-y-1">
                  <div className="text-3xl text-number">₹12.4L</div>
                  <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Daily Volume</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card glass className="flex flex-col items-start gap-8 p-12 text-left border-white/50 rounded-[50px] group hover:bg-white/60 transition-all duration-500">
              <div className="p-6 bg-accent-brown text-white rounded-[24px] shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Globe size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-heading tracking-tight">Decentralized Power</h3>
                <p className="text-lg opacity-60 leading-relaxed">Each outlet operates as an independent node, controlled by our proprietary OS. Real autonomy for real owners.</p>
              </div>
            </Card>

            <Card glass className="flex flex-col items-start gap-8 p-12 text-left border-white/50 rounded-[50px] group hover:bg-white/60 transition-all duration-500">
              <div className="p-6 bg-accent-red text-white rounded-[24px] shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Shield size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-heading tracking-tight">Trust & Transparency</h3>
                <p className="text-lg opacity-60 leading-relaxed">Realistic ROI expectations of ₹5,000/day daily sales. No hidden fees, no fake promises. Just raw business.</p>
              </div>
            </Card>

            <Card glass className="flex flex-col items-start gap-8 p-12 text-left border-white/50 rounded-[50px] group hover:bg-white/60 transition-all duration-500">
              <div className="p-6 bg-accent-gold text-white rounded-[24px] shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <TrendingUp size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-heading tracking-tight">Rapid Scaling</h3>
                <p className="text-lg opacity-60 leading-relaxed">Go from survey to live in 14 days. Our plug-and-play infrastructure handles the complexity while you focus on the coffee.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Footer */}
      <footer className="pt-48 pb-24 bg-white/40 backdrop-blur-md border-t border-black/5 px-6">
        <div className="max-w-6xl mx-auto space-y-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-32">
            <div className="space-y-10">
              <h4 className="text-[12px] font-bold opacity-30 uppercase tracking-[0.4em]">Brand</h4>
              <ul className="space-y-6 text-lg font-medium opacity-60">
                <li><Link href="/about" className="hover:text-accent-red transition-colors">Our Story</Link></li>
                <li><Link href="/contact" className="hover:text-accent-red transition-colors">Support</Link></li>
                <li><Link href="/franchise" className="hover:text-accent-red transition-colors">Partners</Link></li>
              </ul>
            </div>
            <div className="space-y-10">
              <h4 className="text-[12px] font-bold opacity-30 uppercase tracking-[0.4em]">Legal</h4>
              <ul className="space-y-6 text-lg font-medium opacity-60">
                <li><Link href="/terms" className="hover:text-accent-red transition-colors">Terms of Use</Link></li>
                <li><Link href="/privacy" className="hover:text-accent-red transition-colors">Privacy</Link></li>
                <li><Link href="/refund" className="hover:text-accent-red transition-colors">Refunds</Link></li>
                <li><Link href="/shipping" className="hover:text-accent-red transition-colors">Shipping</Link></li>
              </ul>
            </div>
            <div className="col-span-2 space-y-10">
              <h4 className="text-[12px] font-bold opacity-30 uppercase tracking-[0.4em]">Office</h4>
              <div className="space-y-4">
                <p className="text-xl font-heading">HQ: Okhla Phase III</p>
                <p className="text-md opacity-40">New Delhi, 110020 • India</p>
              </div>
            </div>
          </div>

          <div className="pt-24 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Coffee size={56} strokeWidth={1} className="opacity-10" />
              <div className="text-center md:text-left">
                <p className="text-[12px] font-bold uppercase tracking-[0.6em] mb-2 opacity-20">Janu Bhai Coffee Co.</p>
                <p className="text-[10px] font-bold opacity-20 tracking-widest">BUILT FOR REAL INDIA • SINCE 2024</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity p-4 border border-black/5 rounded-full">
                Partner Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
