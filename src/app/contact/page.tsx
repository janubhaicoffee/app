"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SEO } from '@/components/ui/SEO';

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown p-6 pb-32 animate-in fade-in duration-700">
      <SEO 
        title="Get in Touch" 
        description="Connect with Janu Bhai Coffee. Support, partnership inquiries, or just to say hi. We are here for the community."
      />

      <div className="max-w-2xl mx-auto space-y-16">
        <button onClick={() => router.push('/')} className="p-3 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect">
          <ArrowLeft size={24} />
        </button>

        <header className="space-y-6">
          <h1 className="text-6xl font-heading tracking-tighter leading-tight">Always Around,<br/><span className="text-accent-brown">Chai Pe Charcha.</span></h1>
          <p className="text-xl opacity-60 leading-relaxed max-w-md font-medium">
            Got an issue? Want to partner up? Or just want to talk coffee? Drop us a line.
          </p>
        </header>

        {/* Contact Channels */}
        <div className="grid gap-6">
          <Card glass className="p-10 flex items-center gap-8 border-accent-brown/10 hover:border-accent-brown/30 transition-colors rounded-[40px]">
            <div className="p-5 bg-accent-brown text-white rounded-3xl shadow-xl">
              <Globe size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-heading tracking-tight">Corporate Office</h3>
              <p className="text-md opacity-60">HQ: Okhla Phase III, New Delhi 110020</p>
              <p className="text-md font-bold text-accent-brown">ops@janubhai.coffee</p>
            </div>
          </Card>

          <Card glass className="p-10 flex items-center gap-8 border-accent-brown/10 hover:border-accent-brown/30 transition-colors rounded-[40px]">
            <div className="p-5 bg-accent-red text-white rounded-3xl shadow-xl">
              <Target size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-heading tracking-tight">Support Hotline</h3>
              <p className="text-md opacity-60">Mon-Sat • 9 AM - 7 PM</p>
              <p className="text-xl font-bold tracking-tighter text-number">+91 91111 22222</p>
            </div>
          </Card>
        </div>

        {/* Message Form */}
        <section className="space-y-8 pt-10">
          <h2 className="text-3xl font-heading tracking-tight">Drop a Message</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Subject" className="w-full bg-white border border-black/5 rounded-[24px] py-6 px-8 text-lg focus:outline-none focus:ring-4 focus:ring-accent-brown/5 shadow-sm" />
            <textarea placeholder="Tell us what's on your mind..." rows={4} className="w-full bg-white border border-black/5 rounded-[24px] py-6 px-8 text-lg focus:outline-none focus:ring-4 focus:ring-accent-brown/5 shadow-sm resize-none" />
            <button className="w-full bg-accent-brown text-white py-6 rounded-[32px] shadow-2xl press-effect font-bold uppercase tracking-[0.2em] text-sm">
              Send Message
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
