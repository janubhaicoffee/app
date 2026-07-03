"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import OutletGuard from "@/components/OutletGuard";
import OutletSidebar from "@/components/outlet/OutletSidebar";
import "./outlet.css";

export default function OutletLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/outlet" || pathname === "/";
  const [activeRole, setActiveRole] = useState("superuser");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const impRole = sessionStorage.getItem("impersonated_role") || "superuser";
    setActiveRole(impRole);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const restrictedPaths = [
    "/outlet/analytics",
    "/outlet/operations/staff",
    "/outlet/operations/expenses",
    "/outlet/financials",
    "/outlet/settings"
  ];
  const isRestrictedPath = restrictedPaths.some(path => pathname.startsWith(path));
  const isEmployee = ["cashier", "barista", "kitchen", "staff"].includes(activeRole);

  if (mounted && isEmployee && isRestrictedPath) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: '#F8F1E4', padding: '24px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#B71C1C', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Access Denied</h1>
        <p style={{ color: '#5D4037', fontSize: '14px', textAlign: 'center', maxWidth: '400px' }}>Your current staff profile role ({activeRole.toUpperCase()}) does not have permission to access this page.</p>
        <button 
          onClick={() => window.history.back()} 
          style={{ marginTop: '16px', padding: '10px 20px', background: '#3E2723', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          GO BACK
        </button>
      </div>
    );
  }

  return (
    <OutletGuard>
      <div className="outlet-layout-wrapper">
        <OutletSidebar />
        <main className="outlet-main-content">
          {children}
        </main>
      </div>
    </OutletGuard>
  );
}
