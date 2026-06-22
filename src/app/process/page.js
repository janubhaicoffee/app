"use client";
import { motion } from "framer-motion";
import { Leaf, Filter, Sun, Flame, Snowflake, Coffee, Check } from "lucide-react";
import "./process.css";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
};

const timelineSteps = [
  {
    title: "Handpicked",
    desc: "Only ripe cherries are selected with care.",
    icon: <Leaf size={40} />
  },
  {
    title: "Carefully Sorted",
    desc: "Only the best cherries make the cut.",
    icon: <Filter size={40} />
  },
  {
    title: "Sun Dried",
    desc: "Naturally sun dried to lock in flavour.",
    icon: <Sun size={40} />
  },
  {
    title: "Expertly Roasted",
    desc: "Roasted in small batches to bring out the best aroma and balance.",
    icon: <Flame size={40} />
  },
  {
    title: "Freeze Dried",
    desc: "After roasting, beans are freeze dried to preserve freshness, aroma and natural oils.",
    icon: <Snowflake size={40} />
  },
  {
    title: "Served Fresh",
    desc: "Sealed for freshness and served in our cafe for the perfect cup every time.",
    icon: <Coffee size={40} />
  }
];

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
            one of India's most celebrated coffee growing regions, known for its 
            rich soil, perfect climate and passion for quality.
          </p>
        </motion.div>
      </section>

      {/* Timeline Section */}
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

        <div className="timeline-container">
          {timelineSteps.map((step, index) => {
            const isEven = index % 2 === 1; // 0-indexed, so 1,3,5 are "even" visual steps
            
            return (
              <div className="timeline-step" key={index}>
                <motion.div 
                  className="step-icon-container"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={scaleIn}
                >
                  <div className="step-icon">{step.icon}</div>
                </motion.div>

                <motion.div 
                  className="step-content"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={isEven ? slideInRight : slideInLeft}
                >
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </motion.div>
              </div>
            );
          })}
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
