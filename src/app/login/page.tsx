"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, LogIn, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";
import { MagneticButton } from "@/components/ui/motion/MagneticButton";
import { Mascot } from "@/components/ui/motion/Mascot";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabase";
import React, { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "customer";
  const isFranchise = role === "franchise";

  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Customer: simulated OTP flow
  const handleSendOTP = () => {
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 1000);
  };

  const handleOTPComplete = (code: string) => {
    setLoading(true);
    setTimeout(() => {
      router.replace("/app");
    }, 800);
  };

  // Franchise: email/password flow
  async function handleFranchiseLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    if (!isSupabaseConfigured) {
      setMessage("Supabase environment variables are missing.");
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace("/app");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg-cream text-espresso-900 flex font-sans selection:bg-accent-red selection:text-white">
      {/* Left Side — Cinematic Visual */}
      <div className={`hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden ${isFranchise ? 'bg-accent-red' : 'bg-espresso-900'}`}>
        <div className="absolute inset-0">
          <img src="/farm.png" alt="Chikkamagaluru" className="w-full h-full object-cover opacity-15 grayscale" />
          <div className={`absolute inset-0 ${isFranchise ? 'bg-accent-red/85' : 'bg-espresso-900/85'}`} />
        </div>
        <div className="absolute inset-0 bg-[url('/grain.png')] opacity-20 mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 p-16 max-w-lg space-y-10">
          <Mascot size={80} state="idle" />

          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-heading tracking-tighter uppercase leading-[0.9] text-white">
              {isFranchise ? (
                <>Operator<br/>Access<span className="text-accent-gold">.</span></>
              ) : (
                <>Welcome to<br/>the <span className="text-accent-gold italic">Adda</span>.</>
              )}
            </h2>
            <p className="text-lg opacity-50 leading-relaxed font-medium text-white">
              {isFranchise 
                ? "Manage your outlets, track live orders, and control the Janu Bhai OS."
                : "Order, earn credits, and unlock cult status across every Janu Bhai hub."
              }
            </p>
          </div>

          <div className="flex gap-6 pt-4">
            {[
              { val: isFranchise ? "POS" : "₹20", label: isFranchise ? "Terminal" : "Hot Coffee" },
              { val: isFranchise ? "KDS" : "₹50", label: isFranchise ? "Kitchen" : "Cold Coffee" },
              { val: isFranchise ? "24/7" : "100", label: isFranchise ? "Uptime" : "Free Credits" },
            ].map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="h-12 w-px bg-white/10" />}
                <div className="space-y-1">
                  <p className="text-3xl font-heading text-accent-gold">{item.val}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 text-white">{item.label}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
            <ArrowLeft size={14} /> Back home
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center">
            <Mascot size={60} state="idle" />
          </div>

          {/* Role Switcher */}
          <div className="flex bg-espresso-900/5 rounded-full p-1">
            <Link
              href="/login?role=customer"
              className={`flex-1 text-center py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                !isFranchise ? 'bg-accent-gold text-espresso-900 shadow-md' : 'text-espresso-900/40 hover:text-espresso-900/70'
              }`}
            >
              Customer
            </Link>
            <Link
              href="/login?role=franchise"
              className={`flex-1 text-center py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                isFranchise ? 'bg-accent-red text-white shadow-md' : 'text-espresso-900/40 hover:text-espresso-900/70'
              }`}
            >
              Operator
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {!isFranchise ? (
              /* CUSTOMER FLOW: Phone + OTP */
              <motion.div
                key="customer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-heading tracking-tighter">
                    Enter the <span className="text-accent-gold">Adda</span>.
                  </h1>
                  <p className="text-sm opacity-40 font-medium">Your phone number is your identity.</p>
                </div>

                {!otpSent ? (
                  <div className="space-y-6">
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-espresso-900/30 font-bold text-lg">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full rounded-2xl border-2 border-espresso-900/10 bg-white px-6 pl-16 py-6 text-xl font-bold font-number focus:outline-none focus:border-accent-gold focus:ring-4 focus:ring-accent-gold/10 transition-all"
                      />
                    </div>
                    <MagneticButton intensity={0.2} className="w-full">
                      <Button
                        fullWidth
                        disabled={phone.length < 10 || loading}
                        onClick={handleSendOTP}
                        size="lg"
                        className="bg-accent-gold text-espresso-900 py-6 rounded-full font-bold uppercase tracking-widest shadow-[0_10px_30px_rgba(255,184,0,0.3)] hover:bg-espresso-900 hover:text-bg-cream transition-all"
                      >
                        {loading ? "Sending..." : "Send OTP"}
                      </Button>
                    </MagneticButton>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-2">
                      <p className="text-sm font-bold uppercase tracking-widest text-espresso-900/50">
                        OTP sent to +91 {phone}
                      </p>
                      <button onClick={() => setOtpSent(false)} className="text-accent-red text-xs font-bold uppercase tracking-widest hover:underline">
                        Change number
                      </button>
                    </div>
                    <OTPInput length={6} accentColor="gold" onComplete={handleOTPComplete} />
                    {loading && (
                      <div className="flex justify-center">
                        <Mascot size={60} state="loading" />
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* FRANCHISE FLOW: Email + Password */
              <motion.div
                key="franchise"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-heading tracking-tighter flex items-center gap-3">
                    <Shield className="text-accent-red" size={32} /> Operator Access.
                  </h1>
                  <p className="text-sm opacity-40 font-medium">Enter your credentials to access the Janu Bhai OS.</p>
                </div>

                <form className="space-y-5" onSubmit={handleFranchiseLogin}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-4">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@janubhai.com"
                      className="w-full rounded-2xl border-2 border-espresso-900/10 bg-white px-6 py-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-red/10 focus:border-accent-red transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-4">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border-2 border-espresso-900/10 bg-white px-6 py-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-red/10 focus:border-accent-red transition-all"
                    />
                  </div>
                  <MagneticButton intensity={0.2} className="w-full">
                    <Button fullWidth disabled={loading} size="lg" className="bg-accent-red text-white py-6 rounded-full font-bold uppercase tracking-widest shadow-[0_10px_30px_rgba(226,55,68,0.3)] hover:bg-espresso-900 transition-all">
                      <LogIn size={18} className="mr-2" />
                      {loading ? "Authenticating..." : "Enter the OS"}
                    </Button>
                  </MagneticButton>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {message && (
            <div className="bg-accent-red/5 border border-accent-red/10 rounded-2xl p-5 text-center">
              <p className="text-sm font-medium text-accent-red">{message}</p>
            </div>
          )}

          <div className="border-t border-espresso-900/5 pt-8 text-center">
            <p className="text-sm opacity-40">
              New here?{" "}
              <Link href="/signup" className="font-bold text-espresso-900 opacity-100 hover:text-accent-red transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
