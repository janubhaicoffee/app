import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { Package, MapPin, Gift, ChevronRight, Settings as SettingsIcon, LogOut, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CustomerProfile = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'My Orders', icon: <Package size={20} />, desc: 'Track & reorder', path: '#' },
    { label: 'Saved Addresses', icon: <MapPin size={20} />, desc: 'Home, Work, Rohini', path: '#' },
    { label: 'Rewards & Coupons', icon: <Gift size={20} />, desc: '140 points available', path: '#' },
    { label: 'Help & Support', icon: <HelpCircle size={20} />, desc: 'Contact Janu Bhai HQ', path: '#' },
    { label: 'Settings', icon: <SettingsIcon size={20} />, desc: 'App preferences', path: '#' },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold px-1">My Account</h2>
      </div>

      {/* Profile Header */}
      <Card glass className="p-6 flex flex-col items-center text-center gap-3">
        <div className="w-24 h-24 rounded-full bg-coffee-brown text-white flex items-center justify-center text-3xl font-bold shadow-xl">
          {profile?.full_name?.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-bold">{profile?.full_name}</h3>
          <p className="text-sm opacity-60">+91 98765 43210</p>
        </div>
        <div className="flex gap-2 mt-2">
          <div className="bg-cream px-4 py-2 rounded-xl text-xs font-bold text-coffee-brown border border-brown">
            LOYALTY MEMBER
          </div>
        </div>
      </Card>

      {/* Points Summary Card */}
      <Card className="bg-coffee-brown text-white p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Available Balance</p>
              <h3 className="text-3xl font-bold mt-1">140 Points</h3>
            </div>
            <Gift className="opacity-20" size={40} />
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="opacity-60">Next Reward: Free Coffee</span>
              <span>140 / 200</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-1000" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Menu Options */}
      <div className="space-y-3">
        <Card glass className="p-0 overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left"
              onClick={() => item.path !== '#' && navigate(item.path)}
            >
              <div className="p-2 bg-cream rounded-xl text-coffee-brown">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{item.label}</p>
                <p className="text-xs opacity-60">{item.desc}</p>
              </div>
              <ChevronRight size={18} className="opacity-30" />
            </button>
          ))}
        </Card>
      </div>

      {/* Logout */}
      <button 
        onClick={signOut}
        className="w-full btn btn-secondary flex items-center justify-center gap-2 py-4"
      >
        <LogOut size={20} />
        <span>Sign Out</span>
      </button>

      <div className="text-center">
        <p className="text-[10px] font-bold opacity-20 uppercase tracking-[0.2em]">Janu Bhai Coffee v1.4.0</p>
      </div>
    </div>
  );
};
