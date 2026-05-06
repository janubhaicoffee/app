import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useCart } from '../context/CartContext';
import { useCountUp } from '../hooks/useCountUp';
import { SEO } from '../components/ui/SEO';
import { ArrowLeft, Search, Plus, ShoppingBag, Star, Clock, MapPin, Coffee, Zap } from 'lucide-react';
import type { MenuItem } from '../lib/supabase';

const MENU_DATA: Record<string, MenuItem[]> = {
  'coffee': [
    { id: 'c1', name: 'Hot Cappuccino', category: 'coffee', price: 120, image_url: null, is_available: true },
    { id: 'c2', name: 'Flat White', category: 'coffee', price: 140, image_url: null, is_available: true },
    { id: 'c3', name: 'Janu Bhai Special Hot', category: 'coffee', price: 90, image_url: null, is_available: true },
  ],
  'cold': [
    { id: 'cc1', name: 'Classic Cold Coffee', category: 'cold', price: 150, image_url: null, is_available: true },
    { id: 'cc2', name: 'Hazelnut Frappe', category: 'cold', price: 180, image_url: null, is_available: true },
    { id: 'cc3', name: 'Iced Americano', category: 'cold', price: 130, image_url: null, is_available: true },
  ],
  'snacks': [
    { id: 's1', name: 'Paneer Patties', category: 'snacks', price: 60, image_url: null, is_available: true },
    { id: 's2', name: 'Bun Maska', category: 'snacks', price: 80, image_url: null, is_available: true },
    { id: 's3', name: 'Vada Pav (2 pcs)', category: 'snacks', price: 90, image_url: null, is_available: true },
  ]
};

const CATEGORIES = [
  { id: 'coffee', label: 'Hot Kaapi', icon: <Coffee size={16} /> },
  { id: 'cold', label: 'Cold Brews', icon: <Zap size={16} /> },
  { id: 'snacks', label: 'Quick Bites', icon: <ShoppingBag size={16} /> },
];

export const OutletMenu = () => {
  const navigate = useNavigate();
  const { addItem, totalItems, totalPrice } = useCart();
  const [activeTab, setActiveTab] = useState('coffee');
  const animatedPrice = useCountUp(totalPrice);

  const outletSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Janu Bhai Coffee — Connaught Place",
    "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Connaught Place",
      "addressLocality": "New Delhi",
      "addressRegion": "Delhi",
      "postalCode": "110001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 28.6315,
      "longitude": 77.2167
    },
    "url": "https://janubhai.coffee/app/outlet/cp",
    "telephone": "+91-98765-43210",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "08:00",
        "closes": "23:00"
      }
    ]
  };

  return (
    <div className="animate-fade-in space-y-6 pb-32">
      <SEO 
        title="Menu — Connaught Place"
        description="Order premium coffee and snacks from Janu Bhai Coffee Connaught Place. Fast delivery and local favorites."
        keywords="coffee connaught place, best coffee delhi, janu bhai menu"
        schema={outletSchema}
      />
      {/* Cinematic Outlet Header */}
      <div className="relative -mx-4 -mt-4 h-60 overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[3s] ease-out"
          alt="Coffee Shop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-cream via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-xl rounded-2xl text-white z-10 press-effect border border-white/20"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="animate-fade-in-up stagger-1">
            <h2 className="text-3xl font-heading tracking-tighter drop-shadow-lg">Connaught Place</h2>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest mt-2">
              <div className="flex items-center gap-1.5"><Star size={12} className="fill-current text-amber-400" /> 4.8</div>
              <span className="opacity-40">•</span>
              <div className="flex items-center gap-1.5"><Clock size={12} /> 15-20 mins</div>
              <span className="opacity-40">•</span>
              <div className="flex items-center gap-1.5"><MapPin size={12} /> 1.2 km</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl whitespace-nowrap transition-all press-effect ${
              activeTab === cat.id 
                ? 'bg-accent-brown text-white shadow-xl scale-105' 
                : 'bg-white text-accent-brown/60 border border-black/5 hover:border-accent-brown/20'
            }`}
          >
            <span>{cat.icon}</span>
            <span className="font-bold text-xs uppercase tracking-wider">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search Bar - Native feel */}
      <div className="relative group px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={20} />
        <input 
          type="text" 
          placeholder="What are you craving?" 
          className="w-full bg-white border border-black/5 rounded-2xl py-5 pl-14 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-brown/10 text-sm font-medium shadow-sm transition-all"
        />
      </div>

      {/* Menu List */}
      <div className="space-y-4 px-1">
        {MENU_DATA[activeTab]?.map((item, i) => (
          <Card key={item.id} glass hoverLift className={`p-4 flex gap-5 items-center animate-fade-in-up stagger-${i+1}`}>
            <div className="w-24 h-24 bg-accent-brown-muted rounded-2xl flex items-center justify-center text-4xl text-accent-brown/10">
              {activeTab === 'coffee' ? <Coffee size={40} /> : activeTab === 'cold' ? <Zap size={40} /> : <ShoppingBag size={40} />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-heading leading-tight truncate">{item.name}</h4>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Best Seller</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xl text-number">₹{item.price}</span>
                <button 
                  onClick={() => addItem(item)}
                  className="p-2.5 bg-accent-brown text-white rounded-xl press-effect shadow-md flex items-center gap-2 px-5"
                >
                  <Plus size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Add</span>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Fixed Checkout Bar - Apple style */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-bg-cream via-bg-cream to-transparent pb-nav">
          <button 
            onClick={() => navigate('/app/cart')}
            className="w-full bg-accent-brown text-white p-5 rounded-3xl shadow-2xl flex justify-between items-center press-effect animate-bounce-subtle border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl text-number">
                {totalItems}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest leading-none mb-1">View Checkout</p>
                <p className="text-xl text-number leading-none">₹{animatedPrice}</p>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl">
              <ShoppingBag size={24} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
