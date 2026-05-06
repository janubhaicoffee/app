import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Phone, Mail, Send } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { SEO } from '../components/ui/SEO';

export const Contact = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown p-6 pb-24">
      <SEO 
        title="Contact Us" 
        description="Get in touch with Janu Bhai Coffee. Support for customers, partners, and franchise inquiries."
        keywords="janu bhai coffee contact, coffee franchise support india, customer care janu bhai"
      />

      <div className="max-w-2xl mx-auto space-y-10">
        <button onClick={() => navigate('/')} className="p-3 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect">
          <ArrowLeft size={24} />
        </button>

        <section className="space-y-4 animate-fade-in">
          <h1 className="text-5xl font-heading tracking-tighter">Get in <span className="text-accent-red">Touch.</span></h1>
          <p className="text-lg opacity-80 max-w-md">
            Whether you're a customer with a question or a future partner, we're here to help.
          </p>
        </section>

        <div className="grid gap-4 animate-fade-in-up">
          <a href="https://wa.me/91XXXXXXXXXX" className="block">
            <Card glass hoverLift className="p-6 flex items-center gap-5 border-green-100 group">
              <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <MessageSquare size={28} />
              </div>
              <div>
                <h4 className="font-heading text-xl">WhatsApp Support</h4>
                <p className="text-sm opacity-60">Instant response during work hours</p>
              </div>
            </Card>
          </a>

          <div className="grid grid-cols-2 gap-4">
            <Card glass className="p-6 space-y-3">
              <div className="w-10 h-10 bg-accent-brown text-white rounded-xl flex items-center justify-center">
                <Phone size={18} />
              </div>
              <h4 className="font-bold text-sm">Call Us</h4>
              <p className="text-xs opacity-60">+91 98765 43210</p>
            </Card>
            <Card glass className="p-6 space-y-3">
              <div className="w-10 h-10 bg-accent-brown text-white rounded-xl flex items-center justify-center">
                <Mail size={18} />
              </div>
              <h4 className="font-bold text-sm">Email</h4>
              <p className="text-xs opacity-60">hello@janubhai.coffee</p>
            </Card>
          </div>
        </div>

        <section className="space-y-6 pt-10 border-t border-accent-brown/10 animate-fade-in-up">
          <h2 className="text-2xl font-heading tracking-tight">Send a Message</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Your Name" className="w-full bg-white border border-black/5 rounded-2xl py-5 px-6 focus:outline-none focus:ring-2 focus:ring-accent-brown/10 shadow-sm" />
            <textarea placeholder="How can we help?" rows={4} className="w-full bg-white border border-black/5 rounded-2xl py-5 px-6 focus:outline-none focus:ring-2 focus:ring-accent-brown/10 shadow-sm resize-none" />
            <button className="w-full btn btn-primary py-5 rounded-3xl shadow-xl press-effect flex items-center justify-center gap-3 font-bold uppercase tracking-[0.2em] text-xs">
              <span>Send Message</span>
              <Send size={16} />
            </button>
          </div>
        </section>

        <footer className="text-center pt-20 opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">HQ: Sector 18, Noida, UP, India</p>
        </footer>
      </div>
    </div>
  );
};
