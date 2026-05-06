import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ArrowLeft, Phone, MessageSquare, MapPin, CheckCircle2, Coffee, Bike, ChevronRight } from 'lucide-react';

const TRACKING_STEPS = [
  { id: 'placed', label: 'Order Recieved', sub: 'We got your order, boss!', time: '10:30 AM', completed: true },
  { id: 'preparing', label: 'Brewing Magic', sub: 'Janu Bhai is crafting your kaapi.', time: '10:32 AM', completed: true },
  { id: 'delivery', label: 'On the Way', sub: 'Rider is 5 mins away.', time: '10:40 AM', current: true },
  { id: 'delivered', label: 'Pahunch Gaya!', sub: 'Enjoy your coffee.', time: null },
];

export const OrderTracking = () => {
  const navigate = useNavigate();
  const [showRider, setShowRider] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowRider(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex items-center gap-4 px-1">
        <button onClick={() => navigate('/app')} className="p-3 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-heading tracking-tighter">Live Track</h2>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">ID: #JB-98421 • CP Outlet</p>
        </div>
      </div>

      {/* Cinematic Main Status Card */}
      <Card glass className="p-8 flex flex-col items-center text-center gap-6 border-accent-brown border-2 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 text-accent-brown/5 group-hover:scale-125 transition-transform duration-1000">
          <Coffee size={120} />
        </div>
        
        <div className="w-24 h-24 bg-accent-brown-muted rounded-full flex items-center justify-center text-accent-brown relative">
          <div className="absolute inset-0 rounded-full border-4 border-accent-brown border-t-transparent animate-spin" />
          <Bike size={40} className="animate-bounce-subtle" />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-3xl font-heading tracking-tight">On the way!</h3>
          <p className="text-[10px] font-bold text-accent-brown uppercase tracking-[0.2em] mt-2 bg-accent-brown/10 px-4 py-1.5 rounded-full inline-block">
            Estimated 5 mins
          </p>
        </div>
      </Card>

      {/* Premium Rider Card */}
      {showRider && (
        <div className="animate-fade-in-up stagger-1">
          <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1 mb-4">Your Captain</h3>
          <Card glass hoverLift className="p-5 flex items-center gap-5 border-black/5">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-accent-brown flex items-center justify-center font-heading text-2xl text-white shadow-xl">
                R
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-green border-2 border-white rounded-full flex items-center justify-center">
                <CheckCircle2 size={12} className="text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-heading text-xl">Rahul Sharma</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-accent-green uppercase tracking-widest bg-accent-green/10 px-2 py-0.5 rounded-md">
                  BORZO VERIFIED
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="p-4 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect shadow-sm">
                <Phone size={20} />
              </button>
              <button className="p-4 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect shadow-sm">
                <MessageSquare size={20} />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Cinematic Tracking Timeline */}
      <div className="animate-fade-in-up stagger-2 space-y-4">
        <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">Order Status</h3>
        <Card glass className="p-8">
          <div className="space-y-10 relative">
            {/* Custom Progress Line */}
            <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-black/5">
              <div className="absolute top-0 left-0 w-full bg-accent-brown h-[70%] transition-all duration-[2s] ease-out" />
            </div>
            
            {TRACKING_STEPS.map((step, i) => (
              <div key={step.id} className={`flex gap-6 relative z-10 animate-fade-in-up stagger-${i+1}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-sm ${
                  step.completed ? 'bg-accent-brown border-accent-brown/20 text-white' : 
                  step.current ? 'bg-white border-accent-brown text-accent-brown scale-125' : 
                  'bg-white border-black/5 text-black/10'
                }`}>
                  {step.completed ? <CheckCircle2 size={16} /> : <div className={`w-2.5 h-2.5 rounded-full ${step.current ? 'bg-accent-brown animate-pulse' : 'bg-current'}`}></div>}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-lg font-heading leading-none ${step.current ? 'text-accent-brown' : step.completed ? '' : 'opacity-20'}`}>
                      {step.label}
                    </h4>
                    {step.time && <span className="text-xs text-number opacity-40">{step.time}</span>}
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${step.current ? 'text-accent-brown/60' : 'opacity-40'}`}>
                    {step.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Outlet Details - Street style info */}
      <div className="animate-fade-in-up stagger-3 px-1 flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black/5 rounded-xl group-hover:bg-accent-brown/10 transition-colors">
            <MapPin size={16} className="text-accent-brown/40" />
          </div>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Picked from CP Outlet</p>
        </div>
        <ChevronRight size={16} className="opacity-20" />
      </div>
    </div>
  );
};
