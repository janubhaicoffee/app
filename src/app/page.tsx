"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { SEO } from '@/components/ui/SEO';
import Link from 'next/link';
import Image from 'next/image';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';
import { Mascot } from '@/components/ui/motion/Mascot';
import { formatINR } from '@/lib/utils/currency';

// ─── PRODUCT CARD COMPONENT ──────────────────────────────────────────
function ProductCard({
  title,
  description,
  price,
  image,
  ctaText,
  ctaHref,
  disabled = false,
  accent = 'gold',
}: {
  title: string;
  description: string;
  price?: string;
  image: string;
  ctaText: string;
  ctaHref?: string;
  disabled?: boolean;
  accent?: 'gold' | 'red';
}) {
  const accentBg = accent === 'red' ? 'bg-accent-red' : 'bg-accent-gold';
  const accentText = accent === 'red' ? 'text-white' : 'text-espresso-900';

  return (
    <div className="bg-white rounded-[2.5rem] border-4 border-espresso-900 overflow-hidden shadow-janu hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group relative">
      <div className="aspect-square bg-espresso-900/5 relative overflow-hidden border-b-4 border-espresso-900">
        <Image 
          src={image} 
          alt={title} 
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        {price && (
          <div className="absolute top-6 right-6 bg-accent-gold text-espresso-900 px-6 py-3 rounded-xl janu-border font-number font-black text-2xl shadow-janu-sm -rotate-2 z-10">
            {price}
          </div>
        )}
      </div>
      <div className="p-8 md:p-10 space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl md:text-3xl font-heading font-black uppercase tracking-tight text-espresso-900 leading-tight">{title}</h3>
          <div className="h-1 w-12 bg-accent-red" />
        </div>
        <p className="text-espresso-900/60 font-bold text-sm leading-relaxed">{description}</p>
        {disabled ? (
          <button disabled className="w-full py-5 rounded-2xl border-4 border-espresso-900/10 text-espresso-900/20 font-black uppercase tracking-[0.2em] text-xs cursor-not-allowed">
            {ctaText}
          </button>
        ) : (
          <MagneticButton intensity={0.15} className="w-full">
            <Link href={ctaHref || '#'} className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs border-4 border-espresso-900 shadow-janu-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ${accentBg} ${accentText}`}>
              <ShoppingBag size={18} strokeWidth={3} /> {ctaText}
            </Link>
          </MagneticButton>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────
export default function LandingPage() {
  const horizontalRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: horizontalRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <div className="bg-bg-cream overflow-x-hidden">
      <SEO 
        title="Janu Bhai Coffee | Roz Ki Strong Kahaani"
        description="India's Cult Coffee Movement. From Chikkamagaluru to every Adda. 100% Indian Owned."
      />

      {/* 🎬 THE MOVIE SCROLL SECTION */}
      <div ref={horizontalRef} className="relative h-[400vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div style={{ x }} className="flex h-full w-[400vw]">
            
            {/* FRAME 1: HERO - ROZ KI STRONG KAHAANI */}
            <div className="w-[100vw] h-full relative shrink-0">
              <Image src="/farm_new.png" alt="Origin" fill priority className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-espresso-900/40 to-espresso-900" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <FadeIn direction="up">
                  <div className="bg-accent-gold text-espresso-900 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 shadow-janu-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent-red rounded-full" />
                    MAID IN INDIA
                  </div>
                  <h1 className="text-7xl md:text-[14rem] font-heading font-black tracking-tighter uppercase leading-[0.8] text-white">
                    ROZ KI<br/><span className="text-accent-gold">STRONG</span><br/>KAHAANI<span className="text-accent-red">.</span>
                  </h1>
                  <p className="text-white/60 font-bold uppercase tracking-[0.4em] text-xs mt-12 max-w-md mx-auto">
                    AAA Grade beans. Handpicked from Chikkamagaluru. Roasted for the streets.
                  </p>
                  <Mascot size={280} state="idle" className="mt-12" />
                </FadeIn>
              </div>
            </div>

            {/* FRAME 2: THE ROAST HUB */}
            <div className="w-[100vw] h-full relative shrink-0">
              <Image src="/factory_black.png" alt="Roasting" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-espresso-900 via-black/80 to-accent-red/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <FadeIn direction="up">
                  <p className="text-accent-red font-bold uppercase tracking-[0.4em] text-xs mb-8">No-Bullshit Processing</p>
                  <h2 className="text-7xl md:text-[12rem] font-heading font-black tracking-tighter uppercase leading-[0.85] text-white">
                    Roasted<br/>in our<br/><span className="text-accent-red italic">Local Hubs</span>.
                  </h2>
                  <div className="mt-12 flex justify-center gap-4">
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-bold text-xs uppercase tracking-widest">Small Batch</div>
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-bold text-xs uppercase tracking-widest">Dry Vacuum</div>
                  </div>
                </FadeIn>
              </div>
            </div>

            {/* FRAME 3: THE UNIVERSAL JOURNEY */}
            <div className="w-[100vw] h-full relative shrink-0 bg-espresso-900">
              <div className="absolute inset-0 bg-[url('/grain.png')] opacity-15 mix-blend-overlay" />
              <div className="h-full flex flex-col justify-center px-6 md:px-20">
                <div className="mb-16 text-center">
                  <h2 className="text-6xl md:text-9xl font-heading font-black tracking-tighter uppercase text-white leading-none">
                    One Pouch<span className="text-accent-red">.</span><br/>Every <span className="text-accent-gold italic">Adda</span>.
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto">
                  {[
                    { img: '/pouch_tapri_black.png', label: 'Roadside Tapri' },
                    { img: '/pouch_boutique_black.png', label: 'Boutique Cafe' },
                    { img: '/pouch_boho_black.png', label: 'Boho Hangout' },
                    { img: '/pouch_canteen_black.png', label: 'College Canteen' },
                    { img: '/pouch_jail_black.png', label: 'Jail Kitchen' },
                    { img: '/pouch_fivestar_black.png', label: 'Five-Star Bar' },
                  ].map((item, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.05 }} className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border-2 border-white/10 group shadow-2xl">
                      <Image src={item.img} alt={item.label} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-accent-gold font-black text-xl font-heading tracking-tight uppercase leading-none">{item.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* FRAME 4: THE MOVEMENT */}
            <div className="w-[100vw] h-full relative shrink-0">
              <Image src="/pouch_fivestar_black.png" alt="Future" fill className="object-cover" />
              <div className="absolute inset-0 bg-espresso-900/90" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <FadeIn direction="up">
                  <div className="w-32 h-32 mb-12">
                    <Mascot size={128} state="loading" />
                  </div>
                  <h2 className="text-7xl md:text-[14rem] font-heading font-black tracking-tighter uppercase leading-[0.8] text-white">
                    JOIN THE<br/><span className="text-accent-gold">REVOLUTION</span>.
                  </h2>
                  <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs mt-16 max-w-sm mx-auto">
                    Scroll down to explore our Cafe and shop our hero products.
                  </p>
                </FadeIn>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* 📦 E-COMMERCE SECTION */}
      <section className="bg-bg-cream text-espresso-900 py-32 px-6 relative z-10 border-t-8 border-espresso-900">
        <div className="absolute inset-0 bg-[url('/grain.png')] opacity-5 pointer-events-none" />
        <div className="max-w-6xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <p className="text-accent-red font-bold uppercase tracking-[0.4em] text-xs">The Hero Products</p>
            <h2 className="text-7xl md:text-9xl font-heading font-black tracking-tighter uppercase text-espresso-900">Take it <span className="text-accent-gold italic">Home</span>.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ProductCard
              title="Daily Poshtik Jar"
              description="Our signature Chikkamagaluru blend in a sleek glass jar. Pure bean-to-jar journey."
              image="/pouch_boutique_black.png"
              ctaText="Coming Soon"
              disabled={true}
            />
            <ProductCard
              title="Operator's Pouch"
              description="The commercial-grade 1kg black standup pouch. Used across our entire network."
              price={formatINR(3000)}
              image="/pouch_jail_black.png"
              ctaText="Buy Now"
              ctaHref="/product/1kg-pouch"
              accent="red"
            />
          </div>

          <div className="bg-espresso-900 rounded-[4rem] p-16 md:p-24 text-center space-y-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grain.png')] opacity-15 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10 space-y-10">
              <div className="flex justify-center">
                <div className="bg-white/10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-accent-gold border border-white/20">A Chishti Ventures Initiative</div>
              </div>
              <h3 className="text-6xl md:text-[8rem] font-heading font-black tracking-tighter uppercase text-white leading-[0.8] mb-12">Own a <br/><span className="text-accent-gold">Janu Bhai</span> Hub.</h3>
              <p className="text-white/40 font-bold uppercase tracking-widest text-xs max-w-lg mx-auto leading-relaxed">
                Lowest investment. Highest kinetic energy. Decentralized growth. 100% Indian Owned.
              </p>
              <div className="pt-8">
                <MagneticButton intensity={0.2}>
                  <Link href="/franchise" className="inline-flex items-center gap-6 bg-accent-red text-white px-16 py-8 rounded-full font-black uppercase tracking-widest hover:bg-accent-gold hover:text-espresso-900 transition-all shadow-[0_10px_50px_rgba(226,55,68,0.5)] text-xl border-4 border-transparent hover:border-espresso-900">
                    Start Your Movement <ArrowRight size={28} />
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
