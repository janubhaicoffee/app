"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Zap, 
  Smartphone,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SEO } from '@/components/ui/SEO';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { Mascot } from '@/components/ui/motion/Mascot';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';
import { AnimatePresence, motion } from 'framer-motion';

export default function FranchisePublicPage() {
  const router = useRouter();
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    
    // Simulate network request
    setTimeout(() => {
      setFormStatus('success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-bg-cream text-espresso-900 selection:bg-accent-red selection:text-white overflow-hidden font-sans">
      <SEO 
        title="Start Your Coffee Empire | Janu Bhai Franchise" 
        description="A decentralized, high-yield micro-footprint model. Own the next wave of Indian coffee."
      />

      <div className="grain-overlay opacity-50" />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col justify-center px-6 bg-accent-red text-white border-b-8 border-espresso-900">
        <div className="absolute inset-0 bg-[url('/grain.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8 pt-20">
          <FadeIn direction="up">
            <h1 className="text-6xl md:text-[8rem] font-heading tracking-tighter leading-[0.85] uppercase drop-shadow-2xl">
              OWN THE NEXT WAVE <br/> OF INDIAN COFFEE.
            </h1>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <p className="text-xl md:text-3xl font-bold uppercase tracking-widest opacity-90 max-w-4xl mx-auto leading-relaxed border-2 border-white/20 p-6 rounded-2xl bg-white/5 backdrop-blur-sm">
              A decentralized, high-yield micro-footprint model.
            </p>
          </FadeIn>

          <FadeIn delay={0.4} direction="up" className="pt-8">
            <MagneticButton intensity={0.2}>
              <Button 
                size="lg" 
                onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-accent-gold text-espresso-900 hover:bg-white text-xl px-12 py-8 rounded-full shadow-[0_0_40px_rgba(255,184,0,0.4)] font-bold uppercase tracking-widest transition-all"
              >
                Apply Now <ArrowRight className="ml-2" />
              </Button>
            </MagneticButton>
          </FadeIn>
        </div>
      </section>

      {/* The Blueprint Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <FadeIn direction="up" className="text-center space-y-4">
            <h2 className="text-accent-red font-bold uppercase tracking-[0.4em] text-xs">The Economics</h2>
            <h3 className="text-5xl md:text-7xl font-heading tracking-tight uppercase text-espresso-900">
              The Micro-Footprint <span className="text-accent-gold drop-shadow-sm">Blueprint</span>
            </h3>
            <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto text-espresso-900/70">
              No bloated kitchens. No excess inventory. We stripped the cafe model down to its most profitable core components.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn delay={0.1} direction="up">
              <Card className="h-full bg-white border-2 border-espresso-900/10 p-8 flex flex-col items-center text-center space-y-6 hover:-translate-y-2 transition-transform shadow-xl">
                <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center text-espresso-900 shadow-inner">
                  <Building2 size={32} />
                </div>
                <h4 className="text-2xl font-bold uppercase tracking-widest text-espresso-900">Low Rent</h4>
                <p className="text-espresso-900/70 font-medium">
                  We don't need 1000 sq ft. We target ultra-high footfall micro-locations requiring only ₹15k - ₹30k/mo in rent.
                </p>
              </Card>
            </FadeIn>

            <FadeIn delay={0.2} direction="up">
              <Card className="h-full bg-espresso-900 text-bg-cream border-none p-8 flex flex-col items-center text-center space-y-6 hover:-translate-y-2 transition-transform shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-red/20 rounded-full blur-[50px] pointer-events-none" />
                <div className="w-20 h-20 bg-accent-red rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(226,55,68,0.4)] z-10">
                  <Zap size={32} />
                </div>
                <h4 className="text-2xl font-bold uppercase tracking-widest z-10">High Turnover</h4>
                <p className="text-bg-cream/70 font-medium z-10">
                  2 Items = Zero kitchen bloat. Our POS processes walk-ins in seconds, maximizing output during peak hours.
                </p>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3} direction="up">
              <Card className="h-full bg-white border-2 border-espresso-900/10 p-8 flex flex-col items-center text-center space-y-6 hover:-translate-y-2 transition-transform shadow-xl">
                <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center text-espresso-900 shadow-inner">
                  <Smartphone size={32} />
                </div>
                <h4 className="text-2xl font-bold uppercase tracking-widest text-espresso-900">App-Integrated</h4>
                <p className="text-espresso-900/70 font-medium">
                  Walk-in, Swiggy, and Zomato orders are routed directly into the Janu Bhai OS Kitchen Terminal automatically.
                </p>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-32 px-6 bg-espresso-900 text-bg-cream relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        <div className="max-w-xl mx-auto relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <div className="text-center space-y-4 mb-10">
            <h3 className="text-4xl font-heading tracking-tight uppercase">Join the Protocol</h3>
            <p className="text-sm font-bold uppercase tracking-widest text-accent-gold">Initiate Franchise Application</p>
          </div>

          <AnimatePresence mode="wait">
            {formStatus === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-6 py-12"
              >
                <Mascot size={150} state="success" />
                <h4 className="text-2xl font-bold uppercase tracking-widest text-accent-gold mt-8">Application Received!</h4>
                <p className="font-medium opacity-80">Our expansion node team will contact you within 24 hours to discuss the blueprint.</p>
                <Button 
                  onClick={() => setFormStatus('idle')}
                  variant="outline"
                  className="mt-4 border-white/20 text-white hover:bg-white hover:text-espresso-900 rounded-full px-8 uppercase font-bold tracking-widest"
                >
                  Submit Another
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-4">Full Name</label>
                  <input required type="text" placeholder="e.g. Rahul Sharma" className="w-full bg-black/20 border border-white/10 rounded-full py-4 px-6 text-white focus:outline-none focus:border-accent-gold transition-colors font-medium placeholder:text-white/20" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-4">Phone Number</label>
                  <input required type="tel" placeholder="+91" className="w-full bg-black/20 border border-white/10 rounded-full py-4 px-6 text-white focus:outline-none focus:border-accent-gold transition-colors font-medium placeholder:text-white/20" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-4">Target City</label>
                  <input required type="text" placeholder="e.g. Bangalore" className="w-full bg-black/20 border border-white/10 rounded-full py-4 px-6 text-white focus:outline-none focus:border-accent-gold transition-colors font-medium placeholder:text-white/20" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-4">Investment Budget</label>
                  <select required className="w-full bg-black/20 border border-white/10 rounded-full py-4 px-6 text-white focus:outline-none focus:border-accent-gold transition-colors font-medium appearance-none cursor-pointer">
                    <option value="" disabled selected className="text-espresso-900">Select Range</option>
                    <option value="5-10" className="text-espresso-900">₹5L - ₹10L</option>
                    <option value="10-20" className="text-espresso-900">₹10L - ₹20L</option>
                    <option value="20+" className="text-espresso-900">₹20L+</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  disabled={formStatus === 'loading'}
                  className="w-full py-6 mt-4 bg-accent-red text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-accent-red/90 hover:shadow-[0_0_30px_rgba(226,55,68,0.4)] transition-all flex items-center justify-center gap-4"
                >
                  {formStatus === 'loading' ? (
                    <>
                      <Mascot size={30} state="loading" />
                      Syncing...
                    </>
                  ) : (
                    "Submit to Network"
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

    </div>
  );
}
