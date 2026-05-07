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
          { label: 'POS', icon: <img src="/favicon.png" alt="POS" className="w-5 h-5 object-contain" />, path: '/app/terminal' },
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
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-lg h-20 glass-card rounded-[40px] flex items-center justify-around px-4 z-50 animate-in slide-in-from-bottom-10 duration-700">
      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.label}
            href={item.path}
            className={clsx(
              'relative flex flex-col items-center gap-1.5 transition-all duration-300 px-6 py-3 rounded-[24px] press-effect group',
              isActive ? 'text-accent-brown' : 'text-accent-brown/30 hover:text-accent-brown/50'
            )}
          >
            {isActive && (
              <div className="absolute inset-0 bg-accent-brown/5 rounded-[24px] -z-10 animate-in fade-in zoom-in-95 duration-300" />
            )}
            <div className={clsx(
              'transition-transform duration-300',
              isActive && 'scale-110'
            )}>
              {item.icon}
            </div>
            <span className={clsx(
              'text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300',
              isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-60'
            )}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute -bottom-1 w-1 h-1 bg-accent-brown rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
