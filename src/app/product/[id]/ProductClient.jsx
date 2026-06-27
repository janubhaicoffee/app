"use client";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Leaf, ShieldCheck, Sparkles,
  ShoppingCart, Zap, Repeat,
  Droplets, Wheat, Beef, Cookie, Activity, RefreshCw
} from "lucide-react";

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

function StockIndicator({ isOutOfStock, stock }) {
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

function getNutritionItems(product) {
  const n = product.nutrition;
  if (n && (n.energy || n.protein || n.fat || n.carbs || n.sugar !== undefined)) {
    return [
      { key: "Energy", value: n.energy ? `${n.energy} kcal` : "—", pct: Math.min(parseFloat(n.energy) / 5 || 0, 100), color: "#FFB300", icon: Zap },
      { key: "Protein", value: n.protein ? `${n.protein} g` : "—", pct: Math.min(parseFloat(n.protein) * 2 || 0, 100), color: "#5D4037", icon: Beef },
      { key: "Fat", value: n.fat ? `${n.fat} g` : "—", pct: Math.min(parseFloat(n.fat) * 1.5 || 0, 100), color: "#E65100", icon: Droplets },
      { key: "Carbs", value: n.carbs ? `${n.carbs} g` : "—", pct: Math.min(parseFloat(n.carbs) * 1.5 || 0, 100), color: "#8D6E63", icon: Wheat },
      { key: "Sugar", value: n.sugar !== undefined ? `${n.sugar} g` : "—", pct: parseFloat(n.sugar) * 4 || 0, color: "#B71C1C", icon: Cookie },
    ];
  }
  return [
    { key: "Energy", value: "354 kcal", pct: 18, color: "#FFB300", icon: Zap },
    { key: "Protein", value: "9 g", pct: 18, color: "#5D4037", icon: Beef },
    { key: "Fat", value: "14.4 g", pct: 22, color: "#E65100", icon: Droplets },
    { key: "Carbs", value: "58.7 g", pct: 22, color: "#8D6E63", icon: Wheat },
    { key: "Sugar", value: "0 g", pct: 0, color: "#B71C1C", icon: Cookie },
  ];
}

export default function ProductClient({ initialProduct }) {
  const [product, setProduct] = useState(initialProduct);
  const [isUpdating, setIsUpdating] = useState(false);
  const [subFrequency, setSubFrequency] = useState("weekly");
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("buy");
  const [showAddMoreHint, setShowAddMoreHint] = useState(false);

  const [showMobileBar, setShowMobileBar] = useState(true);
  const lastScrollY = useRef(0);
  const prevProductRef = useRef(initialProduct);

  // Full real-time sync: subscribe to ALL product changes
  useEffect(() => {
    if (!product) return;

    const channel = supabase
      .channel(`product-live-${product.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${product.id}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setProduct(null);
            return;
          }
          setIsUpdating(true);
          setProduct(prev => ({ ...prev, ...payload.new }));
          setTimeout(() => setIsUpdating(false), 600);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [product?.id]);

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

  if (!product) {
    return (
      <main className="product-page">
        <div className="container not-found">
          <h1>Product Not Available</h1>
          <p>This product is no longer available or has been removed.</p>
          <button className="btn-primary" onClick={() => router.push("/")}>
            Browse Coffee
          </button>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    const itemToAdd = {
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
    const itemToAdd = {
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
    const itemToAdd = {
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
    const itemToAdd = {
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

  const productStatus = product.status || "published";
  const isUnavailable = productStatus !== "published" || product.stock <= 0;

  const frontImage = product.image_url || "/product/100gram/100gramfront.png";
  const galleryImages = product.gallery_images || [];
  const backImage = galleryImages[0] || "/product/100gram/100gramback.png";

  const isOutOfStock = product.stock <= 0;
  const hasSalePrice = product.compare_at_price && product.compare_at_price > product.price;
  const discountPct = hasSalePrice ? Math.round((1 - product.price / product.compare_at_price) * 100) : 0;
  const nutritionItems = getNutritionItems(product);

  return (
    <>
      {isUpdating && (
        <div className="live-update-banner">
          <RefreshCw size={14} className="spin" />
          Product updated by admin
        </div>
      )}

      <main className="product-page">
        <div className="container">
          <div className="product-hero">
            <motion.div
              className="product-image-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="image-wrapper">
                <BlendBadge product={product} />
                {discountPct > 0 && (
                  <div className="sale-badge">-{discountPct}%</div>
                )}
                {isUnavailable && productStatus !== "published" && (
                  <div className="status-overlay">{productStatus === "draft" ? "Draft" : "Archived"}</div>
                )}
                <ImageGallery frontImage={frontImage} backImage={backImage} />
              </div>
            </motion.div>

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

              <motion.div
                className="product-price"
                key={product.price}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {hasSalePrice ? (
                  <>
                    <span className="price-value price-sale">₹{product.price}</span>
                    <span className="price-compare">₹{product.compare_at_price}</span>
                    <span className="price-discount">-{discountPct}%</span>
                  </>
                ) : (
                  <span className="price-value">₹{product.price}</span>
                )}
                <span className="price-tax">(incl. of all taxes)</span>
              </motion.div>

              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <StockIndicator
                  isOutOfStock={isOutOfStock}
                  stock={product.stock}
                />
                <span className="weight-text">
                  <strong>Weight:</strong> {product.weight}g
                </span>
              </div>

              <motion.div
                className="purchase-card"
                style={{ opacity: isUnavailable ? 0.5 : 1, pointerEvents: isUnavailable ? "none" : "auto" }}
              >
                {isUnavailable && productStatus !== "published" ? (
                  <div className="unavailable-notice">
                    <p>This product is currently not available for purchase.</p>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </motion.div>

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
                  {nutritionItems.map((item, i) => (
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
                <span className="mobile-sticky-amount">₹{product.price}</span>
                <span className="mobile-sticky-label">
                  {product.name}
                </span>
              </div>
              <button
                className="btn-primary mobile-sticky-btn"
                onClick={handleAddToCart}
                disabled={isUnavailable}
              >
                {isUnavailable ? "UNAVAILABLE" : "ADD TO CART"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .live-update-banner {
          position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
          background: var(--primary-color); color: #fff; text-align: center;
          padding: 6px; font-size: 0.8rem; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .sale-badge {
          position: absolute; top: 12px; right: 12px; z-index: 10;
          background: #c62828; color: #fff; padding: 4px 10px;
          border-radius: 100px; font-size: 0.78rem; font-weight: 800;
          box-shadow: 0 2px 8px rgba(198,40,40,0.3);
        }
        .status-overlay {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          background: rgba(0,0,0,0.7); color: #fff; padding: 8px 20px;
          border-radius: 8px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 2px; z-index: 10; font-size: 1.1rem;
        }
        .price-sale { color: #c62828; }
        .price-compare {
          text-decoration: line-through; color: #999; font-size: 1.1rem;
          margin-left: 8px; font-weight: 400;
        }
        .price-discount {
          display: inline-block; background: #ffebee; color: #c62828;
          padding: 2px 8px; border-radius: 100px; font-size: 0.78rem;
          font-weight: 800; margin-left: 8px;
        }
        .unavailable-notice {
          padding: 2rem; text-align: center; color: var(--text-secondary);
        }
        .unavailable-notice p { margin: 0; font-size: 1rem; }
      `}</style>
    </>
  );
}
