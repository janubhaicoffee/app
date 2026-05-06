import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCountUp } from '../hooks/useCountUp';
import { MapPin, Star, ChevronRight, Plus, Repeat, Coffee, Zap, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MenuItem, Outlet } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const CustomerHome = () => {
  const { profile } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [nearbyOutlets, setNearbyOutlets] = useState<Outlet[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const animatedPoints = useCountUp(loyaltyPoints);

  useEffect(() => {
    fetchCustomerData();
  }, [profile]);

  const fetchCustomerData = async () => {
    if (!profile) return;

    // Fetch real loyalty points from Supabase
    const { data: pointsData } = await supabase
      .from('loyalty_points')
      .select('points')
      .eq('user_id', profile.id)
      .single();
    
    if (pointsData) {
      setLoyaltyPoints(pointsData.points || 0);
    }

    // Fetch real nearby outlets
    try {
      const res = await fetch('/api/catalog?type=outlets');
      if (res.ok) {
        const data = await res.json();
        setNearbyOutlets(data.slice(0, 3)); // Show first 3 outlets
      }
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
    }
  };

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
        {nearbyOutlets.length > 0 ? (
          nearbyOutlets.map((outlet) => (
            <Card 
              key={outlet.id} 
              glass 
              hoverLift 
              pressEffect 
              className="p-4 flex gap-4 items-center"
              onClick={() => navigate(`/app/outlet/${outlet.id}`)}
            >
              <div className="w-16 h-16 rounded-2xl bg-accent-brown-muted flex items-center justify-center text-accent-brown">
                <MapPin size={28} />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-heading leading-tight">{outlet.name}</h4>
                <div className="flex items-center gap-2 text-xs opacity-60 mt-1">
                  <span>{outlet.city}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="fill-current text-amber-500" />
                    <span className="font-bold text-black opacity-100">4.8</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="opacity-20" />
            </Card>
          ))
        ) : (
          <Card glass className="p-6 text-center">
            <p className="text-sm opacity-60">No outlets nearby. Check back soon!</p>
          </Card>
        )}
      </section>

      {/* Quick Order - Fetch from real menu */}
      <QuickOrderSection addItem={addItem} />

      {/* Recent / Reorder - Fetch from real order history */}
      <RecentOrdersSection />
    </div>
  );
};

// Quick Order Section Component - fetches real menu items
const QuickOrderSection: React.FC<{ addItem: (item: MenuItem) => void }> = ({ addItem }) => {
  const [quickItems, setQuickItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuickItems = async () => {
      try {
        const res = await fetch('/api/catalog?type=menu');
        if (res.ok) {
          const data = await res.json();
          setQuickItems(data.slice(0, 4)); // Show first 4 available items
        }
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuickItems();
  }, []);

  if (loading) {
    return (
      <section className="space-y-4">
        <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">Tappable Quick Picks</h3>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} glass className="h-48 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (quickItems.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">Tappable Quick Picks</h3>
      <div className="grid grid-cols-2 gap-4">
        {quickItems.map((item, i) => (
          <Card key={item.id} glass hoverLift className={`p-4 flex flex-col gap-4 animate-fade-in-up stagger-${i+1}`}>
            <div className="h-28 w-full bg-accent-brown-muted rounded-2xl flex items-center justify-center text-4xl text-accent-brown/20 group-hover:scale-110 transition-transform">
              {item.category.includes('Hot') || item.category.includes('Coffee') ? <Coffee size={40} /> : <Zap size={40} />}
            </div>
            <div>
              <p className="font-bold text-sm leading-tight mb-2 h-8 line-clamp-2">{item.name}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg text-number">₹{item.base_price || item.price}</span>
                <button 
                  onClick={() => addItem({...item, price: item.base_price || item.price})}
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
  );
};

// Recent Orders Section Component - fetches real order history
const RecentOrdersSection: React.FC = () => {
  const { profile } = useAuth();
  const [recentOrder, setRecentOrder] = useState<any>(null);

  useEffect(() => {
    const fetchRecentOrder = async () => {
      if (!profile) return;
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!error && data) {
          setRecentOrder(data);
        }
      } catch (error) {
        console.error('Failed to fetch recent order:', error);
      }
    };
    fetchRecentOrder();
  }, [profile]);

  if (!recentOrder) {
    return (
      <section className="space-y-4">
        <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">One-Tap Reorder</h3>
        <Card glass className="p-6 text-center">
          <p className="text-sm opacity-60">No recent orders. Try something new!</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">One-Tap Reorder</h3>
      <Card glass pressEffect className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center">
          <Repeat size={24} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm leading-tight">Previous Order</p>
          <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">
            {new Date(recentOrder.created_at).toLocaleDateString()} • ₹{recentOrder.total_amount}
          </p>
        </div>
        <button className="text-[10px] font-bold bg-accent-brown text-white py-2 px-4 rounded-full press-effect">
          REORDER
        </button>
      </Card>
    </section>
  );
};
