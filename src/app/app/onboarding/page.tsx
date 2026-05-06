"use client";

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ClipboardCheck, 
  Clock, 
  MapPin, 
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function FranchiseOnboarding() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-heading tracking-tighter">Welcome, Future Partner.</h1>
        <p className="text-lg opacity-60 leading-relaxed max-w-md">Your journey to building a Janu Bhai hub starts here.</p>
      </header>

      {/* Application Status */}
      <Card glass className="p-8 bg-accent-brown text-white shadow-2xl rounded-[40px] relative overflow-hidden">
        <div className="absolute right-[-10px] top-[-10px] opacity-10">
          <Sparkles size={120} />
        </div>
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Current Status</p>
              <h3 className="text-2xl font-heading">Under Review</h3>
            </div>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">We're currently surveying your proposed location in <strong>Saket, New Delhi</strong>. You'll hear from our regional lead within 48 hours.</p>
        </div>
      </Card>

      {/* Checklist */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Onboarding Checklist</h2>
        <div className="space-y-4">
          {[
            { title: 'Identity Verification', status: 'completed', icon: <ClipboardCheck /> },
            { title: 'Location Survey', status: 'in-progress', icon: <MapPin /> },
            { title: 'Legal Documentation', status: 'pending', icon: <FileText /> },
            { title: 'Tech Setup & Training', status: 'pending', icon: <Sparkles /> }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-6 p-2">
              <div className={`p-4 rounded-2xl ${item.status === 'completed' ? 'bg-accent-green text-white' : 'bg-white/50 text-accent-brown opacity-40'}`}>
                {item.icon}
              </div>
              <div className="flex-1 flex justify-between items-center border-b border-black/5 pb-2">
                <div>
                  <h4 className={`text-md font-bold ${item.status === 'pending' && 'opacity-40'}`}>{item.title}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">{item.status}</p>
                </div>
                {item.status === 'completed' && <div className="w-6 h-6 bg-accent-green/20 rounded-full flex items-center justify-center text-accent-green text-xs">✓</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <Card glass className="p-6 border-accent-brown/5 bg-accent-brown/5 flex justify-between items-center">
        <p className="text-sm font-medium opacity-60">Need help with your application?</p>
        <Button variant="ghost" className="text-accent-brown font-bold text-xs uppercase tracking-widest">Chat with HQ <ChevronRight size={14} className="ml-2" /></Button>
      </Card>
    </div>
  );
}
