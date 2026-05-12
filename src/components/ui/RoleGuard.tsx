"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UserRole } from "@/lib/roles";
import { ShieldAlert } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallbackRoute?: string;
}

export function RoleGuard({ allowedRoles, children, fallbackRoute = "/app/home" }: RoleGuardProps) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) {
      if (!allowedRoles.includes(profile.role)) {
        router.replace(fallbackRoute);
      }
    }
  }, [loading, profile, allowedRoles, fallbackRoute, router]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-brown/20 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center p-6">
        <div className="w-16 h-16 bg-accent-red/10 text-accent-red rounded-full flex items-center justify-center">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-heading text-accent-brown">Access Restricted</h2>
        <p className="text-sm opacity-60 max-w-sm">
          Redirecting to your authorized workspace...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
