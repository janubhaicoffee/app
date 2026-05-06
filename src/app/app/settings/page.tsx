"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ROLE_LABELS } from "@/lib/roles";
import { ClipboardList, Coffee, LogOut, Shield, Store, User } from "lucide-react";

export default function SettingsPage() {
  const { profile, signOut } = useAuth();
  const workspaceLinks =
    profile?.role === "superadmin"
      ? [
          { href: "/app/admin", label: "HQ command center", icon: <Shield className="opacity-40" /> },
          { href: "/app/outlets", label: "Outlet network", icon: <Store className="opacity-40" /> },
          { href: "/app/users", label: "Users and roles", icon: <User className="opacity-40" /> },
        ]
      : profile?.role === "manager" || profile?.role === "outlet_owner"
        ? [
            { href: "/app/manager", label: "Outlet dashboard", icon: <Store className="opacity-40" /> },
            { href: "/app/users", label: "Staff access", icon: <User className="opacity-40" /> },
            { href: "/app/expenses", label: "Expense log", icon: <ClipboardList className="opacity-40" /> },
          ]
        : profile?.role === "employee" || profile?.role === "cashier" || profile?.role === "kitchen"
          ? [
              { href: "/app/terminal", label: "POS terminal", icon: <Coffee className="opacity-40" /> },
              { href: "/app/orders", label: "Order queue", icon: <ClipboardList className="opacity-40" /> },
            ]
          : [
              { href: "/app/home", label: "Customer home", icon: <Store className="opacity-40" /> },
              { href: "/app/profile", label: "Profile and rewards", icon: <User className="opacity-40" /> },
            ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading tracking-tight">Settings</h1>
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Account and workspace</p>
      </header>

      <Card glass className="p-6 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-accent-brown text-white flex items-center justify-center">
          <User />
        </div>
        <div>
          <h2 className="text-xl font-heading">{profile?.full_name || "Guest"}</h2>
          <p className="text-xs font-bold uppercase tracking-widest opacity-40">
            {profile?.role ? ROLE_LABELS[profile.role] : "No role selected"}
          </p>
        </div>
      </Card>

      <section className="grid gap-3">
        {workspaceLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="p-5 bg-white border-black/5 flex items-center gap-4">
              {item.icon}
              <span className="font-bold">{item.label}</span>
            </Card>
          </Link>
        ))}
      </section>

      {profile && (
        <Button fullWidth variant="outline" className="py-5 border-accent-red/20 text-accent-red" onClick={signOut}>
          <LogOut size={18} className="mr-2" />
          Sign out
        </Button>
      )}
    </div>
  );
}
