"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Footer.css";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/outlet') || pathname?.startsWith('/pos')) return null;

  return (
    <footer className="global-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Janu Bhai Coffee</h3>
            <p>Born in Chikmagaluru, Loved everywhere.</p>
            <p className="footer-copyright">© {new Date().getFullYear()} Janu Bhai Coffee. All rights reserved.</p>
          </div>
          
          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><Link href="/terms">Terms & Conditions</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/refunds">Cancellation & Refund</Link></li>
              <li><Link href="/shipping">Shipping & Delivery</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Support</h4>
            <ul>
              <li><Link href="/track">Track Order</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li>Email: hello@janubhai.com</li>
              <li>Phone: +91 8527976791</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
