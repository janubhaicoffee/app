"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft, Rocket, TrendingUp, IndianRupee, ShieldCheck, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SEO } from '@/components/ui/SEO';

export default function FranchisePublicPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown p-6 pb-32 animate-in fade-in duration-700">
      <SEO 
        title="Start Your Coffee Outlet" 
        description="Join the Janu Bhai network. Start your own coffee outlet with our tech-powered decentralized model. Realistic ROI, full support, and local autonomy."
        keywords="start coffee shop india, coffee franchise india cost, janu bhai coffee outlet"
      />

      <div className="max-w-2xl mx-auto space-y-12">
        <button onClick={() => router.push('/')} className="p-3 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect">
          <ArrowLeft size={24} />
        </button>

        <header className="space-y-4">
          <h1 className="text-6xl font-heading tracking-tighter leading-tight">Build Your Own<br/><span className="text-accent-brown">Coffee Empire.</span></h1>
          <p className="text-xl opacity-60 leading-relaxed max-w-md">
            The most honest franchise model in India. We provide the brain, you provide the hustle.
          </p>
        </header>

        {/* Realistic ROI Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Financial Clarity</h2>
          <div className="grid grid-cols-2 gap-6">
            <Card glass className="p-8 border-accent-brown/20 bg-accent-brown/5 rounded-[40px]">
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-2">Daily Target</p>
              <h4 className="text-4xl text-number">₹5,000</h4>
              <p className="text-[10px] font-bold text-accent-green mt-2 uppercase tracking-widest">REALISTIC BASELINE</p>
            </Card>
            <Card glass className="p-8 border-accent-brown/20 rounded-[40px]">
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-2">Setup Cost</p>
              <h4 className="text-4xl text-number">₹3.5L</h4>
              <p className="text-[10px] font-bold opacity-40 mt-2 uppercase tracking-widest">ALL-INCLUSIVE</p>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">The 3-Step Launch</h2>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Apply & Survey', desc: 'We verify your location and local footfall potential.', icon: <ShieldCheck size={24} /> },
              { step: '02', title: 'Setup & Tech', desc: 'We install the Janu Bhai OS and provide branding assets.', icon: <Rocket size={24} /> },
              { step: '03', title: 'Go Live', desc: 'Start selling and tracking everything on your mobile.', icon: <TrendingUp size={24} /> }
            ].map((item, i) => (
              <div key={i} className="flex gap-8 items-start animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-5xl font-heading text-accent-brown/10 leading-none">{item.step}</div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-2xl font-heading leading-none">{item.title}</h4>
                  <p className="text-md opacity-60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Support Card */}
        <Card glass className="p-12 bg-accent-brown text-white shadow-2xl relative overflow-hidden group rounded-[48px]">
          <div className="absolute -right-16 -top-16 text-white/5 group-hover:scale-125 transition-transform duration-1000">
            <IndianRupee size={240} />
          </div>
          <div className="relative z-10 space-y-8">
            <h3 className="text-4xl font-heading tracking-tight leading-tight">What you get from HQ</h3>
            <ul className="grid gap-4">
              {['Inventory Management App', 'Marketing & SEO Boost', 'Centralized Logistics', 'Real-time Profit Analytics'].map((li, i) => (
                <li key={i} className="flex items-center gap-4 text-md font-medium opacity-90">
                  <div className="p-1 bg-accent-red rounded-full">
                    <ChevronRight size={12} className="text-white" />
                  </div>
                  {li}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* CTA Form Placeholder */}
        <section className="space-y-8 pt-16">
          <h2 className="text-4xl font-heading tracking-tight">Ready to start?</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Your Name" className="w-full bg-white border border-black/5 rounded-[24px] py-6 px-8 text-lg focus:outline-none focus:ring-4 focus:ring-accent-brown/5 shadow-sm transition-all" />
            <input type="email" placeholder="Email Address" className="w-full bg-white border border-black/5 rounded-[24px] py-6 px-8 text-lg focus:outline-none focus:ring-4 focus:ring-accent-brown/5 shadow-sm transition-all" />
            <input type="tel" placeholder="Phone Number (WhatsApp)" className="w-full bg-white border border-black/5 rounded-[24px] py-6 px-8 text-lg focus:outline-none focus:ring-4 focus:ring-accent-brown/5 shadow-sm transition-all" />
            <button className="w-full bg-accent-brown text-white py-6 rounded-[32px] shadow-2xl press-effect font-bold uppercase tracking-[0.2em] text-sm mt-4">
              Apply for Franchise
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
