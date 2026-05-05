import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { devBypassRole } = useAuth();

  const handleDemoLogin = (role: 'employee' | 'manager' | 'superadmin') => {
    devBypassRole(role);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] text-[var(--text-primary)]">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 max-w-lg mx-auto flex flex-col items-center text-center">
        {/* Placeholder for Cinematic Image */}
        <div className="w-full h-64 bg-[var(--accent-brown-light)] rounded-[24px] mb-8 overflow-hidden relative shadow-lg">
          <div className="absolute inset-0 bg-black/20" />
          <img 
            src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Coffee Pour" 
            className="w-full h-full object-cover mix-blend-overlay opacity-80"
          />
        </div>

        <h1 className="mb-4">Janu Bhai<br/><span className="text-accent">Coffee</span></h1>
        <p className="text-lg mb-8 max-w-sm">Roz ki strong kahaani. Built for real India. Powered by simplicity.</p>
        
        <div className="w-full space-y-4">
          <Button fullWidth size="lg" onClick={() => handleDemoLogin('employee')}>
            Open POS (Employee Demo)
          </Button>
          <Button fullWidth size="lg" variant="secondary" onClick={() => handleDemoLogin('manager')}>
            Manager Dashboard
          </Button>
          <Button fullWidth size="lg" variant="outline" onClick={() => handleDemoLogin('superadmin')}>
            Superadmin HQ
          </Button>
        </div>
      </section>

      {/* The Idea Section */}
      <section className="py-16 px-6 max-w-lg mx-auto space-y-6">
        <h2 className="text-center mb-8">The Idea</h2>
        <Card glass>
          <h3 className="mb-2">Run your own outlet</h3>
          <p className="text-sm">Decentralized nodes functioning independently with zero friction.</p>
        </Card>
        <Card glass>
          <h3 className="mb-2">Track every rupee</h3>
          <p className="text-sm">Instant financial sync to the central brain. No manual entries.</p>
        </Card>
        <Card glass>
          <h3 className="mb-2">Grow without chaos</h3>
          <p className="text-sm">Expand your footprint while keeping the quality consistent.</p>
        </Card>
      </section>

      {/* Sticky Bottom CTA for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-white/20 sm:hidden z-50">
        <Button fullWidth size="lg" onClick={() => handleDemoLogin('employee')}>Open App</Button>
      </div>
    </div>
  );
};
