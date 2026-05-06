import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Wallet, MoreHorizontal, Plug, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

export const BottomNav = () => {
  const { profile } = useAuth();
  
  if (!profile) return null;

  const getNavItems = () => {
    switch (profile.role) {
      case 'employee':
        return [
          { label: 'POS', icon: <Home size={22} />, path: '/app' },
          { label: 'Orders', icon: <ClipboardList size={22} />, path: '/app/orders' },
          { label: 'More', icon: <MoreHorizontal size={22} />, path: '/app/settings' },
        ];
      case 'manager':
        return [
          { label: 'Finance', icon: <Wallet size={22} />, path: '/app' },
          { label: 'Orders', icon: <ClipboardList size={22} />, path: '/app/orders' },
          { label: 'Inventory', icon: <Package size={22} />, path: '/app/inventory' },
          { label: 'More', icon: <MoreHorizontal size={22} />, path: '/app/settings' },
        ];
      case 'superadmin':
        return [
          { label: 'HQ', icon: <Home size={22} />, path: '/app' },
          { label: 'Finance', icon: <Wallet size={22} />, path: '/app/finances' },
          { label: 'Integrations', icon: <Plug size={22} />, path: '/app/integrations' },
          { label: 'More', icon: <MoreHorizontal size={22} />, path: '/app/settings' },
        ];
      case 'customer':
        return [
          { label: 'Home', icon: <Home size={22} />, path: '/app' },
          { label: 'Cart', icon: <ClipboardList size={22} />, path: '/app/cart' },
          { label: 'Profile', icon: <Package size={22} />, path: '/app/profile' },
          { label: 'More', icon: <MoreHorizontal size={22} />, path: '/app/settings' },
        ];
      default:
        return [
          { label: 'Home', icon: <Home size={22} />, path: '/app' },
          { label: 'More', icon: <MoreHorizontal size={22} />, path: '/app/settings' },
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
