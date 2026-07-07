"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Leaf, Filter, Sun, Flame, Snowflake, Coffee, Check } from "lucide-react";
import "./process.css";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
};

const timelineSteps = [
  {
    title: "Handpicked",
    desc: "Only ripe cherries are selected with care from the high altitudes of Chikmagalur.",
    icon: <Leaf size={28} />,
    videoUrl: "https://player.vimeo.com/external/477169493.sd.mp4?s=d0db2d326f1dc7de99c5625ff11cc28f7311b5e2&profile_id=165&oauth2_token_id=57447761"
  },
  {
    title: "Carefully Sorted",
    desc: "Only the best beans make the cut, eliminating any defectives for consistent flavour profiles.",
    icon: <Filter size={28} />,
    videoUrl: "https://player.vimeo.com/external/416041071.sd.mp4?s=254641c8f1d5336e76cf08db5b94f061f2fde1c8&profile_id=165&oauth2_token_id=57447761"
  },
  {
    title: "Sun Dried",
    desc: "Naturally sun dried to lock in full-bodied sweetness and complexity.",
    icon: <Sun size={28} />,
    videoUrl: "https://player.vimeo.com/external/517616641.sd.mp4?s=1df0efb8b20ff44e83c7138b3f12440938b812b1&profile_id=165&oauth2_token_id=57447761"
  },
  {
    title: "Expertly Roasted",
    desc: "Roasted in small batches by master roasters to draw out rich aroma and perfect balance.",
    icon: <Flame size={28} />,
    videoUrl: "https://player.vimeo.com/external/435674703.sd.mp4?s=74b6ff9bc0bf476f5712e529deec0b666a4bc27a&profile_id=165&oauth2_token_id=57447761"
  },
  {
    title: "Flavor Captured",
    desc: "Beans are instantly captured at peak freshness, locking in the natural essential oils and fresh aromas.",
    icon: <Snowflake size={28} />,
    videoUrl: "https://player.vimeo.com/external/554988719.sd.mp4?s=9108b3a0cc30fa392cc632279184518cdbc87f17&profile_id=165&oauth2_token_id=57447761"
  },
  {
    title: "Served Fresh",
    desc: "Sealed airtight and served directly to deliver the ultimate coffee experience.",
    icon: <Coffee size={28} />,
    videoUrl: "https://player.vimeo.com/external/391586552.sd.mp4?s=33045860d5bfa780d68a9ad059fb27cf5c0cb4eb&profile_id=165&oauth2_token_id=57447761"
  }
];

function TimelineNode({ step, index }) {
  const containerRef = useRef(null);
  
  // Track scroll position of this timeline node relative to the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  // documentary-style spatial transformations
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.1, 1, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.6, 1], [0.85, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.6, 1], [80, 0, 0]);

  const isEven = index % 2 === 1;

  return (
    <motion.div
      ref={containerRef}
      style={{ opacity, scale, y }}
      className={`timeline-step-row ${isEven ? 'even-row' : 'odd-row'}`}
      key={index}
    >
      {/* Video Container with Hover Zoom */}
      <motion.div
        className="step-media-wrapper vintage-border"
        whileHover={{ scale: 1.04 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <video
          src={step.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="step-loop-video"
        />
        <motion.div
          className="step-cream-overlay"
          whileHover={{ opacity: 0.6 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Content Container with Hover Lift */}
      <motion.div
        className="step-card-content"
        whileHover={{ y: -4, boxShadow: '6px 8px 0px rgba(62, 39, 35, 0.15)' }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="step-badge-node">
          <span className="step-icon-inner">{step.icon}</span>
          <span className="step-number-text">Phase 0{index + 1}</span>
        </div>
        <h3 className="step-title-node">{step.title}</h3>
        <p className="step-desc-node">{step.desc}</p>
      </motion.div>
    </motion.div>
  );
}

export default function ProcessPage() {
  return (
    <main className="process-page">
      {/* Hero Section */}
      <section className="process-hero">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={fadeInUp}
        >
          <p className="hero-subtitle">From the hills of</p>
          <h1 className="hero-title">Chikmagaluru</h1>
          
          <div className="hero-translations">
            <span className="hindi-text">चिकमगलूरु</span>
            <span className="urdu-text">چکمگلورو</span>
          </div>

          <p className="hero-description">
            Our coffee comes from the lush hills of Chikmagaluru, Karnataka 
            one of India&apos;s most celebrated coffee growing regions, known for its 
            rich soil, perfect climate and passion for quality.
          </p>
        </motion.div>
      </section>

      {/* Spatial Timeline Section */}
      <section className="process-timeline-section">
        <motion.h2 
          className="section-title"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={scaleIn}
        >
          From Farm to Cup
        </motion.h2>

        <div className="spatial-timeline-container">
          {timelineSteps.map((step, index) => (
            <TimelineNode step={step} index={index} key={index} />
          ))}
        </div>
      </section>

      {/* Grade Badge Section */}
      <motion.section 
        className="grade-section"
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true, margin: "-50px" }} 
        variants={fadeInUp}
      >
        <div className="grade-badge">
          <h2>AAA</h2>
          <p><span>★</span><span>★</span><span>★</span> GRADE <span>★</span><span>★</span><span>★</span></p>
        </div>
        
        <div className="grade-info">
          <h3>100% ARABICA<br/>SORTED BEANS</h3>
          <p>Only the finest beans. Always.</p>
          
          <div className="grade-features">
            <div className="feature-item">
              <div className="feature-icon"><Check size={20} /></div>
              <span>RICH AROMA</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Check size={20} /></div>
              <span>SMOOTH BODY</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Check size={20} /></div>
              <span>BALANCED TASTE</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer Promise */}
      <motion.div 
        className="process-footer"
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        variants={fadeInUp}
      >
        <p>
          Grown at high altitudes and nurtured with care, our Chikmagalur Arabica 
          beans are AAA grade and carefully sorted for consistent quality. Each cup 
          delivers a perfect balance of aroma, body and flavour the way coffee was meant to be.
        </p>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <Coffee size={24} color="var(--accent-red)" />
          <Coffee size={24} color="var(--primary-color)" />
          <Coffee size={24} color="var(--accent-red)" />
        </div>
      </motion.div>
    </main>
  );
}
