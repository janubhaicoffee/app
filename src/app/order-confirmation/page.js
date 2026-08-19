'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Home, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || '';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container" style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
      <motion.div
        className="confirmation-card-apple"
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="confirmation-icon-apple"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.15 }}
        >
          <CheckCircle2 size={68} />
        </motion.div>

        <h1 className="confirmation-title-apple">Order Confirmed!</h1>
        <p className="confirmation-subtitle-apple">
          Thank you for choosing Janu Bhai. Your artisan single-estate coffee is now being prepared for dispatch.
        </p>

        {orderId && (
          <div className="confirmation-order-badge">
            <Package size={16} />
            <span>Order Reference: #{orderId}</span>
          </div>
        )}

        <div className="confirmation-info-box">
          <p>
            A confirmation receipt and live tracking updates have been dispatched to your email and phone.
          </p>
        </div>

        <div className="confirmation-actions-apple">
          {orderId && (
            <Link
              href={`/track?order=${encodeURIComponent(orderId)}`}
              className="apple-btn-gold confirmation-action-btn"
            >
              <Truck size={17} />
              <span>Track Live Delivery</span>
            </Link>
          )}

          <Link href="/account" className="btn-secondary confirmation-action-btn">
            <span>View All Orders</span>
            <ArrowRight size={16} />
          </Link>

          <Link href="/" className="apple-text-btn-home">
            <Home size={15} />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <main className="order-confirmation-page">
      <Suspense fallback={<div className="confirmation-card-apple" style={{ minHeight: '300px' }} />}>
        <OrderConfirmationContent />
      </Suspense>

      <style jsx global>{`
        .order-confirmation-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 16px calc(90px + env(safe-area-inset-bottom, 0px));
          background: radial-gradient(circle at top center, rgba(58, 36, 31, 0.75) 0%, #2a1a17 75%);
        }
        .confirmation-card-apple {
          background: rgba(58, 36, 31, 0.72);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid rgba(245, 240, 234, 0.14);
          border-radius: 28px;
          padding: 40px 32px;
          text-align: center;
          box-shadow: 
            0 24px 60px -12px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }
        .confirmation-icon-apple {
          color: var(--accent-gold-mustard, #d89a1e);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          filter: drop-shadow(0 4px 16px rgba(216, 154, 30, 0.35));
        }
        .confirmation-title-apple {
          font-family: var(--font-playfair), serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--text-warm-white, #f5f0ea);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .confirmation-subtitle-apple {
          color: var(--text-secondary, #cbb9a8);
          font-size: 0.95rem;
          line-height: 1.5;
          max-width: 480px;
          margin: 0 auto 20px;
        }
        .confirmation-order-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(216, 154, 30, 0.12);
          border: 1px solid rgba(216, 154, 30, 0.3);
          color: var(--accent-gold-mustard, #d89a1e);
          padding: 8px 18px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 24px;
          letter-spacing: 0.4px;
        }
        .confirmation-info-box {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(245, 240, 234, 0.08);
          border-radius: 16px;
          padding: 16px 20px;
          color: var(--text-secondary, #cbb9a8);
          font-size: 0.88rem;
          line-height: 1.5;
          max-width: 480px;
          margin: 0 auto 28px;
        }
        .confirmation-actions-apple {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .confirmation-action-btn {
          width: 100%;
          max-width: 320px;
          height: 48px;
          border-radius: 14px;
          font-size: 0.9rem;
          text-transform: none;
          letter-spacing: 0.3px;
        }
        .apple-text-btn-home {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary, #cbb9a8);
          font-size: 0.85rem;
          margin-top: 8px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .apple-text-btn-home:hover {
          color: var(--text-warm-white, #f5f0ea);
        }
        @media (max-width: 640px) {
          .confirmation-card-apple {
            padding: 28px 18px;
            border-radius: 22px;
          }
          .confirmation-title-apple {
            font-size: 1.7rem;
          }
        }
      `}</style>
    </main>
  );
}
