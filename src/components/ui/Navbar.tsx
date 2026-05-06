"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, MapPin, Menu, X } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const pathname = usePathname();
  const { session } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = [
    { name: 'Our Story', href: '/#story' },
    { name: 'About', href: '/about' },
    { name: 'Franchise', href: '/franchise' },
    { name: 'Menu', href: '/#menu' },
  ];

  const isApp = pathname.startsWith('/app');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-cream/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-accent-brown rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Coffee size={24} />
          </div>
          <span className="font-heading text-xl tracking-tighter uppercase">
            Janu Bhai <span className="text-accent-red">Coffee</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
            >
              {link.name}
            </Link>
          ))}
          
          <div className="h-4 w-px bg-black/10 mx-2" />

          {session ? (
            <Link 
              href="/app"
              className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              href="/login"
              className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
            >
              Sign In
            </Link>
          )}

          <Link href="https://maps.app.goo.gl/yP6L8y2TYHkexmVj6" target="_blank">
            <Button variant="secondary" className="bg-accent-red text-white gap-2 px-6">
              <MapPin size={16} />
              Get Directions
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 opacity-60 hover:opacity-100 transition-opacity"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 right-0 bg-bg-cream border-b border-black/5 p-6 space-y-6 shadow-2xl"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-bold uppercase tracking-[0.2em] opacity-60"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px w-full bg-black/5" />
              <Link 
                href={session ? "/app" : "/login"}
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold uppercase tracking-[0.2em] opacity-60"
              >
                {session ? "Dashboard" : "Sign In"}
              </Link>
              <Link href="https://maps.app.goo.gl/yP6L8y2TYHkexmVj6" target="_blank" className="w-full">
                <Button variant="secondary" className="w-full bg-accent-red text-white gap-2 py-4">
                  <MapPin size={18} />
                  Get Directions
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
