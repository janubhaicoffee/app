'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, Coffee, ShoppingBag, User, Compass } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import './Footer.css';

export default function Footer() {
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  // Hide on admin, outlet, or POS interfaces
  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/outlet') ||
    pathname?.startsWith('/pos')
  )
    return null;

  return (
    <>
      {/* 1. DESKTOP LUXURY FOOTER */}
      <footer className="desktop-footer-luxury" role="contentinfo">
        <div className="container-premium">
          <div className="footer-grid-luxury">
            {/* Column 1: Brand */}
            <div className="footer-col-brand">
              <Link href="/" aria-label="Janu Bhai Coffee - Home">
                <Image
                  src="/logo.png"
                  alt="Janu Bhai Logo"
                  width={56}
                  height={56}
                  className="footer-logo-img"
                />
              </Link>
              <p className="footer-brand-desc">
                Born in Chikmagaluru hills. Artisan batch roasted and micro-crystallized for true café crema.
              </p>
              <p className="footer-copyright-luxury">
                © {new Date().getFullYear()} Janu Bhai Coffee.
              </p>
            </div>

            {/* Column 2: Experience & Shop */}
            <div className="footer-col-links">
              <span className="footer-col-title">Experience & Shop</span>
              <ul>
                <li>
                  <Link href="/product/instantcoffee">Instant Coffee (100g / 1kg)</Link>
                </li>
                <li>
                  <Link href="/events">Events & RSVP Activations</Link>
                </li>
                <li>
                  <Link href="/customer">Customer & Audience Hub</Link>
                </li>
                <li>
                  <Link href="/process">Our Sourcing & Process</Link>
                </li>
                <li>
                  <Link href="/track">Track Order</Link>
                </li>
                <li>
                  <Link href="/contact">Bulk / B2B Orders</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div className="footer-col-links">
              <span className="footer-col-title">Legal</span>
              <ul>
                <li>
                  <Link href="/terms">Terms & Conditions</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/refunds">Refund Policy</Link>
                </li>
                <li>
                  <Link href="/shipping">Shipping Policy</Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Support */}
            <div className="footer-col-links">
              <span className="footer-col-title">Support</span>
              <ul>
                <li>
                  <Link href="/track">Track Order</Link>
                </li>
                <li>
                  <Link href="/contact">Contact Support</Link>
                </li>
                <li className="footer-contact-info">hello@janubhai.com</li>
                <li className="footer-contact-info">+91 8527976791</li>
              </ul>
            </div>

            {/* Column 5: Social */}
            <div className="footer-col-links">
              <span className="footer-col-title">Follow Us</span>
              <div className="footer-social-icons">
                <a
                  href="https://instagram.com/janubhaicoffee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-link"
                  aria-label="Instagram"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/janubhaicoffee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-link"
                  aria-label="Twitter"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* 2. MOBILE DYNAMIC iOS FLOATING BOTTOM APP DOCK */}
      <nav
        className="mobile-app-bottom-nav-apple"
        role="navigation"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="bottom-dock-floating-container">
          <Link
            href="/"
            className={`nav-dock-item ${pathname === '/' ? 'active' : ''}`}
          >
            <Home size={19} />
            <span className="nav-dock-label">Home</span>
          </Link>

          <Link
            href="/product/instantcoffee"
            className={`nav-dock-item ${pathname.startsWith('/product') ? 'active' : ''}`}
          >
            <Coffee size={19} />
            <span className="nav-dock-label">Shop</span>
          </Link>

          <Link
            href="/process"
            className={`nav-dock-item ${pathname === '/process' ? 'active' : ''}`}
          >
            <Compass size={19} />
            <span className="nav-dock-label">Sourcing</span>
          </Link>

          <Link
            href="/cart"
            className={`nav-dock-item cart-dock-item ${pathname === '/cart' ? 'active' : ''}`}
          >
            <div className="dock-icon-wrap">
              <ShoppingBag size={19} />
              {cartCount > 0 && <span className="dock-cart-badge">{cartCount}</span>}
            </div>
            <span className="nav-dock-label">Bag</span>
          </Link>

          <Link
            href="/account"
            className={`nav-dock-item ${pathname === '/account' || pathname.startsWith('/auth') ? 'active' : ''}`}
          >
            <User size={19} />
            <span className="nav-dock-label">Account</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
