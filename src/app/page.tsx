"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Coffee, ShieldCheck, Thermometer, Wind, Zap, ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import { SEO } from '@/components/ui/SEO';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.05], [1, 0.95]);

  return (
    <div className="bg-bg-cream overflow-x-hidden">
      <SEO 
        title="Janu Bhai Coffee | AAA Grade Chikkamagaluru Single Origin"
        description="Experience the science of freshness. Sourced from Chikkamagaluru, processed without chemicals, and preserved via advanced dry vacuum technology."
        keywords="Chikkamagaluru coffee, AAA grade beans, dry vacuum coffee, chemical free coffee, fresh roasted coffee India"
        schema={{
          "@context": "https://schema.org",
          "@type": "FoodEstablishment",
          "name": "Janu Bhai Coffee",
          "image": "https://janubhai.com/farm.png",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Ghaffar Manzil, Jamia Nagar",
            "addressLocality": "Delhi",
            "postalCode": "110025",
            "addressCountry": "IN"
          },
          "url": "https://janubhai.com",
          "servesCuisine": "Coffee",
          "priceRange": "$$"
        }}
      />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ opacity, scale }} className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-red/10 border border-accent-red/20 text-accent-red text-[10px] font-bold uppercase tracking-[0.3em] mb-8"
          >
            <Zap size={14} />
            Direct from Chikkamagaluru
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-heading tracking-tighter leading-[0.9] mb-8 uppercase"
          >
            Roz Ki <span className="text-accent-red">Strong</span><br />Kahaani
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl font-medium opacity-60 mb-12 max-w-2xl mx-auto"
          >
            Experience the journey of AAA-grade beans, preserved through science, and delivered with heart.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login">
              <Button size="lg" className="px-12 group">
                Enter the OS
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="https://maps.app.goo.gl/yP6L8y2TYHkexmVj6" target="_blank">
              <Button variant="outline" size="lg" className="px-12">
                Visit Outlet
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Cinematic Background Video/Image Placeholder */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-bg-cream/20 via-transparent to-bg-cream z-10" />
          <img 
            src="/farm.png" 
            alt="Chikkamagaluru Farm" 
            className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-1000 scale-110"
          />
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-px h-20 bg-gradient-to-b from-accent-brown/20 to-transparent" />
        </div>
      </section>

      {/* The Origin Section */}
      <section id="story" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <p className="text-accent-red font-bold uppercase tracking-[0.4em] text-[10px]">Step 01: The Source</p>
              <h2 className="text-5xl font-heading tracking-tight">Private Farms of <span className="italic">Chikkamagaluru</span></h2>
            </div>
            <p className="text-xl leading-relaxed opacity-70">
              Our journey begins in the mist-covered hills of Chikkamagaluru, where we partner with elite private estates. We don't just buy coffee; we select the top 1% of the harvest.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-6 bg-white rounded-3xl border border-black/5 space-y-3">
                <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="font-bold uppercase tracking-widest text-xs">AAA Grade Only</h4>
                <p className="text-sm opacity-50">Strict export-quality sorting. Only the densest, most flavorful beans make the cut.</p>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-black/5 space-y-3">
                <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                  <MapPin size={20} />
                </div>
                <h4 className="font-bold uppercase tracking-widest text-xs">Single Estate</h4>
                <p className="text-sm opacity-50">Traceable to the specific patch of land. No mixing, no compromises on purity.</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-accent-brown/10 rounded-[4rem] rotate-3 group-hover:rotate-0 transition-transform duration-500" />
            <img 
              src="/storage.png" 
              alt="Raw Bean Storage" 
              className="relative z-10 rounded-[3rem] shadow-2xl w-full aspect-[4/5] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* The Science Section - Interactive Infographic */}
      <section className="py-32 bg-accent-brown text-bg-cream px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <p className="text-accent-gold font-bold uppercase tracking-[0.4em] text-[10px]">The Science of Freshness</p>
            <h2 className="text-5xl md:text-7xl font-heading tracking-tight">How we <span className="text-accent-gold">Preserve</span> Time</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-px bg-white/10 z-0" />
            
            {[
              {
                icon: <Thermometer />,
                title: "Precision Roast",
                desc: "Small-batch roasting without any chemical additives or enhancers. Pure heat, pure flavor.",
                img: "/roast.png"
              },
              {
                icon: <Wind />,
                title: "Dry Vacuum Seal",
                desc: "Innovative extraction of oxygen. Preserves the natural aromatic oils, color, and volatile flavor compounds.",
                img: "/vacuum.png"
              },
              {
                icon: <CheckCircle2 />,
                title: "Airtight Raw Form",
                desc: "Beans stay in raw, airtight storage until the moment of roasting. Freshness isn't a promise, it's physics.",
                img: "/storage.png"
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 space-y-8 group"
              >
                <div className="aspect-square rounded-full overflow-hidden border-4 border-white/5 relative">
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-accent-brown/40 group-hover:bg-transparent transition-colors" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    {step.icon}
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold uppercase tracking-tighter">{step.title}</h3>
                  <p className="text-sm opacity-60 leading-relaxed max-w-[280px] mx-auto">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Freshness Cycle Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-bg-cream rounded-[4rem] p-12 md:p-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
              <img src="/vacuum.png" alt="Fresh Pack" className="w-full h-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-bg-cream" />
            </div>
            
            <div className="relative z-10 max-w-2xl space-y-8">
              <p className="text-accent-red font-bold uppercase tracking-[0.4em] text-[10px]">The Monthly Fresh Cycle</p>
              <h2 className="text-5xl font-heading tracking-tight leading-[0.9]">Never Older Than <span className="italic">30 Days</span></h2>
              <p className="text-xl opacity-70 leading-relaxed">
                Large harvests are never processed all at once. We store our beans in their raw form in airtight silos, processing only what we need for the current month. Every batch you receive was roasted, packed, and shipped within a 30-day window.
              </p>
              
              <ul className="space-y-4 pt-4">
                {[
                  "Dry Vacuum for extended shelf life without chemicals",
                  "Natural smell, color, and taste preserved via physics",
                  "Sent to outlets fresh every single month",
                  "Small batch roasting for maximum quality control"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest opacity-60">
                    <div className="w-2 h-2 bg-accent-red rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="pt-8">
                <Link href="https://maps.app.goo.gl/yP6L8y2TYHkexmVj6" target="_blank">
                  <Button size="lg" className="bg-accent-brown text-white group">
                    Find Nearest Outlet
                    <MapPin size={18} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 text-center px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <h2 className="text-6xl md:text-8xl font-heading tracking-tighter uppercase leading-[0.8]">Join the <span className="text-accent-red italic">Brotherhood</span></h2>
          <p className="text-xl opacity-60">Whether you're a coffee lover or a potential franchise partner, the Janu Bhai OS is ready for you.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" fullWidth className="px-12 py-8 text-xl">Sign In to Dashboard</Button>
            </Link>
            <Link href="/franchise" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" fullWidth className="px-12 py-8 text-xl border-accent-brown text-accent-brown">Partner With Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
