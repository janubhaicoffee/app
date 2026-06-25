"use client";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import { getMatchingVariant } from "@/actions/variants";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Leaf, ShieldCheck, Sparkles,
  ShoppingCart, Zap, Repeat,
  Droplets, Wheat, Beef, Cookie, Activity
} from "lucide-react";

const INTENSITY_COLORS = {
  mild: { bg: "#81C784", label: "Mild" },
  medium: { bg: "#FFB300", label: "Medium" },
  strong: { bg: "#E65100", label: "Strong" },
  extreme: { bg: "#B71C1C", label: "Extreme" },
};

function getIntensityColor(intensity) {
  if (intensity <= 25) return INTENSITY_COLORS.mild;
  if (intensity <= 50) return INTENSITY_COLORS.medium;
  if (intensity <= 75) return INTENSITY_COLORS.strong;
  return INTENSITY_COLORS.extreme;
}

function getBlendData(product) {
  const a = product.arabica_pct || 0;
  const c = product.chicory_pct || 0;
  const r = product.robusta_pct || 0;
  const total = a + c + r;
  if (total === 0) return null;
  const components = [];
  if (a > 0) components.push({ name: "Arabica", pct: a, color: "#5D4037" });
  if (c > 0) components.push({ name: "Chicory", pct: c, color: "#8D6E63" });
  if (r > 0) components.push({ name: "Robusta", pct: r, color: "#3E2723" });
  const isPure = components.length === 1 && components[0].pct === 100;
  return { components, isPure, total };
}

function BlendBadge({ product }) {
  const blend = getBlendData(product);
  if (!blend) return null;

  if (blend.isPure) {
    return (
      <motion.div
        className="blend-badge blend-badge-pure"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Sparkles size={14} />
        100% {blend.components[0].name}
      </motion.div>
    );
  }

  const totalWidth = 100;
  return (
    <motion.div
      className="blend-badge"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {blend.components.map((c, i) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            {i > 0 && <span style={{ color: "var(--text-secondary)", fontSize: "0.7rem" }}>·</span>}
            <span
              className="blend-badge-dot"
              style={{ background: c.color }}
            />
            <span>{c.pct}% {c.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AnimatedDescription({ text }) {
  if (!text) return null;
  const words = text.split(" ");
  return (
    <motion.p
      className="animated-desc"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="desc-word"
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}

const NUTRITION_ITEMS = [
  { key: "Energy", value: "354 kcal", pct: 18, color: "#FFB300", icon: Zap },
  { key: "Protein", value: "9 g", pct: 18, color: "#5D4037", icon: Beef },
  { key: "Fat", value: "14.4 g", pct: 22, color: "#E65100", icon: Droplets },
  { key: "Carbs", value: "58.7 g", pct: 22, color: "#8D6E63", icon: Wheat },
  { key: "Sugar", value: "0 g", pct: 0, color: "#B71C1C", icon: Cookie },
];

function NutritionCard({ item, index }) {
  const Icon = item.icon;
  return (
    <motion.div
      className="nutrition-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="nutrition-card-header">
        <span className="nutrition-card-name">
          <Icon size={14} style={{ marginRight: 6, verticalAlign: "middle", color: item.color }} />
          {item.key}
        </span>
        <span className="nutrition-card-value" style={{ color: item.color }}>
          {item.value}
        </span>
      </div>
      <NutritionBar pct={item.pct} color={item.color} />
    </motion.div>
  );
}

function NutritionBar({ pct, color }) {
  const barRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="nutrition-bar" ref={barRef}>
      <div
        className="nutrition-bar-fill"
        style={{
          width: inView ? `${pct}%` : "0%",
          background: color,
          transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
          transitionDelay: "0.2s",
        }}
      />
    </div>
  );
}

function StockIndicator({ isOutOfStock, stock, isVariantActive }) {
  let dotClass, textClass, label;
  if (isOutOfStock) {
    dotClass = "stock-dot-out";
    textClass = "stock-text-out";
    label = "Out of Stock";
  } else if (stock <= 5) {
    dotClass = "stock-dot-low";
    textClass = "stock-text-low";
    label = `Only ${stock} left!`;
  } else {
    dotClass = "stock-dot-instock";
    textClass = "stock-text-instock";
    label = `${stock} in stock`;
  }

  return (
    <motion.div className="stock-indicator" layout>
      <motion.span
        className={`stock-dot ${dotClass}`}
        animate={stock <= 5 && !isOutOfStock ? { scale: [1, 1.3, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={label}
          className={`stock-text ${textClass}`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}

const TRUST_ITEMS = [
  { icon: Truck, label: "Free shipping over ₹499" },
  { icon: Leaf, label: "Fresh roasted to order" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Sparkles, label: "100% pure ingredients" },
];

export default function ProductClient({ initialProduct }) {
  const [product] = useState(initialProduct);
  const [subFrequency, setSubFrequency] = useState("weekly");
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("buy");
  const [showAddMoreHint, setShowAddMoreHint] = useState(false);

  const [activeVariant, setActiveVariant] = useState(null);
  const [allVariants, setAllVariants] = useState([]);

  const [productStock, setProductStock] = useState(product ? product.stock : 0);
  const [activeVariantStock, setActiveVariantStock] = useState(0);

  const [showMobileBar, setShowMobileBar] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!product) return;
    let active = true;

    async function fetchVariant() {
      const res = await getMatchingVariant(product.id, 50, 50);
      if (active) {
        if (res.variant) {
          setActiveVariant(res.variant);
          setActiveVariantStock(res.variant.stock);
        }
        if (res.allVariants) {
          setAllVariants(res.allVariants);
        }
      }
    }
    fetchVariant();

    return () => { active = false; };
  }, [product]);

  useEffect(() => {
    if (!product) return;

    const channel = supabase
      .channel(`realtime-scarcity-${product.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products', filter: `id=eq.${product.id}` },
        (payload) => {
          setProductStock(payload.new.stock);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'coffee_variants' },
        (payload) => {
          if (activeVariant && payload.new.id === activeVariant.id) {
            setActiveVariantStock(payload.new.stock);
          }
          setAllVariants(prev =>
            prev.map(v => v.id === payload.new.id ? { ...v, stock: payload.new.stock } : v)
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [product, activeVariant]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 200) {
        setShowMobileBar(false);
      } else {
        setShowMobileBar(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSelectVariant = (variant) => {
    setActiveVariant(variant);
    setActiveVariantStock(variant.stock);
  };

  if (!product) {
    return (
      <main className="product-page">
        <div className="container not-found">
          <h1>Product Not Found</h1>
          <p>The coffee you are looking for is currently unavailable or doesn&apos;t exist.</p>
          <button className="btn-primary" onClick={() => router.push("/")}>
            Return Home
          </button>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    const itemToAdd = activeVariant
      ? {
          id: activeVariant.id,
          name: `${product.name} (${activeVariant.name})`,
          price: activeVariant.price,
          image: product.image_url || "/product/100gram/100gramfront.png",
          quantity: 1,
          variantSlug: activeVariant.slug,
          isVariant: true,
        }
      : {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image_url || "/product/100gram/100gramfront.png",
          quantity: 1,
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
          isVariant: true,
        }
      : {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image_url || "/product/100gram/100gramfront.png",
          quantity: 1,
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
          subscription: subFrequency,
        }
      : {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image_url || "/product/100gram/100gramfront.png",
          quantity: 1,
          subscription: subFrequency,
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
          isGift: true,
        }
      : {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image_url || "/product/100gram/100gramfront.png",
          quantity: 1,
          isGift: true,
        };
    addToCart(itemToAdd);
    router.push("/checkout?mode=gift");
  };

  const frontImage = product.image_url || "/product/100gram/100gramfront.png";
  const backImage = "/product/100gram/100gramback.png";

  const isOutOfStock = activeVariant ? activeVariantStock <= 0 : productStock <= 0;
  const displayStock = activeVariant ? activeVariantStock : productStock;
  const activePrice = activeVariant ? activeVariant.price : product.price;

  return (
    <>
      <main className="product-page">
        <div className="container">
          <div className="product-hero">
            {/* Image Section */}
            <motion.div
              className="product-image-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="image-wrapper">
                <BlendBadge product={product} />
                <ImageGallery frontImage={frontImage} backImage={backImage} />
              </div>
            </motion.div>

            {/* Details Section */}
            <motion.div
              className="product-details-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div>
                <h1 className="product-name">
                  {product.name}
                  <span className="product-name-accent" />
                </h1>
              </div>

              <AnimatedDescription text={product.description} />

              {/* Price */}
              <motion.div
                className="product-price"
                key={activePrice}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="price-value">₹{activePrice}</span>
                <span className="price-tax">(incl. of all taxes)</span>
              </motion.div>

              {/* Variant Pills */}
              {allVariants.length > 1 && (
                <div className="variant-section">
                  <span className="variant-label">Choose your strength</span>
                  <div className="variant-pills">
                    {allVariants.map((v) => {
                      const intensity = getIntensityColor(v.intensity);
                      const isActive = activeVariant?.id === v.id;
                      return (
                        <motion.button
                          key={v.id}
                          className={`variant-pill ${isActive ? "active" : ""}`}
                          onClick={() => handleSelectVariant(v)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span
                            className="variant-intensity"
                            style={{ background: intensity.bg }}
                          >
                            {intensity.label[0]}
                          </span>
                          {v.name}
                          <span className="variant-pill-price">₹{v.price}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock + Weight */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <StockIndicator
                  isOutOfStock={isOutOfStock}
                  stock={displayStock}
                  isVariantActive={!!activeVariant}
                />
                <span className="weight-text">
                  <strong>Weight:</strong> {product.weight}g
                </span>
              </div>

              {/* Purchase Module */}
              <motion.div
                className="purchase-card"
                style={{ opacity: isOutOfStock ? 0.5 : 1, pointerEvents: isOutOfStock ? "none" : "auto" }}
              >
                <div className="purchase-tabs">
                  {["buy", "subscribe", "gift"].map((tab) => (
                    <button
                      key={tab}
                      className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      <span className="tab-btn-icon">
                        {tab === "buy" && <ShoppingCart size={14} />}
                        {tab === "subscribe" && <Repeat size={14} />}
                        {tab === "gift" && <Zap size={14} />}
                      </span>
                      {tab === "buy" ? "Buy Once" : tab === "subscribe" ? "Subscribe" : "Gift"}
                    </button>
                  ))}
                </div>

                <div className="tab-content">
                  <AnimatePresence mode="wait">
                    {activeTab === "buy" && (
                      <motion.div
                        key="buy"
                        className="tab-pane"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3>Buy Once</h3>
                        <p>One-time purchase. Delivered fresh to your doorstep.</p>
                        <div className="actions-row">
                          <div className="btn-cart-wrap">
                            <button className="btn-secondary" onClick={handleAddToCart}>
                              ADD TO CART
                            </button>
                            {showAddMoreHint && (
                              <span className="add-more-hint">
                                Tap again to add more!
                              </span>
                            )}
                          </div>
                          <button className="btn-primary" onClick={handleBuyNow}>
                            BUY NOW
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "subscribe" && (
                      <motion.div
                        key="subscribe"
                        className="tab-pane"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3>Subscribe & Save</h3>
                        <p>Never run out of coffee. Auto-delivered, cancel anytime.</p>
                        <div className="actions-row">
                          <select
                            className="sub-freq-select"
                            value={subFrequency}
                            onChange={(e) => setSubFrequency(e.target.value)}
                          >
                            <option value="weekly">Deliver Weekly</option>
                            <option value="monthly">Deliver Monthly</option>
                          </select>
                        </div>
                        <button
                          className="btn-primary"
                          onClick={handleSubscribe}
                          style={{ width: "100%", marginTop: 12 }}
                        >
                          SUBSCRIBE NOW
                        </button>
                      </motion.div>
                    )}

                    {activeTab === "gift" && (
                      <motion.div
                        key="gift"
                        className="tab-pane"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3>Send as a Gift</h3>
                        <p>Ship directly to a friend with a claim token. No address needed!</p>
                        <button
                          className="btn-secondary"
                          onClick={handleGift}
                          style={{ width: "100%" }}
                        >
                          GIFT NOW
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Trust Strip */}
              <motion.div
                className="trust-strip"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {TRUST_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    className="trust-item"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </motion.div>
                ))}
              </motion.div>

              {/* Nutrition */}
              <motion.div
                className="nutrition-section"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="nutrition-header">
                  <Activity size={20} color="var(--text-secondary)" />
                  <h2>Nutritional Facts</h2>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                    (Per 100g)
                  </span>
                </div>
                <div className="nutrition-grid">
                  {NUTRITION_ITEMS.map((item, i) => (
                    <NutritionCard key={item.key} item={item} index={i} />
                  ))}
                  <div className="nutrition-footer">
                    No Artificial Colors · No Artificial Flavours · 100% Indian
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <AnimatePresence>
        {showMobileBar && (
          <motion.div
            className="mobile-sticky-bar"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-sticky-inner">
              <div className="mobile-sticky-price">
                <span className="mobile-sticky-amount">₹{activePrice}</span>
                <span className="mobile-sticky-label">
                  {activeVariant ? activeVariant.name : product.name}
                </span>
              </div>
              <button
                className="btn-primary mobile-sticky-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
