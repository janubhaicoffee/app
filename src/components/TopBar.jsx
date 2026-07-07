"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import "./TopBar.css";

export default function TopBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const [user, setUser] = useState(null);
  const [outletHref, setOutletHref] = useState('/outlet');

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/outlet') || pathname?.startsWith('/pos')) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen, pathname]);

  // Trap focus inside mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/outlet') || pathname?.startsWith('/pos')) return;
    const menu = document.querySelector('.nav-menu');
    if (!menu) return;
    const focusable = menu.querySelectorAll('a[href], button');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    menu.addEventListener('keydown', trap);
    first?.focus();
    return () => menu.removeEventListener('keydown', trap);
  }, [isMobileMenuOpen, pathname]);

  if (pathname === '/' || pathname?.startsWith('/admin') || pathname?.startsWith('/outlet') || pathname?.startsWith('/pos')) return null;

  const cartCount = getCartCount();

  return (
    <header className={`topbar ${isScrolled ? "scrolled" : "transparent"}`} role="banner">
      <div className="container topbar-container">
        <div className="logo-container">
          <Link href="/" aria-label="Janu Bhai Coffee - Home">
            <Image src="/logo.png" alt="Janu Bhai Logo" width={60} height={60} className="logo-img" priority />
          </Link>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="nav-menu"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu - Centered */}
        <nav id="desktop-nav-menu" className="desktop-menu" role="navigation" aria-label="Main navigation">
          <Link href="/product/instantcoffee" className="nav-link">
            Instant Coffee
          </Link>
          <Link href="/process" className="nav-link">
            Our Process
          </Link>
          <Link href="/#about" className="nav-link">
            About
          </Link>
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
          {user && (
            <Link href={outletHref} className="nav-link">
              Outlet
            </Link>
          )}
        </nav>

        {/* Right side actions - Minimal */}
        <div className="topbar-actions" role="group" aria-label="User actions">
          <Link
            href={user ? "/account" : "/auth/login"}
            className="action-link-text nav-link"
            aria-label={user ? "My Account" : "Login"}
          >
            {user ? "Account" : "Login"}
          </Link>
          
          <Link
            href="/cart"
            className="action-icon cart-icon"
            aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ', empty'}`}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="cart-badge" aria-hidden="true">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Portal */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {isMobileMenuOpen && (
            <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true"></div>
          )}
          
          <nav id="mobile-nav-menu" className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`} role="navigation" aria-label="Mobile navigation">
            <div className="mobile-menu-header">
              <Image src="/logo.png" alt="" width={50} height={50} />
              <button 
                className="mobile-close-btn" 
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mobile-menu-links">
              <Link href="/product/instantcoffee" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Instant Coffee
              </Link>
              <Link href="/process" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Our Process
              </Link>
              <Link href="/#about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="/contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </Link>
              {user && (
                <Link href={outletHref} className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Outlet Management
                </Link>
              )}
              <Link href={user ? "/account" : "/auth/login"} className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                {user ? "My Account" : "Login"}
              </Link>
              <Link href="/cart" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Cart ({cartCount})
              </Link>
            </div>
          </nav>
        </>,
        document.body
      )}
    </header>
  );
}
