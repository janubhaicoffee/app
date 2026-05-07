"use client";

import { motion } from 'framer-motion';
import { Globe, Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { SEO } from '@/components/ui/SEO';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown">
      <SEO 
        title="Get in Touch" 
        description="Connect with Janu Bhai Coffee. Support, partnership inquiries, or just to say hi. We are here for the community."
      />

      {/* Hero Banner */}
      <section className="relative bg-accent-brown text-bg-cream py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-accent-gold font-bold uppercase tracking-[0.4em] text-[10px]"
          >
            We're Always Around
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-heading tracking-tighter uppercase leading-[0.85]"
          >
            Let's <span className="text-accent-gold italic">Talk</span> Coffee.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-medium opacity-60 max-w-lg mx-auto"
          >
            Got an issue? Want to partner up? Or just want to talk about the perfect cup? We're here.
          </motion.p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              icon: <MapPin size={24} />, 
              label: "Visit Us", 
              primary: "Ghaffar Manzil, Jamia Nagar",
              secondary: "Delhi - 110025, India",
              color: "bg-accent-brown" 
            },
            { 
              icon: <Mail size={24} />, 
              label: "Email Us", 
              primary: "hello@janubhai.com",
              secondary: "We respond within 24 hours",
              color: "bg-accent-red" 
            },
            { 
              icon: <Clock size={24} />, 
              label: "Working Hours", 
              primary: "Mon – Sat",
              secondary: "9:00 AM – 7:00 PM IST",
              color: "bg-accent-green" 
            },
          ].map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              className="bg-white rounded-[32px] p-8 shadow-xl shadow-accent-brown/5 border border-black/5 space-y-6"
            >
              <div className={`w-14 h-14 ${card.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                {card.icon}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">{card.label}</p>
                <p className="text-lg font-bold tracking-tight">{card.primary}</p>
                <p className="text-sm opacity-50">{card.secondary}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Message Form */}
      <section className="max-w-3xl mx-auto px-6 py-32 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-heading tracking-tight uppercase">Drop a <span className="text-accent-red italic">Message</span></h2>
          <p className="text-sm opacity-50 font-medium max-w-md mx-auto">Whether it's feedback, a franchise inquiry, or a simple hello — we'd love to hear from you.</p>
        </div>
        
        <form className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input 
              type="text" 
              placeholder="Your Name" 
              className="w-full bg-white border border-black/5 rounded-2xl py-5 px-7 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-brown/5 shadow-sm transition-all placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px] placeholder:font-bold placeholder:opacity-30" 
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-white border border-black/5 rounded-2xl py-5 px-7 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-brown/5 shadow-sm transition-all placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px] placeholder:font-bold placeholder:opacity-30" 
            />
          </div>
          <input 
            type="text" 
            placeholder="Subject" 
            className="w-full bg-white border border-black/5 rounded-2xl py-5 px-7 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-brown/5 shadow-sm transition-all placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px] placeholder:font-bold placeholder:opacity-30" 
          />
          <textarea 
            placeholder="Your Message" 
            rows={5} 
            className="w-full bg-white border border-black/5 rounded-2xl py-5 px-7 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-brown/5 shadow-sm resize-none transition-all placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px] placeholder:font-bold placeholder:opacity-30" 
          />
          <Button fullWidth size="lg" className="py-6 group">
            Send Message
            <Send size={16} className="ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>
      </section>
    </div>
  );
}
