"use client";

import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/roles';

export const TopBar = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between py-6 px-2">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-accent-brown rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-accent-brown/20 transition-transform active:scale-95 cursor-pointer">
          {profile?.full_name?.charAt(0) || '?'}
        </div>
        <div className="space-y-0.5">
          <h2 className="text-xl font-heading tracking-tight leading-none">{profile?.full_name || 'Guest'}</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">
            {profile?.role ? ROLE_LABELS[profile.role] : 'Welcome'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {profile && (
          <button 
            onClick={signOut} 
            className="p-3 bg-accent-brown/5 text-accent-brown rounded-xl hover:bg-accent-brown hover:text-white transition-all duration-300 press-effect"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </header>
  );
};
