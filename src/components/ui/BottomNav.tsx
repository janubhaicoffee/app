"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Wallet, MoreHorizontal, Plug, Package, Coffee, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export const BottomNav = () => {
  const { profile } = useAuth();
  const pathname = usePathname();
  
  if (!profile) return null;

  const getNavItems = () => {
    switch (profile.role) {
      case 'employee':
      case 'cashier':
      case 'kitchen':
        return [
          { label: 'POS', icon: <Coffee size={22} />, path: '/app/terminal' },
          { label: 'Orders', icon: <ClipboardList size={22} />, path: '/app/orders' },
          { label: 'More', icon: <MoreHorizontal size={22} />, path: '/app/settings' },
        ];
      case 'manager':
      case 'outlet_owner':
        return [
          { label: 'Dashboard', icon: <Home size={22} />, path: '/app/manager' },
          { label: 'Inventory', icon: <Package size={22} />, path: '/app/inventory' },
          { label: 'Finance', icon: <Wallet size={22} />, path: '/app/profit' },
          { label: 'More', icon: <MoreHorizontal size={22} />, path: '/app/settings' },
        ];
      case 'superadmin':
        return [
          { label: 'HQ', icon: <Shield size={22} />, path: '/app/admin' },
          { label: 'Network', icon: <Plug size={22} />, path: '/app/integrations' },
          { label: 'Global', icon: <Wallet size={22} />, path: '/app/finances' },
          { label: 'More', icon: <MoreHorizontal size={22} />, path: '/app/settings' },
        ];
      case 'customer':
        return [
          { label: 'Home', icon: <Home size={22} />, path: '/app/home' },
          { label: 'Cart', icon: <ClipboardList size={22} />, path: '/app/cart' },
          { label: 'Profile', icon: <Package size={22} />, path: '/app/profile' },
          { label: 'More', icon: <MoreHorizontal size={22} />, path: '/app/settings' },
        ];
      default:
        return [
          { label: 'Home', icon: <Home size={22} />, path: '/app/home' },
          { label: 'More', icon: <MoreHorizontal size={22} />, path: '/app/settings' },
        ];
    }
  };

  const items = getNavItems();

  return (
    <nav className="fixed bottom-6 left-6 right-6 h-20 glass rounded-[32px] flex items-center justify-around px-4 z-50 shadow-2xl">
      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.label}
            href={item.path}
            className={clsx(
              'flex flex-col items-center gap-1 transition-all duration-300 px-4 py-2 rounded-2xl',
              isActive ? 'text-accent-brown bg-accent-brown/5' : 'text-accent-brown/40 hover:text-accent-brown/60'
            )}
          >
            {item.icon}
            <span className="text-[8px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
