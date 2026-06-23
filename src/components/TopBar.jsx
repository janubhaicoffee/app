"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronDown, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import "./TopBar.css";

export default function TopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    async function loadProducts() {
      const { data } = await supabase.from('products').select('id, name').order('created_at', { ascending: true });
      if (data) setProducts(data);
    }
    loadProducts();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <header className="topbar">
      <div className="container topbar-container">
        <div className="logo-container">
          <Link href="/">
            <Image src="/logo.png" alt="Janu Bhai Logo" width={75} height={75} className="logo-img" />
          </Link>
        </div>

        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
          ☰
        </button>

        <nav className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div 
            className="dropdown"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="nav-link dropdown-toggle" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              Coffee <ChevronDown size={16} />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu-wrapper">
                <div className="dropdown-menu">
                  {products.map(p => (
                    <Link key={p.id} href={`/product/${p.id}`} className="dropdown-item">{p.name}</Link>
                  ))}
                  {products.length === 0 && <span className="dropdown-item">Loading...</span>}
                </div>
              </div>
            )}
          </div>
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
