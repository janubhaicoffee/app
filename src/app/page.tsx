"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { SEO } from '@/components/ui/SEO';
import { Store, Coffee, User, Globe, Shield } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { devBypassRole } = useAuth();

  const handleDemoLogin = (role: 'employee' | 'manager' | 'superadmin' | 'customer') => {
    devBypassRole(role);
    router.push('/app');
  };

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Janu Bhai Coffee",
    "url": "https://janubhai.coffee",
    "logo": "https://janubhai.coffee/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-98765-43210",
      "contactType": "customer service"
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream overflow-x-hidden selection:bg-accent-brown selection:text-white">
      <SEO 
        title="Roz Ki Strong Kahaani" 
        description="Premium Indian coffee near you. Janu Bhai Coffee is a decentralized network of high-quality coffee outlets built for the real India. Order now or start your own outlet."
        keywords="coffee near me, affordable coffee India, start coffee outlet India, best cold brew India"
        schema={schemaMarkup}
      />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 max-w-4xl mx-auto flex flex-col items-center text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[400px] bg-accent-brown/5 rounded-full blur-[100px] -z-10" />
        
        <div className="w-full max-w-[500px] aspect-[4/5] rounded-[40px] overflow-hidden relative shadow-2xl mb-12 animate-in zoom-in duration-1000">
          <img 
            src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Premium Indian Coffee Roast" 
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s] ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="text-left">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Premium Roast</span>
              <p className="text-white font-heading text-2xl leading-tight">Since 2024</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/20">
              <Coffee className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-6xl md:text-8xl font-heading tracking-tighter leading-none mb-4">Janu Bhai<br/><span className="text-accent-red">Coffee</span></h1>
          <p className="text-xl font-medium opacity-60 mb-10 leading-relaxed px-4 max-w-md mx-auto">
            Roz ki strong kahaani.<br/>Built for real India. Powered by simplicity.
          </p>
        </div>
        
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-1000" style={{ maxWidth: 360 }}>
          <Button fullWidth size="lg" className="py-6 shadow-xl press-effect bg-accent-brown text-white rounded-3xl" onClick={() => handleDemoLogin('customer')}>
            <User size={20} className="mr-2" />
            Order Now
          </Button>
          
          <Button fullWidth variant="outline" className="press-effect border-accent-brown/20 py-6 rounded-3xl" onClick={() => router.push('/franchise')}>
            <Store size={20} className="mr-2" />
            Start Your Outlet
          </Button>
          
          <div className="pt-12 pb-4">
            <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Demo Access Roles</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button fullWidth variant="ghost" className="bg-white/50 text-[10px] font-bold uppercase tracking-wider py-4 rounded-2xl" onClick={() => handleDemoLogin('employee')}>
              POS Hub
            </Button>
            <Button fullWidth variant="ghost" className="bg-white/50 text-[10px] font-bold uppercase tracking-wider py-4 rounded-2xl" onClick={() => handleDemoLogin('manager')}>
              Manager
            </Button>
          </div>
          
          <Button fullWidth variant="ghost" className="text-accent-brown/20 text-[10px] uppercase tracking-widest hover:text-accent-brown transition-colors py-4" onClick={() => handleDemoLogin('superadmin')}>
            Superadmin HQ Entry
          </Button>
        </div>
      </section>

      {/* Trust & SEO Section */}
      <section className="py-24 bg-accent-brown/5 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-5xl font-heading tracking-tighter">Honest Growth.</h2>
            <p className="text-lg opacity-50 max-w-sm mx-auto leading-relaxed">Scaling local impact with central intelligence.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card glass className="flex flex-col items-start gap-6 p-10 text-left border-white/50 rounded-[40px]">
              <div className="p-5 bg-accent-brown text-white rounded-3xl">
                <Globe size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-heading tracking-tight">Decentralized Power</h3>
                <p className="text-lg opacity-60 leading-relaxed">Each outlet operates as an independent node, controlled by our proprietary OS.</p>
              </div>
            </Card>

            <Card glass className="flex flex-col items-start gap-6 p-10 text-left border-white/50 rounded-[40px]">
              <div className="p-5 bg-accent-red text-white rounded-3xl">
                <Shield size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-heading tracking-tight">Trust & Transparency</h3>
                <p className="text-lg opacity-60 leading-relaxed">Realistic ROI expectations of ₹5,000/day daily sales. No fake promises.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Footer */}
      <footer className="pt-32 pb-16 bg-white/30 backdrop-blur-sm border-t border-black/5 px-6">
        <div className="max-w-4xl mx-auto space-y-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="space-y-8">
              <h4 className="text-[12px] font-bold opacity-30 uppercase tracking-[0.2em]">Platform</h4>
              <ul className="space-y-6 text-md font-medium opacity-80">
                <li><Link href="/about" className="hover:text-accent-red transition-colors">Our Story</Link></li>
                <li><Link href="/franchise" className="hover:text-accent-red transition-colors">Start Outlet</Link></li>
                <li><Link href="/contact" className="hover:text-accent-red transition-colors">Contact Support</Link></li>
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-[12px] font-bold opacity-30 uppercase tracking-[0.2em]">Legal</h4>
              <ul className="space-y-6 text-md font-medium opacity-80">
                <li><Link href="/terms" className="hover:text-accent-red transition-colors">Terms of Use</Link></li>
                <li><Link href="/privacy" className="hover:text-accent-red transition-colors">Privacy Policy</Link></li>
                <li><Link href="/refund" className="hover:text-accent-red transition-colors">Refunds</Link></li>
                <li><Link href="/shipping" className="hover:text-accent-red transition-colors">Shipping</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-16 border-t border-black/5 flex flex-col items-center gap-8 opacity-30">
            <Coffee size={48} strokeWidth={1} />
            <div className="text-center">
              <p className="text-[12px] font-bold uppercase tracking-[0.5em] mb-3">Janu Bhai Coffee Co.</p>
              <p className="text-[10px] font-bold">BUILT FOR REAL INDIA • SINCE 2024</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
