"use client";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import "../login/auth.css";

export default function PosLoginPage() {
  const [mode, setMode] = useState("otp");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState(["", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("email");
  const router = useRouter();
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  const formatPhone = (raw) => {
    let p = raw.replace(/[\s()-]/g, '');
    if (/^\d{10}$/.test(p)) p = `+91${p}`;
    else if (/^\d+$/.test(p) && !p.startsWith('+')) p = `+${p}`;
    return p;
  };

  const handleSendOtp = async () => {
    if (!phone) return;
    setLoading(true);
    setError(null);
    try {
      await supabase.auth.signInWithOtp({
        phone: formatPhone(phone),
        options: { shouldCreateUser: true }
      });
      setStep("otp");
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(0, 1);
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs[index - 1].current?.focus();
    if (e.key === 'Enter') handleVerifyOtp();
  };

  const handleVerifyOtp = async () => {
    const token = otp.join("");
    if (token.length !== 6) { setError("Enter 6-digit OTP"); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formatPhone(phone),
        token,
        type: 'sms'
      });
      if (verifyError) throw verifyError;

      const formattedPhone = formatPhone(phone);
      const { data: staff } = await supabase
        .from('outlet_staff')
        .select('id, role, outlet_id')
        .or(`phone.eq.${formattedPhone},user_id.eq.${data.session.user.id}`)
        .maybeSingle();

      if (!staff) {
        await supabase.auth.signOut();
        setError("No POS staff found with this phone number.");
        setLoading(false);
        return;
      }

      if (!['cashier', 'barista', 'manager', 'owner', 'admin', 'superadmin'].includes(staff.role)) {
        await supabase.auth.signOut();
        setError("You do not have POS access.");
        setLoading(false);
        return;
      }

      if (staff.user_id !== data.session.user.id) {
        await supabase.from('outlet_staff').update({ user_id: data.session.user.id }).eq('id', staff.id);
      }

      router.push("/pos/dashboard");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStep("pin");
    setTimeout(() => pinRefs[0].current?.focus(), 100);
  };

  const handlePinChange = (index, value) => {
    if (value.length > 1) value = value.slice(0, 1);
    if (value && !/^\d$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) pinRefs[index + 1].current?.focus();
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) pinRefs[index - 1].current?.focus();
    if (e.key === 'Enter') handleLogin();
  };

  const handleLogin = async () => {
    const pinCode = pin.join("");
    if (pinCode.length !== 4 || !password) { setError("Please enter your PIN and password."); return; }
    setLoading(true);
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError(signInError.message); setLoading(false); return; }
    try {
      const { data: staff } = await supabase
        .from('outlet_staff')
        .select('role, outlet_id')
        .eq('user_id', data.session.user.id)
        .eq('pin', pinCode)
        .maybeSingle();
      if (!staff) { await supabase.auth.signOut(); setError("Invalid PIN or no POS access."); setLoading(false); return; }
      router.push("/pos/dashboard");
    } catch (err) {
      await supabase.auth.signOut();
      setError("Verification failed.");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("email");
    setPin(["", "", "", ""]);
    setPassword("");
    setError(null);
  };

  if (mode === "email") {
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
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cashier@janubhai.com" autoFocus />
                </div>
                <button type="submit" className="btn-primary full-width mt-20" disabled={!email}>CONTINUE</button>
              </form>
              <p className="mt-20 text-center" style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
                <button type="button" onClick={() => { setMode("otp"); setError(null); setPhone(""); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.85rem' }}>
                  Login with Phone OTP
                </button>
              </p>
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
                    <input key={index} ref={pinRefs[index]} type="password" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)} onKeyDown={(e) => handlePinKeyDown(index, e)}
                      style={{ width: '56px', height: '64px', textAlign: 'center', fontSize: '1.6rem', border: '2px solid var(--border-color)', borderRadius: '8px', fontFamily: 'monospace', fontWeight: 'bold', background: digit ? 'var(--accent-red)' : 'var(--bg-color)', color: digit ? '#fff' : 'var(--text-primary)', transition: 'all 0.15s ease' }} />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter account password" />
              </div>
              <button type="submit" className="btn-primary full-width mt-20" disabled={loading || pin.join("").length !== 4 || !password}>
                {loading ? "VERIFYING..." : "LOG IN"}
              </button>
            </form>
            <p className="mt-20 text-center" style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
              <button type="button" onClick={handleReset}
                style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.85rem' }}>
                Back to email
              </button>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="container auth-container">
        <div className="auth-box vintage-border" style={{ maxWidth: '400px' }}>
          <h1 className="auth-title">POS Login</h1>

          {step === "otp" ? (
            <>
              <p className="auth-subtitle" style={{ fontSize: '0.85rem' }}>OTP sent to {phone}</p>
              {error && <div className="error-box">{error}</div>}
              <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="auth-form">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px' }}>6-Digit OTP</label>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {otp.map((digit, index) => (
                      <input key={index} ref={otpRefs[index]} type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        style={{ width: '44px', height: '54px', textAlign: 'center', fontSize: '1.4rem', border: '2px solid var(--border-color)', borderRadius: '8px', fontFamily: 'monospace', fontWeight: 'bold', background: digit ? 'var(--accent-red)' : 'var(--bg-color)', color: digit ? '#fff' : 'var(--text-primary)' }} />
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-primary full-width mt-20" disabled={loading || otp.join("").length !== 6}>
                  {loading ? "VERIFYING..." : "VERIFY OTP"}
                </button>
              </form>
              <p className="mt-20 text-center" style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
                <button type="button" onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.85rem' }}>
                  Change phone number
                </button>
              </p>
            </>
          ) : (
            <>
              <p className="auth-subtitle" style={{ fontSize: '0.95rem' }}>Enter your phone number</p>
              {error && <div className="error-box">{error}</div>}
              <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="auth-form">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" autoFocus />
                </div>
                <button type="submit" className="btn-primary full-width mt-20" disabled={loading || !phone}>
                  {loading ? "SENDING OTP..." : "SEND OTP"}
                </button>
              </form>
              <p className="mt-20 text-center" style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
                <button type="button" onClick={() => { setMode("email"); setError(null); setStep("email"); setEmail(""); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.85rem' }}>
                  Login with Email + PIN
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
