'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Zap,
  Star,
  Check,
  Truck,
  Leaf,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  RotateCcw,
  Flame,
  Droplets,
  Clock,
  Calendar,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import './page.css';

const PACK_SIZES = [
  {
    id: '100g',
    variantId: 'v_thoda_100',
    name: '100g Starter Jar',
    weightLabel: '100g',
    price: 300,
    originalPrice: 399,
    servings: '~50 cups',
    costPerCup: '₹6 / cup',
    badge: 'Popular',
    image: '/product/100gram/100gramfront.png',
    backImage: '/product/100gram/100gramback.png',
    description: 'Perfect for daily morning coffee lovers & first-time tasters.',
  },
  {
    id: '1kg',
    variantId: 'v_thoda_1000',
    name: '1kg Value Pouch',
    weightLabel: '1kg (1000g)',
    price: 3000,
    originalPrice: 3990,
    servings: '~500 cups',
    costPerCup: '₹6 / cup',
    badge: 'Best Value (Save ₹990)',
    image: '/product/1000gram/1000gramfront.png',
    backImage: '/product/1000gram/1000gramback.png',
    description: 'Bulk economy pack for families, offices & heavy coffee drinkers.',
  },
];

const BREW_METHODS = [
  {
    id: 'hot',
    title: 'Velvety Hot Coffee',
    subtitle: 'Smooth & comforting',
    icon: Flame,
    steps: [
      'Add 1 tsp (2g) of Janu Bhai Coffee Powder to your cup.',
      'Pour 150ml of piping hot milk or boiled water.',
      'Stir vigorously for 3 seconds and watch rich crema form instantly.',
    ],
  },
  {
    id: 'iced',
    title: 'Barista Iced Latte',
    subtitle: 'Chilled & refreshing',
    icon: Droplets,
    steps: [
      'Dissolve 1.5 tsp of Janu Bhai Coffee in 30ml warm water or milk.',
      'Fill a tall glass with 4-5 fresh ice cubes and 150ml cold milk.',
      'Pour the coffee shot over milk and stir for an iced café indulgence.',
    ],
  },
  {
    id: 'black',
    title: 'Pure Black Espresso',
    subtitle: 'Bold & zero calorie',
    icon: Zap,
    steps: [
      'Take 1 tsp of Janu Bhai Coffee in an espresso or americano mug.',
      'Add 120ml of hot water (approx 85-90°C).',
      'Enjoy the pure aromatic notes of Chikmagalur estate Arabica.',
    ],
  },
];

const COMPARISON_ROWS = [
  {
    feature: 'Bean Sourcing',
    janubhai: '100% Single-Estate Chikmagalur Arabica',
    commercial: 'Low-grade mixed robusta & filler beans',
  },
  {
    feature: 'Processing Tech',
    janubhai: 'Cold micro-crystallization (Aroma Lock)',
    commercial: 'High-heat thermal spray drying (burnt aroma)',
  },
  {
    feature: 'Solubility',
    janubhai: 'Dissolves in 3s in Hot or Chilled milk/water',
    commercial: 'Leaves undissolved lumps in cold liquids',
  },
  {
    feature: 'Taste & Acidity',
    janubhai: 'Smooth caramel & chocolate notes, zero bitterness',
    commercial: 'Harsh, bitter, metallic aftertaste',
  },
  {
    feature: 'Energy Boost',
    janubhai: 'Clean, sustained 3.2% caffeine without crash',
    commercial: 'Sudden spike followed by jitters and energy crash',
  },
];

const REVIEWS = [
  {
    id: 1,
    name: 'Vikram Malhotra',
    city: 'New Delhi',
    rating: 5,
    tag: 'Verified Buyer',
    text: 'Janu Bhai has completely replaced my expensive espresso machine on busy mornings. The aroma when you open the jar is pure Chikmagalur heaven. Dissolves in seconds and tastes like a fresh café brew.',
  },
  {
    id: 2,
    name: 'Anjali Sharma',
    city: 'Bengaluru',
    rating: 5,
    tag: 'Verified Buyer',
    text: 'Being from Karnataka, I am extremely particular about my coffee. This Thoda Hard blend has the exact rich body and zero bitter aftertaste. Iced latte with oat milk is unbelievable with this powder!',
  },
  {
    id: 3,
    name: 'Rohan Mehta',
    city: 'Mumbai',
    rating: 5,
    tag: 'Verified Buyer',
    text: 'The 1kg pack is an absolute lifesaver for our office. Fast shipping, airtight seal, and every single cup has a thick velvety froth. 10/10 recommendation.',
  },
];

const FAQS = [
  {
    q: 'How many cups does one 100g pack make?',
    a: 'Each 100g jar yields approximately 50 rich cups of coffee (using the recommended 2g teaspoon per serving). The 1kg pouch makes 500+ cups.',
  },
  {
    q: 'Does it dissolve easily in cold milk for iced coffee?',
    a: 'Yes! Our micro-crystallized freeze-dried extraction process ensures 100% instant solubility in cold milk, oat milk, or chilled water within 3 seconds without clumps.',
  },
  {
    q: 'What is the blend ratio and origin?',
    a: 'Our signature "Thoda Hard" instant coffee is crafted with 70% single-estate Arabica from high-altitude plantations in Chikmagalur, Karnataka, blended with 30% fine roasted chicory for a thick, velvety body.',
  },
  {
    q: 'How fast is shipping across India?',
    a: 'All orders are dispatched within 24 hours. Metro deliveries typically arrive in 2-3 business days, and rest of India in 3-5 business days. Tracking details are sent via SMS/Email.',
  },
];

export default function Home() {
  const [selectedPackId, setSelectedPackId] = useState('100g');
  const [quantity, setQuantity] = useState(1);
  const [activeBrewTab, setActiveBrewTab] = useState('hot');
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [addedToast, setAddedToast] = useState(false);
  const [viewSide, setViewSide] = useState('front'); // 'front' | 'back'
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  const heroRef = useRef(null);
  const router = useRouter();
  const { addToCart, clearCart } = useCart();

  const selectedPack = PACK_SIZES.find((p) => p.id === selectedPackId) || PACK_SIZES[0];

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setIsScrolledPastHero(rect.bottom < 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    const itemToAdd = {
      id: 'instantcoffee',
      variant_id: selectedPack.variantId,
      name: `Janu Bhai Instant Coffee (Thoda Hard - ${selectedPack.weightLabel})`,
      price: selectedPack.price,
      image: selectedPack.image,
      quantity: quantity,
    };
    addToCart(itemToAdd);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    clearCart();
    const itemToAdd = {
      id: 'instantcoffee',
      variant_id: selectedPack.variantId,
      name: `Janu Bhai Instant Coffee (Thoda Hard - ${selectedPack.weightLabel})`,
      price: selectedPack.price,
      image: selectedPack.image,
      quantity: quantity,
    };
    addToCart(itemToAdd);
    router.push('/checkout?mode=standard');
  };

  return (
    <div className="home-d2c-wrapper">
      {/* 1. HERO PRODUCT SECTION */}
      <section className="d2c-hero-section" ref={heroRef}>
        <div className="d2c-hero-bg-glow" />
        <div className="container d2c-hero-grid">
          {/* Hero Left: Product Visuals */}
          <div className="d2c-hero-visual-col">
            <div className="d2c-product-stage">
              <div className="d2c-badge-floating origin-badge">
                <Leaf size={14} />
                <span>Chikmagalur Single Estate</span>
              </div>

              <div className="d2c-product-image-wrap">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedPack.id + viewSide}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="d2c-main-image-container"
                  >
                    <Image
                      src={viewSide === 'front' ? selectedPack.image : selectedPack.backImage}
                      alt={selectedPack.name}
                      width={480}
                      height={480}
                      priority
                      className="d2c-hero-product-img"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* View toggle (Front / Nutrition Back) */}
                <div className="d2c-view-toggle">
                  <button
                    className={`d2c-view-btn ${viewSide === 'front' ? 'active' : ''}`}
                    onClick={() => setViewSide('front')}
                  >
                    Front Pack
                  </button>
                  <button
                    className={`d2c-view-btn ${viewSide === 'back' ? 'active' : ''}`}
                    onClick={() => setViewSide('back')}
                  >
                    Nutrition & Details
                  </button>
                </div>
              </div>

              {/* Trust Pill under image */}
              <div className="d2c-floating-stat-card">
                <div className="d2c-rating-chip">
                  <Star size={14} className="star-filled" />
                  <span className="rating-num">4.9</span>
                  <span className="rating-count">(1,850+ Verified Ratings)</span>
                </div>
                <div className="d2c-speed-chip">
                  <Clock size={14} />
                  <span>Ready in 3s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right: Direct Purchase & Highlights */}
          <div className="d2c-hero-details-col">
            <div className="d2c-brand-pill">
              <Sparkles size={13} />
              <span>PREMIUM INSTANT COFFEE</span>
            </div>

            <h1 className="d2c-main-title">
              REAL INSTANT COFFEE.
              <br />
              <span className="d2c-highlight-text">NO COMPROMISE.</span>
            </h1>

            <p className="d2c-lead-description">
              Artisan roasted in small batches from Chikmagalur estates. Micro-crystallized to
              dissolve in 3 seconds in hot or chilled milk with a rich, velvety crema.
            </p>

            {/* Pack Size Selector */}
            <div className="d2c-pack-selector-card">
              <div className="d2c-selector-header">
                <span className="d2c-selector-title">Select Pack Size</span>
                <span className="d2c-delivery-note">
                  <Truck size={13} /> Free delivery across India
                </span>
              </div>

              <div className="d2c-pack-options-grid">
                {PACK_SIZES.map((pack) => {
                  const isSelected = selectedPackId === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      className={`d2c-pack-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedPackId(pack.id)}
                    >
                      {pack.badge && (
                        <span
                          className={`d2c-pack-badge ${pack.id === '1kg' ? 'badge-save' : ''}`}
                        >
                          {pack.badge}
                        </span>
                      )}
                      <div className="d2c-pack-info">
                        <span className="d2c-pack-weight">{pack.weightLabel}</span>
                        <span className="d2c-pack-servings">
                          {pack.servings} ({pack.costPerCup})
                        </span>
                      </div>
                      <div className="d2c-pack-pricing">
                        <span className="d2c-price-current">
                          ₹{pack.price.toLocaleString('en-IN')}
                        </span>
                        <span className="d2c-price-original">₹{pack.originalPrice}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quantity & Buy Buttons */}
              <div className="d2c-purchase-action-group">
                <div className="d2c-qty-picker">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <button type="button" className="d2c-btn-buy-now" onClick={handleBuyNow}>
                  <Zap size={18} />
                  <span>Buy Now • ₹{(selectedPack.price * quantity).toLocaleString('en-IN')}</span>
                </button>

                <button
                  type="button"
                  className={`d2c-btn-add-cart ${addedToast ? 'added' : ''}`}
                  onClick={handleAddToCart}
                >
                  {addedToast ? (
                    <>
                      <Check size={18} /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} /> Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Quick Trust Badges */}
              <div className="d2c-hero-trust-row">
                <div className="d2c-trust-mini">
                  <Check size={14} className="check-icon" /> 100% Arabica Blend
                </div>
                <div className="d2c-trust-mini">
                  <Check size={14} className="check-icon" /> Zero Artificial Preservatives
                </div>
                <div className="d2c-trust-mini">
                  <Check size={14} className="check-icon" /> Dissolves in Hot / Cold Milk
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST HIGHLIGHT BAR */}
      <section className="d2c-trust-strip">
        <div className="container d2c-trust-strip-inner">
          <div className="d2c-strip-item">
            <Leaf size={22} className="d2c-strip-icon" />
            <div>
              <h4>Chikmagalur Estates</h4>
              <p>High altitude canopy-grown beans</p>
            </div>
          </div>
          <div className="d2c-strip-item">
            <Sparkles size={22} className="d2c-strip-icon" />
            <div>
              <h4>Micro-Crystallized</h4>
              <p>Locked in aroma, 3s instant dissolve</p>
            </div>
          </div>
          <div className="d2c-strip-item">
            <ShieldCheck size={22} className="d2c-strip-icon" />
            <div>
              <h4>Zero Burnt Bitterness</h4>
              <p>Clean medium roast flavor profile</p>
            </div>
          </div>
          <div className="d2c-strip-item">
            <Truck size={22} className="d2c-strip-icon" />
            <div>
              <h4>Fast Dispatch</h4>
              <p>Direct to your doorstep pan-India</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ROAST SCIENCE & BLEND STORY */}
      <section className="d2c-story-section">
        <div className="container d2c-story-grid">
          <div className="d2c-story-content">
            <span className="d2c-section-eyebrow">The Craft Behind Janu Bhai</span>
            <h2 className="d2c-section-title">
              Why Regular Instant Coffee Tastes Bitter & How We Fixed It: <br />
              <span className="d2c-highlight-text">And Why Ours Doesn’t.</span>
            </h2>
            <p className="d2c-story-para">
              Most mass-market commercial instant coffees use cheap robusta filler beans roasted at
              extreme thermal temperatures, burning away natural aromatics and leaving a harsh,
              metallic aftertaste.
            </p>
            <p className="d2c-story-para">
              Janu Bhai takes single-estate Arabica cherries from Chikmagalur, Karnataka. We
              medium-roast them at 210-220°C to activate natural Maillard caramelization, followed
              by gentle sub-zero freeze drying. The result is pure, smooth coffee crystals that
              produce a luscious crema the moment they meet milk or hot water.
            </p>

            <div className="d2c-specs-grid">
              <div className="d2c-spec-card">
                <span className="d2c-spec-val">70%</span>
                <span className="d2c-spec-lbl">Estate Arabica</span>
              </div>
              <div className="d2c-spec-card">
                <span className="d2c-spec-val">30%</span>
                <span className="d2c-spec-lbl">Rich Chicory Body</span>
              </div>
              <div className="d2c-spec-card">
                <span className="d2c-spec-val">3.2%</span>
                <span className="d2c-spec-lbl">Clean Caffeine Boost</span>
              </div>
              <div className="d2c-spec-card">
                <span className="d2c-spec-val">0g</span>
                <span className="d2c-spec-lbl">Added Sugars / Fillers</span>
              </div>
            </div>
          </div>

          <div className="d2c-story-media">
            <div className="d2c-story-card-glass">
              <Image
                src="/expertly_roasted.png"
                alt="Expertly Roasted Janu Bhai Coffee"
                width={500}
                height={500}
                className="d2c-story-img"
              />
              <div className="d2c-glass-footer">
                <h4>Small Batch Roast Master Guarantee</h4>
                <p>Every batch freshly sealed in airtight packaging.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPARISON MATRIX */}
      <section className="d2c-comparison-section">
        <div className="container">
          <div className="d2c-section-center-head">
            <span className="d2c-section-eyebrow">The Clear Difference</span>
            <h2 className="d2c-section-title">Janu Bhai vs Commercial Instant Brands</h2>
          </div>

          <div className="d2c-table-wrapper">
            <table className="d2c-comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="th-highlight">Janu Bhai Instant Coffee</th>
                  <th>Mass Market Brands</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx}>
                    <td className="td-feature">{row.feature}</td>
                    <td className="td-highlight">
                      <Check size={16} className="td-check" />
                      <span>{row.janubhai}</span>
                    </td>
                    <td className="td-commercial">{row.commercial}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. 3-SECOND BREW GUIDE */}
      <section className="d2c-brew-section">
        <div className="container">
          <div className="d2c-section-center-head">
            <span className="d2c-section-eyebrow">Zero Equipment Required</span>
            <h2 className="d2c-section-title">How To Brew in 3 Seconds</h2>
            <p className="d2c-section-desc">
              No French press, moka pot, or filter paper needed. Just instant café perfection.
            </p>
          </div>

          {/* Brew Tabs */}
          <div className="d2c-brew-tabs">
            {BREW_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  type="button"
                  className={`d2c-brew-tab-btn ${activeBrewTab === method.id ? 'active' : ''}`}
                  onClick={() => setActiveBrewTab(method.id)}
                >
                  <Icon size={18} />
                  <div>
                    <span className="tab-title">{method.title}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Brew Steps */}
          {(() => {
            const currentMethod =
              BREW_METHODS.find((m) => m.id === activeBrewTab) || BREW_METHODS[0];
            return (
              <div className="d2c-brew-steps-card">
                <div className="d2c-steps-grid">
                  {currentMethod.steps.map((step, index) => (
                    <div key={index} className="d2c-step-item">
                      <div className="d2c-step-number">{index + 1}</div>
                      <p className="d2c-step-text">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 5.5. COFFEE MASTERCLASSES & EVENTS SHOWCASE */}
      <section className="d2c-events-showcase-section" style={{ padding: '60px 0', background: 'radial-gradient(circle at center, rgba(46,30,20,0.4) 0%, transparent 80%)' }}>
        <div className="container">
          <div className="d2c-section-center-head" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
            <span className="d2c-section-eyebrow" style={{ color: '#d4a359', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Sparkles size={16} /> Brand Activations & Culture
            </span>
            <h2 className="d2c-section-title" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f7e7ce', margin: '8px 0 10px' }}>
              Experience Coffee Beyond the Cup
            </h2>
            <p className="d2c-section-desc" style={{ color: '#a89f91', fontSize: '0.95rem', margin: 0 }}>
              Join our weekend cupping masterclasses, latte art workshops, and intimate acoustic brew pop-ups in New Delhi.
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link
              href="/events"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #d4a359 0%, #b8863b 100%)',
                color: '#120b06',
                fontWeight: 700,
                padding: '12px 28px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '0.92rem',
                boxShadow: '0 8px 24px rgba(212,163,89,0.3)',
              }}
            >
              <Calendar size={18} /> View Upcoming Events & RSVP →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED REVIEWS */}
      <section className="d2c-reviews-section">
        <div className="container">
          <div className="d2c-section-center-head">
            <div className="d2c-stars-row">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" className="star-filled" />
              ))}
            </div>
            <h2 className="d2c-section-title">Loved By 10,000+ Coffee Drinkers</h2>
            <p className="d2c-section-desc">Real feedback from verified buyers across India</p>
          </div>

          <div className="d2c-reviews-grid">
            {REVIEWS.map((rev) => (
              <div key={rev.id} className="d2c-review-card">
                <div className="d2c-rev-header">
                  <div className="d2c-rev-stars">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" className="star-filled" />
                    ))}
                  </div>
                  <span className="d2c-rev-tag">{rev.tag}</span>
                </div>
                <p className="d2c-rev-text">“{rev.text}”</p>
                <div className="d2c-rev-author">
                  <strong>{rev.name}</strong>
                  <span>{rev.city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQS */}
      <section className="d2c-faq-section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="d2c-section-center-head">
            <span className="d2c-section-eyebrow">Frequently Asked</span>
            <h2 className="d2c-section-title">Got Questions?</h2>
          </div>

          <div className="d2c-faq-accordion">
            {FAQS.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div key={index} className={`d2c-faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="d2c-faq-trigger"
                    onClick={() => setExpandedFaq(isOpen ? -1 : index)}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={18} className={`faq-chevron ${isOpen ? 'rotate' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="d2c-faq-body">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. BOTTOM PURCHASE BANNER */}
      <section className="d2c-bottom-cta-banner">
        <div className="container d2c-bottom-cta-inner">
          <div>
            <h3>Ready for your finest daily cup?</h3>
            <p>Order your 100g Starter Jar (₹300) or 1kg Value Pouch (₹3,000) today.</p>
          </div>
          <div className="d2c-bottom-cta-actions">
            <button type="button" className="d2c-btn-buy-now" onClick={handleBuyNow}>
              <Zap size={18} /> Buy Now
            </button>
            <button type="button" className="d2c-btn-add-cart" onClick={handleAddToCart}>
              <ShoppingBag size={18} /> Add to Cart
            </button>
          </div>
        </div>
      </section>

      {/* 9. STICKY MOBILE BOTTOM BAR (on scroll) */}
      <AnimatePresence>
        {isScrolledPastHero && (
          <motion.div
            className="d2c-mobile-sticky-bar"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.25 }}
          >
            <div className="d2c-sticky-info">
              <span className="d2c-sticky-name">{selectedPack.weightLabel}</span>
              <span className="d2c-sticky-price">₹{selectedPack.price}</span>
            </div>
            <div className="d2c-sticky-actions">
              <button
                type="button"
                className="d2c-sticky-cart-btn"
                onClick={handleAddToCart}
                aria-label="Add to cart"
              >
                <ShoppingBag size={18} />
              </button>
              <button type="button" className="d2c-sticky-buy-btn" onClick={handleBuyNow}>
                <Zap size={16} /> Buy Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
