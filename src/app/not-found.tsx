import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg-cream text-accent-brown flex flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="space-y-6">
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-accent-brown/5 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/favicon.png" alt="Janu Bhai Logo" className="w-16 h-16 object-contain" />
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">Error 404</p>
          <h1 className="text-5xl md:text-6xl font-heading tracking-tighter uppercase">Page Not <span className="text-accent-red italic">Found</span></h1>
        </div>
        
        <p className="max-w-sm text-sm opacity-40 font-medium mx-auto">
          This route doesn't exist in the Janu Bhai ecosystem. It might have been moved or never existed.
        </p>
      </div>
      
      <div className="flex gap-4">
        <Link href="/">
          <Button className="bg-accent-brown text-white px-10">Back Home</Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline" className="px-10">Contact Us</Button>
        </Link>
      </div>
    </main>
  );
}
