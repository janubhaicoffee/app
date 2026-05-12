"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/ui/SEO';
import { Button } from '@/components/ui/Button';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';
import { useRouter } from 'next/navigation';

export default function MenuPublicPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent-red selection:text-white">
      <SEO 
        title="The Menu | Janu Bhai Coffee" 
        description="We do two things. We do them perfectly. Hot Coffee (₹20) and Cold Coffee (₹50)."
      />

      {/* Header Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-24 left-0 w-full z-20 text-center pointer-events-none px-4"
      >
        <h1 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-white mix-blend-difference drop-shadow-md">
          We do two things. We do them perfectly.
        </h1>
      </motion.div>

      {/* Split Screen Container */}
      <div className="flex-1 flex flex-col md:flex-row h-screen">
        
        {/* Left Side: THE HOT */}
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 bg-espresso-900 flex flex-col justify-center items-center p-8 md:p-20 relative overflow-hidden group"
        >
          {/* Grain and texture */}
          <div className="absolute inset-0 bg-[url('/grain.png')] opacity-20 mix-blend-overlay pointer-events-none" />
          
          <div className="relative z-10 text-center space-y-6 max-w-sm">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-8xl md:text-[10rem] font-heading tracking-tighter leading-none text-bg-cream drop-shadow-2xl">
                HOT.
              </h2>
            </motion.div>
            
            <div className="inline-block border border-bg-cream/20 rounded-full px-6 py-2 text-xl font-number font-bold text-bg-cream">
              ₹20
            </div>
            
            <p className="text-bg-cream/70 text-sm md:text-base leading-relaxed font-medium uppercase tracking-widest mt-8">
              Poshtik. Raw. Energizing. <br/>
              AAA Grade Chikkamagaluru beans, dry vacuum processed. <br/>
              The honest Indian adda experience.
            </p>
          </div>

          {/* Steam Effect */}
          <motion.div 
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-bg-cream/5 to-transparent pointer-events-none blur-3xl"
          />
        </motion.div>

        {/* Right Side: THE COLD */}
        <motion.div 
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 bg-accent-gold flex flex-col justify-center items-center p-8 md:p-20 relative overflow-hidden group"
        >
          {/* Grain and texture */}
          <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          
          <div className="relative z-10 text-center space-y-6 max-w-sm">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-8xl md:text-[10rem] font-heading tracking-tighter leading-none text-espresso-900 drop-shadow-xl">
                COLD.
              </h2>
            </motion.div>
            
            <div className="inline-block border border-espresso-900/20 rounded-full px-6 py-2 text-xl font-number font-bold text-espresso-900">
              ₹50
            </div>
            
            <p className="text-espresso-900/80 text-sm md:text-base leading-relaxed font-bold uppercase tracking-widest mt-8">
              Thick. Intense. Unapologetic. <br/>
              Gen-Z approved texture. No ice dilution. <br/>
              Pure caffeinated velocity.
            </p>
          </div>

          {/* Ice/Condensation Effect */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-soft-light pointer-events-none" />
        </motion.div>

      </div>

      {/* Interactive Floating CTA */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50"
      >
        <MagneticButton intensity={0.4}>
          <Button 
            size="lg" 
            onClick={() => router.push('/app')}
            className="bg-accent-gold text-espresso-900 hover:bg-white border-2 border-transparent hover:border-accent-gold px-12 py-8 text-xl rounded-full shadow-[0_10px_40px_rgba(255,184,0,0.4)] font-bold tracking-widest uppercase transition-all duration-300"
          >
            Order on the App
          </Button>
        </MagneticButton>
      </motion.div>

    </div>
  );
}
