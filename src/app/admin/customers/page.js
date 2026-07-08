'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
export default function AdminCustomers() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const [custRes, ordRes] = await Promise.all([
          fetch('/api/admin/data?type=customers', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
          fetch('/api/admin/data?type=orders', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
        ]);
        const custJson = await custRes.json();
        const ordJson = await ordRes.json();
        if (custRes.ok) setCustomers(custJson.data || []);
        else setError(custJson.error);
        if (ordRes.ok) setOrders(ordJson.data || []);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const orderStats = {};
  orders.forEach((o) => {
    if (!orderStats[o.user_id]) orderStats[o.user_id] = { count: 0, total: 0 };
    orderStats[o.user_id].count += 1;
    orderStats[o.user_id].total += o.total_amount || 0;
  });
  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  });
  const exportCSV = () => {
    if (customers.length === 0) return;
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Total Orders',
      'Total Spent',
      'Tags',
      'Joined Date',
    ];
    const csvRows = [headers.join(',')];
    customers.forEach((c) => {
      const stats = orderStats[c.id] || { count: 0, total: 0 };
      const row = [
        c.id,
        `"${c.name || ''}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        stats.count,
        stats.total,
        `"${(c.tags || []).join('; ')}"`,
        new Date(c.created_at).toISOString().split('T')[0],
      ];
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  if (loading) return <div className="admin-loading">Loading customers...</div>;
  if (error)
    return (
      <div className="admin-loading" style={{ color: '#c62828' }}>
        Error: {error}
      </div>
    );
  return (
    <div>
      {' '}
      <div className="admin-header">
        {' '}
        <div>
          {' '}
          <h1>Customers Directory</h1>{' '}
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            {' '}
            {customers.length} customer{customers.length !== 1 ? 's' : ''} registered{' '}
          </p>{' '}
        </div>{' '}
        <button className="admin-btn" onClick={exportCSV}>
          Download CSV
        </button>{' '}
      </div>{' '}
      <div className="admin-toolbar">
        {' '}
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            maxWidth: '400px',
            padding: '0.6rem 0.75rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            background: 'var(--bg-chocolate)',
            color: 'var(--text-warm-white)',
          }}
        />{' '}
        {search && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {' '}
            {filtered.length} of {customers.length} shown{' '}
          </span>
        )}{' '}
      </div>{' '}
      <div className="admin-card">
        {' '}
        <table className="admin-table">
          {' '}
          <thead>
            {' '}
            <tr>
              <th></th>
              <th>Name</th> <th>Contact</th> <th>Source</th> <th>Location</th>
              <th>Orders</th> <th>Total Spent</th> <th>Tags</th>
              <th>Joined</th>
            </tr>{' '}
          </thead>{' '}
          <tbody>
            {' '}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {search ? 'No customers match your search.' : 'No customers found.'}
                </td>
              </tr>
            ) : (
              filtered.map((customer) => {
                const stats = orderStats[customer.id] || { count: 0, total: 0 };
                return (
                  <tr key={customer.id}>
                    <td>
                      {customer.profile_picture_url ? (
                        <img
                          src={customer.profile_picture_url}
                          alt=""
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--accent-gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#1a1a1a',
                          }}
                        >
                          {(customer.name || '?')[0].toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--accent-gold)',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                        onClick={() => router.push(`/admin/customers/${customer.id}`)}
                      >
                        {customer.name}
                      </span>
                      {customer.auth_provider && (
                        <span
                          style={{
                            display: 'inline-block',
                            marginLeft: 6,
                            padding: '0.1rem 0.4rem',
                            borderRadius: 3,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            background:
                              customer.auth_provider === 'facebook'
                                ? '#1877F2'
                                : customer.auth_provider === 'google'
                                  ? '#DB4437'
                                  : '#666',
                            color: '#fff',
                            textTransform: 'uppercase',
                            verticalAlign: 'middle',
                          }}
                        >
                          {customer.auth_provider}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{customer.email || '-'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {customer.phone || ''}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {customer.current_location || customer.hometown || '-'}
                    </td>
                    <td>{stats.count}</td>
                    <td>₹{stats.total.toLocaleString()}</td>
                    <td>
                      {customer.tags?.length > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {customer.tags.slice(0, 2).join(', ')}
                          {customer.tags.length > 2 ? '...' : ''}
                        </span>
                      )}
                      {(!customer.tags || customer.tags.length === 0) && '-'}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}{' '}
          </tbody>{' '}
        </table>{' '}
      </div>{' '}
    </div>
  );
}
