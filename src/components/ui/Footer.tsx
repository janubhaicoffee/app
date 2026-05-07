"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-black/5 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
          {/* Brand & Contact */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="Janu Bhai Coffee Logo" className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-500" />
            </Link>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-accent-brown/5 rounded-lg text-accent-brown mt-1">
                  <MapPin size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-30">Our Headquarters</p>
                  <p className="text-sm font-medium leading-relaxed">
                    Ghaffar Manzil, Jamia Nagar,<br />
                    Delhi - 110025, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-accent-brown/5 rounded-lg text-accent-brown mt-1">
                  <Mail size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-30">Inquiries</p>
                  {/* SVG Email Protection */}
                  <div className="h-6 flex items-center">
                    <svg width="140" height="20" viewBox="0 0 140 20" className="opacity-80">
                      <text x="0" y="15" font-family="monospace" font-size="14" fill="currentColor" font-weight="bold">
                        hello@janubhai.com
                      </text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Site Links */}
          <div className="space-y-8 md:pl-12">
            <h4 className="text-[12px] font-bold opacity-30 uppercase tracking-[0.4em]">Navigation</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-sm font-medium hover:text-accent-red transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-sm font-medium hover:text-accent-red transition-colors">About Us</Link></li>
              <li><Link href="/#story" className="text-sm font-medium hover:text-accent-red transition-colors">Our Story</Link></li>
              <li><Link href="/franchise" className="text-sm font-medium hover:text-accent-red transition-colors">Partner Program</Link></li>
              <li><Link href="/app" className="text-sm font-medium hover:text-accent-red transition-colors">App Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-8 md:pl-12">
            <h4 className="text-[12px] font-bold opacity-30 uppercase tracking-[0.4em]">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/terms" className="text-sm font-medium hover:text-accent-red transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm font-medium hover:text-accent-red transition-colors">Privacy Policy</Link></li>
              <li><Link href="/shipping" className="text-sm font-medium hover:text-accent-red transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/returns" className="text-sm font-medium hover:text-accent-red transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/disclosure" className="text-sm font-medium hover:text-accent-red transition-colors">Disclosures</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold opacity-20 uppercase tracking-[0.6em]">
            © 2026 Janu Bhai Coffee Co. • Built for the Real India
          </p>
          <div className="flex gap-8 opacity-20 text-[10px] font-bold uppercase tracking-widest">
            <span>FSSAI Certified</span>
            <span>Premium AAA Grade</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
