import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCountUp } from '../hooks/useCountUp';
import { MapPin, Star, ChevronRight, Plus, Repeat, Coffee, Zap, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MenuItem } from '../lib/supabase';

const QUICK_ITEMS: MenuItem[] = [
  { id: 'q1', name: 'Masala Chai', category: 'Hot', price: 40, image_url: null, is_available: true },
  { id: 'q2', name: 'Cold Coffee', category: 'Cold', price: 90, image_url: null, is_available: true },
  { id: 'q3', name: 'Paneer Patties', category: 'Snacks', price: 60, image_url: null, is_available: true },
  { id: 'q4', name: 'Bun Maska', category: 'Snacks', price: 45, image_url: null, is_available: true },
];

export const CustomerHome = () => {
  const { profile } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const animatedPoints = useCountUp(140);

  return (
    <div className="animate-fade-in space-y-8 pb-32">
      {/* Header / Loyalty Hero */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-3xl font-heading tracking-tighter">Namaste, {profile?.full_name?.split(' ')[0]}!</h2>
            <p className="text-sm opacity-60">Ready for your favorite fix?</p>
          </div>
          <div className="p-2 bg-accent-brown-muted rounded-xl text-accent-brown">
            <Gift size={24} />
          </div>
        </div>

        <Card className="stat-card-brown shadow-xl p-6 relative overflow-hidden flex justify-between items-center min-h-[120px]">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Loyalty Points</p>
            <h2 className="text-5xl text-number text-white">{animatedPoints}</h2>
            <p className="text-[10px] font-bold text-white/80 mt-2 bg-white/20 inline-block px-2 py-1 rounded-full">
              FREE COFFEE AT 200
            </p>
          </div>
          <div className="relative z-10 opacity-20">
            <Coffee size={80} strokeWidth={1} />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        </Card>
      </div>

      {/* Offers - Cinematic Scroll */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">Exclusive Offers</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
          <Card className="min-w-[300px] bg-accent-red text-white p-6 relative overflow-hidden shadow-lg press-effect">
            <div className="relative z-10">
              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest">Limited</span>
              <h3 className="text-2xl font-heading mt-3 leading-tight">Buy 2 Get 1<br/>FREE</h3>
              <p className="text-xs mt-2 opacity-70">Tap to activate deal</p>
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-12 scale-150">
              <Zap size={100} />
            </div>
          </Card>
          <Card className="min-w-[300px] bg-accent-brown text-white p-6 relative overflow-hidden shadow-lg press-effect">
            <div className="relative z-10">
              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest">Combo</span>
              <h3 className="text-2xl font-heading mt-3 leading-tight">₹50 Off on<br/>Full Meals</h3>
              <p className="text-xs mt-2 opacity-70">Valid on pre-orders</p>
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-12 scale-150">
              <Coffee size={100} />
            </div>
          </Card>
        </div>
      </section>

      {/* Nearby Outlet */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest">Find Us Near You</h3>
          <button className="text-[10px] font-bold text-accent-brown underline tracking-widest">VIEW ALL</button>
        </div>
        <Card glass hoverLift pressEffect className="p-4 flex gap-4 items-center"
          onClick={() => navigate('/app/outlet/demo-cp')}
        >
          <div className="w-16 h-16 rounded-2xl bg-accent-brown-muted flex items-center justify-center text-accent-brown">
            <MapPin size={28} />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-heading leading-tight">Connaught Place</h4>
            <div className="flex items-center gap-2 text-xs opacity-60 mt-1">
              <span>1.2 km away</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star size={10} className="fill-current text-amber-500" />
                <span className="font-bold text-black opacity-100">4.8</span>
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="opacity-20" />
        </Card>
      </section>

      {/* Quick Order */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">Tappable Quick Picks</h3>
        <div className="grid grid-cols-2 gap-4">
          {QUICK_ITEMS.map((item, i) => (
            <Card key={item.id} glass hoverLift className={`p-4 flex flex-col gap-4 animate-fade-in-up stagger-${i+1}`}>
              <div className="h-28 w-full bg-accent-brown-muted rounded-2xl flex items-center justify-center text-4xl text-accent-brown/20 group-hover:scale-110 transition-transform">
                {item.category === 'Hot' ? <Coffee size={40} /> : <Zap size={40} />}
              </div>
              <div>
                <p className="font-bold text-sm leading-tight mb-2 h-8 line-clamp-2">{item.name}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg text-number">₹{item.price}</span>
                  <button 
                    onClick={() => addItem(item)}
                    className="p-2 bg-accent-brown text-white rounded-xl press-effect shadow-md"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent / Reorder */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">One-Tap Reorder</h3>
        <Card glass pressEffect className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center">
            <Repeat size={24} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm leading-tight">Large Cappuccino + Bun Maska</p>
            <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">2 days ago • ₹180</p>
          </div>
          <button className="text-[10px] font-bold bg-accent-brown text-white py-2 px-4 rounded-full press-effect">
            REORDER
          </button>
        </Card>
      </section>
    </div>
  );
};
