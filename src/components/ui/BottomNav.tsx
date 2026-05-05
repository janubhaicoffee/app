import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Wallet, Package, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

export const BottomNav: React.FC = () => {
  const { profile } = useAuth();
  
  if (!profile) return null; // Only show for logged in users

  // Navigation items structure based on role
  const getNavItems = () => {
    switch (profile.role) {
      case 'employee':
        return [
          { label: 'POS', icon: <Home size={24} />, path: '/app' },
          { label: 'Orders', icon: <ClipboardList size={24} />, path: '/app/orders' },
          { label: 'More', icon: <MoreHorizontal size={24} />, path: '/app/settings' },
        ];
      case 'manager':
        return [
          { label: 'Dashboard', icon: <Home size={24} />, path: '/app' },
          { label: 'Finances', icon: <Wallet size={24} />, path: '/app/finances' },
          { label: 'Inventory', icon: <Package size={24} />, path: '/app/inventory' },
          { label: 'More', icon: <MoreHorizontal size={24} />, path: '/app/settings' },
        ];
      case 'superadmin':
        return [
          { label: 'HQ', icon: <Home size={24} />, path: '/app' },
          { label: 'Outlets', icon: <Package size={24} />, path: '/app/outlets' },
          { label: 'More', icon: <MoreHorizontal size={24} />, path: '/app/settings' },
        ];
      default:
        return [
          { label: 'Home', icon: <Home size={24} />, path: '/app' },
        ];
    }
  };

  const items = getNavItems();

  return (
    <nav className="bottom-nav glass">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          end={item.path === '/app'}
          className={({ isActive }) => clsx('nav-item', isActive && 'active')}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
