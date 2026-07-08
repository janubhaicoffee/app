'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StorySection() {
  return (
    <section className="brand-story-section section-padding" id="about">
      <div className="container-premium">
        <motion.div
          className="brand-story-grid"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="brand-story-left">
            <span className="featured-subtitle">Our Heritage</span>
            <h2
              className="heading-luxury"
              style={{ color: 'var(--bg-espresso)', marginBottom: '28px' }}
            >
              BORN IN THE HILLS.
              <br />
              BREWED FOR YOU.
            </h2>
            <p className="body-luxury body-luxury-dark">
              Janu Bhai Coffee was founded on a simple promise: to bring the authentic, unfiltered
              taste of Chikmagaluru's finest estates direct to your home.
            </p>
            <p
              className="body-luxury body-luxury-dark"
              style={{ marginTop: '-24px', marginBottom: '48px' }}
            >
              By sourcing direct from heritage growers, small-batch roasting in Delhi, and cutting
              out the middlemen, we ensure every cup is as honest and fresh as coffee gets. No
              compromise, ever.
            </p>
            <Link href="/process" className="btn-cta-premium">
              Discover Our Process
              <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </Link>
          </div>

          <div className="brand-story-right">
            <div className="founder-img-frame">
              <Image
                src="/arsalanazad.png"
                alt="Arsalan Azad - Founder of Janu Bhai Coffee"
                width={480}
                height={600}
                className="founder-img"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
