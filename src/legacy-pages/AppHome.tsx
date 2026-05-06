import { useAuth } from '../context/AuthContext';
import { PosTerminal } from './PosTerminal';
import { ManagerDashboard } from './ManagerDashboard';
import { SuperadminDashboard } from './SuperadminDashboard';
import { CustomerHome } from './CustomerHome';

export const AppHome = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  switch (profile.role) {
    case 'employee':
      return <PosTerminal />;
    case 'manager':
      return <ManagerDashboard />;
    case 'superadmin':
      return <SuperadminDashboard />;
    case 'customer':
      return <CustomerHome />;
    default:
      return <CustomerHome />;
  }
};
