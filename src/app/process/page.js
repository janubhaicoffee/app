'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
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
} from 'lucide-react';
import './process.css';

// Animated Stats Counter component
function AnimatedCounter({ value, suffix = '', duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (!hasTriggered) return;

    const target = parseInt(value.replace(/,/g, ''), 10);
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

// Before/After interactive sorting comparison cards
function BeforeAfterCards() {
  return (
    <div className="sorting-grid-cards">
      {/* Defective Beans Card */}
      <div className="sorting-card rejected">
        <h4 className="sorting-card-title">
          <X size={20} /> Rejected Beans
        </h4>
        <ul className="sorting-list">
          <li className="sorting-list-item">
            <X size={16} color="#ff4d4d" style={{ marginTop: '4px' }} />
            <span>
              <strong>Broken & Chipped:</strong> Causes uneven roasting, leading to bitter and
              astringent flavors.
            </span>
          </li>
          <li className="sorting-list-item">
            <X size={16} color="#ff4d4d" style={{ marginTop: '4px' }} />
            <span>
              <strong>Insect Damaged:</strong> Contaminates the brew, creating flat, moldy
              off-notes.
            </span>
          </li>
          <li className="sorting-list-item">
            <X size={16} color="#ff4d4d" style={{ marginTop: '4px' }} />
            <span>
              <strong>Black/Deformed:</strong> Results in harsh chemical tastes and stale aromas.
            </span>
          </li>
        </ul>
      </div>

      {/* Janu Bhai AAA Grade Card */}
      <div className="sorting-card approved">
        <h4 className="sorting-card-title">
          <Check size={20} /> Janu Bhai AAA Beans
        </h4>
        <ul className="sorting-list">
          <li className="sorting-list-item">
            <Check size={16} color="#00e676" style={{ marginTop: '4px' }} />
            <span>
              <strong>Uniform Density:</strong> Yields a perfectly balanced roast and consistent cup
              profiles.
            </span>
          </li>
          <li className="sorting-list-item">
            <Check size={16} color="#00e676" style={{ marginTop: '4px' }} />
            <span>
              <strong>Symmetrical Sizing:</strong> Bold, high-density beans that capture complex
              aromatic oils.
            </span>
          </li>
          <li className="sorting-list-item">
            <Check size={16} color="#00e676" style={{ marginTop: '4px' }} />
            <span>
              <strong>Perfect Moisture (11%):</strong> Locks in the natural berry and chocolate
              undertones.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

const steps = [
  {
    phase: '01',
    tagline: 'Harvesting',
    title: 'Handpicked',
    desc: 'Only the ripest, deep red coffee cherries are selected by hand. Sourcing only at peak maturity ensures a naturally sweet, clean cup with none of the sourness of underripe fruit.',
    videoUrl:
      'https://player.vimeo.com/external/477169493.sd.mp4?s=d0db2d326f1dc7de99c5625ff11cc28f7311b5e2&profile_id=165&oauth2_token_id=57447761',
    icon: <Leaf size={24} />,
  },
  {
    phase: '02',
    tagline: 'Quality Control',
    title: 'Sorted by Hand',
    desc: 'Sorting is where quality is won or lost. Every single batch is manually sorted to remove broken, insect-damaged, or discolored beans. This meticulous process ensures a pure, premium taste in every brew.',
    videoUrl:
      'https://player.vimeo.com/external/416041071.sd.mp4?s=254641c8f1d5336e76cf08db5b94f061f2fde1c8&profile_id=165&oauth2_token_id=57447761',
    icon: <Filter size={24} />,
    isSorting: true,
  },
  {
    phase: '03',
    tagline: 'Dehydration',
    title: 'Sun Dried',
    desc: 'Our beans are spread evenly across elevated drying beds, basking under the natural heat of the sun. Hand-raked hourly for slow, uniform dehydration, this locks in the complex sugars and full-bodied fruitiness.',
    videoUrl:
      'https://player.vimeo.com/external/517616641.sd.mp4?s=1df0efb8b20ff44e83c7138b3f12440938b812b1&profile_id=165&oauth2_token_id=57447761',
    icon: <Sun size={24} />,
  },
  {
    phase: '04',
    tagline: 'Flavor Development',
    title: 'Expertly Roasted',
    desc: 'Roasted in state-of-the-art small-batch roasters. Our master roasters monitor temperature curves to caramelize coffee sugars perfectly, bringing out intense notes of cocoa, nuts, and sweet spices.',
    videoUrl:
      'https://player.vimeo.com/external/435674703.sd.mp4?s=74b6ff9bc0bf476f5712e529deec0b666a4bc27a&profile_id=165&oauth2_token_id=57447761',
    icon: <Flame size={24} />,
    isRoasting: true,
  },
  {
    phase: '05',
    tagline: 'Preservation',
    title: 'Freeze Dried',
    desc: 'Freshly brewed coffee is concentrated and instantly frozen to -40°C. In an absolute vacuum, water is sublimated, locking the aromatic coffee oils and delicate flavor compounds into rigid crystals.',
    videoUrl:
      'https://player.vimeo.com/external/554988719.sd.mp4?s=9108b3a0cc30fa392cc632279184518cdbc87f17&profile_id=165&oauth2_token_id=57447761',
    icon: <Snowflake size={24} />,
    isFreezeDry: true,
  },
  {
    phase: '06',
    tagline: 'Delivery',
    title: 'Served Fresh',
    desc: 'Airtight packaging ensures zero oxidation. From our estate roasting facility in Chikmagalur to your doorstep, we preserve every nuance of flavor so you experience coffee at its peak.',
    videoUrl:
      'https://player.vimeo.com/external/391586552.sd.mp4?s=33045860d5bfa780d68a9ad059fb27cf5c0cb4eb&profile_id=165&oauth2_token_id=57447761',
    icon: <Coffee size={24} />,
  },
];

function TimelineStep({ step, index }) {
  const containerRef = useRef(null);

  // Track scroll progress of this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Scale the video/media gently while scrolling
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1.01]);
  // Subtle text vertical parallax shift
  const yText = useTransform(scrollYProgress, [0, 0.5, 1], [30, 0, -30]);

  return (
    <div ref={containerRef} className="story-phase-block" id={`phase-${step.phase}`}>
      <div className="story-phase-container">
        {/* Typographic Phase Divider */}
        <div className="story-divider">
          <div className="story-divider-line"></div>
          <span className="story-divider-num">{step.phase}</span>
          <div className="story-divider-line"></div>
        </div>

        {/* Large Media Stage */}
        <div className="phase-visual-stage">
          <motion.video
            style={{ scale }}
            src={step.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="phase-visual-media"
          />
          <div className="phase-scrim-layer" />
        </div>

        {/* Detailed Info Column */}
        <motion.div style={{ y: yText }} className="phase-info-stage">
          <div className="phase-header-left">
            <span className="phase-tagline">{step.tagline}</span>
            <h2 className="phase-main-heading">{step.title}</h2>
            <div className="phase-icon-badge">{step.icon}</div>
          </div>

          <div className="phase-content-right">
            {step.isFreezeDry ? (
              <div className="frosted-glass-envelope" style={{ padding: '2rem' }}>
                <span className="frost-sparkle">❄ Sub-Zero Vacuum</span>
                <p className="phase-paragraph">{step.desc}</p>
              </div>
            ) : step.isRoasting ? (
              <div className="roast-glow-card" style={{ padding: '1rem 0' }}>
                <p className="phase-paragraph">{step.desc}</p>
                <div className="roast-glow-indicator">
                  <span className="roast-glow-pulse"></span>
                  Thermal Caramelization Active
                </div>
              </div>
            ) : (
              <p className="phase-paragraph">{step.desc}</p>
            )}

            {/* Render Before/After Quality Comparison cards in sorting phase */}
            {step.isSorting && <BeforeAfterCards />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ProcessPage() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate particle configuration client-side to prevent hydration mismatch
    const generated = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${15 + Math.random() * 15}s`,
    }));
    setParticles(generated);
  }, []);

  return (
    <main className="process-page">
      {/* Background visual overlays */}
      <div className="process-overlay-noise" />
      <div className="process-overlay-vignette" />

      {/* Floating dust particles */}
      <div className="process-dust-container">
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

      {/* Hero Section */}
      <section className="process-hero-container">
        <video
          src="https://player.vimeo.com/external/384761655.sd.mp4?s=38217cf2d4c0634a4135e98587d60920b784cf18&profile_id=165&oauth2_token_id=57447761"
          autoPlay
          muted
          loop
          playsInline
          className="hero-video-bg"
        />
        <div className="hero-scrim" />

        <div className="hero-content">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="hero-pre-title"
          >
            From the hills of
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="hero-main-title"
          >
            Chikmagaluru
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hero-quote-text"
          >
            "Every cup starts 3,400 feet above sea level."
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 1, duration: 1 }}
          onClick={() => {
            document
              .querySelector('.sourcing-intro-section')
              ?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="scroll-indicator-wrap"
        >
          <span className="scroll-indicator-text">Scroll to follow the bean's journey</span>
          <ChevronDown className="scroll-indicator-arrow" size={20} />
        </motion.div>
      </section>

      {/* Why Chikmagaluru Introduction & Sourcing Stats */}
      <section className="sourcing-intro-section">
        <div className="sourcing-intro-grid">
          <div>
            <h2 className="intro-lead-text">
              Every cup begins <span>3,400 feet</span> above sea level.
            </h2>
            <p className="intro-description">
              Nestled in the Western Ghats of India, Chikmagaluru is the birthplace of Indian
              coffee. The combination of rich volcanic soil, heavy canopy shade, and perfect
              microclimates results in beans that mature slowly, developing incredibly complex, deep
              profiles.
            </p>
            <a href="#phase-01" className="btn-follow-journey">
              Follow the Journey <ChevronDown size={16} />
            </a>
          </div>

          <div className="sourcing-stats-list">
            <div className="stat-counter-card">
              <div className="stat-number-wrapper">
                <AnimatedCounter value="1200" suffix="m" />
              </div>
              <div className="stat-label-text">Peak Elevation</div>
            </div>

            <div className="stat-counter-card">
              <div className="stat-number-wrapper">
                <AnimatedCounter value="100" suffix="%" />
              </div>
              <div className="stat-label-text">Arabica Sourcing</div>
            </div>

            <div className="stat-counter-card">
              <div className="stat-number-wrapper">AAA</div>
              <div className="stat-label-text">Quality Grade</div>
            </div>

            <div className="stat-counter-card">
              <div className="stat-number-wrapper">Single</div>
              <div className="stat-label-text">Estate Origin</div>
            </div>

            <div className="stat-counter-card" style={{ gridColumn: 'span 2' }}>
              <div className="stat-number-wrapper">Small Batch</div>
              <div className="stat-label-text">Fresh Roasting Style</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sourcing Narrative Phases */}
      <section className="storytelling-narrative">
        {steps.map((step, index) => (
          <TimelineStep key={step.phase} step={step} index={index} />
        ))}
      </section>

      {/* Emotional Ending Steaming Coffee CTA */}
      <section className="ending-emotional-section">
        <h2 className="ending-headline">
          The journey ends here.
          <span>The experience begins with you.</span>
        </h2>

        {/* Steaming Coffee Cup Animation */}
        <div className="ending-steaming-mug-container">
          <div className="steam-vapor-lines">
            <span className="steam-vapor"></span>
            <span className="steam-vapor"></span>
            <span className="steam-vapor"></span>
          </div>
          <Coffee className="steaming-coffee-cup" size={64} />
        </div>

        <Link href="/product/instantcoffee" className="shop-cta-btn-premium">
          Brew Yours <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
