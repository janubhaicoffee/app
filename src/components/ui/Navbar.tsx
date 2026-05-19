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
    { name: 'HOME', href: '/' },
    { name: 'THE CAFE', href: '/menu' },
    { name: 'OUR STORY', href: '/about' },
    { name: 'ADDA LOCATIONS', href: '/contact' },
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
        isScrolled ? "py-2" : "py-3"
      }`}
    >
      <div className={`max-w-[95%] mx-auto px-4 md:px-6 flex items-center justify-between rounded-full transition-all duration-300 ${
        isScrolled 
          ? "bg-bg-cream/95 backdrop-blur-xl shadow-lg border-2 border-espresso-900/10 py-2" 
          : "bg-white/80 backdrop-blur-md border-2 border-espresso-900/5 py-3"
      }`}>
        
        {/* Left: Logo — Official Illustrated Logo */}
        <Link href="/" className="flex items-center group relative z-50">
          <div className="relative">
            <Mascot size={isScrolled ? 56 : 72} state="idle" className="transition-all duration-300" />
          </div>
        </Link>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-200 relative group/link ${
                pathname === link.href ? 'text-accent-red' : 'text-espresso-900/60 hover:text-espresso-900'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 h-[2px] bg-accent-red transition-all duration-300 ${
                pathname === link.href ? 'w-full' : 'w-0 group-hover/link:w-full'
              }`} />
            </Link>
          ))}
        </div>

        {/* Right: Auth Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <MagneticButton intensity={0.1}>
            <Link href="/login" className="flex items-center gap-2 bg-accent-gold text-espresso-900 font-black uppercase tracking-widest text-[9px] px-6 h-11 rounded-full border-2 border-espresso-900 shadow-janu-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              <User size={14} strokeWidth={3} />
              CUSTOMER LOGIN
            </Link>
          </MagneticButton>

          <MagneticButton intensity={0.1}>
            <Link href="/login?role=franchise" className="flex items-center gap-2 bg-accent-red text-white font-black uppercase tracking-widest text-[9px] px-6 h-11 rounded-full border-2 border-espresso-900 shadow-janu-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              <Lock size={14} strokeWidth={3} />
              FRANCHISEE OS
            </Link>
          </MagneticButton>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-espresso-900 hover:text-accent-red transition-colors z-50 relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} strokeWidth={3} /> : <Menu size={28} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="lg:hidden fixed inset-0 z-40 bg-accent-gold flex flex-col pt-32 px-6 pb-12 overflow-y-auto"
          >
            <div className="flex flex-col gap-6 w-full">
              {navLinks.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  key={link.name}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-5xl font-heading font-black uppercase tracking-tighter text-espresso-900 hover:text-accent-red transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <div className="h-2 w-20 bg-espresso-900 my-8" />
              
              <div className="flex flex-col gap-4">
                <Link 
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 bg-white text-espresso-900 border-4 border-espresso-900 font-black uppercase tracking-widest py-6 rounded-[2rem] shadow-janu"
                >
                  <User size={24} strokeWidth={4} />
                  CUSTOMER LOGIN
                </Link>

                <Link 
                  href="/login?role=franchise"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 bg-accent-red text-white border-4 border-espresso-900 font-black uppercase tracking-widest py-6 rounded-[2rem] shadow-janu"
                >
                  <Lock size={24} strokeWidth={4} />
                  FRANCHISEE OS
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
