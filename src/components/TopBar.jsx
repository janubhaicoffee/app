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

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/outlet')) return null;

  return (
    <header className="topbar">
      <div className="container topbar-container">
        <div className="logo-container">
          <Link href="/">
            <Image src="/logo.png" alt="Janu Bhai Logo" width={75} height={75} className="logo-img" />
          </Link>
        </div>

        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        <nav className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <Image src="/logo.png" alt="Janu Bhai Logo" width={50} height={50} />
            <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <Link href="/product/instantcoffee" className="nav-link">
            Instant Coffee
          </Link>
          
          <Link href={outletHref} className="nav-link">
            Outlet Management
          </Link>

          <Link href="/process" className="nav-link">Our Process</Link>
        </nav>

        <div className="topbar-actions">
          <Link href={user ? "/account" : "/auth/login"} className="action-icon">
            <User size={24} color="var(--text-primary)" />
          </Link>
          <Link href="/cart" className="action-icon cart-icon">
            <ShoppingBag size={24} color="var(--text-primary)" />
            {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
