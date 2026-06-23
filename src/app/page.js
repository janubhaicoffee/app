"use client";
import Image from "next/image";
import Link from "next/link";
import "./page.css";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const animatedRefs = useRef([]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    animatedRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !animatedRefs.current.includes(el)) {
      animatedRefs.current.push(el);
    }
  };

  return (
    <main className="main-content">

      {/* ===== HERO - SPLIT LAYOUT ===== */}
      <section className="hero">
        <div className="hero-bg-grain" />
        <div className="container hero-grid">
          <div className="hero-text">
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
          </div>

          <div className="hero-image">
            <div className="hero-image-frame">
              <Image
                src="/arsalanazad.png"
                alt="Arsalan Azad holding Janu Bhai Coffee"
                width={600}
                height={600}
                priority
                className="hero-portrait"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="trust-bar" ref={addRef}>
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
      </section>



      {/* ===== PROCESS - FARM TO CUP ===== */}
      <section className="process-section" id="process">
        <div className="container">
          <div className="section-intro animate-on-scroll" ref={addRef}>
            <h2 className="section-heading">From Farm to Cup</h2>
            <p className="section-desc">
              Every batch goes through four careful steps before it reaches you.
            </p>
          </div>

          <div className="process-row">
            <div className="process-card animate-on-scroll" ref={addRef}>
              <div className="process-card-img-wrap">
                <Image src="/handpicked.png" alt="Handpicked coffee cherries" width={300} height={300} className="process-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="process-card-content">
                <span className="process-card-num">01</span>
                <h3>Handpicked</h3>
                <p>Only the ripest cherries, selected by hand from our Chikmagaluru estate.</p>
              </div>
            </div>

            <div className="process-card animate-on-scroll" ref={addRef}>
              <div className="process-card-img-wrap">
                <Image src="/sun_dried.png" alt="Sun dried coffee beans" width={300} height={300} className="process-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="process-card-content">
                <span className="process-card-num">02</span>
                <h3>Sun Dried</h3>
                <p>Naturally sun dried over days to develop rich, deep flavour profiles.</p>
              </div>
            </div>

            <div className="process-card animate-on-scroll" ref={addRef}>
              <div className="process-card-img-wrap">
                <Image src="/expertly_roasted.png" alt="Expertly roasted coffee" width={300} height={300} className="process-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="process-card-content">
                <span className="process-card-num">03</span>
                <h3>Roasted</h3>
                <p>Small-batch roasted to perfection. Every batch tasted before it ships.</p>
              </div>
            </div>

            <div className="process-card animate-on-scroll" ref={addRef}>
              <div className="process-card-img-wrap">
                <Image src="/served_fresh.png" alt="Fresh coffee served" width={300} height={300} className="process-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="process-card-content">
                <span className="process-card-num">04</span>
                <h3>Delivered Fresh</h3>
                <p>Sealed and shipped within days of roasting. Freshness guaranteed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STORY BAND ===== */}
      <section className="story-section">
        <div className="container">
          <div className="story-layout animate-on-scroll" ref={addRef}>
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
          </div>
        </div>
      </section>

    </main>
  );
}
