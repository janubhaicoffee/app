"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") || "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <main className="order-confirmation-page">
      <div className="container" style={{ maxWidth: 700, margin: "0 auto", padding: "4rem 1rem" }}>
        <motion.div
          className="confirmation-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="confirmation-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
          >
            <CheckCircle size={64} />
          </motion.div>

          <h1 className="confirmation-title">Order Confirmed!</h1>
          <p className="confirmation-subtitle">
            Thank you for your order. Your coffee journey begins now.
          </p>

          {orderId && (
            <div className="confirmation-order-id">
              <Package size={18} />
              <span>Order #{orderId}</span>
            </div>
          )}

          <div className="confirmation-details">
            <p>
              We&apos;ve sent a confirmation email with your order details.
              You can track your order status anytime from your account.
            </p>
          </div>

          <div className="confirmation-actions">
            <Link href="/account" className="btn-primary">
              View Orders <ArrowRight size={16} />
            </Link>
            <Link href="/" className="btn-secondary">
              <Home size={16} /> Back to Home
            </Link>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .order-confirmation-page {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 80px;
        }
        .confirmation-card {
          background: var(--bg-color-dark);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 3rem 2rem;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        .confirmation-icon {
          color: var(--accent-gold);
          margin-bottom: 1rem;
        }
        .confirmation-title {
          font-size: 1.8rem;
          color: var(--text-primary);
          margin: 0 0 0.5rem;
        }
        .confirmation-subtitle {
          color: var(--text-secondary);
          margin: 0 0 1.5rem;
          font-size: 1rem;
        }
        .confirmation-order-id {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(216, 154, 30, 0.1);
          border: 1px solid rgba(216, 154, 30, 0.25);
          color: var(--accent-gold);
          padding: 0.5rem 1.2rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }
        .confirmation-details {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.6;
          max-width: 420px;
          margin: 0 auto 2rem;
        }
        .confirmation-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .confirmation-actions .btn-primary,
        .confirmation-actions .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
        }
        .confirmation-actions .btn-secondary {
          background: transparent;
          border: 2px solid var(--border-color);
          color: var(--text-primary);
        }
        .confirmation-actions .btn-secondary:hover {
          border-color: var(--accent-gold);
        }
        @media (max-width: 768px) {
          .order-confirmation-page { padding-top: 100px; }
          .confirmation-card { padding: 2rem 1.2rem; }
          .confirmation-title { font-size: 1.4rem; }
        }
      `}</style>
    </main>
  );
}
