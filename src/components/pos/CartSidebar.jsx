'use client';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartSidebar({
  items,
  onUpdateQuantity,
  onRemoveItem,
  subtotal,
  tax,
  total,
  customerName,
  onCustomerNameChange,
  orderNotes,
  onOrderNotesChange,
  onPlaceOrder,
  placing,
  orderType,
  tableNumber,
}) {
  return (
    <div className="pos-cart-sidebar">
      <div className="pos-cart-header">
        <span>Order ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
        <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)' }}>
          {orderType === 'dine-in' ? `Table ${tableNumber || '-'}` : orderType}
        </span>
      </div>

      <div className="pos-cart-items">
        {items.length === 0 ? (
          <div className="pos-empty">Cart is empty. Tap a product to add.</div>
        ) : (
          items.map((item, idx) => (
            <div key={item.id || idx} className="pos-cart-item">
              <div className="pos-cart-item-info">
                <div className="pos-cart-item-name">{item.name}</div>
                <div className="pos-cart-item-price">
                  ₹{parseFloat(item.price || 0).toFixed(2)} each
                </div>
              </div>
              <div className="pos-qty-controls">
                <button
                  className="pos-qty-btn"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus size={12} />
                </button>
                <span className="pos-qty-value">{item.quantity}</span>
                <button
                  className="pos-qty-btn"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="pos-cart-item-total">
                ₹{parseFloat(item.price * item.quantity || 0).toFixed(2)}
              </div>
              <button className="pos-cart-remove" onClick={() => onRemoveItem(item.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="pos-cart-footer">
        <input
          className="pos-cart-input"
          placeholder="Customer name"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
        />
        <textarea
          className="pos-cart-textarea"
          placeholder="Order notes..."
          value={orderNotes}
          onChange={(e) => onOrderNotesChange(e.target.value)}
        />
        <div className="pos-total-row">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="pos-total-row">
          <span>Tax (5%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="pos-total-row grand-total">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <button
          className="pos-place-order-btn"
          onClick={onPlaceOrder}
          disabled={placing || items.length === 0}
        >
          {placing ? 'Placing Order...' : `Place Order • ₹${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
