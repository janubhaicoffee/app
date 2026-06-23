"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./auth.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let errMsg = error.message || error.msg || JSON.stringify(error);
      if (typeof errMsg === 'object') errMsg = JSON.stringify(errMsg);
      if (errMsg === '{}') errMsg = "Invalid email or password.";
      setError(errMsg);
    } else {
      router.push("/account");
    }
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="container auth-container">
        <div className="auth-box vintage-border">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to your account</p>
          
          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
            </div>
            <button type="submit" className="btn-primary full-width mt-20" disabled={loading}>
              {loading ? "LOGGING IN..." : "LOG IN"}
            </button>
          </form>

          <p className="mt-20 text-center" style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
            Don't have an account? <Link href="/auth/signup" style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
