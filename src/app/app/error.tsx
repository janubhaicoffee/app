"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mascot } from '@/components/ui/motion/Mascot';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';
import { Button } from '@/components/ui/Button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Janu Bhai OS Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center p-8 font-sans selection:bg-accent-red selection:text-white text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10 mix-blend-overlay pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 max-w-lg"
      >
        <div className="relative">
          <Mascot size={140} state="loading" />
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-accent-red rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(226,55,68,0.5)]">
            <AlertTriangle size={18} />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-heading tracking-tighter uppercase text-accent-red leading-none">
          System Overload.
        </h1>

        <p className="text-espresso-900/50 font-bold uppercase tracking-widest text-sm max-w-sm leading-relaxed">
          The kitchen is temporarily jammed. Our engineers are on it. Give us a moment.
        </p>

        <MagneticButton intensity={0.3}>
          <Button
            onClick={reset}
            size="lg"
            className="bg-accent-red text-white hover:bg-espresso-900 px-12 py-6 rounded-full font-bold uppercase tracking-widest shadow-[0_10px_40px_rgba(226,55,68,0.4)] transition-all flex items-center gap-3"
          >
            <RefreshCw size={18} /> Try Again
          </Button>
        </MagneticButton>
      </motion.div>
    </div>
  );
}
