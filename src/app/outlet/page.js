'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, Eye, EyeOff, AlertTriangle, ShieldCheck, Phone } from 'lucide-react';
import OutletDashboard from './dashboard/page';

export default function OutletPortalPage() {
  const router = useRouter();
  const redirectAdmin = () => {
    const isSub = typeof window !== 'undefined' && window.location.hostname.startsWith('outlet.');
    router.push(isSub ? '/dashboard' : '/outlet/dashboard');
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [authError, setAuthError] = useState('');

  const [loginMode, setLoginMode] = useState('otp');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpStep, setOtpStep] = useState('phone');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [lockoutSecs, setLockoutSecs] = useState(0);

  const formatPhone = (raw) => {
    let p = raw.replace(/[\s()-]/g, '');
    if (/^\d{10}$/.test(p)) p = `+91${p}`;
    else if (/^\d+$/.test(p) && !p.startsWith('+')) p = `+${p}`;
    return p;
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          const response = await fetch('/api/admin/data?type=check', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.isAdmin) {
              setIsAuthorizedAdmin(true);
              redirectAdmin();
            } else {
              setIsAuthorizedAdmin(false);
            }
          } else {
            setIsAuthorizedAdmin(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Session verification failed', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    let timer = null;
    const lockoutTime = localStorage.getItem('outlet_login_lockout');
    if (lockoutTime) {
      const remaining = Math.ceil((parseInt(lockoutTime) - Date.now()) / 1000);
      if (remaining > 0) {
        setLockoutSecs(remaining);
        timer = setInterval(() => {
          const rem = Math.ceil((parseInt(lockoutTime) - Date.now()) / 1000);
          if (rem <= 0) {
            setLockoutSecs(0);
            localStorage.removeItem('outlet_login_lockout');
            localStorage.removeItem('outlet_login_attempts');
            clearInterval(timer);
          } else {
            setLockoutSecs(rem);
          }
        }, 1000);
      } else {
        localStorage.removeItem('outlet_login_lockout');
        localStorage.removeItem('outlet_login_attempts');
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [submitting]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAuthorizedAdmin(false);
    setLoginError('');
    setAuthError('');
    setEmail('');
    setPassword('');
    router.push('/outlet');
  };

  const handleSendOtp = async () => {
    if (!phone) return;
    setSubmitting(true);
    setLoginError('');
    try {
      await supabase.auth.signInWithOtp({
        phone: formatPhone(phone),
        options: { shouldCreateUser: true },
      });
      setOtpStep('verify');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join('');
    if (token.length !== 6) {
      setLoginError('Enter 6-digit OTP');
      return;
    }
    setSubmitting(true);
    setLoginError('');
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formatPhone(phone),
        token,
        type: 'sms',
      });
      if (verifyError) throw verifyError;

      const formattedPhone = formatPhone(phone);

      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('phone', formattedPhone)
        .maybeSingle();

      if (profile) {
        localStorage.removeItem('outlet_login_attempts');
        localStorage.removeItem('outlet_login_lockout');
        setIsAuthenticated(true);
        setIsAuthorizedAdmin(true);
        redirectAdmin();
        return;
      }

      const { data: staff } = await supabase
        .from('outlet_staff')
        .select('role')
        .or(`phone.eq.${formattedPhone},user_id.eq.${data.session.user.id}`)
        .in('role', ['manager', 'owner', 'superadmin'])
        .maybeSingle();

      if (staff) {
        if (staff.user_id !== data.session.user.id) {
          await supabase
            .from('outlet_staff')
            .update({ user_id: data.session.user.id })
            .eq('phone', formattedPhone);
        }
        localStorage.removeItem('outlet_login_attempts');
        localStorage.removeItem('outlet_login_lockout');
        setIsAuthenticated(true);
        setIsAuthorizedAdmin(true);
        redirectAdmin();
        return;
      }

      await supabase.auth.signOut();
      setLoginError(
        'Access Denied: Only authorized managers have permission to enter the outlet portal.',
      );
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const lockoutTime = localStorage.getItem('outlet_login_lockout');
    if (lockoutTime && parseInt(lockoutTime) > Date.now()) {
      setLoginError(
        `Too many failed attempts. Try again in ${Math.ceil((parseInt(lockoutTime) - Date.now()) / 1000)} seconds.`,
      );
      return;
    }

    setSubmitting(true);
    setLoginError('');

    const sanitizedEmail = email.trim();
    const sanitizedPassword = password;

    if (!sanitizedEmail || !sanitizedPassword) {
      setLoginError('Please enter both email and password.');
      setSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 80) {
      setLoginError('Access Denied: Invalid email format or length.');
      setSubmitting(false);
      return;
    }

    if (sanitizedPassword.length < 6 || sanitizedPassword.length > 60) {
      setLoginError('Access Denied: Invalid credentials.');
      setSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (error) {
        const attempts = (parseInt(localStorage.getItem('outlet_login_attempts')) || 0) + 1;
        localStorage.setItem('outlet_login_attempts', attempts.toString());
        if (attempts >= 5) {
          const lockUntil = Date.now() + 5 * 60 * 1000;
          localStorage.setItem('outlet_login_lockout', lockUntil.toString());
          setLockoutSecs(300);
          setLoginError('Too many failed attempts. Access locked for 5 minutes.');
        } else {
          setLoginError(`Access Denied: Invalid credentials. (${5 - attempts} attempts remaining)`);
        }
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/admin/data?type=check', {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });

      if (response.ok) {
        const checkData = await response.json();
        if (checkData.isAdmin) {
          localStorage.removeItem('outlet_login_attempts');
          localStorage.removeItem('outlet_login_lockout');
          setIsAuthenticated(true);
          setIsAuthorizedAdmin(true);
          redirectAdmin();
        } else {
          await supabase.auth.signOut();
          setLoginError(
            'Access Denied: Only authorized managers have permission to enter the outlet portal.',
          );
        }
      } else {
        await supabase.auth.signOut();
        setLoginError('Access Denied: Verification failed.');
      }
    } catch (err) {
      console.error('Authentication request failed', err);
      setLoginError('Access Denied: Authentication request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="portal-loading-container">
        <div className="portal-loading-spinner" />
        <p>Securing connection...</p>
        <style jsx>{`
          .portal-loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #f8f1e4;
            color: #3e2723;
            font-family: sans-serif;
          }
          .portal-loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #d7ccc8;
            border-top-color: #3e2723;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 12px;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (isAuthenticated && isAuthorizedAdmin) {
    return <OutletDashboard />;
  }

  if (isAuthenticated && !isAuthorizedAdmin) {
    return (
      <div className="portal-page">
        <div className="portal-card secure-border">
          <div className="logo-container">
            <Image src="/logo.png" alt="Janu Bhai Coffee Logo" width={100} height={100} priority />
          </div>
          <div className="portal-header">
            <AlertTriangle className="error-icon" size={48} />
            <h1>Access Denied</h1>
            <p>Your account does not have permission to access the Outlet Administration Portal.</p>
          </div>
          <div className="portal-actions">
            <button className="btn-portal-primary" onClick={handleLogout}>
              LOG OUT & SWITCH ACCOUNT
            </button>
          </div>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-card secure-border">
        <div className="logo-container">
          <Image src="/logo.png" alt="Janu Bhai Coffee Logo" width={110} height={110} priority />
        </div>
        <div className="portal-header">
          <h1>JANU BHAI COFFEE</h1>
          <span className="secure-badge">
            <ShieldCheck size={14} /> EMPLOYEE PORTAL
          </span>
          <p>Authorized personnel only. Access attempts are audited.</p>
        </div>

        {/* Login mode tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            marginBottom: '24px',
            width: '100%',
            borderBottom: '2px solid var(--border-color, #D7CCC8)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setLoginMode('otp');
              setLoginError('');
              setOtpStep('phone');
              setPhone('');
              setOtp(['', '', '', '', '', '']);
            }}
            style={{
              flex: 1,
              padding: '10px',
              background: loginMode === 'otp' ? '#3E2723' : 'transparent',
              color: loginMode === 'otp' ? '#fff' : '#5D4037',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.15s',
              borderRadius: '8px 8px 0 0',
            }}
          >
            <Phone size={14} style={{ marginRight: 6, display: 'inline' }} /> Phone OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('email');
              setLoginError('');
              setEmail('');
              setPassword('');
            }}
            style={{
              flex: 1,
              padding: '10px',
              background: loginMode === 'email' ? '#3E2723' : 'transparent',
              color: loginMode === 'email' ? '#fff' : '#5D4037',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.15s',
              borderRadius: '8px 8px 0 0',
            }}
          >
            <Mail size={14} style={{ marginRight: 6, display: 'inline' }} /> Email & Password
          </button>
        </div>

        {loginError && (
          <div className="portal-error-banner">
            <AlertTriangle size={16} />
            <span>{loginError}</span>
          </div>
        )}

        {loginMode === 'otp' ? (
          otpStep === 'verify' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyOtp();
              }}
              className="portal-form"
            >
              <p style={{ fontSize: '13px', textAlign: 'center', color: '#5D4037' }}>
                OTP sent to {phone}
              </p>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    marginBottom: '10px',
                    fontSize: '13px',
                  }}
                >
                  6-Digit OTP
                </label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        let v = e.target.value;
                        if (v.length > 1) v = v.slice(0, 1);
                        if (v && !/^\d$/.test(v)) return;
                        const newOtp = [...otp];
                        newOtp[index] = v;
                        setOtp(newOtp);
                        if (v && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[index] && index > 0)
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        if (e.key === 'Enter') handleVerifyOtp();
                      }}
                      id={`otp-${index}`}
                      style={{
                        width: '44px',
                        height: '52px',
                        textAlign: 'center',
                        fontSize: '1.3rem',
                        border: '2px solid var(--border-color, #D7CCC8)',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        background: digit ? '#3E2723' : '#fff',
                        color: digit ? '#fff' : '#3E2723',
                        outline: 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="btn-portal-primary"
                disabled={submitting || otp.join('').length !== 6}
              >
                {submitting ? 'VERIFYING...' : 'VERIFY OTP'}
              </button>
              <p style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep('phone');
                    setOtp(['', '', '', '', '', '']);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#B71C1C',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    fontSize: '0.85rem',
                  }}
                >
                  Change phone number
                </button>
              </p>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOtp();
              }}
              className="portal-form"
            >
              <div className="portal-form-group">
                <label>Phone Number</label>
                <div className="portal-input-wrapper">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="tel"
                    required
                    disabled={submitting}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    maxLength={20}
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="btn-portal-primary" disabled={submitting || !phone}>
                {submitting ? 'SENDING OTP...' : 'SEND OTP'}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleLogin} className="portal-form">
            <div className="portal-form-group">
              <label>Email Address</label>
              <div className="portal-input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  required
                  disabled={lockoutSecs > 0 || submitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@janubhai.com"
                  maxLength={80}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="portal-form-group">
              <label>Security Password</label>
              <div className="portal-input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockoutSecs > 0 || submitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  maxLength={60}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn-portal-primary"
              disabled={submitting || lockoutSecs > 0}
            >
              {submitting
                ? 'AUTHENTICATING SECURELY...'
                : lockoutSecs > 0
                  ? `LOCKED OUT (${lockoutSecs}s)`
                  : 'SECURE LOG IN'}
            </button>
          </form>
        )}
      </div>
      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .portal-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #F8F1E4;
    padding: 24px;
    font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
  }
  .portal-card {
    background: #ffffff;
    width: 100%;
    max-width: 440px;
    padding: 40px 32px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(62, 39, 35, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .secure-border {
    border: 2px solid var(--primary-color, #3E2723);
    border-top: 6px solid var(--primary-color, #3E2723);
  }
  .logo-container {
    margin-bottom: 20px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
  }
  .portal-header {
    text-align: center;
    margin-bottom: 28px;
    width: 100%;
  }
  .portal-header h1 {
    font-family: var(--font-playfair), serif;
    font-size: 24px;
    font-weight: 800;
    color: var(--primary-color, #3E2723);
    margin: 0 0 6px;
    letter-spacing: 0.5px;
  }
  .secure-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 700;
    color: var(--accent-gold, #FFB300);
    background: var(--primary-color, #3E2723);
    padding: 3px 8px;
    border-radius: 4px;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }
  .portal-header p {
    font-size: 13px;
    color: var(--text-secondary, #5D4037);
    margin: 0;
    line-height: 1.4;
  }
  .portal-error-banner {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #ffebee;
    border-left: 4px solid var(--accent-red, #B71C1C);
    color: #c62828;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 24px;
    width: 100%;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
  }
  .error-icon {
    color: var(--accent-red, #B71C1C);
    margin-bottom: 12px;
  }
  .portal-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .portal-form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }
  .portal-form-group label {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary, #5D4037);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .portal-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }
  .portal-input-wrapper input {
    width: 100%;
    padding: 12px 40px;
    border: 1.5px solid var(--border-color, #D7CCC8);
    border-radius: 8px;
    font-size: 14px;
    color: var(--text-primary, #3E2723);
    background: #ffffff;
    outline: none;
  }
  .portal-input-wrapper input:focus {
    border-color: var(--primary-color, #3E2723);
    box-shadow: 0 0 0 3px rgba(62, 39, 35, 0.08);
  }
  .portal-input-wrapper input:disabled {
    background: #f5ebe6;
    color: #a1887f;
    cursor: not-allowed;
  }
  .input-icon {
    position: absolute;
    left: 14px;
    color: #a1887f;
    pointer-events: none;
  }
  .password-toggle {
    position: absolute;
    right: 14px;
    background: none;
    border: none;
    color: #a1887f;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
  }
  .password-toggle:hover {
    color: var(--primary-color, #3E2723);
  }
  .btn-portal-primary {
    background: var(--primary-color, #3E2723);
    color: #ffffff;
    padding: 14px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    width: 100%;
    margin-top: 10px;
    box-shadow: 0 4px 12px rgba(62, 39, 35, 0.15);
  }
  .btn-portal-primary:hover:not(:disabled) {
    background: #4a3228;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(62, 39, 35, 0.2);
  }
  .btn-portal-primary:disabled {
    background: var(--border-color, #D7CCC8);
    color: #a1887f;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
  .portal-actions {
    margin-top: 24px;
    width: 100%;
  }
  @media (max-width: 768px) {
    .portal-page { padding: 16px; }
    .portal-card { padding: 28px 20px; max-width: 100%; }
    .portal-header h1 { font-size: 20px; }
    .portal-input-wrapper input { padding: 10px 36px; font-size: 16px; }
    .btn-portal-primary { padding: 12px; font-size: 13px; }
  }
  @media (max-width: 480px) {
    .portal-page { padding: 12px; }
    .portal-card { padding: 24px 16px; border-radius: 10px; }
    .portal-header h1 { font-size: 18px; }
    .portal-header p { font-size: 12px; }
    .portal-input-wrapper input { padding: 10px 32px; font-size: 16px; }
    .input-icon { left: 10px; }
    .password-toggle { right: 10px; }
  }
  @media (max-width: 380px) {
    #otp-0, #otp-1, #otp-2, #otp-3, #otp-4, #otp-5 { width: 38px !important; height: 46px !important; font-size: 1.1rem !important; }
  }
`;
