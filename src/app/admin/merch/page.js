"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminMerch() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ id: '', name: '', price: '', stock: '', weight: '', description: '', image_url: '', category: 'merch', seo_title: '', seo_description: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data?type=merch", {
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
      setFormData({ 
        id: product.id, name: product.name, price: product.price, 
        stock: product.stock, weight: product.weight || '', 
        description: product.description || '', image_url: product.image_url || '',
        category: 'merch', seo_title: product.seo_title || '', seo_description: product.seo_description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ id: '', name: '', price: '', stock: '', weight: '', description: '', image_url: '', category: 'merch', seo_title: '', seo_description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: formData.id,
      name: formData.name, // Fixed fallback
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      weight: parseFloat(formData.weight),
      description: formData.description,
      image_url: formData.image_url,
      category: 'merch',
      seo_title: formData.seo_title,
      seo_description: formData.seo_description
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

  const generateAISEO = async () => {
    if (!formData.name) return alert("Please enter a product name first");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/ai/generate-seo", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ productName: formData.name, description: formData.description, price: formData.price })
      });
      if (res.ok) {
        const json = await res.json();
        setFormData(prev => ({ ...prev, seo_title: json.seo.seo_title, seo_description: json.seo.seo_description }));
      } else {
        alert("Failed to generate SEO. Check AI keys.");
      }
    } catch(e) {
      alert("Error calling AI");
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Manage Merch</h1>
        <button className="admin-btn" onClick={() => openModal()}>+ Add New Merch</button>
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
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No merch in database.</td></tr>
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
          <div className="admin-card" style={{ width: '500px', backgroundColor: '#fff', padding: '2rem' }}>
            <h2 style={{ marginTop: 0 }}>{editingProduct ? "Edit Merch" : "Add New Merch"}</h2>
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

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>SEO Settings</h3>
                  <button type="button" onClick={generateAISEO} style={{ background: 'var(--accent-gold)', color: 'var(--text-primary)', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✨ Generate with AI</button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label>Category</label>
                    <input type="text" value="merch" disabled style={{ width: '100%', padding: '8px', marginTop: '5px', backgroundColor: '#eee' }} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label>SEO Title</label>
                    <input type="text" value={formData.seo_title} onChange={e => setFormData({...formData, seo_title: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label>SEO Description</label>
                  <textarea rows="2" value={formData.seo_description} onChange={e => setFormData({...formData, seo_description: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }}></textarea>
                </div>
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
