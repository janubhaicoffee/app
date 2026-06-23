"use client";
import { motion } from "framer-motion";

export default function TrustBar() {
  return (
    <motion.section 
      className="trust-bar"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container trust-bar-inner">
        <div className="trust-item">
          <span className="trust-number">100%</span>
          <span className="trust-label">Chikmagaluru Origin</span>
        </div>
        <span className="trust-divider" />
        <div className="trust-item">
          <span className="trust-number">Small Batch</span>
          <span className="trust-label">Freshly Roasted</span>
        </div>
        <span className="trust-divider" />
        <div className="trust-item">
          <span className="trust-number">Farm Direct</span>
          <span className="trust-label">No Middlemen</span>
        </div>
      </div>
    </motion.section>
  );
}
