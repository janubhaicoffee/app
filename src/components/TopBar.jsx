"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ShoppingBag } from "lucide-react";
import "./TopBar.css";

export default function TopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="container topbar-container">
        <div className="logo-container">
          <Link href="/">
            {/* The user will place logo.png in public folder */}
            <div className="logo-placeholder">
              <span className="logo-text">JANU BHAI</span>
              <span className="logo-subtext">COFFEE</span>
            </div>
          </Link>
        </div>

        <nav className="nav-menu">
          <div 
            className="dropdown"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="nav-link dropdown-toggle">
              Coffee <ChevronDown size={16} />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link href="#instant" className="dropdown-item">Instant Coffee</Link>
                <Link href="#beans" className="dropdown-item">Coffee Beans</Link>
              </div>
            )}
          </div>
          <Link href="#process" className="nav-link">Our Process</Link>
        </nav>

        <div className="cart-icon">
          <ShoppingBag size={24} color="var(--text-primary)" />
        </div>
      </div>
    </header>
  );
}
