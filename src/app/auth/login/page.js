"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import "./auth.css";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  const isPhone = (val) => /^\d{10}$/.test(val);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const isMobile = isPhone(identifier);
    const payload = isMobile 
      ? { phone: '+91' + identifier } 
      : { email: identifier };

    const { error } = await supabase.auth.signInWithOtp({
      ...payload,
      options: {
        shouldCreateUser: true,
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(`A 6-digit login code has been sent to your ${isMobile ? 'mobile number' : 'email'}.`);
      setStep(2);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isMobile = isPhone(identifier);
    const payload = isMobile 
      ? { phone: '+91' + identifier, type: 'sms' } 
      : { email: identifier, type: 'email' };

    const { data, error } = await supabase.auth.verifyOtp({
      ...payload,
      token: otp,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/account");
    }
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="container auth-container">
        <div className="auth-box vintage-border">
          <h1 className="auth-title">Welcome</h1>
          <p className="auth-subtitle">Sign in or create an account</p>
          
          {error && <div className="error-box">{error}</div>}
          {message && <div className="success-box">{message}</div>}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="form-group">
                <label>Email Address or Mobile</label>
                <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email or 10-digit mobile" />
              </div>
              <button type="submit" className="btn-primary full-width mt-20" disabled={loading}>
                {loading ? "SENDING CODE..." : "SEND LOGIN CODE"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="form-group">
                <label>6-Digit Code</label>
                <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} />
              </div>
              <button type="submit" className="btn-primary full-width mt-20" disabled={loading}>
                {loading ? "VERIFYING..." : "VERIFY & SIGN IN"}
              </button>
              <button type="button" className="btn-secondary full-width mt-20" onClick={() => setStep(1)} disabled={loading}>
                BACK
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
