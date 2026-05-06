"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/ui/SEO';
import { Coffee, ShieldCheck, Heart, Leaf, FlaskConical, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-bg-cream min-h-screen pb-32">
      <SEO 
        title="About Our Founder | Sheikh Arsalan Ullah Chishti"
        description="Learn about the journey of Janu Bhai Coffee, founded by Sheikh Arsalan Ullah Chishti. From selling instant coffee to revolutionizing the Indian coffee industry."
        keywords="Sheikh Arsalan Ullah Chishti, Janu Bhai Coffee founder, Indian coffee history, coffee vs tea science, sustainable coffee India"
      />

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/founder.png" 
            alt="Sheikh Arsalan Ullah Chishti" 
            className="w-full h-full object-cover object-center grayscale opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-cream/20 to-bg-cream" />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-accent-red font-bold uppercase tracking-[0.4em] text-[10px] mb-4"
          >
            The Visionary Behind the OS
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-8xl font-heading tracking-tighter uppercase"
          >
            Sheikh Arsalan <br />Ullah <span className="text-accent-red italic">Chishti</span>
          </motion.h1>
        </div>
      </section>

      {/* Origin Story */}
      <section className="max-w-4xl mx-auto px-6 py-24 space-y-16">
        <div className="space-y-8">
          <h2 className="text-4xl font-heading tracking-tight">From One Shop to a Movement</h2>
          <div className="opacity-80 leading-relaxed space-y-6 text-lg">
            <p>
              The Janu Bhai story began in November 2021. I started as a coffee enthusiast with a simple mission: to bring a better cup of coffee to the streets of India. Back then, it was just me and a few packs of instant coffee, selling to a single local shop.
            </p>
            <p>
              That one shop soon became multiple. Then came the khokas, the hotels, and eventually the resorts. What started as a small trade evolved into a deep understanding of the systemic issues within the Indian coffee industry. I saw firsthand how the average coffee farmer was being exploited.
            </p>
          </div>
        </div>

        {/* The Philosophy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-10 bg-white rounded-[3rem] border border-black/5 space-y-6 shadow-sm">
            <div className="w-12 h-12 bg-accent-red/5 text-accent-red rounded-2xl flex items-center justify-center">
              <Award size={24} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">The Stolen Harvest</h3>
            <p className="text-sm opacity-60 leading-relaxed">
              India produces some of the most expensive and most traded raw coffee in the world. Yet, multinational organizations exploit our farmers, taking away the best AAA grade export quality beans for a dirt cheap price. We are here to reclaim that harvest.
            </p>
          </div>
          <div className="p-10 bg-accent-brown text-bg-cream rounded-[3rem] space-y-6 shadow-xl">
            <div className="w-12 h-12 bg-white/10 text-accent-gold rounded-2xl flex items-center justify-center">
              <Leaf size={24} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-accent-gold">A Cultural Shift</h3>
            <p className="text-sm opacity-60 leading-relaxed">
              Coffee culture was deeply rooted in the Indian sub-continent long before it was elsewhere. We consumed coffee culturally for centuries. However, during the British era, a forced systemic shift moved the entire nation toward tea consumption. We are bringing the original culture back.
            </p>
          </div>
        </div>

        {/* Scientific Comparison */}
        <div className="space-y-12 py-12">
          <div className="text-center space-y-4">
            <FlaskConical size={32} className="mx-auto text-accent-red" />
            <h2 className="text-4xl font-heading tracking-tight">The Science of Consumption</h2>
            <p className="text-sm opacity-50 font-bold uppercase tracking-widest">Pure Coffee vs. Commercial Tea</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-xl font-bold flex items-center gap-2">
                <Coffee size={20} className="text-accent-brown" />
                Pure Coffee Purity
              </h4>
              <div className="space-y-4 text-sm opacity-70 leading-relaxed">
                <p>
                  High-quality, pure coffee is a powerhouse of antioxidants and bioactive compounds. In the short term, it provides a cognitive boost and increases metabolic rate.
                </p>
                <p>
                  Long term studies indicate that regular consumption of pure coffee can support cardiovascular health and reduce the risk of neurodegenerative diseases. Our chemical-free roasting ensures these benefits remain intact.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-xl font-bold flex items-center gap-2">
                <Leaf size={20} className="text-accent-red" />
                The Commercial Tea Reality
              </h4>
              <div className="space-y-4 text-sm opacity-70 leading-relaxed">
                <p>
                  Much of the tea available in India across mass brands consists of lower grade dust or CTC (Crush, Tear, Curl) leaves. These often lack the complex nutrient profile of whole leaf tea.
                </p>
                <p>
                  Short term side effects of low-quality tea can include increased acidity and tannin-induced digestive issues. Long term, the lack of quality control in mass-processed tea can lead to heavy metal exposure and reduced nutrient absorption.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="pt-24 text-center space-y-8">
          <Heart size={48} className="mx-auto text-accent-red animate-pulse" />
          <h2 className="text-5xl font-heading tracking-tight uppercase max-w-2xl mx-auto">
            Coffee is more than a drink, <br /> it is a <span className="text-accent-red italic">reclamation</span>.
          </h2>
          <p className="text-xl opacity-60 italic font-medium">
            "We are not just selling coffee. We are restoring a legacy."
          </p>
          <div className="pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.5em] opacity-30">Sheikh Arsalan Ullah Chishti</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-20 mt-2">Founder & Coffee Enthusiast</p>
          </div>
        </div>
      </section>
    </div>
  );
}
