import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between py-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-[var(--accent-brown)] rounded-full flex items-center justify-center text-white font-bold">
          {profile?.full_name?.charAt(0) || <User size={20} />}
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-tight">{profile?.full_name || 'Guest'}</h2>
          <p className="text-xs text-[var(--text-secondary)] capitalize">{profile?.role || 'Welcome'}</p>
        </div>
      </div>
      
      {profile && (
        <button 
          onClick={signOut}
          className="p-2 text-[var(--text-secondary)] hover:bg-black/5 rounded-full transition-colors"
        >
          <LogOut size={20} />
        </button>
      )}
    </header>
  );
};
