'use client';
import { useState, useEffect } from 'react';
import { Search, ArrowUp, ArrowDown, Users } from 'lucide-react';

export default function CustomerProfiling({ outletId, refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);

  // Filtering and sorting states
  const [search, setSearch] = useState('');
  const [loyaltyFilter, setLoyaltyFilter] = useState('all');
  const [sortDir, setSortDir] = useState(null); // null, 'asc', 'desc'

  // Coupon issuance states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/outlet/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      const { data } = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleSortSpend = () => {
    if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortDir('asc');
    }
  };

  const handleSaveCoupon = async () => {
    try {
      const res = await fetch('/api/outlet/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          discount_type: 'percentage',
          discount_value: 15,
        }),
      });
      if (res.ok) {
        setCouponSuccess(true);
        setTimeout(() => {
          setCouponSuccess(false);
          setSelectedCustomer(null);
          setCouponCode('');
        }, 3000);
      }
    } catch (err) {
      console.error('Save coupon error:', err);
    }
  };

  // Filter and sort logic
  let filtered = customers.filter((c) => {
    // 1. Search filter
    const nameMatch = (c.name || '').toLowerCase().includes(search.toLowerCase());
    const emailMatch = (c.email || '').toLowerCase().includes(search.toLowerCase());
    const matchSearch = nameMatch || emailMatch;

    // 2. Loyalty filter
    const matchLoyalty =
      loyaltyFilter === 'all' || (c.tier || '').toLowerCase() === loyaltyFilter.toLowerCase();

    return matchSearch && matchLoyalty;
  });

  if (sortDir === 'asc') {
    filtered.sort((a, b) => parseFloat(a.spend || 0) - parseFloat(b.spend || 0));
  } else if (sortDir === 'desc') {
    filtered.sort((a, b) => parseFloat(b.spend || 0) - parseFloat(a.spend || 0));
  }

  const formatCurrency = (n) =>
    Number(n).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  if (loading) {
    return (
      <div className="panel">
        <h2>Customer Registry</h2>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <h2>Customer Registry</h2>
        <div className="error-text">{error}</div>
      </div>
    );
  }

  return (
    <div className="panel" data-testid="customer-registry-panel">
      <h2>Customer Registry</h2>

      {/* Controls */}
      <div
        className="customer-controls"
        style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#a0aec0' }} />
          <input
            className="form-control"
            style={{ paddingLeft: 30 }}
            data-testid="customer-search-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <select
            className="form-control"
            data-testid="customer-loyalty-filter"
            value={loyaltyFilter}
            onChange={(e) => setLoyaltyFilter(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="all">All Tiers</option>
            <option value="Bronze">Bronze</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>
        <div style={{ fontSize: 12, color: '#718096', alignSelf: 'center', marginLeft: 'auto' }}>
          {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Customer Table */}
      {customers.length === 0 ? (
        <div
          className="empty-placeholder"
          data-testid="customer-registry-table"
          style={{ padding: '20px 0' }}
        >
          <Users size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
          <p>No customers found</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="outlet-table" data-testid="customer-registry-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Visits</th>
                <th
                  data-testid="sort-total-spend"
                  onClick={handleSortSpend}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  className="sort-header"
                >
                  Spend{' '}
                  {sortDir === 'asc' ? (
                    <ArrowUp size={12} style={{ display: 'inline', marginLeft: 2 }} />
                  ) : sortDir === 'desc' ? (
                    <ArrowDown size={12} style={{ display: 'inline', marginLeft: 2 }} />
                  ) : null}
                </th>
                <th>Tier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    data-testid="empty-customers"
                    style={{ textAlign: 'center', color: '#a0aec0', padding: '20px 0' }}
                  >
                    {loyaltyFilter !== 'all'
                      ? 'No customers found in this tier'
                      : 'No customers matched your search'}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} data-testid="customer-row">
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.email || '-'}</td>
                    <td>{c.visits || 0}</td>
                    <td className="total-spend">{c.spend || 0}</td>
                    <td>
                      <span
                        className={`outlet-badge ${
                          c.tier?.toLowerCase() === 'gold'
                            ? 'yellow'
                            : c.tier?.toLowerCase() === 'silver'
                              ? 'gray'
                              : c.tier?.toLowerCase() === 'platinum'
                                ? 'purple'
                                : 'blue'
                        }`}
                      >
                        {c.tier}
                      </span>
                    </td>
                    <td>
                      <button
                        data-testid="btn-issue-coupon"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCouponCode(`${c.name.replace(/\s+/g, '').toUpperCase()}15`);
                        }}
                        className="outlet-btn outline xs"
                        style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Issue Coupon
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Coupon Issuance Form */}
      {selectedCustomer && (
        <div className="outlet-card" style={{ marginTop: 16 }}>
          <h3>Issue Custom Coupon for {selectedCustomer.name}</h3>
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label>Coupon Code</label>
            <input
              type="text"
              className="form-control"
              data-testid="field-coupon-code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button
            className="outlet-btn primary sm"
            data-testid="btn-save-coupon"
            onClick={handleSaveCoupon}
            style={{
              padding: '6px 12px',
              background: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Save Coupon
          </button>
          {couponSuccess && (
            <div style={{ marginTop: 10, color: 'green', fontSize: 13, fontWeight: 'bold' }}>
              Coupon saved successfully
            </div>
          )}
        </div>
      )}
    </div>
  );
}
