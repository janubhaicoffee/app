"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Menu, X } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { MagneticButton } from './motion/MagneticButton';
import { Mascot } from './motion/Mascot';

export const Navbar = () => {
  const pathname = usePathname();
  const { session } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
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
    { name: 'Our Story', href: '/#story' },
    { name: 'About', href: '/about' },
    { name: 'Our Source', href: '/source' },
    { name: 'Franchise', href: '/franchise' },
  ];

  return (
    <motion.nav 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "py-4" : "py-6"
      }`}
    >
      <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between rounded-full transition-all duration-500 ${
        isScrolled ? "bg-espresso-900/80 backdrop-blur-xl border border-white/10 shadow-2xl py-3 px-8 text-white" : "bg-transparent text-current"
      }`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group relative z-50">
          <Mascot size={isScrolled ? 48 : 64} floating={!isScrolled} className="transition-all duration-500" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
            >
              {link.name}
            </Link>
          ))}
          
          <div className={`h-4 w-px mx-2 ${isScrolled ? 'bg-white/20' : 'bg-black/10'}`} />

          {session ? (
            <Link 
              href="/app"
              className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              href="/login"
              className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
            >
              Sign In
            </Link>
          )}

          <Link href="https://maps.app.goo.gl/yP6L8y2TYHkexmVj6" target="_blank">
            <MagneticButton intensity={0.2}>
              <Button variant="secondary" className="bg-accent-red text-white gap-2 px-6 shadow-xl shadow-accent-red/20">
                <MapPin size={16} />
                Get Directions
              </Button>
            </MagneticButton>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 opacity-60 hover:opacity-100 transition-opacity z-50 relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="md:hidden fixed inset-0 z-40 bg-espresso-900/95 backdrop-blur-2xl text-white flex items-center justify-center p-6"
          >
            <div className="flex flex-col items-center gap-10 w-full max-w-sm">
              <Mascot size={100} />
              
              <div className="flex flex-col items-center gap-8 w-full">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-xl font-heading font-bold uppercase tracking-[0.2em] opacity-80 hover:opacity-100"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="h-px w-full bg-white/10" />
                <Link 
                  href={session ? "/app" : "/login"}
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-heading font-bold uppercase tracking-[0.2em] opacity-80 hover:opacity-100"
                >
                  {session ? "Dashboard" : "Sign In"}
                </Link>
                <Link href="https://maps.app.goo.gl/yP6L8y2TYHkexmVj6" target="_blank" className="w-full mt-4">
                  <Button variant="secondary" className="w-full bg-accent-red text-white gap-2 py-6 text-lg rounded-2xl">
                    <MapPin size={20} />
                    Get Directions
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

