"use client";
import { motion } from "framer-motion";
import { Globe, Coffee, Leaf } from "lucide-react";

export default function TrustBar() {
  return (
    <motion.section 
      className="trust-bar"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container-premium trust-bar-inner">
        <div className="trust-item">
          <Globe size={24} color="var(--accent-gold-mustard)" strokeWidth={1.5} />
          <span className="trust-number">100% Chikmagaluru Origin</span>
          <span className="trust-sublabel">Single Estate Arabica</span>
        </div>
        
        <div className="trust-item">
          <Coffee size={24} color="var(--accent-gold-mustard)" strokeWidth={1.5} />
          <span className="trust-number">Small Batch</span>
          <span className="trust-sublabel">Expertly Roasted in Delhi</span>
        </div>
        
        <div className="trust-item">
          <Leaf size={24} color="var(--accent-gold-mustard)" strokeWidth={1.5} />
          <span className="trust-number">Farm Direct</span>
          <span className="trust-sublabel">Fair Trade, No Middlemen</span>
        </div>
      </div>
    </motion.section>
  );
}
