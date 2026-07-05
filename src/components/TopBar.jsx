"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronDown, ShoppingBag, User, Menu, X, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import "./TopBar.css";

export default function TopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const [user, setUser] = useState(null);
  const [coffeeProducts, setCoffeeProducts] = useState([]);
  const [outletHref, setOutletHref] = useState('/outlet');

  const pathname = usePathname();

  useEffect(() => {
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

    async function loadProducts() {
      const { data } = await supabase.from('products').select('id, name, category').order('created_at', { ascending: true });
      if (data) {
        setCoffeeProducts(data.filter(p => p.category !== 'merch'));
      }
    }
    loadProducts();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
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

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/outlet') || pathname?.startsWith('/pos')) return null;

  const cartCount = getCartCount();

  return (
    <header className="topbar" role="banner">
      <div className="container topbar-container">
        <div className="logo-container">
          <Link href="/" aria-label="Janu Bhai Coffee - Home">
            <Image src="/logo.png" alt="Janu Bhai Logo" width={75} height={75} className="logo-img" />
          </Link>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="nav-menu"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true"></div>
        )}

        <nav id="nav-menu" className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
          <div className="mobile-menu-header">
            <Image src="/logo.png" alt="" width={50} height={50} />
          </div>

          <Link href="/product/instantcoffee" className="nav-link">
            Instant Coffee
          </Link>
          
          <Link href={outletHref} className="nav-link mobile-only-link">
            Outlet Management
          </Link>

          <Link href="/process" className="nav-link">Our Process</Link>
        </nav>

        <div className="topbar-actions" role="group" aria-label="User actions">
          <Link
            href={user ? "/account" : "/auth/login"}
            className="action-icon"
            aria-label={user ? "My Account" : "Sign In"}
          >
            <User size={24} color="var(--text-primary)" />
          </Link>
          <Link href={outletHref} className="outlet-btn" aria-label="Outlet Management">
            Outlet Management
          </Link>
          <Link
            href="/cart"
            className="action-icon cart-icon"
            aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ', empty'}`}
          >
            <ShoppingBag size={24} color="var(--text-primary)" />
            {cartCount > 0 && (
              <span className="cart-badge" aria-hidden="true">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
