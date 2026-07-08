'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, Phone, User, Mail, TrendingUp, Calendar } from 'lucide-react';
import '../outlet.css';
export default function OutletCustomers() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerFb, setCustomerFb] = useState(null);
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('customers')
        .select('*')
        .order('total_spent', { ascending: false })
        .limit(50);
      if (search.trim()) {
        const term = search.trim();
        query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`);
      }
      const { data } = await query;
      setCustomers(data || []);
    } catch (err) {
      console.error('Fetch customers error:', err);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchCustomers();
  }, []);
  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerFb(null);
    try {
      const [posRes, onlineRes, fbRes] = await Promise.all([
        supabase
          .from('pos_orders')
          .select('*')
          .or(`customer_id.eq.${customer.id},customer_phone.eq.${customer.phone}`)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('orders')
          .select('*')
          .or(
            `user_id.eq.${customer.user_id},customer_email.eq.${customer.email},customer_phone.eq.${customer.phone}`,
          )
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('customer_facebook_data')
          .select('*')
          .eq('customer_id', customer.id)
          .maybeSingle(),
      ]);
      setCustomerOrders(
        [
          ...(posRes.data || []).map((o) => ({ ...o, source_label: 'Cafe' })),
          ...(onlineRes.data || []).map((o) => ({
            ...o,
            source_label: 'Online',
          })),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
      );
      if (fbRes.data) setCustomerFb(fbRes.data);
    } catch (err) {
      console.error('Fetch customer orders error:', err);
    }
  };
  return (
    <main className="outlet-page">
      {' '}
      <header className="outlet-header">
        {' '}
        <h1>Unified Customer Profiles</h1> <p>View customer activity across all channels</p>{' '}
      </header>{' '}
      <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        {' '}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {' '}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email..."
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid var(--border-color)',
              background: 'var(--bg-chocolate)',
              color: 'var(--text-warm-white)',
              borderRadius: 4,
            }}
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
          />{' '}
          <button
            className="btn-primary"
            onClick={fetchCustomers}
            style={{
              background: 'var(--accent-gold)',
              color: '#1a0a08',
              border: 'none',
              borderRadius: 4,
              padding: '10px 16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {' '}
            <Search size={16} /> Search{' '}
          </button>{' '}
        </div>{' '}
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading customers...</p>
        ) : selectedCustomer ? (
          <div>
            {' '}
            <button
              className="btn-secondary"
              onClick={() => setSelectedCustomer(null)}
              style={{
                marginBottom: 20,
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-warm-white)',
                padding: '8px 16px',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {' '}
              â† Back to all customers{' '}
            </button>{' '}
            <div
              className="customer-profile-header"
              style={{
                background: 'var(--bg-chocolate)',
                padding: 24,
                border: '1px solid var(--border-color)',
                marginBottom: 20,
                borderRadius: 8,
                display: 'flex',
                gap: 20,
                alignItems: 'flex-start',
              }}
            >
              {selectedCustomer.profile_picture_url ? (
                <img
                  src={selectedCustomer.profile_picture_url}
                  alt=""
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    border: '3px solid var(--accent-gold)',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: '#1a1a1a',
                    flexShrink: 0,
                  }}
                >
                  {(selectedCustomer.name || '?')[0].toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 22, marginBottom: 4, color: 'var(--text-warm-white)' }}>
                  {selectedCustomer.name || 'Unknown'}
                  {selectedCustomer.auth_provider && (
                    <span
                      style={{
                        marginLeft: 8,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 4,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background:
                          selectedCustomer.auth_provider === 'facebook'
                            ? '#1877F2'
                            : selectedCustomer.auth_provider === 'google'
                              ? '#DB4437'
                              : '#666',
                        color: '#fff',
                        verticalAlign: 'middle',
                      }}
                    >
                      {selectedCustomer.auth_provider}
                    </span>
                  )}
                </h2>
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                    color: 'var(--text-secondary)',
                    fontSize: 14,
                    marginTop: 4,
                  }}
                >
                  {selectedCustomer.phone && (
                    <span>
                      <Phone size={13} /> {selectedCustomer.phone}
                    </span>
                  )}
                  {selectedCustomer.email && (
                    <span>
                      <Mail size={13} /> {selectedCustomer.email}
                    </span>
                  )}
                  {selectedCustomer.current_location && (
                    <span>📍 {selectedCustomer.current_location}</span>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 24,
                    marginTop: 12,
                    color: 'var(--text-warm-white)',
                    fontSize: 14,
                  }}
                >
                  <div>
                    <strong>{selectedCustomer.total_orders || 0}</strong> orders
                  </div>
                  <div style={{ color: 'var(--accent-gold)' }}>
                    <strong>₹{parseFloat(selectedCustomer.total_spent || 0).toFixed(0)}</strong>{' '}
                    spent
                  </div>
                  <div>
                    <strong>{selectedCustomer.visit_count || 0}</strong> visits
                  </div>
                </div>
                {selectedCustomer.last_order_at && (
                  <p style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <Calendar size={12} /> Last activity:{' '}
                    {new Date(selectedCustomer.last_order_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            {/* Demographics from Facebook */}
            {(selectedCustomer.gender ||
              selectedCustomer.birthday ||
              selectedCustomer.age_range ||
              selectedCustomer.hometown) && (
              <div
                style={{
                  background: 'var(--bg-chocolate)',
                  padding: 16,
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  marginBottom: 16,
                  display: 'flex',
                  gap: 24,
                  flexWrap: 'wrap',
                  fontSize: 14,
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--accent-gold)', width: '100%' }}>
                  Profile Details
                </div>
                {selectedCustomer.gender && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Gender:</span>{' '}
                    <span style={{ color: 'var(--text-warm-white)' }}>
                      {selectedCustomer.gender}
                    </span>
                  </div>
                )}
                {selectedCustomer.birthday && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Birthday:</span>{' '}
                    <span style={{ color: 'var(--text-warm-white)' }}>
                      {selectedCustomer.birthday}
                    </span>
                  </div>
                )}
                {selectedCustomer.age_range && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Age:</span>{' '}
                    <span style={{ color: 'var(--text-warm-white)' }}>
                      {selectedCustomer.age_range.min || '?'}–
                      {selectedCustomer.age_range.max || '?'}
                    </span>
                  </div>
                )}
                {selectedCustomer.hometown && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Hometown:</span>{' '}
                    <span style={{ color: 'var(--text-warm-white)' }}>
                      {selectedCustomer.hometown}
                    </span>
                  </div>
                )}
                {selectedCustomer.facebook_link && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Facebook:</span>{' '}
                    <a
                      href={selectedCustomer.facebook_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#1877F2' }}
                    >
                      View Profile ↗
                    </a>
                  </div>
                )}
              </div>
            )}
            {/* Facebook Social Summary */}
            {customerFb && (
              <div
                style={{
                  background: 'var(--bg-chocolate)',
                  padding: 16,
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  marginBottom: 16,
                  display: 'flex',
                  gap: 20,
                  flexWrap: 'wrap',
                  fontSize: 14,
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--accent-gold)', width: '100%' }}>
                  Facebook Activity
                </div>
                <div>
                  👥 <strong>{(customerFb.friends || []).length}</strong> friends on app
                </div>
                <div>
                  ❤️ <strong>{(customerFb.likes || []).length}</strong> page likes
                </div>
                <div>
                  📸 <strong>{(customerFb.photos || []).length}</strong> photos
                </div>
                <div>
                  📝 <strong>{(customerFb.posts || []).length}</strong> posts
                </div>
                <div>
                  🎬 <strong>{(customerFb.videos || []).length}</strong> videos
                </div>
              </div>
            )}
            <h3 style={{ marginBottom: 12, color: 'var(--text-warm-white)' }}>
              Order History (All Channels)
            </h3>{' '}
            {customerOrders.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No orders found</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {' '}
                {customerOrders.map((order, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-chocolate)',
                      padding: 16,
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {' '}
                    <div>
                      {' '}
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--text-warm-white)',
                        }}
                      >
                        {' '}
                        {order.source_label === 'Cafe' ? 'â˜• Cafe' : 'ðŸ›’ Online'} Â· #
                        {order.order_number || order.id?.slice(0, 8)}{' '}
                      </div>{' '}
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {' '}
                        {new Date(order.created_at).toLocaleString()}{' '}
                      </div>{' '}
                    </div>{' '}
                    <div style={{ textAlign: 'right' }}>
                      {' '}
                      <div style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                        {' '}
                        â‚¹
                        {parseFloat(order.total_amount || order.total || 0).toFixed(2)}{' '}
                      </div>{' '}
                      <span className={`pos-badge ${order.status || order.payment_status}`}>
                        {' '}
                        {order.status || order.payment_status}{' '}
                      </span>{' '}
                    </div>{' '}
                  </div>
                ))}{' '}
              </div>
            )}{' '}
          </div>
        ) : customers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              color: 'var(--text-secondary)',
            }}
          >
            {' '}
            <TrendingUp size={40} style={{ opacity: 0.3, marginBottom: 8 }} />{' '}
            <p>No customers found</p>{' '}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {' '}
            {customers.map((c) => (
              <div
                key={c.id}
                style={{
                  background: 'var(--bg-chocolate)',
                  padding: 16,
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
                onClick={() => handleSelectCustomer(c)}
              >
                {c.profile_picture_url ? (
                  <img
                    src={c.profile_picture_url}
                    alt=""
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#1a1a1a',
                      flexShrink: 0,
                    }}
                  >
                    {(c.name || '?')[0].toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-warm-white)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {c.name || 'Unknown'}
                    {c.auth_provider && (
                      <span
                        style={{
                          padding: '0.1rem 0.4rem',
                          borderRadius: 3,
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background:
                            c.auth_provider === 'facebook'
                              ? '#1877F2'
                              : c.auth_provider === 'google'
                                ? '#DB4437'
                                : '#666',
                          color: '#fff',
                        }}
                      >
                        {c.auth_provider}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.phone || ''}
                    {c.phone && c.email ? ' · ' : ''}
                    {c.email || ''}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {c.total_orders || 0} orders · ₹{parseFloat(c.total_spent || 0).toFixed(0)}{' '}
                    spent · {c.visit_count || 0} visits
                    {c.current_location && <span> · 📍 {c.current_location}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {c.last_order_at && (
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {new Date(c.last_order_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}{' '}
          </div>
        )}{' '}
      </div>{' '}
    </main>
  );
}
