"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Plus, X, Eye, Copy, Trash2, Sparkles, GripVertical, Star, ImagePlus } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "published", label: "Published", color: "#2e7d32" },
  { value: "draft", label: "Draft", color: "#e65100" },
  { value: "archived", label: "Archived", color: "#9e9e9e" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "Uncategorized" },
  { value: "coffee", label: "Coffee" },
  { value: "merch", label: "Merchandise" },
  { value: "beans", label: "Coffee Beans" },
  { value: "gift", label: "Gift" },
];

const defaultForm = {
  id: "", name: "", price: "", compare_at_price: "", stock: "100", weight: "",
  description: "", image_url: "", category: "", status: "draft", featured: false,
  sort_order: "0", seo_title: "", seo_description: "",
  arabica_pct: "", chicory_pct: "", robusta_pct: "",
  nutrition: { energy: "", protein: "", fat: "", carbs: "", sugar: "" },
  gallery_images: [],
};

function NutritionForm({ data, onChange }) {
  const fields = [
    { key: "energy", label: "Energy (kcal)" },
    { key: "protein", label: "Protein (g)" },
    { key: "fat", label: "Fat (g)" },
    { key: "carbs", label: "Carbs (g)" },
    { key: "sugar", label: "Sugar (g)" },
  ];
  return (
    <div className="nutrition-grid-form">
      {fields.map(f => (
        <div key={f.key}>
          <label>{f.label}</label>
          <input type="number" min="0" step="0.1" value={data[f.key]} placeholder="0"
            onChange={e => onChange({ ...data, [f.key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

function GalleryManager({ images, onChange }) {
  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) onChange([...images, url]);
  };
  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };
  const moveImage = (from, to) => {
    const arr = [...images];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    onChange(arr);
  };

  return (
    <div className="gallery-manager">
      {images.map((url, i) => (
        <div key={i} className="gallery-item">
          <img src={url} alt="" onError={e => { e.target.style.display = "none" }} />
          <div className="gallery-item-actions">
            <button type="button" onClick={() => moveImage(i, Math.max(0, i - 1))} disabled={i === 0}>◀</button>
            <button type="button" onClick={() => removeImage(i)}><Trash2 size={14} /></button>
            <button type="button" onClick={() => moveImage(i, Math.min(images.length - 1, i + 1))} disabled={i === images.length - 1}>▶</button>
          </div>
        </div>
      ))}
      <button type="button" className="admin-btn-outline" onClick={addImage} style={{ padding: "0.5rem", fontSize: "0.8rem" }}>
        <ImagePlus size={14} /> Add Image
      </button>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ ...defaultForm, nutrition: { ...defaultForm.nutrition } });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [toast, setToast] = useState(null);
  const modalRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [isModalOpen]);

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
      setFormData({
        id: product.id,
        name: product.name,
        price: product.price?.toString() || "",
        compare_at_price: product.compare_at_price?.toString() || "",
        stock: product.stock?.toString() || "0",
        weight: product.weight?.toString() || "",
        description: product.description || "",
        image_url: product.image_url || "",
        category: product.category || "",
        status: product.status || "draft",
        featured: product.featured || false,
        sort_order: product.sort_order?.toString() || "0",
        seo_title: product.seo_title || "",
        seo_description: product.seo_description || "",
        arabica_pct: product.arabica_pct?.toString() || "",
        chicory_pct: product.chicory_pct?.toString() || "",
        robusta_pct: product.robusta_pct?.toString() || "",
        nutrition: product.nutrition || { energy: "", protein: "", fat: "", carbs: "", sugar: "" },
        gallery_images: product.gallery_images || [],
      });
      setPreviewUrl(product.image_url || "");
    } else {
      setEditingProduct(null);
      setFormData({ ...defaultForm, nutrition: { ...defaultForm.nutrition }, gallery_images: [] });
      setPreviewUrl("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const nutritionValues = {};
    let hasNutrition = false;
    for (const [key, val] of Object.entries(formData.nutrition)) {
      if (val !== "" && val !== null && val !== undefined) {
        nutritionValues[key] = parseFloat(val);
        hasNutrition = true;
      }
    }

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      stock: parseInt(formData.stock) || 0,
      weight: parseFloat(formData.weight) || 0,
      description: formData.description,
      image_url: formData.image_url,
      category: formData.category || null,
      status: formData.status,
      featured: formData.featured,
      sort_order: parseInt(formData.sort_order) || 0,
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
      arabica_pct: formData.arabica_pct ? parseInt(formData.arabica_pct) : 0,
      chicory_pct: formData.chicory_pct ? parseInt(formData.chicory_pct) : 0,
      robusta_pct: formData.robusta_pct ? parseInt(formData.robusta_pct) : 0,
      nutrition: hasNutrition ? nutritionValues : null,
      gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : null,
    };

    if (!editingProduct) {
      payload.id = formData.id || formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }

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
        showToast(editingProduct ? "Product updated" : "Product created");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error saving product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!confirmDelete || confirmDelete.id !== product.id) {
      setConfirmDelete(product);
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_product", id: product.id })
      });
      if (res.ok) {
        fetchProducts();
        showToast("Product deleted");
      }
    } catch (e) {
      showToast("Error deleting product", "error");
    }
    setConfirmDelete(null);
  };

  const handleDuplicate = async (product) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate_product", id: product.id })
      });
      if (res.ok) {
        fetchProducts();
        showToast("Product duplicated as draft");
      }
    } catch (e) {
      showToast("Error duplicating product", "error");
    }
  };

  const generateAISEO = async () => {
    if (!formData.name) { showToast("Enter a product name first", "error"); return; }
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
        showToast("SEO generated");
      } else {
        showToast("AI generation failed", "error");
      }
    } catch (e) {
      showToast("Error calling AI", "error");
    }
  };

  const filteredProducts = products.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) && !p.id?.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[1];
    return <span className="status-badge" style={{ background: opt.color, color: "#fff" }}>{opt.label}</span>;
  };

  return (
    <div className="admin-products-page">
      {toast && (
        <div className={`admin-toast ${toast.type === "error" ? "admin-toast-error" : ""}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <h1>Manage Products</h1>
        <button className="admin-btn" onClick={() => openModal()}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admin-filter-tabs">
          {["all", "published", "draft", "archived"].map(s => (
            <button key={s} className={`filter-tab ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
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
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem" }}>
                  {search ? "No products match your search." : "No products yet. Add your first product!"}
                </td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className={product.status === "draft" ? "row-draft" : product.status === "archived" ? "row-archived" : ""}>
                    <td>
                      <div className="product-thumb" onClick={() => window.open(`/product/${product.id}`, "_blank")}>
                        {product.image_url
                          ? <img src={product.image_url} alt="" onError={e => { e.target.style.display = "none" }} />
                          : <Eye size={16} />}
                      </div>
                    </td>
                    <td>
                      <div className="product-name-cell">
                        <span className="product-name-text">{product.name}</span>
                        <span className="product-id-text">{product.id}</span>
                        {product.featured && <Star size={12} fill="var(--accent-gold)" color="var(--accent-gold)" />}
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
                    <td><span className="cell-category">{product.category || "—"}</span></td>
                    <td>
                      <div className="cell-actions">
                        <button className="admin-btn-sm" onClick={() => openModal(product)} title="Edit">Edit</button>
                        <button className="admin-btn-sm-icon" onClick={() => handleDuplicate(product)} title="Duplicate"><Copy size={14} /></button>
                        <button className={`admin-btn-sm-icon ${confirmDelete?.id === product.id ? "btn-confirming" : ""}`}
                          onClick={() => handleDelete(product)} title="Delete">
                          {confirmDelete?.id === product.id ? "Sure?" : <Trash2 size={14} />}
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

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="admin-modal" ref={modalRef}>
            <div className="admin-modal-header">
              <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <section className="form-section">
                  <h3>General</h3>
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Product Name *</label>
                      <input required type="text" value={formData.name}
                        onChange={e => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            name: val,
                            id: editingProduct ? prev.id : val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                          }));
                        }}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Slug (ID)</label>
                      <input required type="text" disabled={!!editingProduct} value={formData.id}
                        onChange={e => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      {formData.status !== "published" && (
                        <span className="form-hint">Only published products are visible to customers</span>
                      )}
                    </div>
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={formData.featured}
                          onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                        />
                        <Star size={14} fill={formData.featured ? "var(--accent-gold)" : "none"} color="var(--accent-gold)" />
                        Featured Product
                      </label>
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <h3>Pricing & Inventory</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input required type="number" min="0" step="0.01" value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Compare-at Price (₹)</label>
                      <input type="number" min="0" step="0.01" value={formData.compare_at_price} placeholder="Original price for sale display"
                        onChange={e => setFormData({ ...formData, compare_at_price: e.target.value })}
                      />
                      {formData.compare_at_price && parseFloat(formData.compare_at_price) > parseFloat(formData.price) && (
                        <span className="form-hint form-hint-sale">Sale active — {(100 - (parseFloat(formData.price) / parseFloat(formData.compare_at_price) * 100)).toFixed(0)}% off</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Stock</label>
                      <input type="number" min="0" value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Weight (g)</label>
                      <input type="number" min="0" step="0.1" value={formData.weight}
                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Sort Order</label>
                      <input type="number" min="0" step="1" value={formData.sort_order}
                        onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <h3>Media</h3>
                  <div className="form-row">
                    <div className="form-group flex-2">
                      <label>Main Image URL</label>
                      <input type="url" value={formData.image_url} placeholder="https://..."
                        onChange={e => { setFormData({ ...formData, image_url: e.target.value }); setPreviewUrl(e.target.value); }}
                      />
                    </div>
                    <div className="form-group image-preview-group">
                      {previewUrl ? (
                        <img src={previewUrl} alt="" className="image-preview" onError={e => { e.target.src = "https://via.placeholder.com/80?text=No+Image"; }} />
                      ) : (
                        <div className="image-preview-placeholder">No Image</div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Gallery Images</label>
                    <GalleryManager images={formData.gallery_images || []}
                      onChange={urls => setFormData({ ...formData, gallery_images: urls })}
                    />
                  </div>
                </section>

                <section className="form-section">
                  <h3>Blend Composition</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Arabica %</label>
                      <input type="number" min="0" max="100" value={formData.arabica_pct}
                        onChange={e => setFormData({ ...formData, arabica_pct: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Chicory %</label>
                      <input type="number" min="0" max="100" value={formData.chicory_pct}
                        onChange={e => setFormData({ ...formData, chicory_pct: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Robusta %</label>
                      <input type="number" min="0" max="100" value={formData.robusta_pct}
                        onChange={e => setFormData({ ...formData, robusta_pct: e.target.value })}
                      />
                    </div>
                  </div>
                  {formData.arabica_pct && formData.chicory_pct && formData.robusta_pct && (
                    <div className="blend-total">
                      Total: {parseInt(formData.arabica_pct) + parseInt(formData.chicory_pct) + parseInt(formData.robusta_pct)}%
                      {parseInt(formData.arabica_pct) + parseInt(formData.chicory_pct) + parseInt(formData.robusta_pct) !== 100 && (
                        <span className="blend-warning"> (should be 100%)</span>
                      )}
                    </div>
                  )}
                </section>

                <section className="form-section">
                  <h3>Description</h3>
                  <div className="form-group">
                    <textarea rows="5" value={formData.description} placeholder="Product description..."
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </section>

                <section className="form-section">
                  <h3>Nutritional Facts (per 100g)</h3>
                  <NutritionForm data={formData.nutrition}
                    onChange={n => setFormData({ ...formData, nutrition: n })}
                  />
                </section>

                <section className="form-section">
                  <div className="form-section-header-action">
                    <h3>SEO Settings</h3>
                    <button type="button" className="admin-btn-outline btn-ai" onClick={generateAISEO}>
                      <Sparkles size={14} /> Generate with AI
                    </button>
                  </div>
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>SEO Title</label>
                      <input type="text" value={formData.seo_title}
                        onChange={e => setFormData({ ...formData, seo_title: e.target.value })}
                      />
                      <span className="char-count">{formData.seo_title.length}/70</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>SEO Description</label>
                    <textarea rows="2" value={formData.seo_description}
                      onChange={e => setFormData({ ...formData, seo_description: e.target.value })}
                    />
                    <span className="char-count">{formData.seo_description.length}/160</span>
                  </div>
                </section>
              </div>

              <div className="admin-modal-footer">
                <div className="footer-left">
                  {editingProduct && (
                    <button type="button" className="admin-btn-outline btn-preview"
                      onClick={() => window.open(`/product/${editingProduct.id}`, "_blank")}>
                      <Eye size={14} /> Preview
                    </button>
                  )}
                </div>
                <div className="footer-right">
                  <button type="button" className="admin-btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="admin-btn" disabled={saving}>
                    {saving ? "Saving..." : (editingProduct ? "Save Changes" : "Create Product")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .admin-products-page { position: relative; }
        .admin-toast {
          position: fixed; top: 20px; right: 20px; z-index: 10000;
          background: #2e7d32; color: #fff; padding: 12px 24px; border-radius: 8px;
          font-weight: 600; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          animation: slideIn 0.3s ease;
        }
        .admin-toast-error { background: #c62828; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .admin-toolbar {
          display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;
        }
        .admin-search {
          display: flex; align-items: center; gap: 0.5rem; background: #fff;
          border: 1px solid var(--border-color); border-radius: 6px; padding: 0.5rem 0.75rem; flex: 1; max-width: 360px;
        }
        .admin-search input {
          border: none; outline: none; background: transparent; width: 100%; font-size: 0.9rem;
        }
        .admin-search input::placeholder { color: #aaa; }
        .admin-search svg { color: #999; flex-shrink: 0; }

        .admin-filter-tabs { display: flex; gap: 4px; }
        .filter-tab {
          padding: 0.4rem 0.8rem; border: 1px solid var(--border-color); background: #fff;
          border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);
          transition: all 0.2s;
        }
        .filter-tab.active {
          background: var(--primary-color); color: #fff; border-color: var(--primary-color);
        }

        .admin-table-wrap { overflow-x: auto; }
        .product-thumb {
          width: 40px; height: 40px; border-radius: 6px; overflow: hidden;
          background: #f5f0eb; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.2s;
        }
        .product-thumb:hover { transform: scale(1.1); }
        .product-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .product-thumb svg { color: #999; }
        .product-name-cell {
          display: flex; flex-direction: column; gap: 2px; align-items: flex-start;
        }
        .product-name-text { font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; }
        .product-id-text { font-size: 0.75rem; color: #999; }
        .cell-price { font-weight: 700; }
        .cell-compare { text-decoration: line-through; color: #999; font-weight: 400; margin-left: 6px; font-size: 0.85rem; }
        .cell-category { font-size: 0.8rem; color: var(--text-secondary); }
        .row-draft { opacity: 0.7; }
        .row-archived { opacity: 0.5; }

        .cell-actions { display: flex; gap: 4px; align-items: center; }
        .admin-btn-sm {
          padding: 0.3rem 0.6rem; font-size: 0.78rem; border: 1px solid var(--border-color);
          background: #fff; border-radius: 4px; cursor: pointer; font-weight: 600; color: var(--text-primary);
          transition: all 0.15s;
        }
        .admin-btn-sm:hover { background: var(--primary-color); color: #fff; border-color: var(--primary-color); }
        .admin-btn-sm-icon {
          width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid var(--border-color); background: #fff; border-radius: 4px; cursor: pointer;
          transition: all 0.15s; color: var(--text-secondary);
        }
        .admin-btn-sm-icon:hover { border-color: var(--accent-red); color: var(--accent-red); }
        .btn-confirming { background: #c62828 !important; color: #fff !important; border-color: #c62828 !important; font-size: 0.7rem; font-weight: 700; }

        .status-badge {
          display: inline-block; padding: 0.2rem 0.6rem; border-radius: 100px;
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
        }

        /* Modal */
        .admin-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.7); z-index: 2000;
          display: flex; justify-content: center; align-items: flex-start;
          overflow-y: auto; padding: 2rem;
        }
        .admin-modal {
          background: #fff; border-radius: 12px; width: 100%; max-width: 800px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-height: 90vh;
          display: flex; flex-direction: column; overflow: hidden;
        }
        .admin-modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color);
          background: #faf8f5;
        }
        .admin-modal-header h2 { margin: 0; font-family: var(--font-playfair); color: var(--primary-color); }
        .admin-modal-close {
          background: none; border: none; cursor: pointer; color: #999; padding: 4px;
          border-radius: 4px; transition: all 0.2s;
        }
        .admin-modal-close:hover { background: #f0f0f0; color: var(--text-primary); }
        .admin-modal-body {
          padding: 2rem; overflow-y: auto; flex: 1;
        }
        .admin-modal-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 2rem; border-top: 1px solid var(--border-color); gap: 1rem;
        }
        .footer-left, .footer-right { display: flex; gap: 0.75rem; align-items: center; }

        /* Form sections */
        .form-section {
          margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #f0ebe5;
        }
        .form-section:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .form-section h3 {
          font-size: 1rem; color: var(--primary-color); margin: 0 0 1rem 0; font-weight: 700;
        }
        .form-section-header-action {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
        }
        .form-section-header-action h3 { margin: 0; }
        .btn-ai { font-size: 0.8rem; padding: 0.3rem 0.7rem; color: var(--accent-gold); border-color: var(--accent-gold); }
        .btn-preview { font-size: 0.85rem; }
        .form-row {
          display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.75rem;
        }
        .form-row:last-child { margin-bottom: 0; }
        .form-group {
          display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 120px;
        }
        .form-group.flex-1 { flex: 1; }
        .form-group.flex-2 { flex: 2; }
        .form-group label {
          font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;
        }
        .form-group input, .form-group select, .form-group textarea {
          padding: 0.6rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px;
          font-size: 0.9rem; font-family: inherit; background: #fff; transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(62,39,35,0.08);
        }
        .form-group textarea { resize: vertical; line-height: 1.5; }
        .form-group input:disabled { background: #f5f0eb; color: #999; cursor: not-allowed; }
        .form-hint { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }
        .form-hint-sale { color: #c62828; font-weight: 600; }
        .char-count { font-size: 0.7rem; color: #aaa; text-align: right; margin-top: 2px; }
        .checkbox-group { justify-content: flex-end; min-width: auto; }
        .checkbox-label {
          display: flex !important; align-items: center; gap: 6px; cursor: pointer;
          font-size: 0.85rem !important; text-transform: none !important; padding: 0.5rem 0;
          white-space: nowrap;
        }
        .checkbox-label input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }

        .image-preview-group { flex: 0 0 auto; }
        .image-preview {
          width: 80px; height: 80px; border-radius: 8px; object-fit: cover;
          border: 2px solid var(--border-color);
        }
        .image-preview-placeholder {
          width: 80px; height: 80px; border-radius: 8px; border: 2px dashed var(--border-color);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; color: #ccc; text-align: center;
        }

        .gallery-manager { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .gallery-item {
          width: 72px; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; position: relative;
        }
        .gallery-item img { width: 100%; height: 60px; object-fit: cover; display: block; }
        .gallery-item-actions {
          display: flex; gap: 2px; padding: 2px; background: #faf8f5; justify-content: center;
        }
        .gallery-item-actions button {
          border: none; background: none; cursor: pointer; font-size: 0.65rem;
          padding: 2px 4px; color: #666; border-radius: 2px;
        }
        .gallery-item-actions button:disabled { opacity: 0.3; cursor: default; }
        .gallery-item-actions button:hover:not(:disabled) { background: #e8e0d8; }

        .nutrition-grid-form { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; }
        .nutrition-grid-form label { font-size: 0.75rem; }
        .nutrition-grid-form input { width: 100%; }

        .blend-total { font-size: 0.8rem; font-weight: 600; margin-top: 6px; color: var(--text-secondary); }
        .blend-warning { color: #c62828; font-weight: 700; }

        @media (max-width: 768px) {
          .admin-modal { max-width: 100%; margin: 0; border-radius: 0; max-height: 100vh; }
          .admin-modal-overlay { padding: 0; }
          .form-row { flex-direction: column; }
          .nutrition-grid-form { grid-template-columns: repeat(2, 1fr); }
          .admin-toolbar { flex-direction: column; align-items: stretch; }
          .admin-search { max-width: 100%; }
        }
      `}</style>
    </div>
  );
}
