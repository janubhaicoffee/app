"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";
import { MagneticButton } from "@/components/ui/motion/MagneticButton";
import { Mascot } from "@/components/ui/motion/Mascot";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: name+phone, 1: OTP verification
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSendOTP = () => {
    if (phone.length < 10 || !name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setStep(1);
      setLoading(false);
    }, 1000);
  };

  const handleOTPComplete = (code: string) => {
    setLoading(true);
    // Simulate account creation + redirect
    setTimeout(() => {
      router.replace("/app/onboarding");
    }, 800);
  };

  return (
    <main className="min-h-screen bg-bg-cream text-espresso-900 flex font-sans selection:bg-accent-red selection:text-white">
      {/* Left Side — Cinematic */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-espresso-900 text-bg-cream items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/roast.png" alt="Coffee" className="w-full h-full object-cover opacity-15 grayscale" />
          <div className="absolute inset-0 bg-espresso-900/85" />
        </div>
        <div className="absolute inset-0 bg-[url('/grain.png')] opacity-20 mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 p-16 max-w-lg space-y-10">
          <Mascot size={80} state="idle" />
          <div className="space-y-4">
            <h2 className="text-5xl font-heading tracking-tighter uppercase leading-[0.9] text-white">
              Join the<br/><span className="text-accent-gold italic">Brotherhood</span>.
            </h2>
            <p className="text-lg opacity-50 leading-relaxed font-medium text-white">
              Your number. Your identity. Your Adda. No passwords, no friction.
            </p>
          </div>
          <ul className="space-y-4 pt-4">
            {["100 free Janu Credits on signup", "Instant ordering from any hub", "Earn badges & cult status"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest opacity-50 text-white">
                <div className="w-2 h-2 bg-accent-gold rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
            <ArrowLeft size={14} /> Back home
          </Link>

          <div className="lg:hidden flex justify-center">
            <Mascot size={60} state="idle" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-heading tracking-tighter">
              {step === 0 ? "Create account" : "Verify your number"}
            </h1>
            <p className="text-sm opacity-40 font-medium">
              {step === 0 ? "Quick. No email needed. Just your phone." : `OTP sent to +91 ${phone}`}
            </p>
          </div>

          {step === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-4">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What do we call you?"
                  autoFocus
                  className="w-full rounded-2xl border-2 border-espresso-900/10 bg-white px-6 py-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-gold/10 focus:border-accent-gold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-4">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-espresso-900/30 font-bold">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full rounded-2xl border-2 border-espresso-900/10 bg-white px-6 pl-16 py-5 text-sm font-bold font-number focus:outline-none focus:ring-4 focus:ring-accent-gold/10 focus:border-accent-gold transition-all"
                  />
                </div>
              </div>
              <MagneticButton intensity={0.2} className="w-full">
                <Button
                  fullWidth
                  disabled={phone.length < 10 || !name.trim() || loading}
                  onClick={handleSendOTP}
                  size="lg"
                  className="bg-accent-gold text-espresso-900 py-6 rounded-full font-bold uppercase tracking-widest shadow-[0_10px_30px_rgba(255,184,0,0.3)] hover:bg-espresso-900 hover:text-bg-cream transition-all"
                >
                  {loading ? "Sending OTP..." : <>Continue <ArrowRight size={18} className="ml-2" /></>}
                </Button>
              </MagneticButton>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <OTPInput length={6} accentColor="gold" onComplete={handleOTPComplete} />
              <div className="text-center">
                <button onClick={() => setStep(0)} className="text-accent-red text-xs font-bold uppercase tracking-widest hover:underline">
                  Change number
                </button>
              </div>
              {loading && (
                <div className="flex justify-center">
                  <Mascot size={60} state="loading" />
                </div>
              )}
            </motion.div>
          )}

          {message && (
            <div className="bg-accent-red/5 border border-accent-red/10 rounded-2xl p-5 text-center">
              <p className="text-sm font-medium text-accent-red">{message}</p>
            </div>
          )}

          <div className="border-t border-espresso-900/5 pt-8 text-center">
            <p className="text-sm opacity-40">
              Already registered?{" "}
              <Link href="/login" className="font-bold text-espresso-900 opacity-100 hover:text-accent-red transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
