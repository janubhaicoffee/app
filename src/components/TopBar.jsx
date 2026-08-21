'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, Menu, X, ArrowLeft, ChevronRight, User as UserIcon, LogIn, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import './TopBar.css';

export default function TopBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  // Return null for admin/outlet/pos subdomains/paths
  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/outlet') ||
    pathname?.startsWith('/pos')
  )
    return null;

  const cartCount = getCartCount();
  const isHome = pathname === '/';

  const getPageTitle = () => {
    if (pathname === '/') return 'Janu Bhai Coffee';
    if (pathname === '/cart') return 'Bag';
    if (pathname === '/checkout') return 'Checkout';
    if (pathname === '/process') return 'Our Sourcing';
    if (pathname === '/account') return 'Account';
    if (pathname === '/contact') return 'Contact';
    if (pathname === '/track') return 'Track Order';
    if (pathname?.startsWith('/auth')) return 'Account Access';
    if (pathname?.startsWith('/product/')) return 'Coffee Details';
    return 'Janu Bhai';
  };

  return (
    <header
      className={`topbar-global-wrapper ${isScrolled ? 'scrolled' : ''}`}
      role="banner"
    >
      {/* 1. DESKTOP VIEWPORT: macOS Floating Frosted Bar */}
      <div className="topbar-desktop-inner">
        <div className="logo-container-desktop">
          <Link href="/" aria-label="Janu Bhai Coffee - Home" className="desktop-logo-link">
            <Image
              src="/logo.png"
              alt="Janu Bhai Logo"
              width={48}
              height={48}
              className="logo-img-desktop"
              priority
            />
            <span className="desktop-brand-text">Janu Bhai</span>
          </Link>
        </div>

        <nav className="desktop-navigation-links apple-pill-nav" role="navigation" aria-label="Desktop navigation">
          <Link
            href="/product/instantcoffee"
            className={`nav-link-pill ${pathname.startsWith('/product') ? 'active' : ''}`}
          >
            <span>Shop Coffee</span>
          </Link>
          <Link
            href="/events"
            className={`nav-link-pill ${pathname.startsWith('/events') ? 'active' : ''}`}
          >
            <span>Events & RSVP</span>
          </Link>
          <Link
            href="/process"
            className={`nav-link-pill ${pathname === '/process' ? 'active' : ''}`}
          >
            <span>Sourcing</span>
          </Link>
          <Link
            href="/track"
            className={`nav-link-pill ${pathname === '/track' ? 'active' : ''}`}
          >
            <span>Track Order</span>
          </Link>
          <Link
            href="/contact"
            className={`nav-link-pill ${pathname === '/contact' ? 'active' : ''}`}
          >
            <span>Contact</span>
          </Link>
        </nav>

        <div className="desktop-action-group">
          {/* User Account / 1-Click Login Pill */}
          <Link
            href={user ? '/account' : '/auth/login'}
            className={`desktop-account-pill ${user ? 'is-logged' : ''}`}
          >
            {user ? (
              <>
                <UserIcon size={16} />
                <span>Account</span>
              </>
            ) : (
              <>
                <LogIn size={15} />
                <span>Sign In</span>
              </>
            )}
          </Link>

          {/* Cart Bag with Glowing Counter */}
          <Link
            href="/cart"
            className="desktop-cart-pill apple-press"
            aria-label="Shopping Cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="cart-badge-apple animate-pulse-badge">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 2. MOBILE VIEWPORT: Dynamic iOS Top Bar */}
      <div className="topbar-mobile-inner">
        {isHome ? (
          <button
            className="app-icon-btn-apple apple-press"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        ) : (
          <Link href="/" className="app-icon-btn-apple apple-press" aria-label="Go back to Home">
            <ArrowLeft size={20} />
          </Link>
        )}

        <div className="mobile-center-title-area">
          {isHome ? (
            <Link href="/" className="mobile-logo-wrap">
              <Image
                src="/logo.png"
                alt="Janu Bhai Logo"
                width={36}
                height={36}
                className="logo-img-mobile"
                priority
              />
              <span className="mobile-brand-title">Janu Bhai</span>
            </Link>
          ) : (
            <span className="mobile-page-title-text">{getPageTitle()}</span>
          )}
        </div>

        <Link
          href="/cart"
          className="app-icon-btn-apple relative-badge apple-press"
          aria-label="Shopping Cart"
        >
          <ShoppingBag size={20} />
          {cartCount > 0 && <span className="app-cart-badge-apple">{cartCount}</span>}
        </Link>
      </div>

      {/* Hamburger Sidebar Navigation Drawer (Mobile) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="sidebar-overlay-global"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="menu-sidebar-apple"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            >
              <div className="sidebar-header-apple">
                <div className="sidebar-brand-group">
                  <Image src="/logo.png" alt="Janu Bhai Logo" width={42} height={42} />
                  <div>
                    <span className="sidebar-brand-name">Janu Bhai</span>
                    <span className="sidebar-brand-sub">Chikmagalur Coffee</span>
                  </div>
                </div>
                <button
                  className="sidebar-close-btn-apple"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="sidebar-links-list-apple">
                <Link
                  href="/product/instantcoffee"
                  className="sidebar-link-item-apple"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Shop Instant Coffee</span>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/events"
                  className="sidebar-link-item-apple"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Events & RSVP Activations</span>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/customer"
                  className="sidebar-link-item-apple"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Customer & Audience Hub</span>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/process"
                  className="sidebar-link-item-apple"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Our Sourcing & Process</span>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/track"
                  className="sidebar-link-item-apple"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Track Order</span>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="sidebar-link-item-apple"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Contact & Bulk Enquiries</span>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href={user ? '/account' : '/auth/login'}
                  className="sidebar-link-item-apple highlight-auth-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{user ? 'My Account' : 'Sign In / Register'}</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="sidebar-footer-apple">
                <p>© {new Date().getFullYear()} Janu Bhai Coffee.</p>
                <span className="estate-guarantee-tag">Single-Estate Chikmagalur Harvest</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
