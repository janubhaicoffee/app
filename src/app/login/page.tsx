"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!isSupabaseConfigured) {
      setMessage("Supabase environment variables are missing. Configure the real backend before signing in.");
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
    <main className="min-h-screen bg-bg-cream text-accent-brown p-6 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100">
          <ArrowLeft size={14} />
          Back home
        </Link>

        <header className="space-y-2 text-center">
          <h1 className="text-4xl font-heading tracking-tight">Sign in</h1>
          <p className="text-sm opacity-50">Use your Janu Bhai Coffee account to enter the OS.</p>
        </header>

        <Card glass className="p-8 rounded-[40px] space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="w-full rounded-2xl border border-black/5 bg-white px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent-brown/10"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-2xl border border-black/5 bg-white px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent-brown/10"
            />
            <Button fullWidth disabled={loading} className="bg-accent-brown text-white py-5">
              <LogIn size={18} className="mr-2" />
              {loading ? "Signing in" : "Sign in"}
            </Button>
          </form>

          {message && <p className="text-center text-sm font-medium text-accent-red">{message}</p>}

          <div className="border-t border-black/5 pt-5 text-center">
            <p className="text-xs opacity-50">
              New customer?{" "}
              <Link href="/signup" className="font-bold text-accent-brown opacity-100">
                Create an account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
