import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, TrendingUp, IndianRupee, ShieldCheck, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { SEO } from '../components/ui/SEO';

export const Franchise = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown p-6 pb-32">
      <SEO 
        title="Start Your Coffee Outlet" 
        description="Join the Janu Bhai network. Start your own coffee outlet with our tech-powered decentralized model. Realistic ROI, full support, and local autonomy."
        keywords="start coffee shop india, coffee franchise india cost, janu bhai coffee outlet"
      />

      <div className="max-w-2xl mx-auto space-y-12">
        <button onClick={() => navigate('/')} className="p-3 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect">
          <ArrowLeft size={24} />
        </button>

        <header className="space-y-4 animate-fade-in">
          <h1 className="text-5xl font-heading tracking-tighter leading-tight">Build Your Own<br/><span className="text-accent-brown">Coffee Empire.</span></h1>
          <p className="text-lg opacity-80 leading-relaxed max-w-md">
            The most honest franchise model in India. We provide the brain, you provide the hustle.
          </p>
        </header>

        {/* Realistic ROI Section */}
        <section className="space-y-4 animate-fade-in-up">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Financial Clarity</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card glass className="p-5 border-accent-brown/20 bg-accent-brown/5">
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Daily Target</p>
              <h4 className="text-3xl text-number">₹5,000</h4>
              <p className="text-[10px] font-bold text-accent-green mt-1">REALISTIC BASELINE</p>
            </Card>
            <Card glass className="p-5 border-accent-brown/20">
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Setup Cost</p>
              <h4 className="text-3xl text-number">₹3.5L</h4>
              <p className="text-[10px] font-bold opacity-40 mt-1">ALL-INCLUSIVE</p>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">The 3-Step Launch</h2>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Apply & Survey', desc: 'We verify your location and local footfall potential.', icon: <ShieldCheck size={20} /> },
              { step: '02', title: 'Setup & Tech', desc: 'We install the Janu Bhai OS and provide branding assets.', icon: <Rocket size={20} /> },
              { step: '03', title: 'Go Live', desc: 'Start selling and tracking everything on your mobile.', icon: <TrendingUp size={20} /> }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl font-heading text-accent-brown/20 leading-none">{item.step}</div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-xl font-heading leading-none">{item.title}</h4>
                  <p className="text-sm opacity-60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Support Card */}
        <Card glass className="p-8 bg-accent-brown text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 text-white/5 group-hover:scale-125 transition-transform duration-1000">
            <IndianRupee size={160} />
          </div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-heading tracking-tight leading-tight">What you get from Janu Bhai HQ</h3>
            <ul className="space-y-3">
              {['Inventory Management App', 'Marketing & SEO Boost', 'Centralized Logistics', 'Real-time Profit Analytics'].map((li, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium opacity-90">
                  <ChevronRight size={16} className="text-accent-red" />
                  {li}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* CTA Form Placeholder */}
        <section className="space-y-6 pt-10">
          <h2 className="text-3xl font-heading tracking-tight">Ready to start?</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Your Name" className="w-full bg-white border border-black/5 rounded-2xl py-5 px-6 focus:outline-none focus:ring-2 focus:ring-accent-brown/10 shadow-sm" />
            <input type="email" placeholder="Email Address" className="w-full bg-white border border-black/5 rounded-2xl py-5 px-6 focus:outline-none focus:ring-2 focus:ring-accent-brown/10 shadow-sm" />
            <input type="tel" placeholder="Phone Number (WhatsApp)" className="w-full bg-white border border-black/5 rounded-2xl py-5 px-6 focus:outline-none focus:ring-2 focus:ring-accent-brown/10 shadow-sm" />
            <button className="w-full btn btn-primary py-5 rounded-3xl shadow-xl press-effect font-bold uppercase tracking-[0.2em] text-xs">
              Apply for Franchise
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
