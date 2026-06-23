"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function StorySection() {
  return (
    <section className="story-section">
      <div className="container">
        <motion.div 
          className="story-layout"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="story-content">
            <h2 className="story-heading">
              Born in the hills.<br />
              Brewed for you.
            </h2>
            <p className="story-text">
              Janu Bhai Coffee started with a simple idea - bring the real taste of
              Chikmagaluru to every Indian home. No blending, no shortcuts,
              no middlemen. Just honest, fresh coffee from farm to your cup.
            </p>
            <Link href="/process" className="btn-outline">
              Learn More About Our Process
              <ArrowRight size={16} className="btn-arrow" />
            </Link>
          </div>
          <div className="story-visual">
            <div className="story-stat">
              <span className="story-stat-value">Chikmagaluru</span>
              <span className="story-stat-label">Single Origin Estate</span>
            </div>
            <div className="story-stat">
              <span className="story-stat-value">Fresh Roasted</span>
              <span className="story-stat-label">Every Small Batch</span>
            </div>
            <div className="story-stat">
              <span className="story-stat-value">Zero Chicory</span>
              <span className="story-stat-label">Pure Coffee Only</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
