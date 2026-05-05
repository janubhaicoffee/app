import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PosTerminal } from './PosTerminal';
import { ManagerDashboard } from './ManagerDashboard';
import { SuperadminDashboard } from './SuperadminDashboard';

export const AppHome: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  switch (profile.role) {
    case 'employee':
      return <PosTerminal />;
    case 'manager':
      return <ManagerDashboard />;
    case 'superadmin':
      return <SuperadminDashboard />;
    default:
      return <div>Customer View (Coming Soon)</div>;
  }
};
