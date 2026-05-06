import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coffee, Users, Globe, Target } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { SEO } from '../components/ui/SEO';

export const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown p-6 pb-24">
      <SEO 
        title="About Our Mission" 
        description="Learn about Janu Bhai Coffee - a decentralized, hyper-local coffee chain built for the real India. Scaling local impact through technology."
        keywords="about janu bhai coffee, decentralized coffee chain, Indian coffee brand mission"
      />

      <div className="max-w-2xl mx-auto space-y-10">
        <button onClick={() => navigate('/')} className="p-3 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect">
          <ArrowLeft size={24} />
        </button>

        <section className="space-y-4 animate-fade-in">
          <h1 className="text-5xl font-heading tracking-tighter leading-none">The Story of<br/><span className="text-accent-red">Janu Bhai</span></h1>
          <p className="text-lg opacity-80 leading-relaxed">
            We aren't just another corporate coffee chain. We are a decentralized movement designed to empower local operators while delivering world-class coffee to every corner of India.
          </p>
        </section>

        <div className="grid gap-6 animate-fade-in-up">
          <Card glass className="p-6 space-y-4">
            <div className="w-12 h-12 bg-accent-brown text-white rounded-2xl flex items-center justify-center shadow-xl">
              <Globe size={24} />
            </div>
            <h3 className="text-xl font-heading">Decentralized Model</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Every Janu Bhai outlet is an independent node. They operate with local autonomy but are boosted by our central intelligence system for optimization and growth.
            </p>
          </Card>

          <Card glass className="p-6 space-y-4">
            <div className="w-12 h-12 bg-accent-red text-white rounded-2xl flex items-center justify-center shadow-xl">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-heading">Our Mission</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              To democratize premium coffee. We want to see a high-quality, tech-powered coffee outlet in every neighborhood, run by local people, serving local people.
            </p>
          </Card>
        </div>

        <section className="space-y-6 pt-10 border-t border-accent-brown/10">
          <h2 className="text-3xl font-heading tracking-tight">Honest Grounded Scaling</h2>
          <p className="text-sm opacity-80 leading-relaxed">
            We believe in real numbers. No corporate jargon. No fake promises. Just good coffee, solid systems, and a scalable model that works for the operator first.
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/franchise')} className="flex-1 btn btn-primary py-4 rounded-2xl shadow-xl press-effect font-bold uppercase tracking-widest text-xs">
              Start Your Outlet
            </button>
          </div>
        </section>

        <footer className="text-center pt-20 opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Janu Bhai Coffee © 2026</p>
        </footer>
      </div>
    </div>
  );
};
