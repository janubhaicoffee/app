"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Package, MapPin, Coffee, LogOut, CheckCircle2, Settings } from "lucide-react";
import "./account.css";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Address Form State
  const [addressForm, setAddressForm] = useState({
    address: "",
    city: "",
    pincode: ""
  });
  const [savingAddress, setSavingAddress] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async (session) => {
      try {
        if (!session) {
          router.push("/auth/login");
          return;
        }
        
        setUser(session.user);

        // Fetch Profile for Address
        const { data: profile } = await supabase
          .from('profiles')
          .select('address, city, pincode')
          .eq('id', session.user.id)
          .single();
          
        if (profile && mounted) {
          setAddressForm({
            address: profile.address || "",
            city: profile.city || "",
            pincode: profile.pincode || ""
          });
        }

        // Fetch Orders
        let orCondition = `user_id.eq.${session.user.id}`;
        if (session.user.email) orCondition += `,customer_email.eq.${session.user.email}`;

        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .or(orCondition)
          .order('created_at', { ascending: false });
          
        if (orderData && mounted) {
          setOrders(orderData);
        }

        // Check Admin Status
        const adminRes = await fetch("/api/admin/data?type=check", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          if (adminData.isAdmin && mounted) {
            setIsAdmin(true);
          }
        }

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // First check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData(session);
      } else {
        // If no session immediately (e.g. parsing hash), wait a moment or let auth listener catch it
        // We don't redirect immediately to allow the hash to be parsed
      }
    });

    // Listen for auth state changes (crucial for Magic Links / OAuth with hash fragments)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchUserData(session);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          router.push("/auth/login");
        }
      }
    });

    // Fallback: If after 2 seconds we still have no session and loading is true, redirect
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session && mounted) {
          router.push("/auth/login");
        }
      });
    }, 2000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        address: addressForm.address,
        city: addressForm.city,
        pincode: addressForm.pincode,
        updated_at: new Date()
      });
      
    if (error) {
      alert("Failed to save address. Please try again.");
      console.error(error);
    } else {
      alert("Address saved successfully!");
    }
    setSavingAddress(false);
  };

  if (loading) {
    return <main className="account-page text-center"><p>Loading your portal...</p></main>;
  }

  if (!user) return null;

  return (
    <main className="account-page">
      <div className="container">
        <div className="account-layout">
          
          {/* Sidebar */}
          <aside className="sidebar">
            <nav className="sidebar-nav">
              <div 
                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <LayoutDashboard size={20} />
                <span>Overview</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={20} />
                <span>Order History</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <MapPin size={20} />
                <span>Addresses</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
                onClick={() => setActiveTab('subscriptions')}
              >
                <Coffee size={20} />
                <span>Subscriptions</span>
              </div>
              
              {isAdmin && (
                <div 
                  className="nav-item"
                  onClick={() => router.push('/admin')}
                  style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}
                >
                  <Settings size={20} />
                  <span>Admin Panel</span>
                </div>
              )}
              
              <div className="nav-item logout" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Logout</span>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <section className="main-content">
            
            {activeTab === 'overview' && (
              <div className="tab-content fade-in">
                <h2 className="tab-header">Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || "Coffee Lover"}!</h2>
                
                <div className="overview-cards">
                  <div className="stat-card">
                    <h3>Total Orders</h3>
                    <div className="stat-value">{orders.length}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Active Subscriptions</h3>
                    <div className="stat-value">0</div>
                  </div>
                  <div className="stat-card">
                    <h3>Janu Bhai Points</h3>
                    <div className="stat-value">Coming Soon</div>
                  </div>
                </div>
                
                <div className="profile-details">
                  <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Account Details</h3>
                  <p><strong>Name:</strong> {user.user_metadata?.full_name || "N/A"}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="tab-content fade-in">
                <h2 className="tab-header">Your Orders</h2>
                <div className="orders-list">
                  {orders.length === 0 ? (
                    <p className="no-orders" style={{ textAlign: 'center', padding: '40px' }}>
                      You haven&apos;t placed any orders yet. Start your journey with Janu Bhai!
                    </p>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="order-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#fdfdfd', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>Order #{order.id.split('-')[0]}</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.1rem' }}>₹ {order.total_amount}</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', textTransform: 'capitalize', color: 'var(--accent-red)' }}>
                              {order.status.replace(/_/g, ' ')}
                            </p>
                          </div>
                        </div>
                        {order.awb_number && (
                          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>AWB: {order.awb_number}</p>
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
            )}

            {activeTab === 'addresses' && (
              <div className="tab-content fade-in">
                <h2 className="tab-header">Saved Addresses</h2>
                <form className="address-form" onSubmit={handleSaveAddress}>
                  <div className="form-group">
                    <label>Street Address</label>
                    <textarea 
                      rows="3" 
                      required
                      placeholder="123 Coffee Bean Lane, Near Roastery..."
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                    ></textarea>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>City</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Chikmagaluru"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Pincode / ZIP</label>
                      <input 
                        type="text" 
                        required
                        placeholder="577101"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn-primary" disabled={savingAddress}>
                    {savingAddress ? "SAVING..." : "SAVE ADDRESS"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="tab-content fade-in">
                <h2 className="tab-header">Coffee Subscriptions</h2>
                
                <div className="subscription-card">
                  <h3>Coffee On Autopilot</h3>
                  <p>Never run out of freshly roasted single-origin coffee again. Get your favorite blend delivered right to your door every 2 or 4 weeks.</p>
                  
                  <div className="subscription-features">
                    <span className="feature-badge"><CheckCircle2 size={16} /> 15% Off Every Order</span>
                    <span className="feature-badge"><CheckCircle2 size={16} /> Free Shipping</span>
                    <span className="feature-badge"><CheckCircle2 size={16} /> Pause or Cancel Anytime</span>
                  </div>
                  
                  <button className="subscribe-btn" onClick={() => alert("Subscription Engine coming soon!")}>
                    Explore Plans
                  </button>
                </div>
              </div>
            )}

          </section>
        </div>
      </div>
    </main>
  );
}
