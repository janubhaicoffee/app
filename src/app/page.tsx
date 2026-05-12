"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Coffee, ShieldCheck, Thermometer, Wind, Zap, ArrowRight, MapPin, CheckCircle2, BarChart3, Users, Network } from 'lucide-react';
import { SEO } from '@/components/ui/SEO';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// Motion Components
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { Parallax } from '@/components/ui/motion/Parallax';
import { AnimatedCounter } from '@/components/ui/motion/AnimatedCounter';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);

  return (
    <div className="bg-espresso-900 text-bg-cream overflow-x-hidden min-h-screen" ref={containerRef}>
      <SEO 
        title="Janu Bhai Coffee | India's Decentralized Coffee Movement"
        description="Experience the science of freshness. Sourced from Chikkamagaluru, processed without chemicals, and preserved via advanced dry vacuum technology."
        keywords="Chikkamagaluru coffee, decentralized coffee, Gen Z coffee brand, dry vacuum coffee, fresh roasted coffee India"
      />

      <div className="grain-overlay" />

      {/* Cinematic Hero Section */}
      <section className="relative h-[100svh] flex flex-col justify-center overflow-hidden">
        {/* Background Parallax Image */}
        <div className="absolute inset-0 z-0">
          <Parallax speed={0.4} className="h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-espresso-900/60 via-espresso-900/40 to-espresso-900 z-10" />
            <img 
              src="/farm.png" 
              alt="Chikkamagaluru Farm Cinematic" 
              className="w-full h-full object-cover scale-110 opacity-40 mix-blend-luminosity"
            />
          </Parallax>
        </div>

        {/* Floating Steam Particles (CSS driven) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30 mix-blend-screen">
          <div className="absolute w-[800px] h-[800px] bg-accent-gold/20 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }} />
        </div>
        
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} 
          className="relative z-10 px-6 max-w-7xl mx-auto w-full pt-20"
        >
          <FadeIn delay={0.2} direction="down">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-espresso text-accent-gold text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-8 border-accent-gold/30">
              <Zap size={14} className="animate-pulse" />
              India's First Decentralized Coffee Movement
            </div>
          </FadeIn>
          
          <FadeIn delay={0.4} direction="up">
            <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-heading tracking-tighter leading-[0.85] mb-8 uppercase text-white drop-shadow-2xl">
              Roz Ki <span className="text-accent-red italic pr-4">Strong</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bg-cream to-accent-gold">Kahaani</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.6} direction="up">
            <p className="text-lg md:text-2xl font-medium opacity-80 mb-12 max-w-2xl text-bg-cream/90 leading-relaxed">
              We are not just a coffee chain. We are an operating system for the culture. AAA-grade Chikkamagaluru beans, completely decentralized.
            </p>
          </FadeIn>

          <FadeIn delay={0.8} direction="up" className="flex flex-col sm:flex-row items-center gap-6">
            <Link href="/login">
              <MagneticButton intensity={0.3}>
                <Button size="lg" className="bg-white text-espresso-900 px-10 h-16 rounded-full text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] group">
                  Enter the OS
                  <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </MagneticButton>
            </Link>
            <Link href="/franchise">
              <MagneticButton intensity={0.2}>
                <Button variant="outline" size="lg" className="px-10 h-16 rounded-full text-lg border-white/30 text-white hover:bg-white hover:text-espresso-900">
                  Own an Outlet
                </Button>
              </MagneticButton>
            </Link>
          </FadeIn>
        </motion.div>

        {/* Live Ecosystem Metrics Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 glass-espresso">
          <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex flex-wrap justify-between gap-8 md:gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-50 mb-1 text-accent-gold">Active Outlets</span>
              <div className="text-3xl md:text-4xl font-heading font-bold text-white"><AnimatedCounter value={24} /></div>
            </div>
            <div className="h-12 w-px bg-white/10 hidden md:block" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-50 mb-1 text-accent-gold">Cups Served</span>
              <div className="text-3xl md:text-4xl font-heading font-bold text-white"><AnimatedCounter value={120500} suffix="+" /></div>
            </div>
            <div className="h-12 w-px bg-white/10 hidden md:block" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-50 mb-1 text-accent-gold">Cities</span>
              <div className="text-3xl md:text-4xl font-heading font-bold text-white"><AnimatedCounter value={5} /></div>
            </div>
            <div className="h-12 w-px bg-white/10 hidden md:block" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-50 mb-1 text-accent-gold">Network APY</span>
              <div className="text-3xl md:text-4xl font-heading font-bold text-accent-green"><AnimatedCounter value={18} suffix="%" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section (OS View) */}
      <section className="py-32 px-6 relative z-10 bg-espresso-800">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <FadeIn direction="up">
            <p className="text-accent-gold font-bold uppercase tracking-[0.4em] text-[10px] mb-4">The Command Center</p>
            <h2 className="text-4xl md:text-6xl font-heading tracking-tight text-white leading-[1.1]">
              Manage Your Outlet Like <br/>
              <span className="italic text-white/50">A Tech Startup</span>
            </h2>
          </FadeIn>
          
          <FadeIn delay={0.2} direction="up" className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-accent-gold/20 blur-[100px] rounded-full" />
            <div className="relative glass-espresso rounded-3xl border border-white/20 p-2 md:p-4 shadow-2xl overflow-hidden aspect-video flex flex-col">
              {/* Mock Dashboard Topbar */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent-red flex items-center justify-center text-[10px] font-bold">JB</div>
                  <div className="text-sm font-bold uppercase tracking-widest text-white/80">Okhla Terminal</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-green animate-pulse" />
                  <span className="text-xs uppercase tracking-widest text-accent-green font-bold">Live</span>
                </div>
              </div>
              
              {/* Mock Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 flex-grow">
                <div className="col-span-2 glass-espresso rounded-2xl border border-white/5 p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40">Today's Revenue</h4>
                    <p className="text-4xl font-number font-bold mt-2">₹14,500</p>
                  </div>
                  <div className="h-32 mt-8 flex items-end gap-2">
                    {[40, 70, 45, 90, 60, 100, 80].map((h, i) => (
                      <div key={i} className="flex-1 bg-accent-gold/50 rounded-t-sm transition-all duration-1000 hover:bg-accent-gold" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="glass-espresso rounded-2xl border border-white/5 p-6">
                    <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">Cups Pulled</h4>
                    <p className="text-3xl font-number font-bold">142</p>
                  </div>
                  <div className="glass-espresso rounded-2xl border border-white/5 p-6">
                    <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">Bean Supply</h4>
                    <p className="text-3xl font-number font-bold text-accent-red">12 kg</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* The Origin Section - Transition to Cream */}
      <section id="story" className="py-32 px-6 bg-bg-cream text-espresso-900 rounded-t-[4rem] -mt-10 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-8">
            <FadeIn direction="right">
              <p className="text-accent-red font-bold uppercase tracking-[0.4em] text-[10px]">Step 01: The Source</p>
              <h2 className="text-5xl font-heading tracking-tight mt-2">Private Farms of <br/><span className="italic">Chikkamagaluru</span></h2>
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
              <p className="text-xl leading-relaxed opacity-80 font-medium">
                Our journey begins in the mist-covered hills of Chikkamagaluru, where we partner with elite private estates. We don't just buy coffee; we select the top 1% of the harvest.
              </p>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <FadeIn delay={0.4} direction="up" className="p-8 bg-white rounded-3xl border border-black/5 shadow-xl hover:-translate-y-2 transition-transform duration-500">
                <div className="w-12 h-12 bg-espresso-900 rounded-xl flex items-center justify-center text-white mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="font-bold uppercase tracking-widest text-xs mb-3 text-espresso-900">AAA Grade Only</h4>
                <p className="text-sm opacity-60 leading-relaxed">Strict export-quality sorting. Only the densest, most flavorful beans make the cut.</p>
              </FadeIn>
              <FadeIn delay={0.6} direction="up" className="p-8 bg-white rounded-3xl border border-black/5 shadow-xl hover:-translate-y-2 transition-transform duration-500">
                <div className="w-12 h-12 bg-espresso-900 rounded-xl flex items-center justify-center text-white mb-6">
                  <MapPin size={24} />
                </div>
                <h4 className="font-bold uppercase tracking-widest text-xs mb-3 text-espresso-900">Single Estate</h4>
                <p className="text-sm opacity-60 leading-relaxed">Traceable to the specific patch of land. No mixing, no compromises on purity.</p>
              </FadeIn>
            </div>
          </div>
          
          <FadeIn direction="left" className="relative group h-[700px]">
            <div className="absolute inset-0 bg-accent-brown/5 rounded-[4rem] rotate-3 group-hover:rotate-0 transition-transform duration-700" />
            <div className="relative z-10 w-full h-full rounded-[3rem] overflow-hidden shadow-2xl">
              <Parallax speed={0.1}>
                <img 
                  src="/storage.png" 
                  alt="Raw Bean Storage" 
                  className="w-full h-[120%] object-cover scale-110"
                />
              </Parallax>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 text-center px-6 bg-espresso-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/roast.png')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-900 via-transparent to-transparent" />
        
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <FadeIn direction="up">
            <h2 className="text-6xl md:text-[8rem] font-heading tracking-tighter uppercase leading-[0.8] mb-8 drop-shadow-2xl">
              Join the <br/><span className="text-accent-red italic">Brotherhood</span>
            </h2>
            <p className="text-xl md:text-2xl opacity-60 font-medium max-w-2xl mx-auto leading-relaxed">
              Whether you're a coffee lover or a potential franchise partner, the Janu Bhai OS is ready for you.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.2} direction="up" className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <Link href="/login" className="w-full sm:w-auto">
              <MagneticButton intensity={0.4}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-espresso-900 px-14 py-8 text-xl rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-shadow">
                  Sign In to Dashboard
                </Button>
              </MagneticButton>
            </Link>
            <Link href="/franchise" className="w-full sm:w-auto">
              <MagneticButton intensity={0.2}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-14 py-8 text-xl rounded-full border-white/30 text-white hover:bg-white hover:text-espresso-900">
                  Partner With Us
                </Button>
              </MagneticButton>
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

