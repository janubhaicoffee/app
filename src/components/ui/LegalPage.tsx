"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SEO } from './SEO';

interface LegalPageProps {
  title: string;
  content: React.ReactNode;
  lastUpdated: string;
}

export const LegalPage = ({ title, content, lastUpdated }: LegalPageProps) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown p-6 pb-24">
      <SEO 
        title={title} 
        description={`Read our ${title}. Important information for Janu Bhai Coffee users and partners.`}
      />

      <div className="max-w-2xl mx-auto space-y-10">
        <button onClick={() => router.push('/')} className="p-3 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect">
          <ArrowLeft size={24} />
        </button>

        <header className="space-y-2">
          <h1 className="text-4xl font-heading tracking-tighter">{title}</h1>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">Last Updated: {lastUpdated}</p>
        </header>

        <article className="prose prose-accent-brown max-w-none prose-sm opacity-80 leading-relaxed space-y-8">
          {content}
        </article>

        <footer className="text-center pt-20 border-t border-accent-brown/5 opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Janu Bhai Coffee © 2026</p>
        </footer>
      </div>
    </div>
  );
};
