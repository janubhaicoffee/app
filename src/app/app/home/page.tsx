"use client";

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  MapPin, 
  Search, 
  Zap, 
  History, 
  Star,
  Users,
  Coffee,
  ChevronRight
} from 'lucide-react';

export default function CustomerHome() {
  const router = useRouter();

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading tracking-tight">Kyun, Janu?<br/>Aaj kya chal raha?</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Your Coffee Ritual • Daily</p>
        </div>
        <div className="w-12 h-12 bg-accent-brown rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent-brown/20">
          <Star size={20} />
        </div>
      </header>

      {/* Near By Outlet */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Closest to You</h2>
        <Card 
          glass 
          hoverLift 
          className="p-6 border-accent-brown/10 flex justify-between items-center bg-white/40"
          onClick={() => router.push('/app/outlet/okhla')}
        >
          <div className="flex gap-4 items-center">
            <div className="p-4 bg-accent-brown text-white rounded-2xl">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="text-xl font-heading">Okhla Hub</h4>
              <p className="text-xs opacity-50 flex items-center gap-1">
                <Star size={10} className="fill-accent-brown text-accent-brown" />
                4.8 • 1.2km away
              </p>
            </div>
          </div>
          <div className="p-3 bg-bg-cream rounded-full">
            <ChevronRight size={16} />
          </div>
        </Card>
      </section>

      {/* Quick Order Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Bestsellers</h2>
          <span className="text-[10px] font-bold text-accent-red tracking-widest cursor-pointer hover:opacity-70 transition-opacity">VIEW MENU</span>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar -mx-6 px-6">
          {[
            { name: 'Cold Brew', price: '180', img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
            { name: 'Chai Latte', price: '120', img: 'https://images.unsplash.com/photo-1544787210-2827448636b2?auto=format&fit=crop&w=400&q=80' },
            { name: 'Latte', price: '160', img: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&w=400&q=80' }
          ].map((item, i) => (
            <Card key={i} className="min-w-[200px] snap-start p-5 space-y-4 bg-white border-black/5 rounded-[40px] shadow-xl shadow-accent-brown/5 hover:shadow-2xl transition-all duration-500 press-effect group">
              <div className="overflow-hidden rounded-[24px]">
                <img src={item.img} alt={item.name} className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="space-y-2">
                <h5 className="text-md font-heading tracking-tight">{item.name}</h5>
                <div className="flex justify-between items-center">
                  <span className="text-xl text-number">₹{item.price}</span>
                  <button className="p-3 bg-accent-brown text-white rounded-2xl shadow-xl shadow-accent-brown/20 hover:bg-accent-red transition-colors">
                    <Zap size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Community / Storyboard */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Community Board</h2>
        <Card glass className="p-10 bg-accent-red text-white space-y-8 rounded-[50px] relative overflow-hidden group border-none shadow-2xl shadow-accent-red/20">
          <div className="absolute right-[-40px] top-[-40px] text-white/10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
            <Users size={200} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-bold uppercase tracking-[0.2em]">Live Event</div>
              <span className="text-[11px] font-bold opacity-60 tracking-wider">TODAY • 6:00 PM</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-heading leading-none tracking-tighter">Poetry Open Mic<br/>@ Okhla Hub</h3>
              <p className="text-lg opacity-80 leading-relaxed font-medium">Bring your notes, grab a brew.<br/>Real people, real stories.</p>
            </div>
            <Button className="bg-white text-accent-red font-bold uppercase tracking-[0.2em] text-[10px] py-5 px-10 rounded-[20px] shadow-xl hover:scale-105 transition-transform">
              Secure Your Spot
            </Button>
          </div>
        </Card>
      </section>

      {/* History */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Recent Order</h2>
        <Card className="p-5 flex justify-between items-center bg-white border-black/5">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-accent-brown-muted rounded-xl text-accent-brown">
              <History size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold">1x Vietnamese Iced Coffee</h4>
              <p className="text-[10px] opacity-40 uppercase tracking-widest">Ordered 2 days ago</p>
            </div>
          </div>
          <Button variant="ghost" className="text-accent-red font-bold text-xs uppercase tracking-widest">REORDER</Button>
        </Card>
      </section>
    </div>
  );
}
