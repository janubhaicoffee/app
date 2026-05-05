import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { BottomNav } from '../components/ui/BottomNav';
import { useAuth } from '../context/AuthContext';
import { TopBar } from '../components/ui/TopBar';

export const AppLayout: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container">
      <div className="app-content">
        <TopBar />
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};
