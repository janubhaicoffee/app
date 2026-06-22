"use client";
import Image from "next/image";
import Link from "next/link";
import "./page.css";
import { useEffect, useRef } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function Home() {
  const animatedRefs = useRef([]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Scroll-triggered animations with IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
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

  const scrollToProcess = () => {
    document.getElementById("process")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="main-content">
      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        {/* Floating particles */}
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />

        <div className="hero-inner">
          <div className="hero-portrait">
            <Image
              src="/arsalanazad.png"
              alt="Arsalan Azad - Founder, Janu Bhai Coffee"
              width={250}
              height={250}
              priority
              className="portrait-img"
            />
          </div>

          <h1>
            From the Hills of
            <span className="accent-text">Chikmagaluru</span>
          </h1>
          <p className="hindi-sub">चिकमगलुरु की ताज़ा कॉफ़ी</p>
          <p className="hero-desc">
            Our coffee comes from the lush hills of Chikmagaluru, Karnataka —
            one of India&apos;s most celebrated coffee growing regions, known for
            its rich soil, perfect climate, and passion for quality.
          </p>

          <button className="btn-hero" onClick={scrollToProcess}>
            Explore Our Coffee
            <ArrowRight size={18} className="btn-hero-arrow" />
          </button>
        </div>

        <button className="scroll-indicator" onClick={scrollToProcess} aria-label="Scroll down">
          <span className="scroll-indicator-dot" />
        </button>
      </section>

      {/* ===== BRAND TRUST STRIP ===== */}
      <section className="trust-strip">
        <div className="trust-grid">
          <div className="trust-item" ref={addRef}>
            <span className="trust-icon">🌿</span>
            <span className="trust-label">100% Chikmagaluru Origin</span>
            <span className="trust-sublabel">Single estate, traceable source</span>
          </div>
          <div className="trust-item" ref={addRef}>
            <span className="trust-icon">🔥</span>
            <span className="trust-label">Small Batch Roasted</span>
            <span className="trust-sublabel">Freshly roasted in limited quantities</span>
          </div>
          <div className="trust-item" ref={addRef}>
            <span className="trust-icon">📦</span>
            <span className="trust-label">Farm Fresh to Door</span>
            <span className="trust-sublabel">Direct from plantation, no middlemen</span>
          </div>
        </div>
      </section>

      {/* ===== PROCESS SECTION — FROM FARM TO CUP ===== */}
      <section className="process-section" id="process">
        <div className="container">
          <div className="section-header animate-on-scroll" ref={addRef}>
            <span className="section-eyebrow">Our Journey</span>
            <h2 className="section-title">From Farm to Cup</h2>
          </div>

          <div className="process-timeline">
            <div className="process-step animate-on-scroll" ref={addRef}>
              <span className="process-step-number">1</span>
              <div className="process-img-wrapper">
                <Image
                  src="/handpicked.png"
                  alt="Handpicked coffee cherries"
                  width={300}
                  height={300}
                  className="process-img"
                />
              </div>
              <h3>Handpicked</h3>
              <p>Only ripe cherries are selected with care from our estate.</p>
            </div>

            <div className="process-step animate-on-scroll" ref={addRef}>
              <span className="process-step-number">2</span>
              <div className="process-img-wrapper">
                <Image
                  src="/sun_dried.png"
                  alt="Sun dried coffee beans"
                  width={300}
                  height={300}
                  className="process-img"
                />
              </div>
              <h3>Sun Dried</h3>
              <p>Naturally sun dried to lock in rich, deep flavour.</p>
            </div>

            <div className="process-step animate-on-scroll" ref={addRef}>
              <span className="process-step-number">3</span>
              <div className="process-img-wrapper">
                <Image
                  src="/expertly_roasted.png"
                  alt="Expertly roasted coffee"
                  width={300}
                  height={300}
                  className="process-img"
                />
              </div>
              <h3>Expertly Roasted</h3>
              <p>Roasted in small batches to bring out the best aroma.</p>
            </div>

            <div className="process-step animate-on-scroll" ref={addRef}>
              <span className="process-step-number">4</span>
              <div className="process-img-wrapper">
                <Image
                  src="/served_fresh.png"
                  alt="Freshly served coffee"
                  width={300}
                  height={300}
                  className="process-img"
                />
              </div>
              <h3>Served Fresh</h3>
              <p>Sealed for freshness and served for the perfect cup every time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="products-section" id="products">
        <div className="container">
          <div className="section-header animate-on-scroll" ref={addRef}>
            <span className="section-eyebrow">Shop</span>
            <h2 className="section-title">Our Coffee</h2>
          </div>

          <div className="products-grid">
            <div className="product-card animate-on-scroll" ref={addRef}>
              <div className="product-card-image">
                <Image
                  src="/product/100gram/100gramfront.png"
                  alt="Janu Bhai Instant Coffee 100g"
                  width={400}
                  height={400}
                  className="product-card-img"
                />
              </div>
              <div className="product-card-body">
                <span className="product-card-badge">☕ Bestseller</span>
                <h3 className="product-card-name">Instant Coffee</h3>
                <p className="product-card-desc">
                  Premium instant coffee made from 100% Chikmagaluru beans. Rich,
                  smooth, and ready in seconds.
                </p>
                <div className="product-card-footer">
                  <span className="product-card-price">
                    ₹199<span>/100g</span>
                  </span>
                  <Link href="/product/instantcoffee" className="btn-shop">
                    Shop Now
                    <ArrowRight size={16} className="btn-shop-arrow" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="product-card animate-on-scroll" ref={addRef}>
              <div className="product-card-image">
                <Image
                  src="/product/1000gram/1000gramfront.png"
                  alt="Janu Bhai Coffee Beans 1kg"
                  width={400}
                  height={400}
                  className="product-card-img"
                />
              </div>
              <div className="product-card-body">
                <span className="product-card-badge">🫘 Premium</span>
                <h3 className="product-card-name">Coffee Beans</h3>
                <p className="product-card-desc">
                  Whole roasted coffee beans from Chikmagaluru estates.
                  Freshly roasted, aromatic, and full-bodied.
                </p>
                <div className="product-card-footer">
                  <span className="product-card-price">
                    ₹799<span>/1kg</span>
                  </span>
                  <Link href="/product/coffeebeans" className="btn-shop">
                    Shop Now
                    <ArrowRight size={16} className="btn-shop-arrow" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STORY SECTION ===== */}
      <section className="story-section">
        <div className="container">
          <div className="story-inner animate-on-scroll" ref={addRef}>
            <span className="section-eyebrow">Our Story</span>
            <h2 className="section-title">Born in Chikmagaluru</h2>
            <p className="story-text">
              Every cup of <strong>Janu Bhai Coffee</strong> carries the legacy of
              Chikmagaluru&apos;s rich coffee heritage. From hand-picking the ripest
              cherries to small-batch roasting, we ensure that every step preserves
              the <strong>authentic flavour</strong> of India&apos;s finest coffee growing region.
            </p>
            <Link href="/process" className="btn-story">
              Our Process
              <ArrowRight size={18} className="btn-story-arrow" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
