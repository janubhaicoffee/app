"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import "./account.css";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <main className="account-page text-center"><p>Loading...</p></main>;
  }

  if (!user) return null;

  return (
    <main className="account-page">
      <div className="container">
        <div className="account-layout">
          {/* Profile Section */}
          <div className="profile-section vintage-border">
            <h2 className="section-header">My Profile</h2>
            <div className="profile-details">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.user_metadata?.full_name || "N/A"}</p>
            </div>
            <button className="btn-secondary mt-20" onClick={handleLogout}>LOGOUT</button>
          </div>

          {/* Orders Section */}
          <div className="orders-section vintage-border">
            <h2 className="section-header">Order History</h2>
            <div className="orders-list">
              <p className="no-orders">You haven't placed any orders yet. Start your journey with Janu Bhai!</p>
              {/* In a real app, we'd fetch orders from Supabase public.orders table here */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
