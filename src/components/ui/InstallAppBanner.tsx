"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallAppBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Basic check to see if we are not running in standalone mode (i.e. running in a normal browser tab)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Check if user already dismissed it this session
    const isDismissed = sessionStorage.getItem('janu_install_dismissed');

    if (isMobile && !isStandalone && !isDismissed) {
      // Delay slightly for dramatic effect and so it doesn't instantly block UI
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('janu_install_dismissed', 'true');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-accent-yellow border-b-4 border-accent-brown shadow-[0_4px_0_0_#4A3022] p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Janu Bhai Logo" className="w-10 h-10 object-contain drop-shadow-md" />
            <div>
              <h4 className="font-heading font-black tracking-tight text-accent-brown uppercase leading-none">Get the App</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent-brown/70 mt-1">Tap 'Share' &gt; 'Add to Home Screen'</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-accent-brown text-white p-2 rounded-xl shadow-[2px_2px_0_0_#fff]">
              <Download size={18} />
            </button>
            <button onClick={dismiss} className="text-accent-brown opacity-50 hover:opacity-100">
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
