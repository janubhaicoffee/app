'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Leaf,
  Filter,
  Sun,
  Flame,
  Snowflake,
  Coffee,
  Check,
  X,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Mountain,
  Award,
  Compass,
  Droplets,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import './process.css';

// Animated Stats Counter component
function AnimatedCounter({ value, suffix = '', duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasTriggered(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasTriggered) return;

    const target = parseInt(String(value).replace(/,/g, ''), 10);
    if (isNaN(target)) {
      setCount(value);
      return;
    }

    let startTime = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const current = Math.floor(progress * target);

      setCount(current);

      if (progress < 1) {
        window.requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    }

    const frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [value, duration, hasTriggered]);

  return (
    <motion.span
      onViewportEnter={() => setHasTriggered(true)}
      viewport={{ once: true, margin: '-50px' }}
    >
      {hasTriggered ? `${count.toLocaleString()}${suffix}` : `0${suffix}`}
    </motion.span>
  );
}

// 6 Core Process Stages
const PROCESS_STEPS = [
  {
    phase: '01',
    id: 'handpicked',
    tagline: 'Harvesting & Selection',
    title: 'Handpicked at Peak Crimson',
    subtitle: 'Selective harvesting at 22° Brix sugar maturity',
    desc: 'Only the ripest, deep-crimson coffee cherries are selected by hand from shade-grown coffee trees in Chikmagalur. Sourcing strictly at peak maturity ensures maximum natural sweetness and prevents any of the astringency found in mechanized harvests.',
    imageUrl: '/handpicked.png',
    icon: Leaf,
    badgeText: 'Western Ghats Hand Harvest',
    metrics: [
      { label: 'Harvest Altitude', val: '1,200m' },
      { label: 'Cherry Brix', val: '22° Sugar' },
      { label: 'Selectivity', val: '100% Manual' },
    ],
  },
  {
    phase: '02',
    id: 'sorting',
    tagline: 'Quality Control & Grading',
    title: 'Optical & Manual Density Sorting',
    subtitle: 'Zero-tolerance sorting for uniform bean density',
    desc: 'Sorting is where true specialty coffee is won. Every harvest batch undergoes meticulous optical and hand sorting. Defective, chipped, insect-damaged, and under-dense beans are removed to guarantee a pure, velvety, non-bitter cup profile.',
    imageUrl: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=1200',
    icon: Filter,
    isSorting: true,
    badgeText: 'Screen 19 AAA Grade',
    metrics: [
      { label: 'Defect Tolerance', val: '0.0%' },
      { label: 'Grading Standard', val: 'AAA Specialty' },
      { label: 'Density Uniformity', val: '99.4%' },
    ],
  },
  {
    phase: '03',
    id: 'sundried',
    tagline: 'Natural Dehydration',
    title: 'Sun Dried on Raised African Beds',
    subtitle: 'Slow, uniform curing under high-altitude sun',
    desc: 'Our freshly pulped beans are spread evenly across elevated African-style mesh drying beds, suspended above the ground for 360-degree airflow. Raked hourly for 14 straight days, this slow dehydration locks in the delicate fruit sugars at an exact 11% equilibrium moisture content.',
    imageUrl: '/sun_dried.png',
    icon: Sun,
    badgeText: '14-Day Raised Bed Curing',
    metrics: [
      { label: 'Drying Period', val: '14 Days' },
      { label: 'Target Moisture', val: '11.0%' },
      { label: 'Bed Rotation', val: 'Hourly' },
    ],
  },
  {
    phase: '04',
    id: 'roasted',
    tagline: 'Thermal Alchemy',
    title: 'Small-Batch Master Drum Roasting',
    subtitle: 'Caramelizing sugars to rich cocoa & hazelnut notes',
    desc: 'Roasted in temperature-controlled small-batch drum roasters. Our master roasters monitor precise roast curves, guiding the beans through the Maillard reaction to develop intense notes of dark chocolate, toasted hazelnut, and sweet caramel without scorching.',
    imageUrl: '/expertly_roasted.png',
    icon: Flame,
    isRoasting: true,
    badgeText: 'Precision Roast Curve',
    metrics: [
      { label: 'Roast Level', val: 'Medium-Dark' },
      { label: 'Batch Volume', val: '25kg Small' },
      { label: 'Development', val: '18% DTR' },
    ],
  },
  {
    phase: '05',
    id: 'freezedried',
    tagline: 'Cryogenic Preservation',
    title: 'Sub-Zero Freeze Drying (-40°C)',
    subtitle: 'Sublimating water to lock in aromatic oils',
    desc: 'Unlike conventional instant coffees that blast coffee extract with scorching 250°C spray-dry heat (destroying the aroma), Janu Bhai uses cryogenic freeze drying. The fresh brew is frozen at -40°C and placed in a high-vacuum chamber where ice sublimates directly to vapor, permanently locking in 100% of the coffee’s natural oils and delicate aromatics.',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1200',
    icon: Snowflake,
    isFreezeDry: true,
    badgeText: '-40°C Vacuum Cryo-Lock',
    metrics: [
      { label: 'Freezing Temp', val: '-40°C' },
      { label: 'Heat Exposure', val: 'Zero Heat' },
      { label: 'Aroma Retention', val: '98.5%' },
    ],
  },
  {
    phase: '06',
    id: 'servedfresh',
    tagline: 'The Climax',
    title: 'Airtight Nitro-Sealed & Served Fresh',
    subtitle: 'Immediate golden crema bloom in every cup',
    desc: 'Immediately packaged in nitro-flushed, airtight containers to eliminate oxygen and moisture degradation. From our Chikmagalur roastery directly to your home, simply add hot milk or boiled water to watch thick golden crema bloom instantly.',
    imageUrl: '/served_fresh.png',
    icon: Coffee,
    badgeText: 'Nitro-Flushed Freshness',
    metrics: [
      { label: 'Oxidation Risk', val: '0.0%' },
      { label: 'Dissolution Speed', val: '3 Seconds' },
      { label: 'Crema Layer', val: 'Velvety Rich' },
    ],
  },
];

// Terroir Stats Data
const TERROIR_METRICS = [
  {
    icon: Mountain,
    value: '1,200m',
    title: 'Peak Elevation',
    desc: 'High altitudes slow bean development, concentrating complex floral and chocolate sugars.',
  },
  {
    icon: Leaf,
    value: '100%',
    title: 'Shade-Grown Canopy',
    desc: 'Grown naturally beneath silver oaks and wild fig trees, nurturing biodiversity.',
  },
  {
    icon: Award,
    value: 'AAA',
    title: 'Specialty Grade',
    desc: 'Bold Screen-19 sizing, rigorously tested for zero primary defects and uniform density.',
  },
  {
    icon: Droplets,
    value: 'Volcanic',
    title: 'Mineral-Rich Loam',
    desc: 'Western Ghats volcanic soil packed with natural potassium and iron for low acidity.',
  },
];

// Interactive Quality Comparison Cards
function QualityComparison() {
  const [activeTab, setActiveTab] = useState('both');

  return (
    <div className="process-quality-comparison">
      <div className="comparison-tabs">
        <button
          className={`comp-tab-btn ${activeTab === 'both' ? 'active' : ''}`}
          onClick={() => setActiveTab('both')}
        >
          Full Comparison
        </button>
        <button
          className={`comp-tab-btn approved ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <Check size={14} /> Janu Bhai AAA Grade
        </button>
        <button
          className={`comp-tab-btn rejected ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          <X size={14} /> Rejected Defective Beans
        </button>
      </div>

      <div className="comparison-grid">
        {(activeTab === 'both' || activeTab === 'rejected') && (
          <div className="comp-card rejected">
            <div className="comp-card-header">
              <div className="comp-badge rejected">
                <X size={14} /> Defect Discards (Commercial Grade)
              </div>
              <h4>What We Reject</h4>
            </div>
            <ul className="comp-list">
              <li>
                <div className="comp-icon-box rejected">
                  <X size={14} />
                </div>
                <div>
                  <strong>Broken & Chipped Beans:</strong>
                  <p>Causes scorching and uneven roasts, resulting in harsh astringency.</p>
                </div>
              </li>
              <li>
                <div className="comp-icon-box rejected">
                  <X size={14} />
                </div>
                <div>
                  <strong>Insect-Damaged / Borer Beans:</strong>
                  <p>Creates flat, sour off-notes that ruin the cup's aromatic profile.</p>
                </div>
              </li>
              <li>
                <div className="comp-icon-box rejected">
                  <X size={14} />
                </div>
                <div>
                  <strong>Black & Under-Ripe Cherries:</strong>
                  <p>Produces unpleasant grassy tastes and bitter chemical aftertastes.</p>
                </div>
              </li>
            </ul>
          </div>
        )}

        {(activeTab === 'both' || activeTab === 'approved') && (
          <div className="comp-card approved">
            <div className="comp-card-header">
              <div className="comp-badge approved">
                <Check size={14} /> Janu Bhai Standard (AAA Specialty)
              </div>
              <h4>What Makes Our Cup</h4>
            </div>
            <ul className="comp-list">
              <li>
                <div className="comp-icon-box approved">
                  <Check size={14} />
                </div>
                <div>
                  <strong>Uniform High-Density Beans:</strong>
                  <p>Ensures smooth, balanced heat distribution and consistent crema yield.</p>
                </div>
              </li>
              <li>
                <div className="comp-icon-box approved">
                  <Check size={14} />
                </div>
                <div>
                  <strong>Bold Screen-19 Sizing:</strong>
                  <p>Large, mature beans containing the highest concentration of aromatic oils.</p>
                </div>
              </li>
              <li>
                <div className="comp-icon-box approved">
                  <Check size={14} />
                </div>
                <div>
                  <strong>Perfect 11% Cured Moisture:</strong>
                  <p>Locks in natural berry notes, buttery mouthfeel, and deep dark chocolate finish.</p>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Interactive Roasting Profile Dial
function RoastingProfileVisualizer() {
  const [activeStage, setActiveStage] = useState('caramelization');

  const stages = {
    drying: {
      name: 'Drying Phase (0 - 150°C)',
      desc: 'Raw green moisture evaporates, turning the beans golden yellow as fresh grass aromas emerge.',
      color: '#d4af37',
    },
    caramelization: {
      name: 'Maillard Caramelization (150 - 200°C)',
      desc: 'Sugars and amino acids react, releasing rich toasted nuts, hazelnut, and vanilla aromatics.',
      color: '#d89a1e',
    },
    firstcrack: {
      name: 'First Crack & Development (200 - 215°C)',
      desc: 'Bean cells rupture open, expanding by 60% as deep dark cocoa and velvety oils develop.',
      color: '#c28717',
    },
  };

  return (
    <div className="roast-visualizer-card">
      <div className="roast-vis-header">
        <Flame size={20} color="#d89a1e" />
        <h4>Interactive Master Roast Curve</h4>
      </div>

      <div className="roast-stage-buttons">
        {Object.entries(stages).map(([key, info]) => (
          <button
            key={key}
            className={`roast-btn ${activeStage === key ? 'active' : ''}`}
            onClick={() => setActiveStage(key)}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="roast-stage-detail">
        <h5>{stages[activeStage].name}</h5>
        <p>{stages[activeStage].desc}</p>
        <div className="roast-temp-bar">
          <div
            className="roast-temp-fill"
            style={{
              width: activeStage === 'drying' ? '33%' : activeStage === 'caramelization' ? '66%' : '100%',
              background: stages[activeStage].color,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Single Process Stage Component with Parallax Scroll
function ProcessStageCard({ step, index }) {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.06, 1.02]);
  const yParallax = useTransform(scrollYProgress, [0, 0.5, 1], [30, 0, -30]);

  const Icon = step.icon;

  return (
    <div ref={cardRef} className="process-stage-section" id={`stage-${step.phase}`}>
      <div className="stage-inner-container">
        
        {/* Stage Number & Badge */}
        <div className="stage-top-bar">
          <div className="stage-phase-number">PHASE {step.phase}</div>
          <div className="stage-tag-badge">
            <Icon size={14} />
            <span>{step.badgeText}</span>
          </div>
        </div>

        {/* Media and Info Grid */}
        <div className={`stage-grid ${index % 2 === 1 ? 'reverse' : ''}`}>
          
          {/* Visual Media Stage */}
          <div className="stage-visual-box">
            <div className="stage-image-frame">
              <motion.img
                style={{ scale: imgScale }}
                src={step.imageUrl}
                alt={step.title}
                className="stage-img"
                loading="lazy"
              />
              <div className="stage-image-overlay-glow" />
            </div>

            {/* Quick Metrics Bar below Image */}
            <div className="stage-metrics-row">
              {step.metrics.map((m, i) => (
                <div key={i} className="stage-metric-cell">
                  <span className="metric-val">{m.val}</span>
                  <span className="metric-lbl">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Text & Interactive Narrative Column */}
          <motion.div style={{ y: yParallax }} className="stage-text-box">
            <span className="stage-tagline">{step.tagline}</span>
            <h2 className="stage-heading">{step.title}</h2>
            <p className="stage-subtitle">{step.subtitle}</p>
            <p className="stage-paragraph">{step.desc}</p>

            {/* Interactive Components per Stage */}
            {step.isSorting && <QualityComparison />}
            {step.isRoasting && <RoastingProfileVisualizer />}
            {step.isFreezeDry && (
              <div className="frosted-vacuum-box">
                <div className="frost-header">
                  <Snowflake size={18} color="#90caf9" />
                  <span>Sub-Zero Cryogenic Sublimation</span>
                </div>
                <p>
                  Zero heat destruction. Unlike 250°C spray-dried powders, freeze drying sublimates pure ice under vacuum, preserving the natural crema-producing aromatics.
                </p>
              </div>
            )}
          </motion.div>

        </div>

      </div>
    </div>
  );
}

// Flavor Compass Profile
function FlavorCompass() {
  const flavorAttributes = [
    { label: 'Crema Richness', score: '9.8 / 10', percentage: 98, note: 'Velvety, micro-foam density' },
    { label: 'Dark Chocolate & Hazelnut', score: '9.5 / 10', percentage: 95, note: 'Deep cocoa caramelization' },
    { label: 'Aromatic Sweetness', score: '9.0 / 10', percentage: 90, note: 'Naturally sweet Arabica finish' },
    { label: 'Low Acidity (Smooth)', score: '9.4 / 10', percentage: 94, note: 'Volcanic loam gentle balance' },
    { label: 'Instant Bloom Speed', score: '10 / 10', percentage: 100, note: 'Dissolves instantly in 3 secs' },
  ];

  return (
    <section className="flavor-compass-section">
      <div className="flavor-compass-container">
        <div className="flavor-compass-header">
          <div className="d2c-badge-floating">
            <Compass size={14} /> Sensory Tasting Profile
          </div>
          <h2 className="section-title">The Janu Bhai Cup Experience</h2>
          <p className="section-subtitle">
            Engineered through high-altitude estate terroir, master small-batch roasting, and sub-zero cryogenic preservation.
          </p>
        </div>

        <div className="flavor-bars-grid">
          {flavorAttributes.map((attr, idx) => (
            <div key={idx} className="flavor-bar-card">
              <div className="flavor-bar-top">
                <span className="flavor-label">{attr.label}</span>
                <span className="flavor-score">{attr.score}</span>
              </div>
              <div className="flavor-progress-track">
                <motion.div
                  className="flavor-progress-fill"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${attr.percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: idx * 0.15 }}
                />
              </div>
              <span className="flavor-note">{attr.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProcessPage() {
  const [particles, setParticles] = useState([]);
  const [activeStageNav, setActiveStageNav] = useState('01');

  useEffect(() => {
    // Generate subtle golden floating dust particles client-side
    const generated = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 12}s`,
      duration: `${14 + Math.random() * 16}s`,
    }));
    setParticles(generated);
  }, []);

  const scrollToStage = (phase) => {
    setActiveStageNav(phase);
    const el = document.getElementById(`stage-${phase}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="process-luxury-page">
      {/* Background Visual Layers */}
      <div className="process-bg-vignette" />
      <div className="process-bg-noise" />

      {/* Floating Golden Dust Particles */}
      <div className="process-dust-layer">
        {particles.map((p) => (
          <div
            key={p.id}
            className="dust-particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Floating Floating Process Step Navigator */}
      <div className="floating-process-nav">
        {PROCESS_STEPS.map((s) => (
          <button
            key={s.phase}
            className={`nav-pill ${activeStageNav === s.phase ? 'active' : ''}`}
            onClick={() => scrollToStage(s.phase)}
          >
            <span className="nav-num">{s.phase}</span>
            <span className="nav-label">{s.title.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* 1. Cinematic Hero Section */}
      <section className="process-hero">
        <img
          src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1800"
          alt="Chikmagalur Coffee Estate Mist"
          className="hero-backdrop-img"
        />
        <div className="hero-scrim-dark" />

        <div className="hero-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-badge"
          >
            <Sparkles size={14} color="#d89a1e" />
            <span>The Chikmagaluru Process Journey</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="hero-title"
          >
            From Western Ghats Peaks <span>To Your Cup</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hero-tagline"
          >
            "Every single sip begins 3,400 feet above sea level in the misty cradle of Indian coffee."
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-actions"
          >
            <button className="btn-explore-journey" onClick={() => scrollToStage('01')}>
              Follow The Bean <ChevronDown size={18} />
            </button>
            <Link href="/product/instantcoffee" className="btn-shop-direct">
              Taste The Roast <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>

        <div className="hero-scroll-cue" onClick={() => scrollToStage('01')}>
          <span>Scroll to begin the journey</span>
          <ChevronDown className="scroll-arrow" size={20} />
        </div>
      </section>

      {/* 2. Terroir & High-Altitude Sourcing Section */}
      <section className="terroir-section">
        <div className="terroir-container">
          <div className="terroir-lead">
            <span className="terroir-pretitle">The Terroir of Chikmagalur</span>
            <h2 className="terroir-title">
              Why our coffee tastes unmistakably <span>different</span>.
            </h2>
            <p className="terroir-desc">
              Nestled in Karnataka’s Western Ghats, Chikmagalur is the historic birthplace of Indian coffee. The unique combination of volcanic red loam, heavy multi-tier shade canopy, and natural monsoon mist yields slow-maturing cherries packed with deep, non-bitter aromatics.
            </p>
          </div>

          <div className="terroir-cards-grid">
            {TERROIR_METRICS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="terroir-card">
                  <div className="terroir-card-icon">
                    <Icon size={24} color="#d89a1e" />
                  </div>
                  <div className="terroir-card-val">{item.value}</div>
                  <h4 className="terroir-card-title">{item.title}</h4>
                  <p className="terroir-card-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. The 6-Stage Interactive Narrative */}
      <section className="process-stages-wrap">
        {PROCESS_STEPS.map((step, idx) => (
          <ProcessStageCard key={step.phase} step={step} index={idx} />
        ))}
      </section>

      {/* 4. Flavor Compass & Sensory Profile */}
      <FlavorCompass />

      {/* 5. Sensory Finale & Steaming Cup CTA */}
      <section className="process-finale-section">
        <div className="finale-container">
          <div className="finale-badge">
            <Zap size={14} color="#d89a1e" />
            <span>Zero Compromise Specialty Coffee</span>
          </div>

          <h2 className="finale-title">
            The journey ends here.
            <span>The experience begins with you.</span>
          </h2>

          <p className="finale-desc">
            Experience the rich golden crema, bold cocoa depth, and smooth non-bitter finish of Janu Bhai Coffee.
          </p>

          {/* Steaming Coffee Cup Icon & Motion Animation */}
          <div className="steaming-cup-stage">
            <div className="steam-lines">
              <span className="steam-line line-1" />
              <span className="steam-line line-2" />
              <span className="steam-line line-3" />
            </div>
            <Coffee className="steaming-cup-icon" size={68} />
          </div>

          <div className="finale-cta-group">
            <Link href="/product/instantcoffee" className="btn-order-fresh-gold">
              Order Your Fresh Pack <ArrowRight size={18} />
            </Link>
            <Link href="/" className="btn-back-home">
              Explore All Blends
            </Link>
          </div>

          <div className="finale-trust-badges">
            <div className="trust-pill">
              <ShieldCheck size={16} color="#00e676" />
              <span>100% Pure Arabica</span>
            </div>
            <div className="trust-pill">
              <Check size={16} color="#00e676" />
              <span>No Preservatives or Added Sugars</span>
            </div>
            <div className="trust-pill">
              <Sparkles size={16} color="#d89a1e" />
              <span>Instant Dissolve in 3 Seconds</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
