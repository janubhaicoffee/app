"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SEO } from '@/components/ui/SEO';
import { Leaf, Droplets, Wind, Thermometer, ArrowDown, MapPin, CheckCircle2 } from 'lucide-react';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { Parallax } from '@/components/ui/motion/Parallax';

export default function SourcePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);

  return (
    <div className="bg-espresso-900 text-bg-cream min-h-screen overflow-hidden" ref={containerRef}>
      <SEO 
        title="Our Source | Chikkamagaluru Coffee | Janu Bhai"
        description="Discover the origin of Janu Bhai Coffee. Straight from the high altitudes of Chikkamagaluru. Processed without chemicals and sealed with dry vacuum technology."
        keywords="Chikkamagaluru coffee, single origin coffee india, dry vacuum coffee processing, sustainable coffee farming"
      />

      <div className="grain-overlay" />

      {/* Hero Section */}
      <section className="relative h-[100svh] flex flex-col justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Parallax speed={0.3} className="h-full">
            <img 
              src="/farm.png" 
              alt="Chikkamagaluru Coffee Farm" 
              className="w-full h-full object-cover scale-110 opacity-30 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-900 via-espresso-900/40 to-transparent" />
          </Parallax>
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} 
          className="relative z-10 max-w-5xl mx-auto w-full text-center"
        >
          <FadeIn delay={0.2} direction="down">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-espresso text-accent-green text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-6 border-accent-green/30">
              <MapPin size={14} className="animate-pulse" />
              Latitude 13°19' N, Longitude 75°46' E
            </div>
          </FadeIn>
          
          <FadeIn delay={0.4} direction="up">
            <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-heading tracking-tighter uppercase leading-[0.85] text-white drop-shadow-2xl">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-gold italic">Source</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.6} direction="up">
            <p className="text-xl md:text-3xl font-medium opacity-80 max-w-3xl mx-auto leading-relaxed text-bg-cream/90 mt-8">
              No middle-men. No compromises. We trace every bean back to the exact patch of soil in Chikkamagaluru.
            </p>
          </FadeIn>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <ArrowDown size={32} className="text-white/30" />
        </div>
      </section>

      {/* Environmental Movement Section */}
      <section className="py-32 px-6 bg-espresso-800 relative z-10 border-y border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="right" className="relative group rounded-[3rem] overflow-hidden shadow-2xl h-[600px]">
            <Parallax speed={0.1}>
              <img 
                src="/farm.png" 
                alt="Environmental Conservation" 
                className="w-full h-[120%] object-cover scale-110 opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-1000"
              />
            </Parallax>
            <div className="absolute inset-0 border-4 border-accent-green/20 rounded-[3rem] pointer-events-none" />
          </FadeIn>

          <div className="space-y-12">
            <FadeIn direction="left">
              <h2 className="text-accent-green font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Environmental Movement</h2>
              <h3 className="text-5xl font-heading tracking-tight leading-[1.1] text-white">
                Regenerative <span className="italic">Agriculture</span>
              </h3>
            </FadeIn>
            
            <FadeIn delay={0.2} direction="left">
              <p className="text-xl leading-relaxed opacity-80 text-bg-cream">
                We believe that the best coffee doesn't hurt the planet. Our partner farms in Chikkamagaluru strictly adhere to regenerative farming practices. This means no synthetic fertilizers, deep shade-grown canopies, and water-conserving processing methods.
              </p>
            </FadeIn>

            <ul className="space-y-6">
              {[
                { icon: <Leaf className="text-accent-green" />, title: "Shade Grown Canopies", desc: "Maintains local bird populations and soil moisture." },
                { icon: <Droplets className="text-accent-gold" />, title: "Water Recycling", desc: "Advanced filtration systems to reuse washing water." },
                { icon: <CheckCircle2 className="text-accent-red" />, title: "Zero Synthetic Chemicals", desc: "100% natural composting and pest management." }
              ].map((item, i) => (
                <FadeIn key={i} delay={0.3 + (i * 0.1)} direction="left" className="flex gap-6">
                  <div className="w-16 h-16 shrink-0 glass-espresso rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold uppercase tracking-widest text-white">{item.title}</h4>
                    <p className="text-sm opacity-60 leading-relaxed font-medium mt-1">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Processing Flow Visualization */}
      <section className="py-40 px-6 bg-bg-cream text-espresso-900 rounded-t-[4rem] relative z-20 -mt-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto space-y-24">
          <FadeIn direction="up" className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-espresso-900/5 text-accent-red text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em]">
              Process Architecture
            </div>
            <h2 className="text-5xl md:text-7xl font-heading tracking-tight uppercase">
              The Physics of <span className="italic text-accent-red">Freshness</span>
            </h2>
            <p className="text-xl opacity-80 font-medium max-w-3xl mx-auto">
              We don't use preservatives. We use physics. Follow the journey of a bean from harvest to extraction.
            </p>
          </FadeIn>

          <div className="relative">
            {/* Animated Flow Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-espresso-900/10 -translate-y-1/2 hidden lg:block overflow-hidden rounded-full">
              <motion.div 
                className="h-full bg-accent-red w-full origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 relative z-10">
              {[
                { 
                  icon: <Leaf />, title: "01. Selective Picking", color: "text-accent-green", bg: "bg-accent-green/10",
                  desc: "Only the deepest red cherries are hand-picked. AAA Grade sorting happens immediately on-site." 
                },
                { 
                  icon: <Thermometer />, title: "02. Profile Roasting", color: "text-accent-red", bg: "bg-accent-red/10",
                  desc: "Small-batch roasting without chemical additives. Precision heat applied to unlock complex aromatics." 
                },
                { 
                  icon: <Wind />, title: "03. Dry Vacuum Seal", color: "text-accent-gold", bg: "bg-accent-gold/10",
                  desc: "Oxygen is completely extracted. Beans are sealed in a vacuum to pause the aging process." 
                },
                { 
                  icon: <Droplets />, title: "04. Precision Extraction", color: "text-espresso-900", bg: "bg-espresso-900/10",
                  desc: "Ground right before brewing at our outlets. High-pressure extraction for the perfect crema." 
                }
              ].map((step, i) => (
                <FadeIn key={i} delay={i * 0.3} direction="up" className="relative group">
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-black/5 h-full flex flex-col items-center text-center hover:-translate-y-4 transition-transform duration-500">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-8 ${step.bg} ${step.color} group-hover:scale-110 transition-transform duration-500`}>
                      {React.cloneElement(step.icon, { size: 32 })}
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-widest mb-4">{step.title}</h3>
                    <p className="text-sm opacity-70 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
