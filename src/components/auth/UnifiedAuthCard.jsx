'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Mail,
  Lock,
  User,
  Fingerprint,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import '../TopBar.css';

export default function UnifiedAuthCard({ defaultTab = 'phone', defaultMode = 'login' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/account';

  const {
    signInWithOtp,
    verifyOtp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithPasskey,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  // Primary mode state: 'phone' | 'email'
  const [authMethod, setAuthMethod] = useState(defaultTab);
  // Phone sub-step: 'input' | 'otp'
  const [phoneStep, setPhoneStep] = useState('input');
  // Email sub-mode: 'login' | 'signup'
  const [emailMode, setEmailMode] = useState(defaultMode);

  // Form inputs
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // OTP Countdown timer
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  // Handle post-login redirection with role check
  const handleAuthSuccess = async (sessionParam) => {
    try {
      let session = sessionParam;
      if (!session) {
        const { data } = await supabase.auth.getSession();
        session = data?.session;
      }

      if (!session) {
        router.push(redirectTo);
        return;
      }

      const res = await fetch('/api/auth/check-role', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (searchParams?.get('redirect')) {
          router.push(searchParams.get('redirect'));
          return;
        }
        if (data.role === 'superadmin') {
          router.push('/admin');
          return;
        }
        if (data.role === 'operations_head' || data.role === 'operations' || data.role === 'operation_manager') {
          router.push('/admin/operations');
          return;
        }
        if (data.role === 'growth' || data.role === 'brand_leader') {
          router.push('/admin/growth');
          return;
        }
        if (data.role === 'manager' || data.role === 'store_manager') {
          router.push('/admin/manager');
          return;
        }
        if (data.role === 'staff') {
          const isLocal =
            window.location.hostname.includes('localhost') ||
            window.location.hostname.includes('127.0.0.1');
          const targetUrl = isLocal
            ? `${window.location.protocol}//outlet.localhost:${window.location.port}/dashboard`
            : `${window.location.protocol}//outlet.janubhai.com/dashboard`;
          window.location.href = targetUrl;
          return;
        }
      }
    } catch (err) {
      console.error('Role check failed:', err);
    }
    router.push(redirectTo);
  };

  // 1-Click Phone OTP Submit
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await signInWithOtp(phone);
      setPhoneStep('otp');
      setResendTimer(30);
      setSuccessMsg(`OTP sent successfully to ${phone}`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your number.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click OTP Code Verification
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the full 6-digit OTP');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await verifyOtp(phone, otp);
      await handleAuthSuccess(data?.session);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithOtp(phone);
      setResendTimer(30);
      setSuccessMsg(`A new OTP has been sent to ${phone}`);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Google OAuth
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  // 1-Click Facebook OAuth
  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithFacebook();
    } catch (err) {
      setError(err.message || 'Facebook sign-in failed.');
      setLoading(false);
    }
  };

  // 1-Click Biometric Passkey
  const handlePasskeySignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await signInWithPasskey();
      await handleAuthSuccess(data?.session);
    } catch (err) {
      setError(
        err.message ||
          'Passkey sign-in failed. If not registered yet, log in with OTP/Email first to link biometrics in your Account.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Email Submit (Login or Signup)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (emailMode === 'login') {
        const data = await signInWithEmail(email, password);
        await handleAuthSuccess(data?.session);
      } else {
        const data = await signUpWithEmail(email, password, name);
        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists. Try logging in.');
        } else {
          setSuccessMsg('Account created! Please check your email to confirm your account.');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unified-auth-card-root">
      {/* Apple-style Frosted Container */}
      <motion.div
        className="auth-card-apple"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Dynamic Glow Aura */}
        <div className="auth-card-glow" />

        {/* Card Header */}
        <div className="auth-card-header">
          <div className="auth-badge-pill">
            <Sparkles size={13} className="sparkle-gold" />
            <span>ONE-CLICK ACCESS</span>
          </div>
          <h1 className="auth-heading">
            {emailMode === 'signup' && authMethod === 'email'
              ? 'Join Janu Bhai'
              : 'Welcome to Janu Bhai'}
          </h1>
          <p className="auth-subheading">
            {emailMode === 'signup' && authMethod === 'email'
              ? 'Create your artisan coffee account in seconds'
              : 'Sign in seamlessly to track orders and earn rewards'}
          </p>
        </div>

        {/* Apple Segmented Switcher: [ Phone OTP ] [ Email ] */}
        <div className="auth-segmented-wrapper">
          <div className="apple-segmented-control auth-method-selector">
            <button
              type="button"
              className={`apple-segmented-item ${authMethod === 'phone' ? 'active' : ''}`}
              onClick={() => {
                setAuthMethod('phone');
                setError(null);
                setSuccessMsg(null);
              }}
            >
              <Smartphone size={16} />
              <span>Phone OTP</span>
            </button>
            <button
              type="button"
              className={`apple-segmented-item ${authMethod === 'email' ? 'active' : ''}`}
              onClick={() => {
                setAuthMethod('email');
                setError(null);
                setSuccessMsg(null);
              }}
            >
              <Mail size={16} />
              <span>Email & Password</span>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              className="apple-alert-box error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              className="apple-alert-box success"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AUTH METHOD: PHONE OTP */}
        {authMethod === 'phone' && (
          <div className="auth-body-flow">
            {phoneStep === 'input' ? (
              <form onSubmit={handlePhoneSubmit} className="apple-form-stack">
                <div className="apple-input-group">
                  <label htmlFor="phone-input">Mobile Number</label>
                  <div className="input-with-icon">
                    <span className="input-prefix-tag">+91</span>
                    <input
                      id="phone-input"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      autoComplete="tel"
                      inputMode="tel"
                      className="apple-text-input has-prefix"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !phone.trim()}
                  className="apple-btn-gold auth-primary-submit"
                >
                  {loading ? (
                    <RefreshCw size={18} className="spin-fast" />
                  ) : (
                    <>
                      <span>Get Instant OTP</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="apple-form-stack">
                <div className="otp-step-info">
                  <p>
                    Enter 6-digit code sent to <strong className="text-gold">{phone}</strong>
                  </p>
                  <button
                    type="button"
                    className="apple-text-btn"
                    onClick={() => {
                      setPhoneStep('input');
                      setOtp('');
                      setError(null);
                    }}
                  >
                    Change Number
                  </button>
                </div>

                <div className="apple-input-group">
                  <label htmlFor="otp-input">Verification Code</label>
                  <input
                    id="otp-input"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="apple-text-input otp-code-input"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="apple-btn-gold auth-primary-submit"
                >
                  {loading ? (
                    <RefreshCw size={18} className="spin-fast" />
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <CheckCircle2 size={17} />
                    </>
                  )}
                </button>

                <div className="otp-resend-row">
                  {resendTimer > 0 ? (
                    <span className="resend-countdown">Resend OTP in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="apple-text-btn resend-active"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* AUTH METHOD: EMAIL & PASSWORD */}
        {authMethod === 'email' && (
          <div className="auth-body-flow">
            <form onSubmit={handleEmailSubmit} className="apple-form-stack">
              {emailMode === 'signup' && (
                <div className="apple-input-group">
                  <label htmlFor="name-input">Full Name</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon-lead" />
                    <input
                      id="name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="apple-text-input has-icon"
                    />
                  </div>
                </div>
              )}

              <div className="apple-input-group">
                <label htmlFor="email-input">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon-lead" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="apple-text-input has-icon"
                  />
                </div>
              </div>

              <div className="apple-input-group">
                <label htmlFor="pass-input">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon-lead" />
                  <input
                    id="pass-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    autoComplete={emailMode === 'login' ? 'current-password' : 'new-password'}
                    className="apple-text-input has-icon has-tail"
                  />
                  <button
                    type="button"
                    className="input-tail-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="apple-btn-gold auth-primary-submit"
              >
                {loading ? (
                  <RefreshCw size={18} className="spin-fast" />
                ) : (
                  <>
                    <span>{emailMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* Sub-toggle: Login vs Signup */}
              <div className="email-sub-toggle">
                {emailMode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="apple-text-link"
                      onClick={() => {
                        setEmailMode('signup');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="apple-text-link"
                      onClick={() => {
                        setEmailMode('login');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        )}

        {/* 1-CLICK INSTANT SOCIAL & BIOMETRIC AUTH DOCK */}
        <div className="auth-dock-divider">
          <span>OR ONE-CLICK SIGN IN</span>
        </div>

        <div className="apple-social-grid">
          {/* Google 1-Click */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="apple-social-pill"
            title="Continue with Google"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
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

          {/* Facebook 1-Click */}
          <button
            type="button"
            onClick={handleFacebookSignIn}
            disabled={loading}
            className="apple-social-pill"
            title="Continue with Facebook"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>

          {/* Biometric Passkey 1-Click */}
          <button
            type="button"
            onClick={handlePasskeySignIn}
            disabled={loading}
            className="apple-social-pill passkey-pill"
            title="Sign in with Biometrics / Passkey"
          >
            <Fingerprint size={18} className="passkey-icon" />
            <span>Passkey</span>
          </button>
        </div>

        {/* Security / Privacy Trust Pill */}
        <div className="auth-card-footer">
          <ShieldCheck size={14} className="shield-icon" />
          <span>256-Bit SSL Encrypted • Single Estate Coffeehouse Security</span>
        </div>
      </motion.div>
    </div>
  );
}
