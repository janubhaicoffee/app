'use client';
import { Suspense, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import '../login/auth.css';

function UnifiedAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    signInWithOtp,
    verifyOtp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithPasskey,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const redirectTo = searchParams.get('redirect') || '/account';
  const [mode, setMode] = useState('phone'); // phone | otp | email | email-signup
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithOtp(phone);
      setMode('otp');
      setMessage('OTP sent to ' + phone);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleRoleRedirect = async (session) => {
    try {
      const res = await fetch('/api/auth/check-role', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.role === 'superadmin') {
          router.push('/admin');
          return;
        } else if (data.role === 'partner' || data.role === 'staff') {
          const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
          const targetUrl = isLocal 
            ? `${window.location.protocol}//outlet.localhost:${window.location.port}/dashboard`
            : `${window.location.protocol}//outlet.janubhai.com/dashboard`;
          window.location.href = targetUrl;
          return;
        }
      }
    } catch (err) {
      console.error('Failed to handle role redirect:', err);
    }
    router.push(redirectTo);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await verifyOtp(phone, otp);
      if (data?.session) {
        await handleRoleRedirect(data.session);
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithFacebook();
    } catch (err) {
      setError(err.message || 'Facebook sign in failed');
      setLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await signInWithPasskey();
      if (data?.session) {
        await handleRoleRedirect(data.session);
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      setError(
        err.message ||
          "Passkey sign in failed. If you haven't registered a passkey on this device yet, sign in via OTP or Email first, then enroll your device under Account Details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === 'email') {
        const data = await signInWithEmail(email, password);
        if (data?.session) {
          await handleRoleRedirect(data.session);
        } else {
          router.push(redirectTo);
        }
      } else {
        const data = await signUpWithEmail(email, password, name);
        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists. Try logging in.');
        } else {
          setMessage(
            <div>
              <p style={{ fontWeight: 700, marginBottom: '8px' }}>🎉 Account created successfully!</p>
              <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>Check your email to confirm your account.</p>
              <div style={{ background: 'rgba(216, 154, 30, 0.06)', border: '1px solid var(--accent-gold)', borderRadius: '6px', padding: '12px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                💡 <strong>Gamified Security Reward:</strong> Once you log in, link your Phone, Google, or Facebook to secure your account and instantly earn up to <strong>350 Loyalty Points</strong> + unlock biometric <strong>Passkey</strong> login!
              </div>
            </div>
          );
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const switchToEmail = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setEmail(data.user.email || '');
      }
    } catch (_) {}
    setMode('email');
    setError(null);
    setMessage(null);
  };

  const resendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithOtp(phone);
      setMessage('OTP resent to ' + phone);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="container auth-container">
        <div className="auth-box vintage-border">
          <h1 className="auth-title">Welcome to Janu Bhai</h1>
          <p className="auth-subtitle">Sign in or create your account</p>

          {error && <div className="error-box">{error}</div>}
          {message && <div className="success-box">{message}</div>}

          {mode === 'phone' && (
            <>
              <form onSubmit={handlePhoneSubmit} className="auth-form">
                <div className="form-group">
                  <label>Phone Number (Primary)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <button type="submit" className="btn-primary full-width mt-20" disabled={loading}>
                  {loading ? 'SENDING OTP...' : 'SEND OTP'}
                </button>
              </form>

              <div className="auth-divider">
                <span>OR SIGN IN WITH</span>
              </div>

              <div className="alternative-auth-container" style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="btn-social-icon"
                  disabled={loading}
                  title="Google"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleFacebookSignIn}
                  className="btn-social-icon"
                  disabled={loading}
                  title="Facebook"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={handlePasskeySignIn}
                  className="btn-social-icon"
                  disabled={loading}
                  title="Passkey"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-gold)' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                  </svg>
                  <span>Passkey</span>
                </button>
              </div>

              <div className="auth-divider">
                <span>OR</span>
              </div>

              <p className="text-center" style={{ fontSize: '0.9rem' }}>
                <button type="button" onClick={switchToEmail} className="link-btn">
                  Continue with Email
                </button>
              </p>
            </>
          )}

          {mode === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="auth-form">
              <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Enter the 6-digit code sent to <strong>{phone}</strong>
              </p>
              <div className="form-group">
                <label>OTP Code</label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>
              <button
                type="submit"
                className="btn-primary full-width mt-20"
                disabled={loading || otp.length < 4}
              >
                {loading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
              </button>
              <div
                style={{
                  marginTop: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                }}
              >
                <button type="button" onClick={resendOtp} className="link-btn" disabled={loading}>
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('phone');
                    setError(null);
                    setMessage(null);
                  }}
                  className="link-btn"
                >
                  Change Number
                </button>
              </div>
            </form>
          )}

          {(mode === 'email' || mode === 'email-signup') && (
            <form onSubmit={handleEmailSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              {mode === 'email-signup' && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
              )}
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-primary full-width mt-20" disabled={loading}>
                {loading ? 'PLEASE WAIT...' : mode === 'email' ? 'LOG IN' : 'SIGN UP'}
              </button>
              <p className="text-center" style={{ marginTop: '15px', fontSize: '0.9rem' }}>
                {mode === 'email' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('email-signup');
                        setError(null);
                      }}
                      className="link-btn"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('email');
                        setError(null);
                      }}
                      className="link-btn"
                    >
                      Log in
                    </button>
                  </>
                )}
              </p>
              <p className="text-center" style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('phone');
                    setError(null);
                    setMessage(null);
                  }}
                  className="link-btn"
                >
                  ← Back to phone
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function UnifiedAuthPage() {
  return (
    <Suspense>
      <UnifiedAuthContent />
    </Suspense>
  );
}
