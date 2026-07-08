'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, Coffee, User } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const pathname = usePathname();

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
                  width={60}
                  height={60}
                  className="footer-logo-img"
                />
              </Link>
              <p className="footer-brand-desc">
                Born in Chikmagaluru. Small-batch roasted. Delivered fresh nationwide.
              </p>
              <p className="footer-copyright-luxury">
                © {new Date().getFullYear()} Janu Bhai Coffee.
              </p>
            </div>

            {/* Column 2: Shop */}
            <div className="footer-col-links">
              <span className="footer-col-title">Shop</span>
              <ul>
                <li>
                  <Link href="/product/instantcoffee">Coffee Powder</Link>
                </li>
                <li>
                  <Link href="/process">Our Sourcing</Link>
                </li>
                <li>
                  <Link href="/">Recipes</Link>
                </li>
                <li>
                  <Link href="/contact">Bulk Orders</Link>
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
              <span className="footer-col-title">Social</span>
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
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-link"
                  aria-label="YouTube"
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
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
                    <path d="m10 15 5-3-5-3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* 2. MOBILE STICKY BOTTOM APP NAVIGATION */}
      <nav
        className="mobile-app-bottom-nav"
        role="navigation"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="bottom-nav-inner">
          <Link href="/" className={`nav-nav-btn ${pathname === '/' ? 'active' : ''}`}>
            <Home size={20} />
            <span className="nav-nav-text">Home</span>
          </Link>

          <Link
            href="/process"
            className={`nav-nav-btn ${pathname === '/process' ? 'active' : ''}`}
          >
            <Coffee size={20} />
            <span className="nav-nav-text">Sourcing</span>
          </Link>

          <Link
            href="/account"
            className={`nav-nav-btn ${pathname === '/account' ? 'active' : ''}`}
          >
            <User size={20} />
            <span className="nav-nav-text">Account</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
