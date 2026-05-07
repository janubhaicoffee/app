"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!isSupabaseConfigured) {
      setMessage("Supabase environment variables are missing. Configure the real backend before account creation.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "customer",
          },
        },
      });
      if (error) throw error;
      router.replace("/app");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Account creation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg-cream text-accent-brown flex">
      {/* Left Side — Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-accent-brown text-bg-cream items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/roast.png" alt="Coffee Roasting" className="w-full h-full object-cover opacity-20 grayscale" />
          <div className="absolute inset-0 bg-accent-brown/80" />
        </div>
        <div className="relative z-10 p-16 max-w-lg space-y-10">
          <img src="/logo.png" alt="Janu Bhai Coffee" className="h-20 w-auto object-contain" />
          <div className="space-y-4">
            <h2 className="text-5xl font-heading tracking-tighter uppercase leading-[0.9]">
              Join the<br/><span className="text-accent-gold italic">Brotherhood</span>.
            </h2>
            <p className="text-lg opacity-50 leading-relaxed font-medium">
              Create your account to order, track, and experience the Janu Bhai ecosystem.
            </p>
          </div>
          <ul className="space-y-4 pt-4">
            {[
              "Real-time order tracking",
              "Exclusive member offers",
              "Franchise partner dashboard"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest opacity-50">
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
            <ArrowLeft size={14} />
            Back home
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center">
            <img src="/logo.png" alt="Janu Bhai Coffee" className="h-16 w-auto object-contain" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-heading tracking-tighter">Create account</h1>
            <p className="text-sm opacity-40 font-medium">Customer accounts are created here. Staff roles are assigned by HQ.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                className="w-full rounded-2xl border border-black/5 bg-white px-6 py-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-brown/5 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-black/5 bg-white px-6 py-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-brown/5 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-2xl border border-black/5 bg-white px-6 py-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-brown/5 transition-all"
              />
            </div>
            <Button fullWidth disabled={loading} size="lg" className="bg-accent-brown text-white py-6 group">
              <UserPlus size={18} className="mr-2" />
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          {message && (
            <div className="bg-accent-red/5 border border-accent-red/10 rounded-2xl p-5 text-center">
              <p className="text-sm font-medium text-accent-red">{message}</p>
            </div>
          )}

          <div className="border-t border-black/5 pt-8 text-center">
            <p className="text-sm opacity-40">
              Already registered?{" "}
              <Link href="/login" className="font-bold text-accent-brown opacity-100 hover:text-accent-red transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
