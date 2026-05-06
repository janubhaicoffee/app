import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import { OutletSwitcher } from './OutletSwitcher';
import { ROLE_LABELS } from '../../lib/types';

export const TopBar = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="topbar">
      <div className="flex items-center gap-3">
        <div className="topbar-avatar">
          {profile?.full_name?.charAt(0) || '?'}
        </div>
        <div className="topbar-info">
          <h2>{profile?.full_name || 'Guest'}</h2>
          <p>{profile?.role ? ROLE_LABELS[profile.role] : 'Welcome'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {profile?.role === 'superadmin' && <OutletSwitcher />}
        {profile && (
          <button onClick={signOut} className="topbar-action">
            <LogOut size={20} />
          </button>
        )}
      </div>
    </header>
  );
};
