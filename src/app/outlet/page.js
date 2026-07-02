"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, Eye, EyeOff, AlertTriangle, ShieldCheck } from "lucide-react";
import OutletDashboard from "./dashboard/page";

export default function OutletPortalPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [authError, setAuthError] = useState("");

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [lockoutSecs, setLockoutSecs] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          // Check if they are admin
          const response = await fetch('/api/admin/data?type=check', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.isAdmin) {
              setIsAuthorizedAdmin(true);
              // Safe redirect to dashboard
              router.push("/dashboard");
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
        console.error("Session verification failed", err);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkSession();
  }, [router]);

  // Rate Limiting Cooldown Countdown
  useEffect(() => {
    let timer = null;
    const lockoutTime = localStorage.getItem("outlet_login_lockout");
    if (lockoutTime) {
      const remaining = Math.ceil((parseInt(lockoutTime) - Date.now()) / 1000);
      if (remaining > 0) {
        setLockoutSecs(remaining);
        timer = setInterval(() => {
          const rem = Math.ceil((parseInt(lockoutTime) - Date.now()) / 1000);
          if (rem <= 0) {
            setLockoutSecs(0);
            localStorage.removeItem("outlet_login_lockout");
            localStorage.removeItem("outlet_login_attempts");
            clearInterval(timer);
          } else {
            setLockoutSecs(rem);
          }
        }, 1000);
      } else {
        localStorage.removeItem("outlet_login_lockout");
        localStorage.removeItem("outlet_login_attempts");
      }
    }
    return () => { if (timer) clearInterval(timer); };
  }, [submitting]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAuthorizedAdmin(false);
    setLoginError("");
    setAuthError("");
    setEmail("");
    setPassword("");
    router.push("/outlet");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Check Lockout
    const lockoutTime = localStorage.getItem("outlet_login_lockout");
    if (lockoutTime && parseInt(lockoutTime) > Date.now()) {
      setLoginError(`Too many failed attempts. Try again in ${Math.ceil((parseInt(lockoutTime) - Date.now()) / 1000)} seconds.`);
      return;
    }

    setSubmitting(true);
    setLoginError("");

    // Input sanitization
    const sanitizedEmail = email.trim();
    const sanitizedPassword = password;

    // Strict validation
    if (!sanitizedEmail || !sanitizedPassword) {
      setLoginError("Please enter both email and password.");
      setSubmitting(false);
      return;
    }

    // Email format regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 80) {
      setLoginError("Access Denied: Invalid email format or length.");
      setSubmitting(false);
      return;
    }

    if (sanitizedPassword.length < 6 || sanitizedPassword.length > 60) {
      setLoginError("Access Denied: Invalid credentials.");
      setSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword
      });

      if (error) {
        // Register failed attempt
        const attempts = (parseInt(localStorage.getItem("outlet_login_attempts")) || 0) + 1;
        localStorage.setItem("outlet_login_attempts", attempts.toString());
        
        if (attempts >= 5) {
          const lockUntil = Date.now() + 5 * 60 * 1000; // 5 min lockout
          localStorage.setItem("outlet_login_lockout", lockUntil.toString());
          setLockoutSecs(300);
          setLoginError("Too many failed attempts. Access locked for 5 minutes.");
        } else {
          setLoginError(`Access Denied: Invalid credentials. (${5 - attempts} attempts remaining)`);
        }
        setSubmitting(false);
        return;
      }

      // Check admin status
      const response = await fetch('/api/admin/data?type=check', {
        headers: { 'Authorization': `Bearer ${data.session.access_token}` }
      });
      
      if (response.ok) {
        const checkData = await response.json();
        if (checkData.isAdmin) {
          // Success! Clear attempts
          localStorage.removeItem("outlet_login_attempts");
          localStorage.removeItem("outlet_login_lockout");
          setIsAuthenticated(true);
          setIsAuthorizedAdmin(true);
          router.push("/dashboard");
        } else {
          // Logged in but not admin
          await supabase.auth.signOut();
          setLoginError("Access Denied: Only authorized managers have permission to enter the outlet portal.");
        }
      } else {
        await supabase.auth.signOut();
        setLoginError("Access Denied: Verification failed.");
      }
    } catch (err) {
      console.error("Authentication request failed", err);
      setLoginError("Access Denied: Authentication request failed.");
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
            background: #F8F1E4;
            color: #3E2723;
            font-family: sans-serif;
          }
          .portal-loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #D7CCC8;
            border-top-color: #3E2723;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 12px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If already authenticated and authorized, render dashboard
  if (isAuthenticated && isAuthorizedAdmin) {
    return <OutletDashboard />;
  }

  // If authenticated but NOT authorized (customer session leakage)
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

  // Not authenticated: render the secure login page
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

        {loginError && (
          <div className="portal-error-banner">
            <AlertTriangle size={16} />
            <span>{loginError}</span>
          </div>
        )}

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
                type={showPassword ? "text" : "password"}
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
            {submitting ? (
              "AUTHENTICATING SECURELY..."
            ) : lockoutSecs > 0 ? (
              `LOCKED OUT (${lockoutSecs}s)`
            ) : (
              "SECURE LOG IN"
            )}
          </button>
        </form>
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
    background: #F8F1E4; /* Warm vintage cream background */
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
    transition: transform 0.2s;
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
    transition: all 0.15s ease-in-out;
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
    transition: all 0.15s;
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
`;
