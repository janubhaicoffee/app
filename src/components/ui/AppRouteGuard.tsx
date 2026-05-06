"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/roles";
import { Button } from "./Button";

const routeAccess: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/app/admin", roles: ["superadmin"] },
  { prefix: "/app/finances", roles: ["superadmin"] },
  { prefix: "/app/integrations", roles: ["superadmin"] },
  { prefix: "/app/outlets", roles: ["superadmin"] },
  { prefix: "/app/users", roles: ["superadmin", "manager", "outlet_owner"] },
  { prefix: "/app/menu", roles: ["superadmin"] },
  { prefix: "/app/pricing", roles: ["superadmin"] },
  { prefix: "/app/manager", roles: ["manager", "outlet_owner", "superadmin"] },
  { prefix: "/app/inventory", roles: ["manager", "outlet_owner", "superadmin"] },
  { prefix: "/app/profit", roles: ["manager", "outlet_owner", "superadmin"] },
  { prefix: "/app/add-expense", roles: ["manager", "outlet_owner", "superadmin"] },
  { prefix: "/app/expenses", roles: ["manager", "outlet_owner", "superadmin"] },
  { prefix: "/app/terminal", roles: ["employee", "cashier", "kitchen", "manager", "outlet_owner", "superadmin"] },
  { prefix: "/app/orders", roles: ["employee", "cashier", "kitchen", "manager", "outlet_owner", "superadmin"] },
  { prefix: "/app/onboarding", roles: ["franchise_applicant", "superadmin"] },
  { prefix: "/app/home", roles: ["customer", "superadmin"] },
  { prefix: "/app/cart", roles: ["customer", "superadmin"] },
  { prefix: "/app/profile", roles: ["customer", "employee", "cashier", "kitchen", "manager", "outlet_owner", "regional_admin", "superadmin", "franchise_applicant"] },
  { prefix: "/app/outlet", roles: ["customer", "superadmin"] },
];

function getAllowedRoles(pathname: string) {
  const match = routeAccess
    .filter((entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  return match?.roles;
}

export function AppRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, authError } = useAuth();
  const allowedRoles = getAllowedRoles(pathname);

  if (!profile) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-5 text-center">
        <div className="rounded-full bg-accent-brown/5 p-6">
          <ShieldAlert size={36} className="opacity-40" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-heading">Sign in required</h1>
          <p className="max-w-sm text-sm opacity-50">{authError || "Use your Janu Bhai account before entering the OS workspace."}</p>
        </div>
        <Link href="/login">
          <Button className="bg-accent-brown text-white px-8">Sign in</Button>
        </Link>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-5 text-center">
        <div className="rounded-full bg-accent-red/5 p-6 text-accent-red">
          <ShieldAlert size={36} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-heading">Access restricted</h1>
          <p className="max-w-sm text-sm opacity-50">This workspace is not available for your current account role.</p>
        </div>
        <Link href="/app/settings">
          <Button variant="outline" className="px-8">Back to settings</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
