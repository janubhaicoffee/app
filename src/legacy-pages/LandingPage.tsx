import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/ui/SEO';
import { Store, Coffee, User, Globe, Shield } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { devBypassRole } = useAuth();

  const handleDemoLogin = (role: 'employee' | 'manager' | 'superadmin' | 'customer') => {
    devBypassRole(role);
    navigate('/app');
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
      <section className="pt-24 pb-16 landing-container flex flex-col items-center text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[400px] bg-accent-brown/5 rounded-full blur-[100px] -z-10" />
        
        <div className="hero-image-wrapper animate-scale-in">
          <img 
            src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Premium Indian Coffee Roast" 
            loading="lazy"
            className="hover:scale-110 transition-transform duration-[2s] ease-out"
          />
          <div className="hero-image-overlay" />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="text-left">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Premium Roast</span>
              <p className="text-white font-heading text-lg leading-tight">Since 2024</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/20">
              <Coffee className="text-white" size={20} />
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up stagger-1">
          <h1 className="mb-4 font-heading tracking-tighter leading-none">Janu Bhai<br/><span className="text-accent-red">Coffee</span></h1>
          <p className="text-lg font-medium opacity-60 mb-10 leading-relaxed px-4 max-w-sm mx-auto">
            Roz ki strong kahaani.<br/>Built for real India. Powered by simplicity.
          </p>
        </div>
        
        <div className="w-full space-y-3 animate-fade-in-up stagger-2" style={{ maxWidth: 360 }}>
          <Button fullWidth size="lg" className="shadow-xl press-effect bg-accent-brown hover:bg-accent-brown/90" onClick={() => handleDemoLogin('customer')}>
            <User size={18} className="mr-2" />
            Order Now
          </Button>
          
          <Button fullWidth variant="outline" className="press-effect border-accent-brown/20 py-4" onClick={() => navigate('/franchise')}>
            <Store size={18} className="mr-2" />
            Start Your Outlet (Franchise)
          </Button>
          
          <div className="pt-10 pb-4">
            <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Demo Access Roles</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button fullWidth variant="ghost" className="bg-white/50 text-[10px] font-bold uppercase tracking-wider" onClick={() => handleDemoLogin('employee')}>
              POS Hub
            </Button>
            <Button fullWidth variant="ghost" className="bg-white/50 text-[10px] font-bold uppercase tracking-wider" onClick={() => handleDemoLogin('manager')}>
              Manager
            </Button>
          </div>
          
          <Button fullWidth variant="ghost" className="text-accent-brown/20 text-[10px] uppercase tracking-widest hover:text-accent-brown transition-colors" onClick={() => handleDemoLogin('superadmin')}>
            Superadmin HQ Entry
          </Button>
        </div>
      </section>

      {/* Trust & SEO Section */}
      <section className="py-20 bg-accent-brown/5">
        <div className="landing-container text-center space-y-12">
          <div className="animate-fade-in space-y-2">
            <h2 className="text-4xl font-heading tracking-tighter">Honest Growth.</h2>
            <p className="text-sm opacity-50 max-w-xs mx-auto">Scaling local impact with central intelligence.</p>
          </div>

          <div className="grid gap-6">
            <Card glass hoverLift className="flex items-start gap-5 p-6 text-left border-white/50">
              <div className="p-4 bg-accent-brown text-white rounded-2xl">
                <Globe size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-heading">Decentralized Power</h3>
                <p className="text-sm opacity-60 leading-relaxed">Each outlet operates as an independent node, controlled by our proprietary OS.</p>
              </div>
            </Card>

            <Card glass hoverLift className="flex items-start gap-5 p-6 text-left border-white/50">
              <div className="p-4 bg-accent-red text-white rounded-2xl">
                <Shield size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-heading">Trust & Transparency</h3>
                <p className="text-sm opacity-60 leading-relaxed">Realistic ROI expectations of ₹5,000/day daily sales. No fake promises.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Footer */}
      <footer className="pt-24 pb-12 bg-white/30 backdrop-blur-sm border-t border-black/5">
        <div className="landing-container space-y-16">
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Platform</h4>
              <ul className="space-y-4 text-sm font-medium opacity-80">
                <li><Link to="/about" className="hover:text-accent-red transition-colors">Our Story</Link></li>
                <li><Link to="/franchise" className="hover:text-accent-red transition-colors">Start Outlet</Link></li>
                <li><Link to="/contact" className="hover:text-accent-red transition-colors">Contact Support</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Legal</h4>
              <ul className="space-y-4 text-sm font-medium opacity-80">
                <li><Link to="/terms" className="hover:text-accent-red transition-colors">Terms of Use</Link></li>
                <li><Link to="/privacy" className="hover:text-accent-red transition-colors">Privacy Policy</Link></li>
                <li><Link to="/refund" className="hover:text-accent-red transition-colors">Refunds</Link></li>
                <li><Link to="/shipping" className="hover:text-accent-red transition-colors">Shipping</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-black/5 flex flex-col items-center gap-6 opacity-30">
            <Coffee size={32} strokeWidth={1.5} />
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] mb-2">Janu Bhai Coffee Co.</p>
              <p className="text-[8px] font-bold">BUILT FOR REAL INDIA • SINCE 2024</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
