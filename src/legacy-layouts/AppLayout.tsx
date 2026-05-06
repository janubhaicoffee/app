import { Outlet, Navigate } from 'react-router-dom';
import { BottomNav } from '../components/ui/BottomNav';
import { useAuth } from '../context/AuthContext';
import { TopBar } from '../components/ui/TopBar';
import { OutletStatusScreen } from '../components/ui/OutletStatusScreen';

export const AppLayout = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-container">
        <div className="flex items-center justify-center" style={{ height: '100vh' }}>
          <div className="text-coffee-brown font-bold animate-pulse">Loading Janu Bhai OS...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  // Demo: Block access if outlet is suspended/inactive
  // Superadmin bypasses this check
  const isOutletBlocked = profile.role !== 'superadmin' && profile.outlet_id === 'kor';

  return (
    <div className="app-container">
      <div className="app-content">
        <TopBar />
        {isOutletBlocked ? (
          <OutletStatusScreen status="suspended" outletName="Koramangala" />
        ) : (
          <Outlet />
        )}
      </div>
      <BottomNav />
    </div>
  );
};
