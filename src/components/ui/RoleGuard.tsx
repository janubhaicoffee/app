"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/lib/roles';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, fallback }) => {
  const { profile } = useAuth();

  if (!profile || !allowedRoles.includes(profile.role)) {
    return (
      fallback || (
        <div className="error-screen animate-fade-in">
          <div className="error-icon">🔒</div>
          <h2 className="error-title">Access Restricted</h2>
          <p className="error-desc">
            You don't have permission to view this section. 
            Please contact your administrator if you think this is a mistake.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export const AccessRestricted = () => (
  <div className="error-screen animate-fade-in">
    <div className="error-icon">🚫</div>
    <h2 className="error-title">Unauthorized</h2>
    <p className="error-desc">This action is not allowed for your role.</p>
  </div>
);
