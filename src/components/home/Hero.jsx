"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg-grain" />
      <div className="container hero-grid">
        <motion.div 
          className="hero-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hero-origin">Chikmagaluru, Karnataka</span>
          <h1 className="hero-heading">
            Fresh Coffee,<br />
            <span className="hero-heading-accent">Straight From</span><br />
            The Hills.
          </h1>
          <p className="hero-sub">चिकमगलुरु की ताज़ा कॉफ़ी</p>
          <p className="hero-desc">
            Single-origin, small-batch roasted coffee from one of India&apos;s
            finest coffee growing regions. No middlemen, no compromise.
          </p>
          <div className="hero-actions">
            <Link href="/product/instantcoffee" className="btn-cta">
              Shop Coffee
              <ArrowRight size={18} className="btn-arrow" />
            </Link>
            <Link href="/process" className="btn-cta-ghost">
              Our Process
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="hero-image"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="hero-image-frame">
            <Image
              src="/arsalanazad.png"
              alt="Arsalan Azad holding Janu Bhai Coffee"
              width={600}
              height={600}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="hero-portrait"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
