"use client";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import "../login/auth.css";

export default function PosLoginPage() {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("email");
  const router = useRouter();
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStep("pin");
    setTimeout(() => pinRefs[0].current?.focus(), 100);
  };

  const handlePinChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    const pinCode = pin.join("");
    if (pinCode.length !== 4 || !password) {
      setError("Please enter your PIN and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      let errMsg = signInError.message || signInError.msg || JSON.stringify(signInError);
      if (typeof errMsg === 'object') errMsg = JSON.stringify(errMsg);
      if (errMsg === '{}') errMsg = "Invalid credentials.";
      setError(errMsg);
      setLoading(false);
      return;
    }

    try {
      const { data: staff } = await supabase
        .from('outlet_staff')
        .select('role, outlet_id')
        .eq('user_id', data.session.user.id)
        .eq('pin', pinCode)
        .maybeSingle();

      if (!staff) {
        await supabase.auth.signOut();
        setError("Invalid PIN or no POS access.");
        setLoading(false);
        return;
      }

      router.push("/pos/dashboard");
    } catch (err) {
      await supabase.auth.signOut();
      setError("Verification failed. Please try again.");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("email");
    setPin(["", "", "", ""]);
    setPassword("");
    setError(null);
  };

  if (step === "email") {
    return (
      <main className="auth-page">
        <div className="container auth-container">
          <div className="auth-box vintage-border" style={{ maxWidth: '400px' }}>
            <h1 className="auth-title">POS Login</h1>
            <p className="auth-subtitle" style={{ fontSize: '0.95rem' }}>Enter your email to begin</p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleEmailSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cashier@janubhai.com"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary full-width mt-20" disabled={!email}>
                CONTINUE
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="container auth-container">
        <div className="auth-box vintage-border" style={{ maxWidth: '400px' }}>
          <h1 className="auth-title" style={{ fontSize: '1.8rem' }}>Enter PIN</h1>
          <p className="auth-subtitle" style={{ fontSize: '0.85rem' }}>{email}</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="auth-form">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px' }}>4-Digit PIN</label>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={pinRefs[index]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    style={{
                      width: '56px', height: '64px', textAlign: 'center', fontSize: '1.6rem',
                      border: '2px solid var(--border-color)', borderRadius: '8px',
                      fontFamily: 'monospace', fontWeight: 'bold',
                      background: digit ? 'var(--accent-red)' : 'var(--bg-color)',
                      color: digit ? '#fff' : 'var(--text-primary)',
                      transition: 'all 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
              />
            </div>

            <button type="submit" className="btn-primary full-width mt-20" disabled={loading || pin.join("").length !== 4 || !password}>
              {loading ? "VERIFYING..." : "LOG IN"}
            </button>
          </form>

          <p className="mt-20 text-center" style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
            <button type="button" onClick={handleReset}
              style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.85rem' }}
            >
              Back to email
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
