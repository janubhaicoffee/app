'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Search, Plus, Eye, Copy, Trash2, Star, Pencil } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'published', label: 'Published', color: '#2e7d32' },
  { value: 'draft', label: 'Draft', color: '#e65100' },
  { value: 'archived', label: 'Archived', color: '#9e9e9e' },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin/data?type=products', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (product) => {
    if (!confirmDelete || confirmDelete.id !== product.id) {
      setConfirmDelete(product);
      return;
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'delete_product', id: product.id }),
      });
      if (res.ok) {
        fetchProducts();
        showToast('Product deleted');
      }
    } catch (e) {
      showToast('Error deleting product', 'error');
    }
    setConfirmDelete(null);
  };

  const handleDuplicate = async (product) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'duplicate_product', id: product.id }),
      });
      if (res.ok) {
        fetchProducts();
        showToast('Duplicated as draft');
      }
    } catch (e) {
      showToast('Error duplicating', 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) && !p.id?.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[1];
    return (
      <span className="status-badge" style={{ background: opt.color, color: '#fff' }}>
        {opt.label}
      </span>
    );
  };

  return (
    <div className="admin-products-page">
      {toast && (
        <div className={`admin-toast ${toast.type === 'error' ? 'admin-toast-error' : ''}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <h1>Manage Products</h1>
        <Link href="/admin/products/new" className="admin-btn">
          <Plus size={16} /> Add New Product
        </Link>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-filter-tabs">
          {['all', 'published', 'draft', 'archived'].map((s) => (
            <button
              key={s}
              className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className="product-count">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}></th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Category</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}
                  >
                    {search
                      ? 'No products match your search.'
                      : 'No products yet. Add your first product!'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={
                      product.status === 'draft'
                        ? 'row-draft'
                        : product.status === 'archived'
                          ? 'row-archived'
                          : ''
                    }
                  >
                    <td>
                      <div
                        className="product-thumb"
                        onClick={() => window.open(`/product/${product.id}`, '_blank')}
                      >
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt=""
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Eye size={16} />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="product-name-cell">
                        <span className="product-name-text">{product.name}</span>
                        <span className="product-id-text">
                          {product.id}{' '}
                          {product.featured && (
                            <Star size={11} fill="var(--accent-gold)" color="var(--accent-gold)" />
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="cell-price">
                      ₹{product.price}
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="cell-compare">₹{product.compare_at_price}</span>
                      )}
                    </td>
                    <td>{product.stock}</td>
                    <td>{getStatusBadge(product.status)}</td>
                    <td>
                      <span className="cell-category">{product.category || '—'}</span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="admin-btn-sm"
                          title="Edit"
                        >
                          <Pencil size={13} /> Edit
                        </Link>
                        <button
                          className="admin-btn-sm-icon"
                          onClick={() => handleDuplicate(product)}
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className={`admin-btn-sm-icon ${confirmDelete?.id === product.id ? 'btn-confirming' : ''}`}
                          onClick={() => handleDelete(product)}
                          title="Delete"
                        >
                          {confirmDelete?.id === product.id ? 'Sure?' : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        .admin-products-page {
          position: relative;
        }
        .admin-loading {
          padding: 3rem;
          text-align: center;
          color: var(--text-secondary);
          font-size: 1.1rem;
        }
        .admin-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          background: #2e7d32;
          color: #fff;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          animation: slideIn 0.3s ease;
        }
        .admin-toast-error {
          background: #c62828;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .admin-toolbar {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .admin-search {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fff;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          flex: 1;
          max-width: 360px;
        }
        .admin-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 0.9rem;
        }
        .admin-search input::placeholder {
          color: #aaa;
        }
        .admin-search svg {
          color: #999;
          flex-shrink: 0;
        }
        .product-count {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
          white-space: nowrap;
        }

        .admin-filter-tabs {
          display: flex;
          gap: 4px;
        }
        .filter-tab {
          padding: 0.4rem 0.8rem;
          border: 1px solid var(--border-color);
          background: #fff;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .filter-tab.active {
          background: var(--primary-color);
          color: #fff;
          border-color: var(--primary-color);
        }

        .admin-table-wrap {
          overflow-x: auto;
        }
        .product-thumb {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          overflow: hidden;
          background: #f5f0eb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .product-thumb:hover {
          transform: scale(1.1);
        }
        .product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-thumb svg {
          color: #999;
        }
        .product-name-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
          align-items: flex-start;
        }
        .product-name-text {
          font-weight: 700;
          font-size: 0.95rem;
        }
        .product-id-text {
          font-size: 0.75rem;
          color: #999;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .cell-price {
          font-weight: 700;
        }
        .cell-compare {
          text-decoration: line-through;
          color: #999;
          font-weight: 400;
          margin-left: 6px;
          font-size: 0.85rem;
        }
        .cell-category {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .row-draft {
          opacity: 0.7;
        }
        .row-archived {
          opacity: 0.5;
        }

        .cell-actions {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .admin-btn-sm {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 0.3rem 0.6rem;
          font-size: 0.78rem;
          border: 1px solid var(--border-color);
          background: #fff;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          color: var(--text-primary);
          text-decoration: none;
          transition: all 0.15s;
        }
        .admin-btn-sm:hover {
          background: var(--primary-color);
          color: #fff;
          border-color: var(--primary-color);
        }
        .admin-btn-sm-icon {
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
          background: #fff;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
          color: var(--text-secondary);
        }
        .admin-btn-sm-icon:hover {
          border-color: var(--accent-red);
          color: var(--accent-red);
        }
        .btn-confirming {
          background: #c62828 !important;
          color: #fff !important;
          border-color: #c62828 !important;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .status-badge {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}
