'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, Menu, X, ArrowLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import './TopBar.css';
export default function TopBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const [user, setUser] = useState(null);
  const [outletHref, setOutletHref] = useState('/outlet');
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('janubhai.com')) {
        setOutletHref('https://outlet.janubhai.com');
      } else {
        setOutletHref('/outlet');
      }
    }
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
    if (pathname === '/') return 'Janu Bhai Coffeehouse';
    if (pathname === '/cart') return 'Shopping Cart';
    if (pathname === '/checkout') return 'Checkout';
    if (pathname === '/process') return 'Our Sourcing';
    if (pathname === '/account') return 'My Account';
    if (pathname === '/contact') return 'Contact Us';
    if (pathname?.startsWith('/product/')) return 'Product Details';
    return 'Janu Bhai Coffeehouse';
  };
  return (
    <header className={`topbar-global-wrapper ${isScrolled ? 'scrolled' : ''}`} role="banner">
      {' '}
      {/* 1. DESKTOP VIEWPORT LAYOUT */}{' '}
      <div className="topbar-desktop-inner">
        <div className="logo-container-desktop">
          <Link href="/" aria-label="Janu Bhai Coffee - Home">
            <Image
              src="/logo.png"
              alt="Janu Bhai Logo"
              width={55}
              height={55}
              className="logo-img-desktop"
              priority
            />
          </Link>
        </div>
        <nav className="desktop-navigation-links" role="navigation" aria-label="Desktop navigation">
          <Link
            href="/product/instantcoffee"
            className={`nav-link ${pathname.startsWith('/product/') ? 'active' : ''}`}
          >
            Shop Coffee
          </Link>
          <Link href="/process" className={`nav-link ${pathname === '/process' ? 'active' : ''}`}>
            Our Sourcing
          </Link>
          <Link href="/track" className={`nav-link ${pathname === '/track' ? 'active' : ''}`}>
            Track Order
          </Link>
          <Link href="/contact" className={`nav-link ${pathname === '/contact' ? 'active' : ''}`}>
            Contact
          </Link>
        </nav>
        <div className="desktop-action-group">
          <Link href={user ? '/account' : '/auth/login'} className="desktop-account-link-text">
            {user ? 'Account' : 'Login'}
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', height: '100%' }}>
            <Link
              href="/cart"
              className="desktop-cart-icon relative-badge"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MOBILE VIEWPORT LAYOUT */}
      <div className="topbar-mobile-inner">
        {isHome ? (
          <button
            className="app-icon-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
        ) : (
          <Link href="/" className="app-icon-btn" aria-label="Go back to Home">
            <ArrowLeft size={22} />
          </Link>
        )}
        <div className="mobile-center-title-area">
          {isHome ? (
            <Image
              src="/logo.png"
              alt="Janu Bhai Logo"
              width={45}
              height={45}
              className="logo-img-mobile"
              priority
            />
          ) : (
            <span className="mobile-page-title-text">{getPageTitle()}</span>
          )}
        </div>
        <Link href="/cart" className="app-icon-btn relative-badge" aria-label="Shopping Cart">
          <ShoppingBag size={22} />
          {cartCount > 0 && <span className="app-cart-badge">{cartCount}</span>}
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
              className="menu-sidebar-global"
              style={{ backgroundColor: 'var(--bg-espresso)' }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="sidebar-header-global">
                <Image src="/logo.png" alt="Janu Bhai Logo" width={50} height={50} />
                <button
                  className="sidebar-close-btn-global"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="sidebar-links-list-global">
                <Link
                  href="/product/instantcoffee"
                  className="sidebar-link-item-global"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Shop Instant Coffee</span>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/process"
                  className="sidebar-link-item-global"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Our Sourcing & Process</span>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/track"
                  className="sidebar-link-item-global"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Track Order</span>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="sidebar-link-item-global"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Contact & Bulk Enquiries</span>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href={user ? '/account' : '/auth/login'}
                  className="sidebar-link-item-global"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{user ? 'My Account' : 'Login / Register'}</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
              <div className="sidebar-footer-global">
                <p>© {new Date().getFullYear()} Janu Bhai Coffee.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
