'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FeaturedProduct() {
  return (
    <section className="featured-product-section section-padding">
      <div className="container-premium featured-product-grid">
        <motion.div
          className="featured-product-left"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="featured-product-img-wrap">
            <Image
              src="/product.png"
              alt="Janu Bhai Premium Freeze Dried Instant Coffee"
              width={500}
              height={500}
              className="featured-product-img"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </motion.div>

        <motion.div
          className="featured-product-right"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <span className="featured-subtitle">Flagship Blend</span>
          <h2
            className="heading-luxury"
            style={{ color: 'var(--bg-espresso)', marginBottom: '24px' }}
          >
            PREMIUM
            <br />
            FREEZE DRIED.
          </h2>
          <p className="body-luxury body-luxury-dark">
            Our signature Chikmagalur blend, freeze-dried at peak freshness to capture the delicate
            aroma, notes, and bold character of 100% pure Arabica.
          </p>

          <div className="featured-product-specs">
            <div className="spec-row">
              <span className="spec-label">Weight</span>
              <span className="spec-value">100g Net</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Type</span>
              <span className="spec-value">Freeze Dried Instant</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Beans</span>
              <span className="spec-value">100% Arabica Blend</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Chicory</span>
              <span className="spec-value">0% (Pure Coffee Only)</span>
            </div>
          </div>

          <Link href="/product/instantcoffee" className="btn-cta-premium">
            Buy Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
