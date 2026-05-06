import React from 'react';
import type { OutletStatus } from '../../lib/types';

interface Props {
  status: OutletStatus;
  outletName: string;
}

export const OutletStatusScreen: React.FC<Props> = ({ status, outletName }) => {
  const config = {
    inactive: {
      icon: '🌙',
      title: 'Outlet is Inactive',
      desc: `${outletName} is currently closed for operations. Please contact HQ to reactivate.`,
    },
    suspended: {
      icon: '🚫',
      title: 'Operations Suspended',
      desc: `Operations at ${outletName} have been suspended due to administrative reasons.`,
    }
  };

  if (status === 'active') return null;

  const data = config[status as keyof typeof config] || config.inactive;

  return (
    <div className="error-screen animate-fade-in">
      <div className="error-icon">{data.icon}</div>
      <h2 className="error-title">{data.title}</h2>
      <p className="error-desc">{data.desc}</p>
      <button 
        className="btn btn-secondary"
        onClick={() => window.location.href = '/'}
      >
        Return to Safety
      </button>
    </div>
  );
};
