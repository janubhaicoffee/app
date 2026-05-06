"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Phone, Mail, Globe } from 'lucide-react';
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
        <div className="grid gap-4">
          {[
            { label: 'WhatsApp Support', value: '+91 98765 43210', icon: <MessageSquare className="text-accent-green" /> },
            { label: 'Official Email', value: 'hello@janubhai.coffee', icon: <Mail className="text-accent-red" /> },
            { label: 'Instagram', value: '@janubhaicoffee', icon: <Globe className="text-accent-brown" /> }
          ].map((item, i) => (
            <Card key={i} glass className="p-8 flex items-center gap-6 border-accent-brown/10 rounded-[32px] hover:bg-white transition-colors cursor-pointer group">
              <div className="p-4 bg-bg-cream rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">{item.label}</p>
                <h4 className="text-xl font-heading">{item.value}</h4>
              </div>
            </Card>
          ))}
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
