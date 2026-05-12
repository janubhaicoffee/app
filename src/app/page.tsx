"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Coffee, Smartphone, Zap, Flame, Snowflake, ArrowRight, QrCode, HeartHandshake, ShieldCheck } from 'lucide-react';
import { SEO } from '@/components/ui/SEO';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { Parallax } from '@/components/ui/motion/Parallax';
import { Mascot } from '@/components/ui/motion/Mascot';

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  return (
    <div className="bg-bg-cream text-espresso-brown overflow-x-hidden min-h-screen" ref={containerRef}>
      <SEO 
        title="Janu Bhai Coffee | Ekdum Jhakaas Poshtik Coffee"
        description="Not a luxury café. Just India's most poshtik coffee. No corporate bullshit. Experience the true Adda culture."
        keywords="Janu Bhai coffee, poshtik coffee, adda culture, cheap coffee india, premium cheap coffee"
      />

      <div className="grain-overlay opacity-10" />

      {/* Section 1: The Immersive Hero */}
      <section className="relative min-h-[100svh] flex flex-col justify-center items-center pt-24 pb-12 px-6 overflow-hidden">
        
        {/* Abstract Background Element */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-5 pointer-events-none">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="w-[150vw] h-[150vw] sm:w-[100vw] sm:h-[100vw] rounded-full border-[100px] border-espresso-brown border-dashed"
          />
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} 
          className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center"
        >
          <FadeIn delay={0.2} direction="down">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-saffron-yellow text-espresso-brown font-black uppercase tracking-widest text-xs mb-8 shadow-[4px_4px_0_0_#4A3022] border-2 border-espresso-brown rotate-[-2deg]">
              <Zap size={16} strokeWidth={3} />
              Ekdum Jhakaas Vibes
            </div>
          </FadeIn>
          
          <FadeIn delay={0.4} direction="up" className="relative">
            <h1 className="text-7xl sm:text-[8rem] md:text-[11rem] font-heading font-black tracking-tighter uppercase leading-[0.8] text-espresso-brown drop-shadow-[8px_8px_0_rgba(226,55,68,0.2)]">
              ROZ KI <br/>
              <span className="text-vibrant-red stroke-espresso-brown stroke-2" style={{ WebkitTextStroke: '3px #4A3022' }}>STRONG</span><br/>
              KAHAANI
            </h1>
            
            {/* Floating Mascot reacting to nothing but scroll */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 md:top-0 md:-right-20 hidden sm:block drop-shadow-2xl"
            >
              <Mascot size={150} state="idle" />
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.6} direction="up">
            <p className="text-xl md:text-3xl font-bold opacity-90 mt-10 mb-12 max-w-2xl mx-auto leading-relaxed">
              Not a luxury café. Just India's most poshtik coffee. No corporate bullshit.
            </p>
          </FadeIn>

          <FadeIn delay={0.8} direction="up" className="flex flex-col w-full sm:w-auto sm:flex-row items-center gap-6">
            <Link href="#menu" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-saffron-yellow text-espresso-brown px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xl border-4 border-espresso-brown shadow-[8px_8px_0_0_#4A3022] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0_0_#4A3022] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all flex items-center justify-center gap-3">
                Order Now
                <ArrowRight strokeWidth={3} />
              </button>
            </Link>
            <Link href="/app" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-bg-cream text-espresso-brown px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xl border-4 border-espresso-brown shadow-[8px_8px_0_0_#4A3022] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0_0_#4A3022] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all flex items-center justify-center gap-3">
                Download App
                <Smartphone strokeWidth={3} />
              </button>
            </Link>
          </FadeIn>
        </motion.div>
      </section>

      {/* Section 2: The "No-Bullshit" Menu */}
      <section id="menu" className="py-24 px-6 border-t-[12px] border-espresso-brown bg-saffron-yellow relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <FadeIn direction="up" className="text-center space-y-4">
            <h2 className="text-6xl md:text-8xl font-heading font-black tracking-tighter uppercase text-espresso-brown drop-shadow-[4px_4px_0_0_#FDFBF7]">
              The No-Bullshit Menu
            </h2>
            <p className="text-2xl font-bold uppercase tracking-widest opacity-80">We only do two things. But we do them best.</p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Hot Coffee Card */}
            <FadeIn direction="right" className="bg-bg-cream rounded-[3rem] border-8 border-espresso-brown p-8 md:p-12 shadow-[16px_16px_0_0_#4A3022] flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-vibrant-red/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative z-10 flex justify-between items-start mb-12">
                <div className="bg-vibrant-red text-white p-4 rounded-2xl border-4 border-espresso-brown shadow-[4px_4px_0_0_#4A3022] rotate-[-5deg]">
                  <Flame size={48} strokeWidth={2.5} />
                </div>
                <div className="bg-bg-cream text-espresso-brown px-6 py-2 rounded-full border-4 border-espresso-brown shadow-[4px_4px_0_0_#4A3022] font-black text-4xl rotate-[5deg]">
                  ₹20
                </div>
              </div>

              <div className="relative z-10 space-y-4">
                <h3 className="text-5xl md:text-7xl font-heading font-black uppercase tracking-tighter text-espresso-brown">The Classic <span className="text-vibrant-red">Hot</span></h3>
                <p className="text-2xl font-bold opacity-80 leading-snug">
                  Strong, sweet, brewed for the daily grind. Served in our signature kulhad-style cups.
                </p>
              </div>
            </FadeIn>

            {/* Cold Coffee Card */}
            <FadeIn delay={0.2} direction="left" className="bg-bg-cream rounded-[3rem] border-8 border-espresso-brown p-8 md:p-12 shadow-[16px_16px_0_0_#4A3022] flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-saffron-yellow/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative z-10 flex justify-between items-start mb-12">
                <div className="bg-saffron-yellow text-espresso-brown p-4 rounded-2xl border-4 border-espresso-brown shadow-[4px_4px_0_0_#4A3022] rotate-[5deg]">
                  <Snowflake size={48} strokeWidth={2.5} />
                </div>
                <div className="bg-bg-cream text-espresso-brown px-6 py-2 rounded-full border-4 border-espresso-brown shadow-[4px_4px_0_0_#4A3022] font-black text-4xl rotate-[-5deg]">
                  ₹50
                </div>
              </div>

              <div className="relative z-10 space-y-4">
                <h3 className="text-5xl md:text-7xl font-heading font-black uppercase tracking-tighter text-espresso-brown">The Chilled <span className="text-saffron-yellow stroke-espresso-brown stroke-2" style={{ WebkitTextStroke: '2px #4A3022' }}>Out</span></h3>
                <p className="text-2xl font-bold opacity-80 leading-snug">
                  Ice cold, thick, Gen-Z approved poshtik energy. Made to beat the heat.
                </p>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* Section 3: The Adda Culture (Community) */}
      <section className="py-24 px-6 bg-espresso-brown text-bg-cream relative overflow-hidden">
        {/* Big Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.03]">
          <h2 className="text-[20rem] font-heading font-black leading-none uppercase">ADDA<br/>VIBES</h2>
        </div>

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <FadeIn direction="up" className="text-center">
            <h2 className="text-6xl md:text-8xl font-heading font-black tracking-tighter uppercase text-saffron-yellow mb-4">
              Your Local Adda.<br/><span className="text-bg-cream">Redefined.</span>
            </h2>
          </FadeIn>

          {/* Masonry/IG Reel Style Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((item, i) => (
              <FadeIn key={item} delay={i * 0.15} direction="up">
                <div className={`bg-white/10 rounded-3xl overflow-hidden relative border-4 border-transparent hover:border-saffron-yellow transition-colors ${i % 2 === 0 ? 'aspect-[9/16]' : 'aspect-square md:aspect-[9/16] mt-0 md:mt-12'}`}>
                  {/* Placeholder for real images */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent flex items-end p-4">
                    <div className="flex items-center gap-2">
                      <HeartHandshake size={20} className="text-saffron-yellow" />
                      <span className="font-bold text-sm uppercase">Jamia Nagar</span>
                    </div>
                  </div>
                  <img src={`/api/placeholder/400/${i % 2 === 0 ? '700' : '500'}`} alt="Community Adda" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: The Ecosystem Teaser */}
      <section className="py-32 px-6 bg-bg-cream relative z-10 border-t-[12px] border-espresso-brown">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-10">
            <FadeIn direction="right">
              <h2 className="text-6xl md:text-8xl font-heading font-black tracking-tighter uppercase leading-[0.9]">
                Scan.<br/>Earn.<br/><span className="text-vibrant-red">Drink.</span><br/>Repeat.
              </h2>
            </FadeIn>
            
            <FadeIn delay={0.2} direction="right">
              <p className="text-2xl font-bold opacity-80 leading-relaxed max-w-lg">
                How do we serve coffee this cheap? No cashiers. No complex menus. Just our app and your thirst.
              </p>
            </FadeIn>

            <FadeIn delay={0.4} direction="right">
              <ul className="space-y-6">
                {['Load wallet instantly via UPI', 'Earn points on every ₹20 spent', 'Skip the line, order from phone'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-xl font-bold">
                    <ShieldCheck size={28} className="text-vibrant-red flex-shrink-0" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>

          <FadeIn direction="left" className="relative flex justify-center">
            {/* Mock Mobile UI */}
            <div className="w-[320px] bg-espresso-brown rounded-[3rem] p-4 border-[12px] border-black shadow-[16px_16px_0_0_#FFB800] rotate-3 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-20" />
              <div className="bg-bg-cream h-[600px] rounded-[2rem] p-6 relative overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-8 pt-4">
                  <span className="font-heading font-black uppercase text-xl">Janu Bhai</span>
                  <div className="bg-saffron-yellow p-2 rounded-full"><QrCode size={20} strokeWidth={3} /></div>
                </div>
                
                <div className="bg-espresso-brown text-bg-cream p-6 rounded-3xl mb-6 shadow-xl relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 opacity-20"><Coffee size={100} /></div>
                  <p className="font-bold text-sm uppercase opacity-60 mb-2">Wallet Balance</p>
                  <p className="font-heading font-black text-5xl">₹240</p>
                </div>

                <div className="space-y-4 flex-grow">
                  <p className="font-bold uppercase text-sm tracking-widest">Recent Orders</p>
                  <div className="bg-white p-4 rounded-2xl flex justify-between items-center border-2 border-black/5 shadow-sm">
                    <div>
                      <p className="font-black">Classic Hot</p>
                      <p className="text-xs font-bold opacity-50 uppercase">Today, 9:00 AM</p>
                    </div>
                    <p className="font-black text-vibrant-red">-₹20</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl flex justify-between items-center border-2 border-black/5 shadow-sm">
                    <div>
                      <p className="font-black">Chilled Out</p>
                      <p className="text-xs font-bold opacity-50 uppercase">Yesterday</p>
                    </div>
                    <p className="font-black text-vibrant-red">-₹50</p>
                  </div>
                </div>

                <button className="w-full bg-saffron-yellow text-espresso-brown py-4 rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0_0_#4A3022] border-2 border-espresso-brown mt-4">
                  Add Money
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}

