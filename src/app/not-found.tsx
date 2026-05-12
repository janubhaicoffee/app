"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mascot } from '@/components/ui/motion/Mascot';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-espresso-900 flex flex-col items-center justify-center p-8 font-sans selection:bg-accent-red selection:text-white text-center relative overflow-hidden">
      {/* Grain overlay */}
      <div className="absolute inset-0 bg-[url('/grain.png')] opacity-20 mix-blend-overlay pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 max-w-lg"
      >
        <Mascot size={160} state="peek" />

        <h1 className="text-7xl md:text-9xl font-heading tracking-tighter uppercase text-accent-gold leading-none">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-heading tracking-tighter uppercase text-bg-cream leading-tight">
          Adda Not Found.
        </h2>

        <p className="text-bg-cream/50 font-bold uppercase tracking-widest text-sm max-w-sm leading-relaxed">
          Looks like you wandered into the wrong gully. Let's get you back to the coffee.
        </p>

        <MagneticButton intensity={0.3}>
          <Link href="/">
            <Button
              size="lg"
              className="bg-accent-gold text-espresso-900 hover:bg-white px-12 py-6 rounded-full font-bold uppercase tracking-widest shadow-[0_10px_40px_rgba(255,184,0,0.4)] transition-all flex items-center gap-3"
            >
              <ArrowLeft size={18} /> Back to the Adda
            </Button>
          </Link>
        </MagneticButton>
      </motion.div>
    </div>
  );
}
