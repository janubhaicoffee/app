'use client';
import { useState } from 'react';
import { claimGift } from '@/actions/gift';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, CheckCircle, MapPin, Phone, User, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClaimClient({ token, initialResult }) {
  const [result] = useState(initialResult);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    pincode: '',
    phone: '',
  });
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  if (result.error) {
    return (
      <main
        className="claim-page"
        style={{ background: 'var(--bg-color)', minHeight: '90vh', padding: '80px 20px' }}
      >
        <div className="container" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="vintage-border"
            style={{
              maxWidth: '500px',
              padding: '30px',
              background: '#FFFDF9',
              textAlign: 'center',
              borderRadius: '8px',
            }}
          >
            <AlertTriangle size={48} color="var(--accent-red)" style={{ marginBottom: '15px' }} />
            <h2
              style={{
                fontFamily: 'var(--font-playfair), serif',
                color: 'var(--primary-color)',
                marginBottom: '10px',
              }}
            >
              Verification Failed
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {result.error}
            </p>
            <button
              className="btn-primary"
              onClick={() => router.push('/')}
              style={{ marginTop: '20px', padding: '10px 25px', fontSize: '0.9rem' }}
            >
              RETURN TO STORE
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  const tx = result.transaction;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClaiming(true);
    setError(null);
    try {
      const res = await claimGift(token, formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (e) {
      setError('An unexpected error occurred during fulfillment.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <main
      className="claim-page"
      style={{ background: 'var(--bg-color)', minHeight: '90vh', padding: '60px 20px' }}
    >
      <div className="container" style={{ maxWidth: '550px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="claim-form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="vintage-border"
              style={{ background: '#FFFDF9', padding: '40px', borderRadius: '8px' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    padding: '15px',
                    borderRadius: '50%',
                    background: 'rgba(183, 28, 28, 0.08)',
                    color: 'var(--accent-red)',
                    marginBottom: '15px',
                  }}
                >
                  <Gift size={36} />
                </div>
                <h1
                  style={{
                    fontFamily: 'var(--font-playfair), serif',
                    fontSize: '1.8rem',
                    color: 'var(--primary-color)',
                    margin: 0,
                  }}
                >
                  Claim Your Coffee Gift 🎁
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
                  A fresh batch of premium coffee has been purchased for you. Enter your address
                  below to dispatch.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-color-dark)',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '25px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.5px',
                  }}
                >
                  Gifted Item:
                </p>
                <p
                  style={{
                    margin: '5px 0 0 0',
                    fontSize: '1.05rem',
                    color: 'var(--accent-red)',
                    fontWeight: '800',
                  }}
                >
                  {tx.products?.name || 'Premium Chikmagalur Coffee'}
                </p>
                {tx.products?.description && (
                  <p
                    style={{
                      margin: '5px 0 0 0',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.4',
                    }}
                  >
                    {tx.products.description}
                  </p>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Recipient Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '10px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 10px 10px 38px',
                        border: '2px solid var(--border-color)',
                        borderRadius: '4px',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Delivery Street Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '10px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <MapPin size={16} />
                    </span>
                    <textarea
                      rows="3"
                      required
                      placeholder="Apartment, building, street address details..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 10px 10px 38px',
                        border: '2px solid var(--border-color)',
                        borderRadius: '4px',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label
                      style={{
                        fontWeight: 'bold',
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      City
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bangalore"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid var(--border-color)',
                        borderRadius: '4px',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontWeight: 'bold',
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 560001"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid var(--border-color)',
                        borderRadius: '4px',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '10px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="Mobile number for delivery updates"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 10px 10px 38px',
                        border: '2px solid var(--border-color)',
                        borderRadius: '4px',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                </div>

                {error && (
                  <p
                    style={{
                      color: 'var(--accent-red)',
                      fontWeight: 'bold',
                      margin: '5px 0 0 0',
                      fontSize: '0.85rem',
                    }}
                  >
                    ⚠️ {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={claiming}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '10px', padding: '14px', fontSize: '1rem' }}
                >
                  {claiming ? 'ROUTING DISPATCH...' : 'DISPATCH COFFEE TO MY ADDRESS 🚀'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="claim-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="vintage-border"
              style={{
                background: '#FFFDF9',
                padding: '50px 40px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <CheckCircle
                size={64}
                color="green"
                style={{ marginBottom: '20px', margin: '0 auto 20px' }}
              />
              <h1
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: '2rem',
                  color: 'var(--primary-color)',
                  margin: 0,
                }}
              >
                Fulfillment Initialized!
              </h1>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '1rem',
                  margin: '15px auto',
                  maxWidth: '420px',
                  lineHeight: '1.6',
                }}
              >
                Your shipping details have been securely logged and mapped to our logistics queue.
                Freshly roasted coffee has been routed for packaging.
              </p>

              <button
                className="btn-primary"
                onClick={() => router.push('/')}
                style={{ marginTop: '20px' }}
              >
                EXPLORE JANU BHAI COFFEE
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
