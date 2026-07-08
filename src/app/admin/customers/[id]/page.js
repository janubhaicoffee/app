'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const badge = (bg, color) => ({
  display: 'inline-block',
  padding: '0.15rem 0.6rem',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  background: bg,
  color,
});

const cardStyle = {
  background: 'var(--bg-chocolate, #1a1a1a)',
  border: '1px solid var(--border-color, #333)',
  borderRadius: '8px',
  padding: '1.25rem',
  marginBottom: '1rem',
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: '0.75rem',
  fontSize: '0.95rem',
  fontWeight: 700,
  color: 'var(--text-warm-white, #fff)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const infoRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.4rem 0',
  borderBottom: '1px solid var(--border-color, #333)',
  fontSize: '0.9rem',
};
const infoLabel = { color: 'var(--text-secondary, #999)' };
const infoValue = {
  color: 'var(--text-warm-white, #fff)',
  fontWeight: 500,
  textAlign: 'right',
  maxWidth: '60%',
};

function ExpandableSection({ title, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={cardStyle}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <h3 style={sectionTitle}>
          {title}{' '}
          <span
            style={{ fontWeight: 400, color: 'var(--text-secondary, #999)', fontSize: '0.85rem' }}
          >
            ({count})
          </span>
        </h3>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary, #999)' }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div style={{ marginTop: '0.75rem' }}>{children}</div>}
    </div>
  );
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/admin/data?type=customer_detail&id=${params.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        const json = await res.json();
        if (res.ok) {
          setCustomer(json.data);
          setNotes(json.data.notes || '');
          setTagsInput((json.data.tags || []).join(', '));
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError('Failed to load customer');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [params.id]);

  const orders = customer?.orders || [];
  const fb = customer?.facebook_data || null;
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const lastOrderDate = totalOrders > 0 ? orders[0].created_at : null;

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'update_customer',
          id: params.id,
          payload: { tags, notes },
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setSaveMsg('Saved successfully');
        setCustomer((prev) => ({ ...prev, tags, notes }));
      } else {
        setSaveMsg('Error: ' + json.error);
      }
    } catch (err) {
      setSaveMsg('Error saving');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  if (loading) return <div className="admin-loading">Loading customer...</div>;
  if (error)
    return (
      <div className="admin-loading" style={{ color: '#c62828' }}>
        Error: {error}
      </div>
    );
  if (!customer) return <div className="admin-loading">Customer not found</div>;

  return (
    <div>
      {/* Header */}
      <div
        className="admin-header"
        style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          {customer.profile_picture_url ? (
            <img
              src={customer.profile_picture_url}
              alt={customer.name}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: '3px solid var(--accent-gold, #d4a843)',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--accent-gold, #d4a843)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#1a1a1a',
              }}
            >
              {(customer.name || '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{customer.name || 'Unknown'}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              {customer.auth_provider && (
                <span
                  style={badge(
                    customer.auth_provider === 'facebook'
                      ? '#1877F2'
                      : customer.auth_provider === 'google'
                        ? '#DB4437'
                        : '#666',
                    '#fff',
                  )}
                >
                  {customer.auth_provider === 'facebook' ? 'f ' : ''}
                  {customer.auth_provider}
                </span>
              )}
              {customer.facebook_id && (
                <span style={badge('rgba(24,119,242,0.15)', '#1877F2')}>FB Verified</span>
              )}
              {customer.user_id && (
                <span style={badge('rgba(46,125,50,0.15)', '#4caf50')}>Registered</span>
              )}
              <span
                style={{
                  color: 'var(--text-secondary, #999)',
                  fontSize: '0.85rem',
                  alignSelf: 'center',
                }}
              >
                Customer since {new Date(customer.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <button className="admin-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            background: saveMsg.startsWith('Error') ? 'rgba(198,40,40,0.2)' : 'rgba(46,125,50,0.2)',
            color: saveMsg.startsWith('Error') ? '#ef5350' : '#4caf50',
          }}
        >
          {saveMsg}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card green">
          <h3>Total Orders</h3>
          <p className="stat-value">{totalOrders}</p>
        </div>
        <div className="stat-card gold">
          <h3>Total Spent</h3>
          <p className="stat-value">₹{totalSpent.toLocaleString()}</p>
        </div>
        <div className="stat-card blue">
          <h3>Last Order</h3>
          <p className="stat-value">
            {lastOrderDate ? new Date(lastOrderDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Visits</h3>
          <p className="stat-value">{customer.visit_count || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders (All)</h3>
          <p className="stat-value">{customer.total_orders || 0}</p>
        </div>
      </div>

      {/* Profile Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Contact */}
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Contact Information</h3>
          <div style={infoRow}>
            <span style={infoLabel}>Email</span>
            <span style={infoValue}>{customer.email || customer.facebook_email || '-'}</span>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>Phone</span>
            <span style={infoValue}>{customer.phone || '-'}</span>
          </div>
          {customer.facebook_link && (
            <div style={infoRow}>
              <span style={infoLabel}>Facebook Profile</span>
              <a
                href={customer.facebook_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...infoValue, color: '#1877F2', textDecoration: 'underline' }}
              >
                View Profile ↗
              </a>
            </div>
          )}
          {customer.current_location && (
            <div style={infoRow}>
              <span style={infoLabel}>Current Location</span>
              <span style={infoValue}>{customer.current_location}</span>
            </div>
          )}
          {customer.hometown && (
            <div style={infoRow}>
              <span style={infoLabel}>Hometown</span>
              <span style={infoValue}>{customer.hometown}</span>
            </div>
          )}
        </div>

        {/* Demographics */}
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Demographics</h3>
          <div style={infoRow}>
            <span style={infoLabel}>Gender</span>
            <span style={infoValue}>{customer.gender || '-'}</span>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>Birthday</span>
            <span style={infoValue}>{customer.birthday || '-'}</span>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>Age Range</span>
            <span style={infoValue}>
              {customer.age_range
                ? `${customer.age_range.min || '?'} - ${customer.age_range.max || '?'}`
                : '-'}
            </span>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>Last Visit</span>
            <span style={infoValue}>
              {customer.last_visit_at ? new Date(customer.last_visit_at).toLocaleDateString() : '-'}
            </span>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>Phone Verified</span>
            <span style={infoValue}>{customer.is_phone_verified ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Facebook Social Data */}
      {fb && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Friends */}
          <ExpandableSection
            title="Facebook Friends"
            count={(fb.friends || []).length}
            defaultOpen={false}
          >
            {(fb.friends || []).length === 0 ? (
              <p style={{ color: 'var(--text-secondary, #999)', margin: 0 }}>
                No friends data available
              </p>
            ) : (
              <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                {(fb.friends || []).map((f, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.35rem 0',
                      borderBottom: '1px solid var(--border-color, #333)',
                      fontSize: '0.85rem',
                      color: 'var(--text-warm-white, #fff)',
                    }}
                  >
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </ExpandableSection>

          {/* Likes */}
          <ExpandableSection
            title="Facebook Likes"
            count={(fb.likes || []).length}
            defaultOpen={false}
          >
            {(fb.likes || []).length === 0 ? (
              <p style={{ color: 'var(--text-secondary, #999)', margin: 0 }}>
                No likes data available
              </p>
            ) : (
              <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                {(fb.likes || []).map((l, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.35rem 0',
                      borderBottom: '1px solid var(--border-color, #333)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-warm-white, #fff)' }}>{l.name}</span>
                    {l.category && (
                      <span
                        style={{
                          color: 'var(--text-secondary, #999)',
                          marginLeft: 8,
                          fontSize: '0.8rem',
                        }}
                      >
                        {l.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ExpandableSection>

          {/* Photos */}
          <ExpandableSection
            title="Facebook Photos"
            count={(fb.photos || []).length}
            defaultOpen={false}
          >
            {(fb.photos || []).length === 0 ? (
              <p style={{ color: 'var(--text-secondary, #999)', margin: 0 }}>
                No photos data available
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: 8,
                }}
              >
                {(fb.photos || []).slice(0, 20).map((p, i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 6,
                      overflow: 'hidden',
                      background: 'var(--bg-espresso, #111)',
                    }}
                  >
                    {p.source ? (
                      <img
                        src={p.source}
                        alt={p.name || ''}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-secondary, #999)',
                          fontSize: '0.75rem',
                        }}
                      >
                        No preview
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ExpandableSection>

          {/* Posts */}
          <ExpandableSection
            title="Facebook Posts"
            count={(fb.posts || []).length}
            defaultOpen={false}
          >
            {(fb.posts || []).length === 0 ? (
              <p style={{ color: 'var(--text-secondary, #999)', margin: 0 }}>
                No posts data available
              </p>
            ) : (
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {(fb.posts || []).map((p, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.5rem 0',
                      borderBottom: '1px solid var(--border-color, #333)',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #999)' }}>
                      {new Date(p.created_time).toLocaleDateString()}
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-warm-white, #fff)',
                        marginTop: 2,
                      }}
                    >
                      {p.message || <em>No text</em>}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary, #999)',
                        marginTop: 2,
                      }}
                    >
                      Type: {p.type}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ExpandableSection>

          {/* Videos */}
          <ExpandableSection
            title="Facebook Videos"
            count={(fb.videos || []).length}
            defaultOpen={false}
          >
            {(fb.videos || []).length === 0 ? (
              <p style={{ color: 'var(--text-secondary, #999)', margin: 0 }}>
                No videos data available
              </p>
            ) : (
              <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                {(fb.videos || []).map((v, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.35rem 0',
                      borderBottom: '1px solid var(--border-color, #333)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-warm-white, #fff)' }}>
                      {v.title || 'Untitled'}
                    </span>
                    <span
                      style={{
                        color: 'var(--text-secondary, #999)',
                        marginLeft: 8,
                        fontSize: '0.8rem',
                      }}
                    >
                      {new Date(v.created_time).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ExpandableSection>
        </div>
      )}

      {/* Tags & Notes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Tags</h3>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Enter tags separated by commas"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid var(--border-color, #333)',
              borderRadius: '4px',
              marginBottom: '0.5rem',
              background: 'var(--bg-espresso, #111)',
              color: 'var(--text-warm-white, #fff)',
              boxSizing: 'border-box',
            }}
          />
          {customer.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {customer.tags.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    background: 'var(--accent-gold, #d4a843)',
                    color: '#1a1a1a',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {(!customer.tags || customer.tags.length === 0) && (
            <p style={{ color: 'var(--text-secondary, #999)', fontSize: '0.85rem', margin: 0 }}>
              No tags added yet.
            </p>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitle}>Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal notes about this customer..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid var(--border-color, #333)',
              borderRadius: '4px',
              resize: 'vertical',
              fontFamily: 'inherit',
              background: 'var(--bg-espresso, #111)',
              color: 'var(--text-warm-white, #fff)',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Order History */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Order History ({totalOrders})</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {totalOrders === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: 'center', color: 'var(--text-secondary, #999)' }}
                >
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <td style={{ fontWeight: 600 }}>#{order.id.slice(0, 8)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{(order.order_items || []).length} items</td>
                  <td>₹{order.total_amount?.toLocaleString()}</td>
                  <td>
                    <span
                      style={{
                        textTransform: 'capitalize',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        background:
                          order.status === 'delivered'
                            ? 'rgba(46,125,50,0.2)'
                            : order.status === 'cancelled'
                              ? 'rgba(198,40,40,0.2)'
                              : order.status === 'paid'
                                ? 'rgba(255,179,0,0.15)'
                                : 'rgba(106,27,154,0.15)',
                        color:
                          order.status === 'delivered'
                            ? '#4caf50'
                            : order.status === 'cancelled'
                              ? '#ef5350'
                              : order.status === 'paid'
                                ? 'var(--accent-gold, #d4a843)'
                                : '#ce93d8',
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
