'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import './checkout.css';

export default function CheckoutPage() {
  const { outletCode } = useParams();
  const router = useRouter();
  const { user, customerProfile } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState('counter'); // "counter" | "online"
  const [ordering, setOrdering] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);

  useEffect(() => {
    if (customerProfile?.name) setCustomerName(customerProfile.name);
    if (customerProfile?.phone) setCustomerPhone(customerProfile.phone);
    if (user?.phone) setCustomerPhone(user.phone);
  }, [customerProfile, user]);

  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      router.push(`/menu/${outletCode}`);
    }
  }, [cartItems, outletCode, router, orderPlaced]);

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setOrdering(true);
    try {
      const res = await fetch('/api/orders/qr-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletCode,
          items: cartItems,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          notes: notes.trim(),
          paymentMode,
          guestCount: 1,
          userId: user?.id || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setOrderPlaced(data);

      if (paymentMode === 'online' && data.razorpayOrderId) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: 'INR',
          name: 'Janu Bhai Coffee',
          description: `Order #${data.orderNumber}`,
          order_id: data.razorpayOrderId,
          prefill: {
            name: customerName,
            contact: customerPhone,
            email: user?.email || '',
          },
          handler: async function (response) {
            await fetch('/api/orders/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            toast.success('Payment successful!');
            clearCart();
          },
          modal: {
            ondismiss: function () {
              toast('Payment cancelled. You can pay at counter.');
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        toast.success('Order placed! Pay at counter.');
        clearCart();
      }
    } catch (err) {
      toast.error(err.message);
    }
    setOrdering(false);
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="checkout-success">
          <div className="success-icon">✓</div>
          <h1>Order Placed!</h1>
          <p className="order-number">Order #{orderPlaced.orderNumber}</p>
          {paymentMode === 'counter' && (
            <p className="pay-at-counter-msg">
              Please pay at the counter when your order is ready.
            </p>
          )}
          <div className="order-summary">
            <p>Total: ₹{orderPlaced.total}</p>
            <p>Status: {orderPlaced.paymentStatus === 'paid' ? 'Paid ✓' : 'Pending Payment'}</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              clearCart();
              router.push(`/menu/${outletCode}`);
            }}
          >
            Order Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button className="checkout-back" onClick={() => router.push(`/menu/${outletCode}`)}>
          ← Back to Menu
        </button>

        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-section">
          <h3>Your Details</h3>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
            />
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests?"
              rows={2}
            />
          </div>
        </div>

        <div className="checkout-section">
          <h3>Order Summary</h3>
          {cartItems.map((item, idx) => (
            <div key={idx} className="checkout-item">
              <span className="checkout-item-name">{item.name}</span>
              <span className="checkout-item-qty">x{item.quantity}</span>
              <span className="checkout-item-price">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="checkout-total">
            <span>Total</span>
            <span>₹{getCartTotal()}</span>
          </div>
        </div>

        <div className="checkout-section">
          <h3>Payment Method</h3>
          <div className="payment-options">
            <label className={`payment-option ${paymentMode === 'counter' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                value="counter"
                checked={paymentMode === 'counter'}
                onChange={() => setPaymentMode('counter')}
              />
              <div className="payment-option-content">
                <span className="payment-option-title">Pay at Counter</span>
                <span className="payment-option-desc">Pay when your order is ready</span>
              </div>
            </label>
            <label className={`payment-option ${paymentMode === 'online' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMode === 'online'}
                onChange={() => setPaymentMode('online')}
              />
              <div className="payment-option-content">
                <span className="payment-option-title">Pay Online</span>
                <span className="payment-option-desc">Credit/Debit Card, UPI, Net Banking</span>
              </div>
            </label>
          </div>
        </div>

        <button
          className="btn-primary full-width place-order-btn"
          onClick={handlePlaceOrder}
          disabled={ordering}
        >
          {ordering ? 'PLACING ORDER...' : `PLACE ORDER • ₹${getCartTotal()}`}
        </button>
      </div>
    </div>
  );
}
