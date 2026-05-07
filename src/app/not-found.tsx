import Link from "next/link";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg-cream text-accent-brown flex flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="rounded-full bg-accent-brown/5 p-4">
        <img src="/favicon.png" alt="Janu Bhai Logo" className="w-16 h-16 object-contain" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-heading tracking-tight">Page not found</h1>
        <p className="max-w-sm text-sm opacity-50">This Janu Bhai route is not part of the current OS workspace.</p>
      </div>
      <Link href="/">
        <Button className="bg-accent-brown text-white px-8">Back home</Button>
      </Link>
    </main>
  );
}
