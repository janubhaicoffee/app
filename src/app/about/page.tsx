"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SEO } from '@/components/ui/SEO';
import { Coffee, ShieldCheck, Heart, Leaf, FlaskConical, Award, ArrowRight } from 'lucide-react';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { Parallax } from '@/components/ui/motion/Parallax';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AboutPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <div className="bg-espresso-900 text-bg-cream min-h-screen overflow-hidden" ref={containerRef}>
      <SEO 
        title="The Janu Bhai Vision | Sheikh Arsalan Ullah Chishti"
        description="Learn about the journey of Janu Bhai Coffee, founded by Sheikh Arsalan Ullah Chishti. From selling instant coffee to revolutionizing the Indian coffee industry."
        keywords="Sheikh Arsalan Ullah Chishti, Janu Bhai Coffee founder, Indian coffee history, coffee vs tea science, sustainable coffee India"
      />

      <div className="grain-overlay" />

      {/* Cinematic Hero Section */}
      <section className="relative h-[100svh] flex flex-col justify-end pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Parallax speed={0.2} className="h-full">
            <img 
              src="/founder.png" 
              alt="Sheikh Arsalan Ullah Chishti" 
              className="w-full h-full object-cover object-top grayscale opacity-50 mix-blend-luminosity scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-900 via-espresso-900/60 to-transparent" />
          </Parallax>
        </div>
        
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 max-w-5xl mx-auto w-full text-center sm:text-left"
        >
          <FadeIn delay={0.2} direction="down">
            <p className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-espresso text-accent-gold text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-6 border-accent-gold/30">
              The Visionary Behind the OS
            </p>
          </FadeIn>
          <FadeIn delay={0.4} direction="up">
            <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-heading tracking-tighter uppercase leading-[0.85] text-white drop-shadow-2xl">
              Sheikh Arsalan<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red to-accent-gold italic">Ullah Chishti</span>
            </h1>
          </FadeIn>
        </motion.div>
      </section>

      {/* Origin Story (Documentary Style Scroll) */}
      <section className="relative z-20 py-32 px-6 bg-espresso-900">
        <div className="max-w-4xl mx-auto space-y-32">
          
          <FadeIn direction="up">
            <div className="space-y-8 pl-0 md:pl-24 border-l-0 md:border-l border-white/10 relative">
              <div className="hidden md:block absolute top-0 -left-3 w-6 h-6 rounded-full glass-espresso border border-accent-red flex items-center justify-center">
                <div className="w-2 h-2 bg-accent-red rounded-full" />
              </div>
              <p className="text-accent-red font-bold uppercase tracking-[0.4em] text-[10px]">November 2021</p>
              <h2 className="text-5xl font-heading tracking-tight text-white">The Spark</h2>
              <p className="text-xl md:text-2xl opacity-80 leading-relaxed text-bg-cream/90 font-medium">
                The Janu Bhai story began with a simple mission: to bring a better cup of coffee to the streets of India. Back then, it was just me and a few packs of instant coffee, selling to a single local shop.
              </p>
            </div>
          </FadeIn>

          <FadeIn direction="up">
            <div className="space-y-8 pl-0 md:pl-24 border-l-0 md:border-l border-white/10 relative">
              <div className="hidden md:block absolute top-0 -left-3 w-6 h-6 rounded-full glass-espresso border border-accent-gold flex items-center justify-center">
                <div className="w-2 h-2 bg-accent-gold rounded-full" />
              </div>
              <p className="text-accent-gold font-bold uppercase tracking-[0.4em] text-[10px]">The Evolution</p>
              <h2 className="text-5xl font-heading tracking-tight text-white">From Shop to Network</h2>
              <p className="text-xl md:text-2xl opacity-80 leading-relaxed text-bg-cream/90 font-medium">
                That one shop soon became multiple. Then came the khokas, the hotels, and eventually the resorts. What started as a small trade evolved into a deep understanding of the systemic issues within the Indian coffee industry. I saw firsthand how the average coffee farmer was being exploited.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* The Philosophy Grid */}
      <section className="py-32 px-6 bg-espresso-800 border-y border-white/5 shadow-2xl relative">
        <div className="absolute inset-0 bg-[url('/farm.png')] opacity-5 bg-cover bg-fixed mix-blend-overlay" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <FadeIn direction="right" className="p-10 md:p-16 glass-espresso rounded-[3rem] space-y-8 border-white/10 hover:-translate-y-2 transition-transform duration-500 group">
            <div className="w-16 h-16 bg-accent-red/10 text-accent-red rounded-2xl flex items-center justify-center group-hover:bg-accent-red group-hover:text-white transition-colors duration-500">
              <Award size={32} />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-heading tracking-tight text-white uppercase">The Stolen Harvest</h3>
              <p className="text-lg opacity-70 leading-relaxed font-medium">
                India produces some of the most expensive and most traded raw coffee in the world. Yet, multinational organizations exploit our farmers, taking away the best AAA grade export quality beans for a dirt cheap price. We are here to reclaim that harvest.
              </p>
            </div>
          </FadeIn>
          
          <FadeIn direction="left" delay={0.2} className="p-10 md:p-16 bg-gradient-to-br from-accent-brown to-espresso-900 text-bg-cream rounded-[3rem] space-y-8 shadow-2xl border border-white/10 hover:-translate-y-2 transition-transform duration-500 group">
            <div className="w-16 h-16 bg-white/10 text-accent-gold rounded-2xl flex items-center justify-center group-hover:bg-accent-gold group-hover:text-espresso-900 transition-colors duration-500">
              <Leaf size={32} />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-heading tracking-tight text-accent-gold uppercase">A Cultural Shift</h3>
              <p className="text-lg opacity-80 leading-relaxed font-medium">
                Coffee culture was deeply rooted in the Indian sub-continent long before it was elsewhere. We consumed coffee culturally for centuries. However, during the British era, a forced systemic shift moved the entire nation toward tea consumption. We are bringing the original culture back.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Scientific Comparison (Coffee vs Tea) */}
      <section className="py-40 px-6 bg-bg-cream text-espresso-900 rounded-t-[4rem] relative z-20 -mt-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto space-y-24">
          <FadeIn direction="up" className="text-center space-y-6">
            <div className="w-20 h-20 bg-espresso-900/5 rounded-full flex items-center justify-center mx-auto text-accent-red mb-8">
              <FlaskConical size={40} />
            </div>
            <p className="text-accent-red font-bold uppercase tracking-[0.4em] text-[10px]">The Science of Consumption</p>
            <h2 className="text-5xl md:text-7xl font-heading tracking-tight uppercase">Pure Coffee vs.<br/><span className="italic text-accent-brown">Commercial Tea</span></h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            <FadeIn direction="right" className="space-y-8">
              <div className="flex items-center gap-4 border-b border-black/10 pb-6">
                <div className="p-4 bg-accent-brown text-white rounded-2xl">
                  <Coffee size={28} />
                </div>
                <h4 className="text-3xl font-heading uppercase">Pure Coffee</h4>
              </div>
              <div className="space-y-6 text-lg opacity-80 leading-relaxed font-medium">
                <p>
                  High-quality, pure coffee is a powerhouse of antioxidants and bioactive compounds. In the short term, it provides a cognitive boost and increases metabolic rate.
                </p>
                <p>
                  Long term studies indicate that regular consumption of pure coffee can support cardiovascular health and reduce the risk of neurodegenerative diseases. Our chemical-free roasting ensures these benefits remain intact.
                </p>
              </div>
            </FadeIn>
            
            <FadeIn direction="left" delay={0.2} className="space-y-8">
              <div className="flex items-center gap-4 border-b border-black/10 pb-6">
                <div className="p-4 bg-accent-red/10 text-accent-red rounded-2xl">
                  <Leaf size={28} />
                </div>
                <h4 className="text-3xl font-heading uppercase">Commercial Tea</h4>
              </div>
              <div className="space-y-6 text-lg opacity-80 leading-relaxed font-medium">
                <p>
                  Much of the tea available in India across mass brands consists of lower grade dust or CTC (Crush, Tear, Curl) leaves. These often lack the complex nutrient profile of whole leaf tea.
                </p>
                <p>
                  Short term side effects of low-quality tea can include increased acidity and tannin-induced digestive issues. Long term, the lack of quality control in mass-processed tea can lead to heavy metal exposure and reduced nutrient absorption.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 text-center px-6 bg-espresso-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/roast.png')] opacity-10 mix-blend-overlay bg-cover bg-center" />
        
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <FadeIn direction="up">
            <Heart size={48} className="mx-auto text-accent-red animate-pulse mb-12" />
            <h2 className="text-5xl md:text-7xl font-heading tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
              Coffee is more than a drink, <br /> it is a <span className="text-accent-red italic">reclamation</span>.
            </h2>
          </FadeIn>
          
          <FadeIn delay={0.2} direction="up">
            <p className="text-2xl md:text-3xl opacity-80 italic font-medium max-w-2xl mx-auto text-bg-cream/90">
              "We are not just selling coffee. We are restoring a legacy."
            </p>
          </FadeIn>

          <FadeIn delay={0.4} direction="up" className="pt-12">
            <Link href="/franchise">
              <MagneticButton intensity={0.3}>
                <Button size="lg" className="bg-white text-espresso-900 px-10 h-16 rounded-full text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] group">
                  Join The Movement
                  <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </MagneticButton>
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
