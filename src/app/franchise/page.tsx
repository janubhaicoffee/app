"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, IndianRupee, ShieldCheck, ChevronRight, Users, 
  TrendingUp, Building2, Eye, FileText, Video, Target, Zap, 
  CheckCircle2, MapPin, Network, Sparkles 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SEO } from '@/components/ui/SEO';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { Parallax } from '@/components/ui/motion/Parallax';
import { AnimatedCounter } from '@/components/ui/motion/AnimatedCounter';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';

export default function FranchisePublicPage() {
  const router = useRouter();
  const [investment, setInvestment] = useState(1); // 1 = 1 Lakh
  const expectedMonthlyReturn = investment * 11000;
  const expectedYearlyReturn = expectedMonthlyReturn * 12;
  const total5YearReturn = expectedYearlyReturn * 5;

  return (
    <div className="min-h-screen bg-espresso-900 text-bg-cream selection:bg-accent-red selection:text-white overflow-hidden">
      <SEO 
        title="Start Your Coffee Empire | Janu Bhai Franchise" 
        description="Join the Janu Bhai decentralized coffee chain. Own a part of a community-powered movement. Low investment, high returns, and full tech support."
        keywords="coffee franchise india, start coffee shop india, janu bhai coffee partnership, decentralized franchise"
      />

      <div className="grain-overlay" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Parallax speed={0.3} className="h-full">
            <img src="/franchise.png" alt="Proud Franchise Owner" className="w-full h-full object-cover opacity-20 mix-blend-luminosity scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-espresso-900/80 via-espresso-900/60 to-espresso-900" />
          </Parallax>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8 pt-20">
          <FadeIn direction="down">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-espresso border border-accent-gold/20 text-accent-gold text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-4">
              <Network size={14} className="animate-pulse" />
              The Decentralized Ownership Protocol
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2} direction="up">
            <h1 className="text-6xl md:text-[8rem] font-heading tracking-tighter leading-[0.85] uppercase text-white drop-shadow-2xl">
              Own Part.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red to-accent-gold">Earn Forever.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.4} direction="up">
            <p className="text-xl md:text-3xl font-medium opacity-80 max-w-3xl mx-auto leading-relaxed text-bg-cream/90">
              You are not buying a franchise. You are joining a movement. We build and run the outlets; you own a stake in the culture.
            </p>
          </FadeIn>

          <FadeIn delay={0.6} direction="up" className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
            <MagneticButton intensity={0.4}>
              <Button size="lg" className="px-12 py-8 text-xl rounded-full bg-white text-espresso-900 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]" onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })}>
                Apply to Partner
              </Button>
            </MagneticButton>
            <MagneticButton intensity={0.2}>
              <Button variant="outline" size="lg" className="px-12 py-8 text-xl rounded-full border-white/30 text-white hover:bg-white hover:text-espresso-900" onClick={() => document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })}>
                Run Simulator
              </Button>
            </MagneticButton>
          </FadeIn>
        </div>
        
        {/* Animated scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/30">
          <div className="w-px h-24 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* Decentralized Network Visualizer */}
      <section className="py-32 px-6 bg-espresso-800 relative z-10 border-y border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="right" className="space-y-8">
            <h2 className="text-accent-gold font-bold uppercase tracking-[0.4em] text-[10px]">The Architecture</h2>
            <h3 className="text-5xl font-heading tracking-tight leading-[0.9] text-white">
              A Network Built For <span className="italic">Scale</span>
            </h3>
            <p className="text-xl leading-relaxed opacity-70">
              Traditional franchises are bloated with royalty fees and operational nightmares. Our decentralized model shifts the power to you. You provide the capital; our OS provides the operations, supply chain, and marketing.
            </p>
            <ul className="space-y-6 pt-4">
              {[
                { icon: <ShieldCheck className="text-accent-green" />, text: "Zero Royalty Fees. Ever." },
                { icon: <Zap className="text-accent-gold" />, text: "Automated Daily Payouts via Smart Contracts" },
                { icon: <Users className="text-accent-red" />, text: "Community Governed Menu Selection" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-lg font-bold tracking-widest text-white/80">
                  <div className="p-3 glass-espresso rounded-xl">{item.icon}</div>
                  {item.text}
                </li>
              ))}
            </ul>
          </FadeIn>
          
          <FadeIn direction="left" delay={0.2} className="relative aspect-square flex items-center justify-center">
            {/* Visualizer Node Graph */}
            <div className="absolute inset-0 bg-accent-gold/5 blur-[120px] rounded-full animate-pulse" />
            <div className="relative w-full h-full max-w-md mx-auto">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 glass-espresso rounded-full border border-accent-gold/50 flex items-center justify-center shadow-[0_0_50px_rgba(255,179,0,0.3)] z-20">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase text-accent-gold">JB HQ</p>
                  <p className="text-[10px] opacity-50 uppercase">OS Core</p>
                </div>
              </div>
              
              {/* Orbiting Nodes */}
              {[0, 72, 144, 216, 288].map((deg, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 origin-[0_0] z-10"
                  style={{ rotate: deg }}
                  animate={{ rotate: deg + 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-40 h-px bg-gradient-to-r from-accent-gold/40 to-transparent" />
                  <div className="absolute top-[-20px] left-[160px] w-10 h-10 glass-espresso rounded-full border border-white/20 flex items-center justify-center shadow-lg" style={{ transform: `rotate(${-deg}deg)` }}>
                    <MapPin size={14} className={i % 2 === 0 ? "text-accent-red" : "text-white"} />
                  </div>
                </motion.div>
              ))}
              
              {/* Data Flow Particles */}
              <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-4 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Interactive Investment Simulator */}
      <section id="simulator" className="py-32 px-6 bg-bg-cream text-espresso-900 rounded-t-[4rem] relative z-20 -mt-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-5xl mx-auto space-y-16">
          <FadeIn direction="up" className="text-center space-y-4">
            <h2 className="text-accent-red font-bold uppercase tracking-[0.4em] text-[10px]">Profit Flow System</h2>
            <h3 className="text-5xl md:text-7xl font-heading tracking-tight uppercase">Simulate Your <span className="italic text-accent-red">Returns</span></h3>
            <p className="text-xl opacity-60 font-medium max-w-2xl mx-auto">
              Play with the numbers. See the potential of owning a stake in the most disruptive coffee brand in India.
            </p>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <div className="glass-card rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-red/5 rounded-full blur-[100px] -z-10" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Simulator Controls */}
                <div className="space-y-12">
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-bold uppercase tracking-widest opacity-50">Investment Amount</label>
                      <div className="text-3xl font-heading font-bold text-accent-red">₹{investment},00,000</div>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="1"
                      value={investment}
                      onChange={(e) => setInvestment(Number(e.target.value))}
                      className="w-full h-3 bg-espresso-900/10 rounded-full appearance-none cursor-pointer accent-accent-red"
                    />
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-40">
                      <span>1 Lakh</span>
                      <span>10 Lakhs</span>
                    </div>
                  </div>

                  <div className="space-y-4 p-6 bg-espresso-900/5 rounded-2xl border border-espresso-900/10">
                    <div className="flex items-center gap-3">
                      <Sparkles size={16} className="text-accent-gold" />
                      <h4 className="text-sm font-bold uppercase tracking-widest">Network APY Projection</h4>
                    </div>
                    <p className="text-xs opacity-60 leading-relaxed font-medium">
                      Based on current operating metrics across 24 outlets, the average yield per ₹1L investment is ~20% of net profit share.
                    </p>
                  </div>
                </div>

                {/* Simulated Results */}
                <div className="space-y-8 flex flex-col justify-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">Monthly Return</p>
                      <div className="text-3xl font-number font-bold text-espresso-900">₹<AnimatedCounter value={expectedMonthlyReturn} /></div>
                      <div className="absolute bottom-0 left-0 h-1 bg-accent-red w-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">Yearly Return</p>
                      <div className="text-3xl font-number font-bold text-espresso-900">₹<AnimatedCounter value={expectedYearlyReturn} /></div>
                      <div className="absolute bottom-0 left-0 h-1 bg-accent-gold w-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </div>
                  </div>

                  <div className="p-8 bg-espresso-900 text-white rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent-red/20 to-transparent opacity-50" />
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                      <div className="space-y-2 text-center sm:text-left">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-gold">Total 5-Year Projection</p>
                        <div className="text-5xl font-number font-bold">₹<AnimatedCounter value={total5YearReturn} /></div>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                        <TrendingUp size={24} className="text-accent-gold" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 pt-4">
            *Projections are illustrative based on historical outlet data. Investments carry risk.
          </p>
        </div>
      </section>

      {/* Live Dashboards Preview */}
      <section className="py-32 px-6 bg-espresso-900 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-accent-gold font-bold uppercase tracking-[0.4em] text-[10px]">Total Transparency</h2>
            <h3 className="text-5xl font-heading tracking-tight uppercase text-white">Live Data. <span className="italic text-white/50">No Secrets.</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Eye />, title: "Live Sales Sync", desc: "Watch cups pull and revenue tick up in real-time on your partner OS app." },
              { icon: <FileText />, title: "Automated P&L", desc: "Every expense is logged on-chain for immutable transparency." },
              { icon: <Video />, title: "Live CCTV Access", desc: "Open up the app and view your outlet's floor instantly." }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.2} direction="up" className="space-y-6 p-10 glass-espresso rounded-[40px] text-center border-white/10 group hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white mx-auto group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-widest text-xs text-white">{item.title}</h4>
                  <p className="text-sm font-medium opacity-60 text-white leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="apply" className="py-40 px-6 text-center bg-espresso-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/franchise.png')] opacity-5 mix-blend-overlay bg-cover bg-center" />
        <div className="max-w-3xl mx-auto space-y-12 relative z-10">
          <div className="space-y-4">
            <h2 className="text-6xl md:text-8xl font-heading tracking-tighter uppercase leading-[0.85] text-white">
              Let's Brew<br/><span className="text-accent-red">Wealth.</span>
            </h2>
            <p className="text-xl md:text-2xl font-medium opacity-60 text-white">Join the fastest-growing decentralized coffee network.</p>
          </div>

          <FadeIn delay={0.2} direction="up">
            <form className="space-y-4 max-w-lg mx-auto pt-12">
              <input type="text" placeholder="FULL NAME" className="w-full bg-white/5 border border-white/10 rounded-[32px] py-6 px-10 text-lg text-white focus:outline-none focus:border-accent-gold focus:bg-white/10 transition-all uppercase font-bold tracking-widest text-xs placeholder:text-white/30" />
              <input type="email" placeholder="EMAIL ADDRESS" className="w-full bg-white/5 border border-white/10 rounded-[32px] py-6 px-10 text-lg text-white focus:outline-none focus:border-accent-gold focus:bg-white/10 transition-all uppercase font-bold tracking-widest text-xs placeholder:text-white/30" />
              <input type="tel" placeholder="WHATSAPP NUMBER" className="w-full bg-white/5 border border-white/10 rounded-[32px] py-6 px-10 text-lg text-white focus:outline-none focus:border-accent-gold focus:bg-white/10 transition-all uppercase font-bold tracking-widest text-xs placeholder:text-white/30" />
              <MagneticButton intensity={0.1} className="w-full mt-4">
                <Button size="lg" className="w-full py-8 text-xl bg-white text-espresso-900 rounded-[32px] shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                  Submit Application
                </Button>
              </MagneticButton>
            </form>
          </FadeIn>

          <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 pt-12 text-white">
            © 2026 Janu Bhai Coffee Co. • A People-Powered Initiative
          </p>
        </div>
      </section>
    </div>
  );
}
