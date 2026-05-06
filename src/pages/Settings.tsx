import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { Users, Store, Settings as SettingsIcon, Shield, LogOut, ChevronRight, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROLE_LABELS } from '../lib/types';

export const Settings = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Management',
      roles: ['superadmin'],
      items: [
        { label: 'Outlets', icon: <Store size={20} />, path: '/app/outlets', desc: 'Create and control nodes' },
        { label: 'Global Users', icon: <Shield size={20} />, path: '/app/users', desc: 'Permissions & staff' },
      ]
    },
    {
      title: 'Outlet Control',
      roles: ['manager'],
      items: [
        { label: 'Staff Management', icon: <Users size={20} />, path: '/app/users', desc: 'Manage your team' },
      ]
    },
    {
      title: 'Account',
      roles: ['customer', 'employee', 'manager', 'superadmin'],
      items: [
        { label: 'Profile Settings', icon: <UserCircle size={20} />, path: '#', desc: 'Personal details' },
        { label: 'App Settings', icon: <SettingsIcon size={20} />, path: '#', desc: 'Preferences & Notifications' },
      ]
    }
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div>
        <h2 className="text-2xl mb-1">More</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>System controls & Account</p>
      </div>

      <Card glass className="p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-coffee-brown text-white flex items-center justify-center text-2xl font-bold">
          {profile?.full_name?.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-lg">{profile?.full_name}</h3>
          <span className={`role-badge ${profile?.role} mt-1 inline-block`}>
            {profile ? ROLE_LABELS[profile.role] : ''}
          </span>
        </div>
      </Card>

      {menuItems.map((section, idx) => {
        if (profile && !section.roles.includes(profile.role)) return null;
        
        return (
          <div key={idx} className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-50 px-1">{section.title}</h4>
            <Card glass className="p-0 overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-bottom text-left"
                  onClick={() => item.path !== '#' && navigate(item.path)}
                >
                  <div className="p-2 bg-cream rounded-xl text-coffee-brown">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs opacity-60">{item.desc}</p>
                  </div>
                  <ChevronRight size={18} className="opacity-30" />
                </button>
              ))}
            </Card>
          </div>
        );
      })}

      <button 
        onClick={signOut}
        className="w-full btn btn-secondary flex items-center justify-center gap-2 py-4"
      >
        <LogOut size={20} />
        <span>Sign Out</span>
      </button>
    </div>
  );
};
