"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check } from 'lucide-react';
import { MagneticButton } from './motion/MagneticButton';
import { Button } from './Button';

interface ReferralCardProps {
  referralCode?: string;
  className?: string;
}

export function ReferralCard({ referralCode = "JANU-BHAI-7K2X", className }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://janubhai.com/join?ref=${referralCode}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Janu Bhai Coffee',
          text: 'Join me on Janu Bhai Coffee! Get 100 free credits with my referral link.',
          url: shareUrl,
        });
      } catch {
        // User cancelled share — do nothing
      }
    } else {
      // Desktop fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative rounded-[2rem] p-8 md:p-10 overflow-hidden shadow-2xl ${className}`}
      style={{
        background: 'linear-gradient(135deg, #4A3022 0%, #E23744 100%)',
      }}
    >
      <div className="absolute inset-0 bg-[url('/grain.png')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10 space-y-8">
        <div className="space-y-4">
          <h3 className="text-4xl md:text-5xl font-heading tracking-tighter uppercase leading-[0.9] text-bg-cream">
            BRING A BHAI.<br/>GET A <span className="text-accent-gold">CHAI</span>.
          </h3>
          <p className="text-bg-cream/70 font-bold text-sm uppercase tracking-widest leading-relaxed max-w-sm">
            Share your link. When they buy their first Poshtik coffee, you get ₹50 in Janu Credits.
          </p>
        </div>

        {/* Referral Code Display */}
        <div className="bg-black/30 border border-white/10 rounded-xl p-4 flex items-center justify-between backdrop-blur-sm">
          <span className="font-number font-black text-accent-gold tracking-widest">{referralCode}</span>
          <button 
            onClick={async () => { await navigator.clipboard.writeText(referralCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="text-white/50 hover:text-white transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        {/* Share Button */}
        <MagneticButton intensity={0.3} className="w-full">
          <Button
            fullWidth
            onClick={handleShare}
            size="lg"
            className="bg-accent-gold text-espresso-900 hover:bg-white py-6 rounded-full font-black uppercase tracking-widest text-lg shadow-[0_10px_40px_rgba(255,184,0,0.4)] transition-all flex items-center justify-center gap-3"
          >
            <Share2 size={20} />
            {copied ? "Copied to Clipboard!" : "Share Link"}
          </Button>
        </MagneticButton>
      </div>
    </motion.div>
  );
}
