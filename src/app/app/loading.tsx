"use client";

import React, { useState, useEffect } from 'react';
import { Mascot } from '@/components/ui/motion/Mascot';
import { motion, AnimatePresence } from 'framer-motion';

const loadingTexts = [
  "Authenticating Operator...",
  "Syncing with Zomato...",
  "Fetching Realtime Orders...",
  "Initializing Janu Bhai OS...",
];

export default function AppLoading() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-espresso-900 selection:bg-accent-red selection:text-white overflow-hidden">
      <Mascot size={150} state="loading" className="mb-8" />
      
      <div className="h-8 relative w-full flex justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={textIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute text-bg-cream font-bold tracking-widest uppercase text-xs sm:text-sm"
          >
            {loadingTexts[textIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
      
      <div className="mt-8 w-48 h-1 bg-bg-cream/10 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-accent-red"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
