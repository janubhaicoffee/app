"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ id: '', name: '', price: '', stock: '', weight: '', description: '', image_url: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data?type=products", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ id: product.id, name: product.name, price: product.price, stock: product.stock, weight: product.weight || '', description: product.description || '', image_url: product.image_url || '' });
    } else {
      setEditingProduct(null);
      setFormData({ id: '', name: '', price: '', stock: '', weight: '', description: '', image_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: formData.id,
      name: formData.formData?.name || formData.name, // Fallback safety
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      weight: parseFloat(formData.weight),
      description: formData.description,
      image_url: formData.image_url
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: editingProduct ? "update_product" : "create_product",
          id: editingProduct?.id,
          payload
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        alert("Failed to save product.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving product.");
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Manage Products</h1>
        <button className="admin-btn" onClick={() => openModal()}>+ Add New Product</button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No products in database.</td></tr>
            ) : (
              products.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>₹{product.price}</td>
                  <td>{product.stock}</td>
                  <td>{product.stock > 0 ? "In Stock" : "Out of Stock"}</td>
                  <td>
                    <button className="admin-btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={() => openModal(product)}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '500px', backgroundColor: 'var(--bg-primary)' }}>
            <h2 style={{ marginTop: 0 }}>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>ID (Slug) - Used in URL</label>
                  <input required disabled={!!editingProduct} type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>
                <div style={{ flex: 2 }}>
                  <label>Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Price (₹)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Weight (g)</label>
                  <input required type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Stock</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>
              </div>
              <div>
                <label>Image URL</label>
                <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
              </div>
              <div>
                <label>Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>Save</button>
                <button type="button" className="admin-btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
