"use client";
import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="not-found-icon">
            <Search size={64} />
          </div>
          
          <h1 className="not-found-title">Page Not Found</h1>
          <p className="not-found-text">
            Oops! The page you're looking for doesn't exist or may have been moved.
          </p>
          
          <div className="not-found-actions">
            <Link href="/" className="btn-primary">
              <Home size={18} /> Go to Homepage
            </Link>
            <Link href="/cart" className="btn-secondary">
              <Search size={18} /> Browse Coffee
            </Link>
          </div>
          
          <div className="not-found-help">
            <h3>Popular Pages:</h3>
            <div className="popular-links">
              <Link href="/product/instantcoffee" className="popular-link">Instant Coffee</Link>
              <Link href="/process" className="popular-link">Our Process</Link>
              <Link href="/track" className="popular-link">Track Order</Link>
              <Link href="/account" className="popular-link">Your Account</Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .not-found-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }
        .not-found-content {
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
        }
        .not-found-icon {
          color: var(--accent-gold);
          margin-bottom: 20px;
          opacity: 0.8;
        }
        .not-found-title {
          font-size: 2.5rem;
          color: var(--primary-color);
          margin-bottom: 16px;
        }
        .not-found-text {
          color: var(--text-secondary);
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .not-found-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .not-found-actions .btn-primary,
        .not-found-actions .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .not-found-help {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid var(--border-color);
        }
        .not-found-help h3 {
          font-size: 1.2rem;
          margin-bottom: 20px;
          color: var(--text-primary);
        }
        .popular-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }
        .popular-link {
          padding: 8px 16px;
          background: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .popular-link:hover {
          background: var(--accent-red);
          border-color: var(--accent-red);
          color: #fff;
          transform: translateY(-2px);
        }
        @media (max-width: 480px) {
          .not-found-title { font-size: 2rem; }
          .not-found-actions { flex-direction: column; }
          .not-found-actions .btn-primary,
          .not-found-actions .btn-secondary { width: 100%; }
        }
      `}</style>
    </main>
  );
}
