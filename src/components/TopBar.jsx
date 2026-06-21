"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import "./TopBar.css";

export default function TopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { getCartCount } = useCart();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="topbar">
      <div className="container topbar-container">
        <div className="logo-container">
          <Link href="/">
            <Image src="/logo.png" alt="Janu Bhai Logo" width={100} height={100} className="logo-img" />
          </Link>
        </div>

        <nav className="nav-menu">
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
                  <Link href="#instant" className="dropdown-item">Instant Coffee</Link>
                  <Link href="#beans" className="dropdown-item">Coffee Beans</Link>
                </div>
              </div>
            )}
          </div>
          <Link href="#process" className="nav-link">Our Process</Link>
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
