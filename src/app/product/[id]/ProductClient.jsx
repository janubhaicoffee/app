"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import { getMatchingVariant } from "@/actions/variants";
import { verifyMysteryDrop } from "@/actions/mystery";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

// Spring-based custom slider wrapping a native accessibility input
function SpringSlider({ label, value, onChange, min = 1, max = 100 }) {
  const [isFocused, setIsFocused] = useState(false);
  const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100;
  
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      
      {/* Visual Slider Track Wrapper */}
      <div style={{ position: 'relative', width: '100%', height: '24px', display: 'flex', alignItems: 'center' }}>
        {/* Track Background */}
        <div style={{ 
          position: 'absolute', 
          left: 0, 
          right: 0, 
          height: '6px', 
          borderRadius: '3px', 
          background: 'rgba(28, 22, 19, 0.15)' 
        }} />
        
        {/* Elastic Track Progress Fill */}
        <motion.div 
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          style={{ 
            position: 'absolute', 
            left: 0, 
            height: '6px', 
            borderRadius: '3px', 
            background: 'var(--text-primary)' 
          }} 
        />
        
        {/* Elastic Slider Handle */}
        <motion.div 
          initial={false}
          animate={{ left: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 450, damping: 22 }}
          style={{ 
            position: 'absolute', 
            width: '18px', 
            height: '18px', 
            borderRadius: '50%', 
            background: 'var(--text-primary)', 
            border: '2px solid #FFFDF9',
            boxShadow: isFocused ? '0 0 0 3px rgba(139, 92, 26, 0.6), 0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.3)',
            x: '-50%',
            cursor: 'pointer',
            zIndex: 2
          }} 
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.9 }}
        />

        {/* Hidden Native Input Overlay for Perfect Touch Target & Accessibility */}
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            opacity: 0, 
            cursor: 'pointer', 
            zIndex: 3 
          }}
        />
      </div>
    </div>
  );
}

export default function ProductClient({ initialProduct }) {
  const [product] = useState(initialProduct);
  const [subFrequency, setSubFrequency] = useState("weekly");
  const { addToCart, clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState("buy");
  const [showAddMoreHint, setShowAddMoreHint] = useState(false);

  // Feature 1: Brew Blueprint Selector States
  const [sleepDebt, setSleepDebt] = useState(() => {
    const sd = searchParams?.get("sleep_debt");
    return sd ? Number(sd) : 50;
  });
  const [workload, setWorkload] = useState(() => {
    const wl = searchParams?.get("workload");
    return wl ? Number(wl) : 50;
  });
  const [activeVariant, setActiveVariant] = useState(null);
  const [allVariants, setAllVariants] = useState([]);
  const [calculatedIntensity, setCalculatedIntensity] = useState(50);

  // Feature 6: Realtime Stock Scarcity Tickers
  const [productStock, setProductStock] = useState(product ? product.stock : 0);
  const [activeVariantStock, setActiveVariantStock] = useState(0);

  // Feature 9: Mystery Drop Decrypter States
  const [mysteryToken, setMysteryToken] = useState("");
  const [revealedDrop, setRevealedDrop] = useState(null);
  const [verifyingMystery, setVerifyingMystery] = useState(false);
  const [mysteryError, setMysteryError] = useState("");

  // Recalculate caffeine intensity and fetch matching variant on slider changes
  useEffect(() => {
    if (!product) return;
    let active = true;

    async function fetchVariant() {
      const res = await getMatchingVariant(product.id, sleepDebt, workload);
      if (active) {
        if (res.variant) {
          setActiveVariant(res.variant);
          setActiveVariantStock(res.variant.stock);
        }
        if (res.allVariants) {
          setAllVariants(res.allVariants);
        }
        if (res.calculatedIntensity) {
          setCalculatedIntensity(res.calculatedIntensity);
        }
      }
    }
    fetchVariant();

    // Silently update browser URL Search Params to reflect configuration state
    const params = new URLSearchParams(searchParams);
    params.set("sleep_debt", sleepDebt.toString());
    params.set("workload", workload.toString());
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);

    return () => {
      active = false;
    };
  }, [sleepDebt, workload, product, pathname, searchParams]);

  // Subscribe to real-time Supabase Postgres changes on products and variants stock
  useEffect(() => {
    if (!product) return;

    const channel = supabase
      .channel(`realtime-scarcity-${product.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products', filter: `id=eq.${product.id}` },
        (payload) => {
          console.log("Realtime product stock changed:", payload.new);
          setProductStock(payload.new.stock);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'coffee_variants' },
        (payload) => {
          console.log("Realtime variant stock changed:", payload.new);
          if (activeVariant && payload.new.id === activeVariant.id) {
            setActiveVariantStock(payload.new.stock);
          }
          setAllVariants(prev => 
            prev.map(v => v.id === payload.new.id ? { ...v, stock: payload.new.stock } : v)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product, activeVariant]);

  if (!product) {
    return (
      <main className="product-page">
        <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h1>Product Not Found</h1>
          <p>The coffee you are looking for is currently unavailable or doesn&apos;t exist.</p>
          <button className="btn-primary" onClick={() => router.push('/')} style={{ marginTop: '1rem' }}>Return Home</button>
        </div>
      </main>
    );
  }

  const handleVerifyMystery = async (e) => {
    e.preventDefault();
    if (!mysteryToken) return;
    setVerifyingMystery(true);
    setMysteryError("");
    try {
      // Retrieve session token securely on client side if available
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session ? session.access_token : null;

      const res = await verifyMysteryDrop(mysteryToken, accessToken);
      if (res.error) {
        setMysteryError(res.error);
      } else {
        setRevealedDrop(res.drop);
        if (res.pointsAwarded) {
          alert("Congratulations! Physical packaging token verified. You have unlocked +50 Lore Points! 🏆");
        } else {
          alert("Token verified! Log in to save discovery points in your portal.");
        }
      }
    } catch (err) {
      setMysteryError("An error occurred during verification.");
    } finally {
      setVerifyingMystery(false);
    }
  };

  const handleAddToCart = () => {
    const itemToAdd = activeVariant 
      ? { 
          id: activeVariant.id, 
          name: `${product.name} (${activeVariant.name})`, 
          price: activeVariant.price, 
          image: product.image_url || "/product/100gram/100gramfront.png", 
          quantity: 1,
          variantSlug: activeVariant.slug,
          isVariant: true 
        }
      : { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          image: product.image_url || "/product/100gram/100gramfront.png", 
          quantity: 1 
        };
    addToCart(itemToAdd);
    setShowAddMoreHint(true);
    setTimeout(() => setShowAddMoreHint(false), 3000);
  };

  const handleBuyNow = () => {
    clearCart();
    const itemToAdd = activeVariant 
      ? { 
          id: activeVariant.id, 
          name: `${product.name} (${activeVariant.name})`, 
          price: activeVariant.price, 
          image: product.image_url || "/product/100gram/100gramfront.png", 
          quantity: 1,
          variantSlug: activeVariant.slug,
          isVariant: true 
        }
      : { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          image: product.image_url || "/product/100gram/100gramfront.png", 
          quantity: 1 
        };
    addToCart(itemToAdd);
    router.push("/checkout?mode=standard");
  };

  const handleSubscribe = () => {
    clearCart();
    const itemToAdd = activeVariant 
      ? { 
          id: activeVariant.id, 
          name: `${product.name} (${activeVariant.name})`, 
          price: activeVariant.price, 
          image: product.image_url || "/product/100gram/100gramfront.png", 
          quantity: 1,
          variantSlug: activeVariant.slug,
          isVariant: true,
          subscription: subFrequency 
        }
      : { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          image: product.image_url || "/product/100gram/100gramfront.png", 
          quantity: 1,
          subscription: subFrequency 
        };
    addToCart(itemToAdd);
    router.push(`/checkout?mode=subscription&frequency=${subFrequency}`);
  };

  const handleGift = () => {
    clearCart();
    const itemToAdd = activeVariant 
      ? { 
          id: activeVariant.id, 
          name: `${product.name} (${activeVariant.name})`, 
          price: activeVariant.price, 
          image: product.image_url || "/product/100gram/100gramfront.png", 
          quantity: 1,
          variantSlug: activeVariant.slug,
          isVariant: true,
          isGift: true 
        }
      : { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          image: product.image_url || "/product/100gram/100gramfront.png", 
          quantity: 1,
          isGift: true 
        };
    addToCart(itemToAdd);
    router.push("/checkout?mode=gift");
  };

  const frontImage = product.image_url || "/product/100gram/100gramfront.png";
  const backImage = "/product/100gram/100gramback.png";

  const isOutOfStock = activeVariant ? activeVariantStock <= 0 : productStock <= 0;
  const activePrice = activeVariant ? activeVariant.price : product.price;

  return (
    <main className="product-page">
      <div className="container product-container">
        {/* Gallery */}
        <div className="product-image-section">
          <div className="premium-image-container">
            <ImageGallery frontImage={frontImage} backImage={backImage} />
          </div>
        </div>

        {/* Details */}
        <div className="product-details-section">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-subtitle">{product.description || "Premium Coffee Blend"}</p>
          
          <div className="price-tag">₹ {activePrice} <span className="mrp-text">(Incl. of all taxes)</span></div>

          <div style={{ margin: '15px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <strong>Stock:</strong>{" "}
            <div style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', height: '1.2rem' }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={isOutOfStock ? "out" : activeVariant ? activeVariantStock : productStock}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ 
                    display: 'inline-block', 
                    color: isOutOfStock ? 'var(--accent-red)' : 'green', 
                    fontWeight: 'bold' 
                  }}
                >
                  {isOutOfStock 
                    ? "Out of Stock" 
                    : activeVariant 
                      ? `${activeVariantStock} packets left!` 
                      : `${productStock} packets left!`
                  }
                </motion.span>
              </AnimatePresence>
            </div>
            <br/>
            <strong>Weight:</strong> {product.weight}g
          </div>

          {/* Feature 1: Brew Blueprint Customizer Widget */}
          {allVariants.length > 0 && (
            <div className="brew-blueprint-section vintage-border" style={{ marginTop: '20px', marginBottom: '20px', padding: '20px', background: 'rgba(237, 227, 208, 0.2)', borderRadius: '6px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>☕</span> BREW BLUEPRINT SELECTOR
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                Slide to adjust your sleep debt and workload agenda. We will dynamically select the exact coffee blend matches.
              </p>
              
              <SpringSlider 
                label="Sleep Deprivation Scale" 
                value={sleepDebt} 
                onChange={setSleepDebt} 
                min={1} 
                max={100} 
              />

              <SpringSlider 
                label="Workload Intensity" 
                value={workload} 
                onChange={setWorkload} 
                min={1} 
                max={100} 
              />

              <div style={{ background: 'var(--bg-color-dark)', padding: '10px 15px', borderRadius: '4px', textAlign: 'center', marginBottom: '15px', fontWeight: '800', fontSize: '0.9rem', border: '1px dashed var(--text-primary)' }}>
                Target Caffeine Intensity: <span style={{ color: 'var(--accent-red)' }}>{calculatedIntensity}%</span>
              </div>

              {activeVariant && (
                <div style={{ background: '#FFFDF9', border: '1px solid var(--border-color)', padding: '15px', borderRadius: '6px' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: '0 0 6px 0', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                    <span>Matched: {activeVariant.name}</span>
                    <span style={{ fontSize: '0.75rem', background: 'var(--accent-red)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                      Intensity {activeVariant.intensity}/100
                    </span>
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                    {activeVariant.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', fontSize: '1rem', color: 'var(--primary-color)', borderTop: '1px solid #f1ece1', paddingTop: '10px' }}>
                    <span>Price: ₹ {activeVariant.price}</span>
                    
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Stock:{" "}
                      <div style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', height: '1.1rem' }}>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={activeVariantStock}
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -15, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ 
                              display: 'inline-block', 
                              color: activeVariantStock > 0 ? (activeVariantStock < 10 ? 'var(--accent-red)' : 'green') : 'red',
                              fontWeight: 'bold'
                            }}
                          >
                            {activeVariantStock > 0 ? `${activeVariantStock} available` : "Out of Stock"}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button 
                className="btn-secondary" 
                onClick={() => {
                  const url = `${window.location.origin}${pathname}?sleep_debt=${sleepDebt}&workload=${workload}`;
                  navigator.clipboard.writeText(url);
                  alert("Copied custom Brew Blueprint configuration link to clipboard! 📋");
                }}
                style={{ width: '100%', marginTop: '15px', padding: '10px', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: '800' }}
              >
                SHARE CONFIG LINK 🔗
              </button>
            </div>
          )}

          {/* Feature 9: Cryptographically Hidden Mystery Drops Panel */}
          <div className="mystery-drop-section vintage-border" style={{ 
            marginTop: '20px', 
            marginBottom: '20px', 
            padding: '20px', 
            background: '#1C1613', 
            color: '#fff', 
            borderRadius: '6px', 
            overflow: 'visible', // Avoid clipping glow/sheen overflow
            perspective: '1000px' // Crucial for realistic 3D transitions
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔮</span> MYSTERY DROP DECRYPTER
            </h3>
            
            <AnimatePresence mode="wait">
              {!revealedDrop ? (
                <motion.div
                  key="locked-drop"
                  initial={{ rotateY: 0, opacity: 1 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeIn" }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <p style={{ fontSize: '0.85rem', color: '#D7CCC8', marginBottom: '15px', lineHeight: '1.4' }}>
                    Have physical packaging from a secret roastery batch? Enter the cryptographically sealed token code here to decrypt its hidden single-origin profile.
                  </p>
                  
                  <form onSubmit={handleVerifyMystery} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. SECRET-ARABICA-XX"
                      value={mysteryToken}
                      onChange={(e) => setMysteryToken(e.target.value)}
                      style={{ flex: 1, padding: '10px', background: '#2E231F', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.9rem' }}
                    />
                    <button 
                      type="submit" 
                      disabled={verifyingMystery}
                      className="btn-primary"
                      style={{ padding: '10px 15px', fontSize: '0.85rem', margin: 0 }}
                    >
                      {verifyingMystery ? "DECRYPTING..." : "DECRYPT"}
                    </button>
                  </form>
                  {mysteryError && (
                    <p style={{ color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: '8px', fontWeight: 'bold' }}>⚠️ {mysteryError}</p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="revealed-drop"
                  initial={{ rotateY: 90, opacity: 0, scale: 0.95 }}
                  animate={{ 
                    rotateY: 0, 
                    opacity: 1, 
                    scale: 1,
                    boxShadow: [
                      '0 0 15px rgba(212, 175, 55, 0.3)',
                      '0 0 35px rgba(212, 175, 55, 0.6)',
                      '0 0 15px rgba(212, 175, 55, 0.3)'
                    ]
                  }}
                  exit={{ rotateY: -90, opacity: 0, scale: 0.95 }}
                  transition={{ 
                    boxShadow: {
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut"
                    },
                    default: {
                      type: "spring", 
                      stiffness: 150, 
                      damping: 18 
                    }
                  }}
                  className="holographic-reveal"
                  style={{
                    background: 'linear-gradient(135deg, #2E1A11 0%, #150905 100%)',
                    border: '2px solid var(--accent-gold)',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Shimmering Light Sweep Overlay */}
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '-150%',
                      width: '60%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.15), rgba(255, 255, 255, 0.25), rgba(255, 215, 0, 0.15), transparent)',
                      transform: 'skewX(-25deg)',
                      pointerEvents: 'none',
                    }}
                    animate={{
                      left: ['-150%', '150%']
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatDelay: 2.5,
                      duration: 1.8,
                      ease: "easeInOut"
                    }}
                  />

                  <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: '10px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>✨ SECURED BEANS DECRYPTED ✨</span>
                  <h4 style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                    {revealedDrop.name}
                  </h4>
                  <hr style={{ border: 0, borderTop: '1px solid var(--accent-gold)', margin: '12px 0', opacity: 0.3 }} />
                  
                  <div style={{ textAlign: 'left', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', color: '#EFEBE9' }}>
                    <p style={{ margin: 0 }}><strong>Decrypted Origin:</strong> {revealedDrop.origin}</p>
                    <p style={{ margin: 0 }}><strong>Roast Characteristics:</strong> {revealedDrop.roastLevel}</p>
                    <p style={{ margin: 0 }}><strong>Tasting Notes:</strong> {revealedDrop.tastingNotes}</p>
                  </div>
                  
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setRevealedDrop(null);
                      setMysteryToken("");
                    }}
                    style={{ 
                      background: 'transparent', 
                      border: '1px solid #D7CCC8', 
                      color: '#D7CCC8', 
                      width: '100%', 
                      marginTop: '20px', 
                      padding: '8px', 
                      fontSize: '0.8rem',
                      position: 'relative',
                      zIndex: 5
                    }}
                  >
                    RESET DECRYPTER
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="purchase-modules" style={{ opacity: isOutOfStock ? 0.5 : 1, pointerEvents: isOutOfStock ? 'none' : 'auto' }}>
            <div className="purchase-tabs-container">
              <div className="tabs-header">
                <button className={`tab-btn ${activeTab === "buy" ? "active" : ""}`} onClick={() => setActiveTab("buy")}>Buy Once</button>
                <button className={`tab-btn ${activeTab === "subscribe" ? "active" : ""}`} onClick={() => setActiveTab("subscribe")}>Subscribe Now</button>
                <button className={`tab-btn ${activeTab === "gift" ? "active" : ""}`} onClick={() => setActiveTab("gift")}>Gift</button>
              </div>
              
              <div className="tab-content">
                {activeTab === "buy" && (
                  <div className="tab-pane">
                    <div className="actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button className="btn-secondary" onClick={handleAddToCart} style={{ flex: 1, position: 'relative' }}>
                        ADD TO CART
                        {showAddMoreHint && (
                          <span style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'var(--bg-color)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap', opacity: 1, transition: 'opacity 0.3s' }}>
                            Tap again to add more packets!
                          </span>
                        )}
                      </button>
                      <button className="btn-primary buy-btn" onClick={handleBuyNow} style={{ flex: 1 }}>BUY NOW</button>
                    </div>
                  </div>
                )}

                {activeTab === "subscribe" && (
                  <div className="tab-pane">
                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary-color)', display: 'flex', justifyContent: 'space-between' }}>Subscribe Now</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Never run out of coffee again. Auto-delivered to your door.</p>
                    <div className="actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <select value={subFrequency} onChange={(e) => setSubFrequency(e.target.value)} style={{ padding: '0.8rem', background: '#fff', color: 'var(--text-primary)', border: '2px solid var(--text-primary)', borderRadius: '4px', flex: 1 }}>
                        <option value="weekly">Deliver Weekly</option>
                        <option value="monthly">Deliver Monthly</option>
                      </select>
                      <button className="btn-primary" onClick={handleSubscribe} style={{ width: '100%', marginTop: '0.5rem' }}>SUBSCRIBE NOW</button>
                    </div>
                  </div>
                )}

                {activeTab === "gift" && (
                  <div className="tab-pane" style={{ textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Send as a Gift 🎁</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Ship directly to a friend with a claim token (no address needed!).</p>
                    <button className="btn-secondary" onClick={handleGift} style={{ width: '100%' }}>GIFT NOW</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="nutrition-table">
            <h3>Nutritional Facts (Per 100g)</h3>
            <table>
              <tbody>
                <tr><td>Energy</td><td>354 kcal</td></tr>
                <tr><td>Protein</td><td>9 g</td></tr>
                <tr><td>Fat</td><td>14.4 g</td></tr>
                <tr><td>Carbohydrate</td><td>58.7 g</td></tr>
                <tr><td>Sugar</td><td>0 g</td></tr>
              </tbody>
            </table>
            <p className="nutrition-footer">No Artificial Colors - No Artificial Flavours - 100% Indian</p>
          </div>
        </div>
      </div>
    </main>
  );
}
