"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Scale } from 'lucide-react';
import { SEO } from './SEO';

interface LegalPageProps {
  title: string;
  content: React.ReactNode;
  lastUpdated: string;
}

export const LegalPage = ({ title, content, lastUpdated }: LegalPageProps) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown">
      <SEO 
        title={title} 
        description={`Read our ${title}. Important information for Janu Bhai Coffee users and partners.`}
      />

      {/* Header Banner */}
      <section className="relative bg-accent-brown text-bg-cream py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-3xl mx-auto relative z-10">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity mb-12"
          >
            <ArrowLeft size={14} />
            Go back
          </button>
          <div className="flex items-start gap-6">
            <div className="hidden sm:flex w-16 h-16 bg-white/10 rounded-2xl items-center justify-center shrink-0 mt-1">
              <Scale size={28} className="opacity-60" />
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-heading tracking-tighter uppercase leading-[0.9]">{title}</h1>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">Last Updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <article className="prose-legal space-y-10 text-[15px] leading-[1.8] opacity-80">
          {content}
        </article>

        {/* Bottom Navigation */}
        <div className="mt-24 pt-12 border-t border-accent-brown/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold opacity-20 uppercase tracking-[0.4em]">Janu Bhai Coffee © 2026</p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest opacity-30 hover:opacity-80 transition-opacity">Terms</Link>
            <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest opacity-30 hover:opacity-80 transition-opacity">Privacy</Link>
            <Link href="/contact" className="text-[10px] font-bold uppercase tracking-widest opacity-30 hover:opacity-80 transition-opacity">Contact</Link>
          </div>
        </div>
      </section>
    </div>
  );
};
