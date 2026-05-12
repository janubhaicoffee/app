"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Mascot } from '@/components/ui/motion/Mascot';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';
import { Button } from '@/components/ui/Button';
import { MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { SEO } from '@/components/ui/SEO';

const MOCK_OUTLETS = [
  { id: '1', name: 'Ghafoor Nagar Hub', distance: '0.8 km' },
  { id: '2', name: 'Indiranagar Express', distance: '1.2 km' },
  { id: '3', name: 'Koramangala Block 5', distance: '2.1 km' },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export default function CultOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null);

  const next = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg-cream flex items-center justify-center overflow-hidden font-sans selection:bg-accent-red selection:text-white">
      <SEO title="Welcome to the Adda" description="Your Janu Bhai onboarding." />

      {/* Progress Dots */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === step ? 'w-8 bg-accent-red' : i < step ? 'w-2 bg-accent-gold' : 'w-2 bg-espresso-900/15'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {/* Step 1: The Vibe Check */}
        {step === 0 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <div className="max-w-lg w-full text-center space-y-12">
              <Mascot size={100} state="idle" className="mx-auto" />

              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-heading tracking-tighter uppercase text-espresso-900 leading-[0.9]">
                  Welcome to<br/>the <span className="text-accent-red">Adda</span>.
                </h1>
                <p className="text-espresso-900/50 font-bold uppercase tracking-widest text-sm">
                  What do we call you?
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name, bhai"
                  autoFocus
                  className="w-full bg-transparent border-b-4 border-espresso-900/20 focus:border-accent-gold text-center text-3xl md:text-5xl font-heading tracking-tight text-espresso-900 py-4 outline-none transition-colors placeholder:text-espresso-900/15"
                />
              </div>

              <MagneticButton intensity={0.3}>
                <Button
                  disabled={!name.trim()}
                  onClick={next}
                  size="lg"
                  className="bg-espresso-900 text-bg-cream hover:bg-accent-red px-16 py-8 rounded-full font-bold uppercase tracking-widest text-lg shadow-2xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight size={20} className="ml-3" />
                </Button>
              </MagneticButton>
            </div>
          </motion.div>
        )}

        {/* Step 2: The Allegiance */}
        {step === 1 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <div className="max-w-lg w-full text-center space-y-12">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-heading tracking-tighter uppercase text-espresso-900 leading-[0.9]">
                  Pick your<br/><span className="text-accent-gold">Home Base</span>.
                </h1>
                <p className="text-espresso-900/50 font-bold uppercase tracking-widest text-sm">
                  {name ? `${name}, w` : 'W'}here do you grab your Poshtik?
                </p>
              </div>

              <div className="space-y-4">
                {MOCK_OUTLETS.map((outlet) => (
                  <motion.button
                    key={outlet.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedOutlet(outlet.id)}
                    className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between transition-all duration-300 ${
                      selectedOutlet === outlet.id
                        ? 'bg-accent-gold border-accent-gold text-espresso-900 shadow-[0_10px_40px_rgba(255,184,0,0.3)] scale-[1.02]'
                        : 'bg-white border-espresso-900/10 text-espresso-900 hover:border-espresso-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <MapPin size={20} className={selectedOutlet === outlet.id ? 'text-espresso-900' : 'text-espresso-900/40'} />
                      <span className="font-bold text-lg uppercase tracking-wider">{outlet.name}</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-50">{outlet.distance}</span>
                  </motion.button>
                ))}
              </div>

              <MagneticButton intensity={0.3}>
                <Button
                  disabled={!selectedOutlet}
                  onClick={next}
                  size="lg"
                  className="bg-espresso-900 text-bg-cream hover:bg-accent-red px-16 py-8 rounded-full font-bold uppercase tracking-widest text-lg shadow-2xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Lock it in <ArrowRight size={20} className="ml-3" />
                </Button>
              </MagneticButton>
            </div>
          </motion.div>
        )}

        {/* Step 3: The Poshtik Pledge */}
        {step === 2 && (
          <motion.div
            key="step3"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <div className="max-w-lg w-full text-center space-y-10">
              <Mascot size={180} state="success" className="mx-auto" />

              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-heading tracking-tighter uppercase text-espresso-900 leading-[0.9]">
                  You're <span className="text-accent-red">In</span>.
                </h1>
                <p className="text-espresso-900/50 font-bold uppercase tracking-widest text-sm max-w-xs mx-auto">
                  {name ? `${name}, ` : ''}100 Janu Credits have been added to your wallet.
                </p>
              </div>

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center gap-3 bg-accent-gold text-espresso-900 px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(255,184,0,0.4)] font-black text-2xl font-number"
              >
                <Sparkles size={24} /> +100 Credits
              </motion.div>

              <MagneticButton intensity={0.3}>
                <Button
                  onClick={() => router.push('/app/home')}
                  size="lg"
                  className="bg-accent-red text-white hover:bg-espresso-900 px-16 py-8 rounded-full font-bold uppercase tracking-widest text-lg shadow-2xl transition-colors"
                >
                  Go Get Your First Coffee <ArrowRight size={20} className="ml-3" />
                </Button>
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
