"use client";

import React from 'react';
import { SEO } from './SEO';
import { ShieldCheck } from 'lucide-react';
import { FadeIn } from './motion/FadeIn';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export const LegalLayout = ({ title, lastUpdated, children }: LegalLayoutProps) => {
  return (
    <div className="bg-bg-cream text-espresso-brown min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <SEO title={`${title} | Janu Bhai Coffee`} description={`Read the ${title} for Janu Bhai Coffee.`} />
      
      {/* Abstract background element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-saffron-yellow/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <FadeIn direction="up">
          <div className="flex items-center gap-3 text-vibrant-red mb-6">
            <ShieldCheck size={24} strokeWidth={3} />
            <span className="font-bold uppercase tracking-widest text-sm">Legal & Policies Hub</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tighter uppercase mb-6 drop-shadow-[4px_4px_0_0_#FFB800]">
            {title}
          </h1>
          
          <div className="inline-block bg-white px-4 py-2 rounded-lg border-2 border-espresso-brown shadow-[4px_4px_0_0_#4A3022] font-bold text-sm uppercase tracking-widest mb-16">
            Last Updated: {lastUpdated}
          </div>
        </FadeIn>

        <FadeIn delay={0.2} direction="up">
          <article className="prose-legal bg-white/50 backdrop-blur-sm p-8 md:p-12 rounded-[2rem] border-4 border-espresso-brown shadow-[16px_16px_0_0_#4A3022]">
            {children}
          </article>
        </FadeIn>
      </div>
    </div>
  );
};
