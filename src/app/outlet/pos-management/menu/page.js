"use client";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  ClipboardList, Plus, Search, RefreshCw, ToggleLeft,
  ToggleRight, Edit3, Tag, X
} from "lucide-react";

export default function MenuPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [outletId, setOutletId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "", price: "", cost: "", category_id: "", stock: "0", sku: "", sort_order: "0",
  });
  const [catForm, setCatForm] = useState({ name: "", description: "", sort_order: "0" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: staff } = await supabase.from("outlet_staff").select("outlet_id").eq("user_id", session.user.id).maybeSingle();
      const oid = staff?.outlet_id;
      setOutletId(oid);

      const params = oid ? `?outletId=${oid}` : "";
      const [prodRes, catRes] = await Promise.allSettled([
        fetch(`/api/pos/products${params}`),
        fetch(`/api/pos/categories${params}`),
      ]);

      if (prodRes.status === "fulfilled" && prodRes.value.ok) {
        const { data } = await prodRes.value.json();
        setProducts(Array.isArray(data) ? data : []);
      }
      if (catRes.status === "fulfilled" && catRes.value.ok) {
        const { data } = await catRes.value.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const channel = supabase.channel("menu-realtime");
    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "pos_products" }, () => { fetchData(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "pos_categories" }, () => { fetchData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const handleToggleAvailability = async (product) => {
    try {
      const res = await fetch("/api/pos/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, is_available: !product.is_available }),
      });
      if (res.ok) { fetchData(); setSuccess(`"${product.name}" ${product.is_available ? "disabled" : "enabled"}`); setTimeout(() => setSuccess(""), 2000); }
    } catch {}
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        outlet_id: outletId,
        name: productForm.name,
        price: parseFloat(productForm.price),
        cost: productForm.cost ? parseFloat(productForm.cost) : null,
        category_id: productForm.category_id || null,
        current_stock: parseInt(productForm.stock) || 0,
        sku: productForm.sku || null,
        sort_order: parseInt(productForm.sort_order) || 0,
      };

      let res;
      if (editingProduct) {
        res = await fetch("/api/pos/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...body }),
        });
      } else {
        res = await fetch("/api/pos/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) { const b = await res.json(); throw new Error(b.error); }
      setSuccess(editingProduct ? "Product updated" : "Product added");
      setProductForm({ name: "", price: "", cost: "", category_id: "", stock: "0", sku: "", sort_order: "0" });
      setShowProductForm(false);
      setEditingProduct(null);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price?.toString() || "",
      cost: product.cost?.toString() || "",
      category_id: product.category_id?.toString() || "",
      stock: product.stock?.toString() || "0",
      sku: product.sku || "",
      sort_order: product.sort_order?.toString() || "0",
    });
    setShowProductForm(true);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/pos/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outlet_id: outletId, name: catForm.name, description: catForm.description, sort_order: parseInt(catForm.sort_order) || 0 }),
      });
      if (res.ok) {
        setSuccess(`Category "${catForm.name}" added`);
        setCatForm({ name: "", description: "", sort_order: "0" });
        setShowCategoryForm(false);
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else { const b = await res.json(); setError(b.error); }
    } catch {} finally { setSubmitting(false); }
  };

  const filteredProducts = products.filter(p => {
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && p.category_id?.toString() !== categoryFilter) return false;
    return true;
  });

  const availableCount = products.filter(p => p.available !== false).length;

  if (loading) return <div className="outlet-loading"><div className="outlet-loading-spinner" /><p>Loading menu...</p></div>;

  return (
    <div>
      <div className="outlet-page-header">
        <div>
          <h1>Menu Management</h1>
          <p className="outlet-page-subtitle">{products.length} items &middot; {availableCount} available</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="outlet-btn outline sm" onClick={() => { setEditingProduct(null); setProductForm({ name: "", price: "", cost: "", category_id: "", stock: "0", sku: "", sort_order: "0" }); setShowProductForm(!showProductForm); }}>
            <Plus size={14} /> {showProductForm ? "Cancel" : "Add Product"}
          </button>
          <button className="outlet-btn outline sm" onClick={() => setShowCategoryForm(!showCategoryForm)}>
            <Tag size={14} /> {showCategoryForm ? "Cancel" : "Add Category"}
          </button>
          <button className="outlet-btn outline sm" onClick={fetchData}><RefreshCw size={14} /></button>
        </div>
      </div>

      {success && <div className="outlet-success-banner">{success}</div>}
      {error && <div className="outlet-error-banner">{error}</div>}

      {showProductForm && (
        <form className="outlet-form" onSubmit={handleSaveProduct}>
          <h3>{editingProduct ? "Edit Product" : "Add Product"}</h3>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Name *</label>
              <input className="form-control" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Price *</label>
              <input type="number" step="0.01" className="form-control" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} required />
            </div>
          </div>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Cost Price</label>
              <input type="number" step="0.01" className="form-control" value={productForm.cost} onChange={e => setProductForm(p => ({ ...p, cost: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={productForm.category_id} onChange={e => setProductForm(p => ({ ...p, category_id: e.target.value }))}>
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Stock</label>
              <input type="number" className="form-control" value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input className="form-control" value={productForm.sku} onChange={e => setProductForm(p => ({ ...p, sku: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="outlet-btn primary" disabled={submitting}>
            {submitting ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
          </button>
        </form>
      )}

      {showCategoryForm && (
        <form className="outlet-form" onSubmit={handleAddCategory}>
          <h3>Add Category</h3>
          <div className="outlet-form-row">
            <div className="form-group">
              <label>Name *</label>
              <input className="form-control" value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Sort Order</label>
              <input type="number" className="form-control" value={catForm.sort_order} onChange={e => setCatForm(p => ({ ...p, sort_order: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input className="form-control" value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <button type="submit" className="outlet-btn primary" disabled={submitting}>Add Category</button>
        </form>
      )}

      <div className="outlet-filter-bar">
        <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
          <Search size={16} style={{ position: "absolute", left: 10, top: 10, color: "#a0aec0" }} />
          <input className="form-control" style={{ paddingLeft: 32 }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span style={{ fontSize: 12, color: "#718096" }}>Changes sync in real-time to all POS terminals</span>
      </div>

      <div className="outlet-card">
        <div className="table-responsive" style={{ maxHeight: 500 }}>
          <table className="outlet-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Cost</th>
                <th>Stock</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr><td colSpan={7}><div className="outlet-empty"><p>No products found</p></div></td></tr>
              ) : filteredProducts.map(p => {
                const cat = categories.find(c => c.id === p.category_id);
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{cat?.name || <span style={{ color: "#a0aec0" }}>Uncategorized</span>}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td>{p.cost ? formatCurrency(p.cost) : "-"}</td>
                    <td>{p.stock ?? "N/A"}</td>
                    <td>
                      <button className="outlet-btn sm" style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: p.available !== false ? "#38a169" : "#a0aec0",
                      }} onClick={() => handleToggleAvailability(p)} title={p.available !== false ? "Click to disable" : "Click to enable"}>
                        {p.available !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </td>
                    <td>
                      <button className="outlet-btn outline sm" onClick={() => handleEditProduct(p)}>
                        <Edit3 size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  function formatCurrency(n) {
    return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  }
}
