"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Menu, 
  ShoppingBag, 
  Heart, 
  Star, 
  ArrowRight, 
  X, 
  ChevronRight, 
  Play,
  RotateCcw,
  Plus
} from "lucide-react";

// Recipes dataset (No references to "freezedried" or "0 chicory")
const recipes = [
  {
    id: "espresso-cappuccino",
    name: "Espresso Cappuccino",
    category: "cappuccinos",
    image: "/cappuccino_cup.png",
    rating: "4.8",
    reviews: "1,245",
    desc: "A rich, classic Italian cappuccino made with premium coffee, warm steamed milk, and a thick, luxurious layer of frothed milk foam. Finished with a light dusting of cocoa.",
    ingredients: [
      "2 tsp Janu Bhai Coffee",
      "60ml hot water",
      "120ml whole milk (steamed & frothed)",
      "Cocoa powder (for dusting)"
    ],
    steps: [
      "Dissolve 2 tsp of Janu Bhai Coffee in 60ml of hot water to create a strong double-espresso base.",
      "Steam and froth 120ml of whole milk in a pitcher until it forms a thick, dense foam.",
      "Pour the espresso base into a warm ceramic cup.",
      "Gently pour the steamed milk over the espresso, holding back the foam with a spoon.",
      "Spoon the remaining thick foam on top and dust lightly with cocoa powder."
    ]
  },
  {
    id: "caffe-mocha",
    name: "Caffe Mocha Americano",
    category: "espressos",
    image: "/mocha_cup.png",
    rating: "4.9",
    reviews: "958",
    desc: "A decadent combination of strong espresso, dark chocolate syrup, and silky steamed milk, topped with a velvety microfoam layer. A perfect sweet treat.",
    ingredients: [
      "2 tsp Janu Bhai Coffee",
      "60ml hot water",
      "1 tbsp premium dark chocolate syrup",
      "120ml milk (steamed)",
      "Chocolate shavings (optional)"
    ],
    steps: [
      "Mix dark chocolate syrup with strong coffee base in the bottom of a cup.",
      "Pour hot water and stir until fully combined.",
      "Pour in steamed milk slowly to create a smooth layer.",
      "Top with a thin layer of foam and garnish with chocolate shavings."
    ]
  },
  {
    id: "iced-oat-latte",
    name: "Iced Oat Milk Latte",
    category: "lattes",
    image: "/iced_latte.png",
    rating: "4.7",
    reviews: "2,130",
    desc: "A cooling, refreshing iced latte featuring cold oat milk and ice cubes drowned in a bold double-espresso shot. Naturally sweet and smooth.",
    ingredients: [
      "2 tsp Janu Bhai Coffee",
      "50ml warm water",
      "150ml cold oat milk",
      "Ice cubes",
      "1 tsp maple syrup (optional)"
    ],
    steps: [
      "Prepare strong espresso shot by mixing Janu Bhai Coffee and warm water.",
      "Fill a glass with ice cubes and pour in cold oat milk.",
      "Drizzle maple syrup if desired.",
      "Slowly pour the espresso shot over the oat milk for a beautiful layered look."
    ]
  },
  {
    id: "classic-affogato",
    name: "Classic Affogato",
    category: "espressos",
    image: "/affogato_cup.png",
    rating: "4.9",
    reviews: "782",
    desc: "A simple yet luxurious dessert. A single scoop of premium vanilla bean ice cream drowned in a hot, concentrated double-espresso shot.",
    ingredients: [
      "1.5 tsp Janu Bhai Coffee",
      "40ml hot water",
      "1 scoop premium vanilla bean ice cream"
    ],
    steps: [
      "Place a scoop of vanilla bean ice cream in a cold dessert bowl.",
      "Mix Janu Bhai Coffee with hot water in a small pitcher.",
      "Right before serving, pour the hot coffee shot over the ice cream scoop."
    ]
  },
  {
    id: "chikmagalur-shakerato",
    name: "Chikmagalur Shakerato",
    category: "iced",
    image: "/shakerato_cup.png",
    rating: "4.8",
    reviews: "560",
    desc: "A bold, icy espresso shot shaken vigorously with brown sugar and ice until a thick, frothy crema forms on top. Served in a chilled glass.",
    ingredients: [
      "2 tsp Janu Bhai Coffee",
      "60ml warm water",
      "2 tsp brown sugar",
      "4-5 ice cubes"
    ],
    steps: [
      "Combine coffee, warm water, and brown sugar in a shaker.",
      "Add ice cubes and shake vigorously for 15-20 seconds.",
      "Strain into a chilled glass, allowing the thick foam to form the top layer."
    ]
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState(recipes[0]);
  const [activeSize, setActiveSize] = useState("M");
  const [favorites, setFavorites] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const { addToCart, getCartCount, clearCart } = useCart();
  const router = useRouter();

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter recipes
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || recipe.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle favorite
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Trigger Add to Cart for the coffee variant used
  const handleAddToCart = (e) => {
    e.stopPropagation();
    const itemToAdd = {
      id: "instantcoffee",
      variant_id: "v_thoda_100",
      name: "Janu Bhai Instant Coffee (Thoda Hard - 100g)",
      price: 300,
      image: "/product/100gram/100gramfront.png",
      quantity: 1,
    };
    addToCart(itemToAdd);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    clearCart();
    const itemToAdd = {
      id: "instantcoffee",
      variant_id: "v_thoda_100",
      name: "Janu Bhai Instant Coffee (Thoda Hard - 100g)",
      price: 300,
      image: "/product/100gram/100gramfront.png",
      quantity: 1,
    };
    addToCart(itemToAdd);
    router.push("/checkout?mode=standard");
  };

  const categories = [
    { id: "all", name: "All" },
    { id: "espressos", name: "Espresso" },
    { id: "cappuccinos", name: "Cappuccino" },
    { id: "lattes", name: "Lattes" },
    { id: "iced", name: "Iced Coffee" }
  ];

  return (
    <div className="app-container">
      {/* Background radial soft light */}
      <div className="app-bg-glow" />

      {/* Main split dashboard (desktop) / single layout (mobile) */}
      <div className="app-viewport">
        {/* LEFT PANEL / MAIN LISTING */}
        <div className="app-left-panel">
          {/* App Header */}
          <header className="app-header">
            <button className="app-icon-btn" onClick={() => setIsMenuOpen(true)} aria-label="Open navigation menu">
              <Menu size={22} />
            </button>
            <h1 className="app-logo">Janu Bhai Coffeehouse</h1>
            <Link href="/cart" className="app-icon-btn relative-badge" aria-label="Shopping Cart">
              <ShoppingBag size={22} />
              {getCartCount() > 0 && (
                <span className="app-cart-badge">{getCartCount()}</span>
              )}
            </Link>
          </header>

          <div className="app-scroll-content">
            {/* Welcoming Banner */}
            <div className="app-welcome-section">
              <h2>Select your brew.</h2>
              <p>Curated recipes made with premium Janu Bhai coffee.</p>
            </div>

            {/* Search Bar */}
            <div className="app-search-wrapper">
              <div className="app-search-input-box">
                <Search size={18} className="app-search-icon" />
                <input 
                  type="text" 
                  placeholder="Search coffee recipes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="search-clear-btn" onClick={() => setSearchQuery("")}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="app-categories-scroll">
              <div className="app-categories-container">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`category-pill ${activeCategory === cat.id ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipes Grid */}
            <div className="app-recipes-grid">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <div 
                    key={recipe.id}
                    className={`recipe-card-premium ${selectedRecipe?.id === recipe.id && !isMobile ? "active" : ""}`}
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      if (isMobile) setIsDetailOpen(true);
                    }}
                  >
                    <div className="recipe-card-image-container">
                      <Image 
                        src={recipe.image} 
                        alt={recipe.name} 
                        width={200} 
                        height={200}
                        className="recipe-card-img-topview"
                        priority
                      />
                    </div>
                    <div className="recipe-card-details">
                      <h3 className="recipe-card-title">{recipe.name}</h3>
                      <div className="recipe-card-rating">
                        <Star size={12} fill="currentColor" stroke="none" />
                        <span>{recipe.rating}</span>
                      </div>
                      <div className="recipe-card-footer">
                        <span className="recipe-card-price">₹300</span>
                        <button 
                          className="recipe-card-add-btn"
                          onClick={(e) => handleAddToCart(e)}
                          aria-label="Add Janu Bhai Coffee to cart"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-recipes-found">
                  <p>No recipes match your search.</p>
                </div>
              )}
            </div>
            
            {/* Special For You Banner */}
            <div className="special-for-you-section">
              <h3 className="special-title">Special for you</h3>
              <div 
                className="special-card"
                onClick={() => {
                  setSelectedRecipe(recipes[3]); // Affogato
                  if (isMobile) setIsDetailOpen(true);
                }}
              >
                <div className="special-card-left">
                  <h4>Barista's Choice</h4>
                  <h3>Classic Affogato</h3>
                  <p>Vanilla bean ice cream drowned in hot espresso.</p>
                </div>
                <div className="special-card-right">
                  <Image src="/affogato_cup.png" alt="Affogato" width={100} height={100} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation Cue for Mobile Feel */}
          <nav className="app-bottom-nav">
            <button className="nav-nav-btn active" onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}>
              <span className="nav-nav-icon">●</span>
              <span className="nav-nav-text">Home</span>
            </button>
            <button className="nav-nav-btn" onClick={() => toggleFavorite(selectedRecipe.id, { stopPropagation: () => {} })}>
              <Heart size={20} fill={favorites.includes(selectedRecipe.id) ? "var(--accent-gold-mustard)" : "none"} color={favorites.includes(selectedRecipe.id) ? "var(--accent-gold-mustard)" : "currentColor"} />
              <span className="nav-nav-text">Favorite</span>
            </button>
            <button className="nav-nav-btn" onClick={() => router.push("/cart")}>
              <div className="relative-badge">
                <ShoppingBag size={20} />
                {getCartCount() > 0 && <span className="app-cart-badge-nav">{getCartCount()}</span>}
              </div>
              <span className="nav-nav-text">Cart</span>
            </button>
          </nav>
        </div>

        {/* RIGHT PANEL / DETAIL VIEW (DESKTOP) */}
        {!isMobile && selectedRecipe && (
          <div className="app-right-panel">
            <div className="detail-view-container">
              {/* Top View Coffee Display */}
              <div className="detail-coffee-display">
                <div className="detail-coffee-circle-bg">
                  <Image 
                    src={selectedRecipe.image} 
                    alt={selectedRecipe.name}
                    width={320}
                    height={320}
                    className="detail-coffee-large-img"
                    priority
                  />
                </div>
              </div>

              {/* Detail Content Card */}
              <div className="detail-content-card">
                <div className="detail-content-header">
                  <div>
                    <h2 className="detail-coffee-name">{selectedRecipe.name}</h2>
                    <div className="detail-coffee-meta">
                      <div className="detail-stars">
                        <Star size={14} fill="currentColor" stroke="none" />
                        <span>{selectedRecipe.rating} <span className="reviews-count">({selectedRecipe.reviews})</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="detail-price-box">
                    <span className="detail-price-label">Janu Bhai Coffee</span>
                    <span className="detail-price-amount">₹300</span>
                  </div>
                </div>

                {/* Size Selector */}
                <div className="detail-size-selector">
                  <span className="selector-title">Select Serving Size</span>
                  <div className="size-options-group">
                    {["S", "M", "L"].map((size) => (
                      <button 
                        key={size}
                        className={`size-btn ${activeSize === size ? "active" : ""}`}
                        onClick={() => setActiveSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="detail-divider" />

                {/* Description */}
                <div className="detail-description-section">
                  <h3>Recipe Description</h3>
                  <p>{selectedRecipe.desc}</p>
                </div>

                {/* Ingredients & Steps split */}
                <div className="detail-split-instructions">
                  <div className="detail-ingredients">
                    <h3>Ingredients Needed</h3>
                    <ul>
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-steps">
                    <h3>Preparation Steps</h3>
                    <ol>
                      {selectedRecipe.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Sticky Action Row */}
                <div className="detail-action-sticky">
                  <button 
                    className={`btn-add-to-cart-app ${addedAnimation ? "added" : ""}`}
                    onClick={(e) => handleAddToCart(e)}
                  >
                    {addedAnimation ? "Added to Cart" : "Add Coffee to Cart"}
                  </button>
                  <button className="btn-buy-now-app" onClick={handleBuyNow}>
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE DRAWER DETAILS (SLIDE UP) */}
      <AnimatePresence>
        {isMobile && isDetailOpen && selectedRecipe && (
          <>
            <motion.div 
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
            />
            <motion.div 
              className="drawer-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <div className="drawer-handle" />
              <button className="drawer-close-btn" onClick={() => setIsDetailOpen(false)} aria-label="Close details">
                <X size={20} />
              </button>

              <div className="drawer-scroll-content">
                {/* Large Coffee Cup */}
                <div className="drawer-coffee-display">
                  <Image 
                    src={selectedRecipe.image} 
                    alt={selectedRecipe.name}
                    width={220}
                    height={220}
                    className="drawer-coffee-img"
                  />
                </div>

                {/* Title Card */}
                <div className="drawer-title-card">
                  <div className="drawer-title-header">
                    <div>
                      <h2>{selectedRecipe.name}</h2>
                      <div className="drawer-rating">
                        <Star size={14} fill="currentColor" stroke="none" />
                        <span>{selectedRecipe.rating} ({selectedRecipe.reviews})</span>
                      </div>
                    </div>
                    <div className="drawer-price-tag">
                      <span>₹300</span>
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div className="detail-size-selector">
                    <span className="selector-title">Select Serving Size</span>
                    <div className="size-options-group">
                      {["S", "M", "L"].map((size) => (
                        <button 
                          key={size}
                          className={`size-btn ${activeSize === size ? "active" : ""}`}
                          onClick={() => setActiveSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="detail-divider" />

                  {/* Description */}
                  <div className="drawer-desc">
                    <h3>Description</h3>
                    <p>{selectedRecipe.desc}</p>
                  </div>

                  {/* Ingredients */}
                  <div className="drawer-ingredients">
                    <h3>Ingredients</h3>
                    <ul>
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Steps */}
                  <div className="drawer-steps">
                    <h3>Recipe Steps</h3>
                    <ol>
                      {selectedRecipe.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* Sticky bottom CTA */}
              <div className="drawer-cta-sticky">
                <button 
                  className={`btn-add-to-cart-app ${addedAnimation ? "added" : ""}`}
                  onClick={(e) => handleAddToCart(e)}
                >
                  {addedAnimation ? "Added" : "Add to Cart"}
                </button>
                <button className="btn-buy-now-app" onClick={handleBuyNow}>
                  Buy Now
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hamburger Menu Sidebar Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              style={{ zIndex: 1100 }}
            />
            <motion.div 
              className="menu-sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="sidebar-header">
                <h2 className="sidebar-logo">Janu Bhai</h2>
                <button className="sidebar-close-btn" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>

              <div className="sidebar-links-list">
                <Link href="/product/instantcoffee" className="sidebar-link-item" onClick={() => setIsMenuOpen(false)}>
                  <span>Buy Coffee Packet</span>
                  <ChevronRight size={16} />
                </Link>
                <Link href="/process" className="sidebar-link-item" onClick={() => setIsMenuOpen(false)}>
                  <span>Our Sourcing Process</span>
                  <ChevronRight size={16} />
                </Link>
                <Link href="/contact" className="sidebar-link-item" onClick={() => setIsMenuOpen(false)}>
                  <span>Contact Us / Bulk Orders</span>
                  <ChevronRight size={16} />
                </Link>
                <Link href="/track" className="sidebar-link-item" onClick={() => setIsMenuOpen(false)}>
                  <span>Track Order</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="sidebar-footer">
                <p>© {new Date().getFullYear()} Janu Bhai Coffeehouse.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
