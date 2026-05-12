"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Coffee, 
  Terminal, 
  ListOrdered, 
  Package, 
  BarChart3, 
  LogOut,
  Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/app/terminal", label: "Terminal", icon: Terminal },
  { href: "/app/orders", label: "Live Orders", icon: ListOrdered },
  { href: "/app/inventory", label: "Inventory", icon: Package },
  { href: "/app/finances", label: "Finances", icon: BarChart3 },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { signOut, profile } = useAuth();

  return (
    <aside className="w-64 bg-accent-brown text-bg-cream flex flex-col h-screen fixed left-0 top-0 border-r-4 border-black/20 z-50">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="bg-accent-red text-white p-2 rounded-xl">
          <Coffee size={24} />
        </div>
        <div>
          <h1 className="font-heading text-xl tracking-tight leading-none text-white">Janu Bhai OS</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent-yellow mt-1">
            {profile?.role.replace('_', ' ')}
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-bold tracking-widest uppercase text-xs ${
                isActive 
                  ? "bg-accent-red text-white shadow-lg shadow-accent-red/20 scale-105" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 3 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl transition-colors font-bold tracking-widest uppercase text-xs text-white/60 hover:bg-white/5 hover:text-white">
          <Settings size={18} />
          Settings
        </button>
        <button 
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl transition-colors font-bold tracking-widest uppercase text-xs text-accent-red hover:bg-accent-red/10"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
