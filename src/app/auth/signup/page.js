"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../login/auth.css";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setError(error.message);
    } else {
      // If user identities is empty, it usually means the email is already registered 
      // but email confirmations are disabled or it's a soft duplicate.
      if (data?.user?.identities?.length === 0) {
        setError("An account with this email already exists.");
      } else {
        setMessage("Account created successfully! Logging you in...");
        setTimeout(() => router.push("/account"), 1500);
      }
    }
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="container auth-container">
        <div className="auth-box vintage-border">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Janu Bhai Coffee</p>
          
          {error && <div className="error-box">{error}</div>}
          {message && <div className="success-box">{message}</div>}

          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Arsalan Azad" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@janubhai.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} />
            </div>
            <button type="submit" className="btn-primary full-width mt-20" disabled={loading}>
              {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
            </button>
          </form>

          <p className="mt-20 text-center" style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
            Already have an account? <Link href="/auth/login" style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
