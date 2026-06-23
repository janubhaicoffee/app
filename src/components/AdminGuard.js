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

      // Use the secure server API to check if the user is an admin
      try {
        const res = await fetch("/api/admin/data?type=check", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.isAdmin) {
            setIsAuthorized(true);
            return;
          }
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }

      router.push("/");
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
