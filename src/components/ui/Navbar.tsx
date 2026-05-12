"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, Lock } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { MagneticButton } from './motion/MagneticButton';
import { Mascot } from './motion/Mascot';

export const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setIsScrolled(latest > 50);
  });

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'The ₹20/₹50 Menu', href: '/#menu' },
    { name: 'Our Story', href: '/about' },
    { name: 'Adda Locations', href: '/locations' },
    { name: 'App', href: '/app-download' },
  ];

  return (
    <motion.nav 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-2" : "py-4"
      }`}
    >
      <div className={`max-w-[95%] mx-auto px-6 flex items-center justify-between rounded-full border-4 border-espresso-brown transition-all duration-300 ${
        isScrolled ? "bg-bg-cream/95 backdrop-blur-md shadow-[8px_8px_0_0_#4A3022] py-2" : "bg-bg-cream shadow-[4px_4px_0_0_#4A3022] py-3"
      }`}>
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 group relative z-50">
          <Mascot size={isScrolled ? 40 : 50} state="idle" className="transition-all duration-300 drop-shadow-md" />
          <span className="font-heading font-black text-2xl uppercase tracking-tighter text-espresso-brown hidden sm:block">Janu Bhai</span>
        </Link>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-bold uppercase tracking-widest text-espresso-brown hover:text-saffron-yellow hover:-translate-y-1 transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right: Dual Ecosystem Login */}
        <div className="hidden lg:flex items-center gap-3">
          <MagneticButton intensity={0.1}>
            <Link href="/login" className="flex items-center gap-2 bg-saffron-yellow text-espresso-brown font-black uppercase tracking-widest px-6 h-12 border-2 border-espresso-brown rounded-full hover:bg-espresso-brown hover:text-saffron-yellow transition-colors shadow-[2px_2px_0_0_#4A3022]">
              <User size={18} strokeWidth={3} />
              Customer Login
            </Link>
          </MagneticButton>

          <MagneticButton intensity={0.1}>
            <Link href="/franchise-login" className="flex items-center gap-2 bg-vibrant-red text-white font-black uppercase tracking-widest px-6 h-12 border-2 border-espresso-brown rounded-full hover:bg-espresso-brown hover:text-vibrant-red transition-colors shadow-[2px_2px_0_0_#4A3022]">
              <Lock size={18} strokeWidth={3} />
              Franchise OS
            </Link>
          </MagneticButton>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-espresso-brown hover:text-vibrant-red transition-colors z-50 relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={32} strokeWidth={3} /> : <Menu size={32} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile Menu (Full Screen Vibrant Yellow) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="lg:hidden fixed inset-0 z-40 bg-saffron-yellow flex flex-col pt-32 px-6 pb-12 overflow-y-auto"
          >
            <div className="flex flex-col gap-6 w-full">
              {navLinks.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.name}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-4xl sm:text-5xl font-heading font-black uppercase tracking-tighter text-espresso-brown hover:text-vibrant-red transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <div className="h-2 w-16 bg-espresso-brown my-8" />
              
              <div className="flex flex-col gap-4">
                <Link 
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 bg-bg-cream text-espresso-brown font-black uppercase tracking-widest py-5 border-4 border-espresso-brown shadow-[8px_8px_0_0_#4A3022] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                >
                  <User size={24} strokeWidth={3} />
                  Customer Login
                </Link>

                <Link 
                  href="/franchise-login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 bg-vibrant-red text-white font-black uppercase tracking-widest py-5 border-4 border-espresso-brown shadow-[8px_8px_0_0_#4A3022] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                >
                  <Lock size={24} strokeWidth={3} />
                  Franchise OS
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

