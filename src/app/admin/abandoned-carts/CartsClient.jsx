"use client";
import { useState } from "react";
import { Mail, ShoppingCart, CheckCircle, Clock } from "lucide-react";

export default function CartsClient({ initialCarts }) {
  const [carts, setCarts] = useState(initialCarts);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const getCartTotal = (payload) => {
    if (!Array.isArray(payload)) return 0;
    return payload.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="carts-dashboard">
      {carts.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={48} color="var(--accent-gold)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No Abandoned Carts</h3>
          <p>Great! All your customers are completing their checkouts.</p>
        </div>
      ) : (
        <div className="carts-grid">
          {carts.map(cart => {
            const total = getCartTotal(cart.cart_payload);
            const date = new Date(cart.updated_at).toLocaleString();
            return (
              <div key={cart.id} className="cart-card">
                <div className="cart-header">
                  <div>
                    <span className={`status-badge status-${cart.status}`}>{cart.status}</span>
                    <div className="cart-date"><Clock size={12} /> {date}</div>
                  </div>
                  <div className="cart-total">{formatCurrency(total)}</div>
                </div>
                
                <div className="cart-customer">
                  {cart.customer_email ? (
                    <div className="customer-info">
                      <Mail size={14} /> {cart.customer_email}
                    </div>
                  ) : (
                    <div className="customer-info text-muted">
                      No email captured (Guest)
                    </div>
                  )}
                </div>

                <div className="cart-items">
                  <p className="items-title"><ShoppingCart size={14} /> Items Left Behind:</p>
                  <ul className="item-list">
                    {cart.cart_payload.map((item, idx) => (
                      <li key={idx}>
                        {item.quantity}x {item.name} {item.variantSlug ? `(${item.variantSlug})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>

                {cart.customer_email && cart.status === 'abandoned' && (
                  <div className="cart-actions">
                    <button className="admin-btn-outline" onClick={() => {
                      window.open(`mailto:${cart.customer_email}?subject=You left something behind!&body=Hi! We noticed you left some items in your cart. Here's a 10% discount code to complete your order: COMEBACK10`);
                    }}>
                      <Mail size={14} /> Send Recovery Email
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .carts-dashboard {
          max-width: 1200px;
        }
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: #faf8f5;
          border-radius: 12px;
          border: 1px dashed #e8e0d8;
        }
        .carts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .cart-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
        }
        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-abandoned {
          background: #ffebee;
          color: #c62828;
        }
        .status-cleared {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .cart-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 6px;
        }
        .cart-total {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--primary-color);
        }
        .cart-customer {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f0ebe5;
        }
        .customer-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .text-muted {
          color: #999;
          font-weight: 400;
        }
        .cart-items {
          flex: 1;
        }
        .items-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary-color);
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .item-list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .item-list li {
          margin-bottom: 6px;
          padding-left: 14px;
          position: relative;
        }
        .item-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--accent-gold);
        }
        .cart-actions {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #f0ebe5;
        }
      `}</style>
    </div>
  );
}
