"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, Target, Coffee, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SEO } from '@/components/ui/SEO';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown p-6 pb-32 animate-in fade-in duration-700">
      <SEO 
        title="Our Story" 
        description="Learn about the Janu Bhai Coffee movement. A decentralized, community-driven coffee network built for the real India."
      />

      <div className="max-w-2xl mx-auto space-y-16">
        <button onClick={() => router.push('/')} className="p-3 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect">
          <ArrowLeft size={24} />
        </button>

        <header className="space-y-6">
          <h1 className="text-6xl font-heading tracking-tighter leading-tight">Built by People,<br/><span className="text-accent-red">Not Boards.</span></h1>
          <p className="text-xl opacity-60 leading-relaxed max-w-md font-medium">
            Janu Bhai Coffee isn't just a brand. It's a decentralized network of independent coffee lovers building the future of Indian café culture.
          </p>
        </header>

        {/* Mission Cards */}
        <div className="grid gap-6">
          <Card glass className="p-10 space-y-4 border-accent-brown/10 rounded-[40px]">
            <div className="p-4 bg-accent-brown text-white w-fit rounded-2xl">
              <Globe size={24} />
            </div>
            <h3 className="text-3xl font-heading tracking-tight">Decentralized Model</h3>
            <p className="text-lg opacity-60 leading-relaxed">
              We don't own the outlets. The local community does. We provide the intelligence, the roast, and the system. They provide the hustle and the heart.
            </p>
          </Card>

          <Card glass className="p-10 space-y-4 border-accent-brown/10 rounded-[40px]">
            <div className="p-4 bg-accent-red text-white w-fit rounded-2xl">
              <Target size={24} />
            </div>
            <h3 className="text-3xl font-heading tracking-tight">Real India First</h3>
            <p className="text-lg opacity-60 leading-relaxed">
              No generic western aesthetics. We celebrate the streets of Okhla, the lanes of Saket, and the spirit of the local 'nukkad'.
            </p>
          </Card>
        </div>

        {/* Narrative Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 opacity-20">
            <div className="h-px flex-1 bg-accent-brown" />
            <Coffee size={24} />
            <div className="h-px flex-1 bg-accent-brown" />
          </div>
          <div className="space-y-6 text-center max-w-lg mx-auto">
            <h2 className="text-4xl font-heading tracking-tight">Why we do this?</h2>
            <p className="text-lg opacity-60 leading-relaxed">
              Because a good cup of coffee shouldn't cost as much as a meal, and starting a business shouldn't be a nightmare of corporate bureaucracy.
            </p>
            <div className="flex justify-center gap-2 pt-4">
              <Heart className="text-accent-red fill-accent-red" size={20} />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Janu Bhai Co-op</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
