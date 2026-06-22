"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import "./account.css";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const getUserAndOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      
      setUser(session.user);

      // Fetch Orders
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (!error && orderData) {
        setOrders(orderData);
      }

      setLoading(false);
    };
    getUserAndOrders();
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

          <div className="orders-section vintage-border">
            <h2 className="section-header">Order History</h2>
            <div className="orders-list">
              {orders.length === 0 ? (
                <p className="no-orders">You haven't placed any orders yet. Start your journey with Janu Bhai!</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="order-card" style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>Order #{order.id.split('-')[0]}</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#ccc' }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary-color)' }}>₹ {order.total_amount}</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                          {order.status.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    {order.awb_number && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>AWB: {order.awb_number}</p>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          onClick={() => router.push(`/track?awb=${order.awb_number}`)}
                        >
                          Track Order
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
