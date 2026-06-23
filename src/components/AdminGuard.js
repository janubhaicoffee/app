"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth/login");
        return;
      }

      // Check if user's email is in the SUPERADMIN_EMAILS env variable
      const adminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      const userEmail = session.user.email?.toLowerCase();

      if (userEmail && adminEmails.includes(userEmail)) {
        setIsAuthorized(true);
      } else {
        router.push("/");
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <h2>Checking Admin Credentials...</h2>
    </div>;
  }

  return children;
}
