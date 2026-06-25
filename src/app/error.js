"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Application Error:", error);
  }, [error]);

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-primary)' }}>
      <div style={{ background: 'white', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px' }}>
        <h1 style={{ color: 'var(--accent-red)', marginBottom: '1rem', fontSize: '2rem' }}>We hit a snag.</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
          {error.message || "Something went unexpectedly wrong on this page. Please try again or return home."}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => reset()} className="btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
            Try Again
          </button>
          <Link href="/" className="btn-secondary" style={{ padding: '0.8rem 1.5rem', textDecoration: 'none' }}>
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
