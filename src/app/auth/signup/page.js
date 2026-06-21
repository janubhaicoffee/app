"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../login/auth.css"; // Reuse auth css

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
      setMessage("Registration successful! You can now log in.");
      // If email confirmation is enabled, they need to check email.
      // Assuming auto-login or simple redirect for now:
      setTimeout(() => router.push("/account"), 1500);
    }
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="container auth-container">
        <div className="auth-box vintage-border">
          <h1 className="auth-title">Join The Club</h1>
          <p className="auth-subtitle">Create a Janu Bhai account</p>
          
          {error && <div className="error-box">{error}</div>}
          {message && <div className="success-box">{message}</div>}

          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary full-width mt-20" disabled={loading}>
              {loading ? "CREATING..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link href="/auth/login" className="auth-link">Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
