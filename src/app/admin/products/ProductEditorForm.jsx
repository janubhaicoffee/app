'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, Sparkles, Star, ImagePlus, Trash2, ArrowLeft } from 'lucide-react';

export const STATUS_OPTIONS = [
  { value: 'published', label: 'Published', color: '#2e7d32' },
  { value: 'draft', label: 'Draft', color: '#e65100' },
  { value: 'archived', label: 'Archived', color: '#9e9e9e' },
];

export const CATEGORY_OPTIONS = [
  { value: '', label: 'Uncategorized' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'beans', label: 'Coffee Beans' },
  { value: 'gift', label: 'Gift' },
];

export const defaultForm = {
  id: '',
  name: '',
  price: '',
  compare_at_price: '',
  stock: '100',
  weight: '',
  description: '',
  image_url: '',
  category: '',
  status: 'draft',
  featured: false,
  sort_order: '0',
  seo_title: '',
  seo_description: '',
  arabica_pct: '',
  chicory_pct: '',
  robusta_pct: '',
  nutrition: { energy: '', protein: '', fat: '', carbs: '', sugar: '', caffeine: '' },
  gallery_images: [],
  variants: [],
};

function NutritionForm({ data, onChange }) {
  const fields = [
    { key: 'energy', label: 'Energy (kcal)' },
    { key: 'protein', label: 'Protein (g)' },
    { key: 'fat', label: 'Fat (g)' },
    { key: 'carbs', label: 'Carbs (g)' },
    { key: 'sugar', label: 'Sugar (g)' },
    { key: 'caffeine', label: 'Caffeine (mg)' },
  ];
  return (
    <div className="nutrition-grid-form">
      {fields.map((f) => (
        <div key={f.key}>
          <label>{f.label}</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={data[f.key]}
            placeholder="0"
            onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

function GalleryManager({ images, onChange }) {
  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) onChange([...images, url]);
  };
  return (
    <div className="gallery-manager">
      {images.map((url, i) => (
        <div key={i} className="gallery-item">
          <img
            src={url}
            alt=""
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="gallery-item-actions">
            <button
              type="button"
              onClick={() => {
                const arr = [...images];
                const [m] = arr.splice(i, 1);
                arr.splice(Math.max(0, i - 1), 0, m);
                onChange(arr);
              }}
              disabled={i === 0}
            >
              ◀
            </button>
            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}>
              <Trash2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                const arr = [...images];
                const [m] = arr.splice(i, 1);
                arr.splice(Math.min(arr.length, i + 1), 0, m);
                onChange(arr);
              }}
              disabled={i === images.length - 1}
            >
              ▶
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="admin-btn-outline" onClick={addImage}>
        <ImagePlus size={14} /> Add Image
      </button>
    </div>
  );
}

function VariantsManager({ variants, onChange, productName }) {
  const [generatingFor, setGeneratingFor] = useState(null);

  const addVariant = () => {
    const newVariant = {
      id: `v_${Date.now()}`,
      name: 'New Variant',
      roast: 'Thoda Hard',
      weight: 100,
      price: 300,
      cogs: 100,
      stock: 100,
      arabica_pct: 100,
      chicory_pct: 0,
      robusta_pct: 0,
      image_url: '',
      scientific_details: '',
      nutrition: { energy: '', protein: '', fat: '', carbs: '', sugar: '', caffeine: '' },
    };
    onChange([...variants, newVariant]);
  };

  const handleGenerateAI = async (index, variant) => {
    setGeneratingFor(index);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch('/api/ai/generate-variant-details', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: productName || 'Instant Coffee',
          variantName: variant.name,
          roast: variant.roast,
          blendRatio: `${variant.arabica_pct}% Arabica, ${variant.chicory_pct}% Chicory, ${variant.robusta_pct}% Robusta`,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const arr = [...variants];
          if (json.nutrition) arr[index].nutrition = json.nutrition;
          if (json.scientific_details) arr[index].scientific_details = json.scientific_details;
          onChange(arr);
        } else {
          alert('AI Error: ' + json.error);
        }
      } else {
        alert('Failed to connect to AI');
      }
    } catch (e) {
      alert('Error generating details: ' + e.message);
    } finally {
      setGeneratingFor(null);
    }
  };

  return (
    <div className="variants-manager">
      {variants.map((v, i) => (
        <div key={v.id} className="variant-card">
          <div className="variant-header">
            <h4>{v.name || 'Untitled'}</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="admin-btn-outline btn-ai"
                onClick={() => handleGenerateAI(i, v)}
                disabled={generatingFor === i}
              >
                <Sparkles size={14} /> {generatingFor === i ? 'Generating...' : 'Auto-Fill with AI'}
              </button>
              <button
                type="button"
                className="admin-btn-icon-danger"
                onClick={() => onChange(variants.filter((_, j) => j !== i))}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="variant-grid">
            <div className="form-group">
              <label>Variant Name</label>
              <input
                type="text"
                value={v.name}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].name = e.target.value;
                  onChange(arr);
                }}
              />
            </div>
            <div className="form-group">
              <label>Roast Level</label>
              <input
                type="text"
                value={v.roast}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].roast = e.target.value;
                  onChange(arr);
                }}
              />
            </div>
            <div className="form-group">
              <label>Weight (g)</label>
              <input
                type="number"
                value={v.weight}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].weight = parseFloat(e.target.value) || 0;
                  onChange(arr);
                }}
              />
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                value={v.price}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].price = parseFloat(e.target.value) || 0;
                  onChange(arr);
                }}
              />
            </div>
            <div className="form-group">
              <label>Cost (COGS)</label>
              <input
                type="number"
                value={v.cogs}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].cogs = parseFloat(e.target.value) || 0;
                  onChange(arr);
                }}
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                value={v.stock}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].stock = parseInt(e.target.value) || 0;
                  onChange(arr);
                }}
              />
            </div>
          </div>

          <hr style={{ margin: '1rem 0', borderColor: '#e8e0d8' }} />

          <h5
            style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}
          >
            Blend Profile (%)
          </h5>
          <div className="variant-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="form-group">
              <label>Arabica %</label>
              <input
                type="number"
                value={v.arabica_pct || 0}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].arabica_pct = parseInt(e.target.value) || 0;
                  onChange(arr);
                }}
              />
            </div>
            <div className="form-group">
              <label>Chicory %</label>
              <input
                type="number"
                value={v.chicory_pct || 0}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].chicory_pct = parseInt(e.target.value) || 0;
                  onChange(arr);
                }}
              />
            </div>
            <div className="form-group">
              <label>Robusta %</label>
              <input
                type="number"
                value={v.robusta_pct || 0}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].robusta_pct = parseInt(e.target.value) || 0;
                  onChange(arr);
                }}
              />
            </div>
          </div>

          <hr style={{ margin: '1rem 0', borderColor: '#e8e0d8' }} />

          <h5
            style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}
          >
            Nutritional Facts (per 100g)
          </h5>
          <div className="variant-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            <div className="form-group">
              <label>Energy</label>
              <input
                type="number"
                step="0.1"
                value={v.nutrition?.energy || ''}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].nutrition = { ...arr[i].nutrition, energy: e.target.value };
                  onChange(arr);
                }}
              />
            </div>
            <div className="form-group">
              <label>Protein</label>
              <input
                type="number"
                step="0.1"
                value={v.nutrition?.protein || ''}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].nutrition = { ...arr[i].nutrition, protein: e.target.value };
                  onChange(arr);
                }}
              />
            </div>
            <div className="form-group">
              <label>Fat</label>
              <input
                type="number"
                step="0.1"
                value={v.nutrition?.fat || ''}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].nutrition = { ...arr[i].nutrition, fat: e.target.value };
                  onChange(arr);
                }}
              />
            </div>
            <div className="form-group">
              <label>Carbs</label>
              <input
                type="number"
                step="0.1"
                value={v.nutrition?.carbs || ''}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].nutrition = { ...arr[i].nutrition, carbs: e.target.value };
                  onChange(arr);
                }}
              />
            </div>
            <div className="form-group">
              <label>Sugar</label>
              <input
                type="number"
                step="0.1"
                value={v.nutrition?.sugar || ''}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].nutrition = { ...arr[i].nutrition, sugar: e.target.value };
                  onChange(arr);
                }}
              />
            </div>
            <div className="form-group">
              <label>Caffeine</label>
              <input
                type="number"
                step="0.1"
                value={v.nutrition?.caffeine || ''}
                onChange={(e) => {
                  const arr = [...variants];
                  arr[i].nutrition = { ...arr[i].nutrition, caffeine: e.target.value };
                  onChange(arr);
                }}
              />
            </div>
          </div>

          <hr style={{ margin: '1rem 0', borderColor: '#e8e0d8' }} />

          <div className="form-group">
            <label>Scientific Details (Variant Specific)</label>
            <textarea
              rows="3"
              value={v.scientific_details || ''}
              placeholder="Describe the roast process, extraction, caffeine profile..."
              onChange={(e) => {
                const arr = [...variants];
                arr[i].scientific_details = e.target.value;
                onChange(arr);
              }}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="admin-btn-outline"
        onClick={addVariant}
        style={{ marginTop: 10 }}
      >
        <Sparkles size={14} /> Add Variant
      </button>
    </div>
  );
}

export default function ProductEditorForm({ initialData, isNew }) {
  const router = useRouter();
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        id: initialData.id || '',
        name: initialData.name || '',
        price: initialData.price?.toString() || '',
        compare_at_price: initialData.compare_at_price?.toString() || '',
        stock: initialData.stock?.toString() || '0',
        weight: initialData.weight?.toString() || '',
        description: initialData.description || '',
        image_url: initialData.image_url || '',
        category: initialData.category || '',
        status: initialData.status || 'draft',
        featured: initialData.featured || false,
        sort_order: initialData.sort_order?.toString() || '0',
        seo_title: initialData.seo_title || '',
        seo_description: initialData.seo_description || '',
        arabica_pct: initialData.arabica_pct?.toString() || '',
        chicory_pct: initialData.chicory_pct?.toString() || '',
        robusta_pct: initialData.robusta_pct?.toString() || '',
        nutrition: initialData.nutrition || {
          energy: '',
          protein: '',
          fat: '',
          carbs: '',
          sugar: '',
        },
        gallery_images: initialData.gallery_images || [],
        variants: initialData.variants || [],
        subscription_discount_weekly: initialData.subscription_discount_weekly?.toString() || '10',
        subscription_discount_monthly:
          initialData.subscription_discount_monthly?.toString() || '15',
      };
    }
    return {
      ...defaultForm,
      nutrition: { ...defaultForm.nutrition },
      gallery_images: [],
      subscription_discount_weekly: '10',
      subscription_discount_monthly: '15',
    };
  });

  const [previewUrl, setPreviewUrl] = useState(initialData?.image_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      id: isNew
        ? val
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        : prev.id,
    }));
  };

  const generateAISEO = async () => {
    if (!formData.name) {
      setError('Enter a product name first');
      return;
    }
    setError('');
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch('/api/ai/generate-seo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: formData.name,
          description: formData.description,
          price: formData.price,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setFormData((prev) => ({
          ...prev,
          seo_title: json.seo.seo_title,
          seo_description: json.seo.seo_description,
        }));
      } else {
        setError('AI generation failed. Check AI keys.');
      }
    } catch (e) {
      setError('Error calling AI');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const nutritionValues = {};
    let hasNutrition = false;
    for (const [key, val] of Object.entries(formData.nutrition)) {
      if (val !== '' && val !== null && val !== undefined) {
        nutritionValues[key] = parseFloat(val);
        hasNutrition = true;
      }
    }

    const slug =
      formData.id ||
      formData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    let basePrice = parseFloat(formData.price) || 0;
    let baseCompare = formData.compare_at_price ? parseFloat(formData.compare_at_price) : null;
    let baseStock = parseInt(formData.stock) || 0;
    let baseWeight = parseFloat(formData.weight) || 0;
    let baseArabica = formData.arabica_pct ? parseInt(formData.arabica_pct) : 0;
    let baseChicory = formData.chicory_pct ? parseInt(formData.chicory_pct) : 0;
    let baseRobusta = formData.robusta_pct ? parseInt(formData.robusta_pct) : 0;
    let baseNutrition = hasNutrition ? nutritionValues : null;

    if (formData.variants && formData.variants.length > 0) {
      const v = formData.variants[0];
      basePrice = parseFloat(v.price) || 0;
      baseStock = formData.variants.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0);
      baseWeight = parseFloat(v.weight) || 0;
      baseArabica = parseInt(v.arabica_pct) || 0;
      baseChicory = parseInt(v.chicory_pct) || 0;
      baseRobusta = parseInt(v.robusta_pct) || 0;
      baseNutrition = v.nutrition || null;
    }

    const payload = {
      id: slug,
      name: formData.name,
      price: basePrice,
      compare_at_price: baseCompare,
      stock: baseStock,
      weight: baseWeight,
      description: formData.description,
      image_url: formData.image_url,
      category: formData.category || null,
      status: formData.status,
      featured: formData.featured,
      sort_order: parseInt(formData.sort_order) || 0,
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
      arabica_pct: baseArabica,
      chicory_pct: baseChicory,
      robusta_pct: baseRobusta,
      nutrition: baseNutrition,
      gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : null,
      variants: formData.variants.length > 0 ? formData.variants : [],
      subscription_discount_weekly: parseInt(formData.subscription_discount_weekly) || 0,
      subscription_discount_monthly: parseInt(formData.subscription_discount_monthly) || 0,
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const body = isNew
        ? { action: 'create_product', payload }
        : { action: 'update_product', id: initialData.id, payload };

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push('/admin/products');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save');
      }
    } catch (e) {
      setError('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const blendTotal =
    (parseInt(formData.arabica_pct) || 0) +
    (parseInt(formData.chicory_pct) || 0) +
    (parseInt(formData.robusta_pct) || 0);

  return (
    <div className="product-editor-page">
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="admin-btn-back" onClick={() => router.push('/admin/products')}>
            <ArrowLeft size={18} />
          </button>
          <h1>{isNew ? 'Add New Product' : `Edit: ${initialData?.name || ''}`}</h1>
        </div>
        {!isNew && (
          <button
            type="button"
            className="admin-btn-outline"
            onClick={() => window.open(`/product/${initialData.id}`, '_blank')}
          >
            <Eye size={14} /> Preview
          </button>
        )}
      </div>

      {error && <div className="editor-error">{error}</div>}

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="editor-body">
          <section className="form-section">
            <h3>General</h3>
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Product Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="form-group flex-1">
                <label>Slug (URL) *</label>
                <input
                  required
                  type="text"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id: e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, ''),
                    })
                  }
                />
                <span className="form-hint">
                  https://www.janubhai.com/product/{formData.id || '...'}
                </span>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {formData.status !== 'published' && (
                  <span className="form-hint">
                    Only published products are visible to customers
                  </span>
                )}
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <Star
                    size={14}
                    fill={formData.featured ? 'var(--accent-gold)' : 'none'}
                    color="var(--accent-gold)"
                  />
                  Featured
                </label>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3>Variants (Dynamic Weights & Roasts)</h3>
            <p className="form-hint" style={{ marginBottom: 15 }}>
              Add variations like "Thoda Hard - 100g", "Bohot Hard - 1000g". This unlocks
              WooCommerce/Shopify style variations on the storefront.
            </p>
            <VariantsManager
              variants={formData.variants}
              onChange={(v) => setFormData({ ...formData, variants: v })}
              productName={formData.name}
            />
          </section>

          {formData.variants.length === 0 && (
            <section className="form-section">
              <h3>Pricing & Inventory (Base Product)</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Compare-at Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.compare_at_price}
                    placeholder="Original price"
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                  />
                  {formData.compare_at_price &&
                    parseFloat(formData.compare_at_price) > parseFloat(formData.price) && (
                      <span className="form-hint form-hint-sale">
                        Sale —{' '}
                        {Math.round(
                          (1 - parseFloat(formData.price) / parseFloat(formData.compare_at_price)) *
                            100,
                        )}
                        % off
                      </span>
                    )}
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Weight (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Sort Order</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  />
                </div>
              </div>
            </section>
          )}

          <section className="form-section">
            <h3
              style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}
            >
              Subscription Pricing (Discounts)
            </h3>
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Weekly Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.subscription_discount_weekly}
                  onChange={(e) =>
                    setFormData({ ...formData, subscription_discount_weekly: e.target.value })
                  }
                />
              </div>
              <div className="form-group flex-1">
                <label>Monthly Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.subscription_discount_monthly}
                  onChange={(e) =>
                    setFormData({ ...formData, subscription_discount_monthly: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3>Media</h3>
            <div className="form-row">
              <div className="form-group flex-2">
                <label>Main Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  placeholder="https://..."
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    setPreviewUrl(e.target.value);
                  }}
                />
              </div>
              <div className="form-group image-preview-group">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt=""
                    className="image-preview"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="image-preview-placeholder">No Image</div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Gallery Images</label>
              <GalleryManager
                images={formData.gallery_images || []}
                onChange={(urls) => setFormData({ ...formData, gallery_images: urls })}
              />
            </div>
          </section>

          {formData.variants.length === 0 && (
            <section className="form-section">
              <h3>Blend Composition</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Arabica %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.arabica_pct}
                    onChange={(e) => setFormData({ ...formData, arabica_pct: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Chicory %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.chicory_pct}
                    onChange={(e) => setFormData({ ...formData, chicory_pct: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Robusta %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.robusta_pct}
                    onChange={(e) => setFormData({ ...formData, robusta_pct: e.target.value })}
                  />
                </div>
              </div>
              {(formData.arabica_pct || formData.chicory_pct || formData.robusta_pct) && (
                <div className="blend-total">
                  Total: {blendTotal}%
                  {blendTotal > 0 && blendTotal !== 100 && (
                    <span className="blend-warning"> (should be 100%)</span>
                  )}
                </div>
              )}
            </section>
          )}

          <section className="form-section">
            <h3>Description</h3>
            <div className="form-group">
              <textarea
                rows="6"
                value={formData.description}
                placeholder="Product description..."
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </section>

          {formData.variants.length === 0 && (
            <section className="form-section">
              <h3>Nutritional Facts (per 100g)</h3>
              <NutritionForm
                data={formData.nutrition}
                onChange={(n) => setFormData({ ...formData, nutrition: n })}
              />
            </section>
          )}

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
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                />
                <span className="char-count">{formData.seo_title.length}/70</span>
              </div>
            </div>
            <div className="form-group">
              <label>SEO Description</label>
              <textarea
                rows="2"
                value={formData.seo_description}
                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
              />
              <span className="char-count">{formData.seo_description.length}/160</span>
            </div>
          </section>
        </div>

        <div className="editor-footer">
          <button
            type="button"
            className="admin-btn-outline"
            onClick={() => router.push('/admin/products')}
          >
            Cancel
          </button>
          <button type="submit" className="admin-btn" disabled={saving}>
            {saving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
          </button>
        </div>
      </form>

      <style jsx global>{`
        .product-editor-page {
          max-width: 900px;
        }
        .admin-btn-back {
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .admin-btn-back:hover {
          background: var(--primary-color);
          color: #fff;
          border-color: var(--primary-color);
        }
        .editor-error {
          background: #ffebee;
          color: #c62828;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .editor-form {
          background: #fff;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .editor-body {
          padding: 2rem;
        }
        .editor-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1rem 2rem;
          border-top: 1px solid var(--border-color);
          background: #faf8f5;
        }

        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #f0ebe5;
        }
        .form-section:last-of-type {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .form-section h3 {
          font-size: 1rem;
          color: var(--primary-color);
          margin: 0 0 1rem 0;
          font-weight: 700;
        }
        .form-section-header-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .form-section-header-action h3 {
          margin: 0;
        }
        .form-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 0.75rem;
        }
        .form-row:last-child {
          margin-bottom: 0;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 120px;
        }
        .form-group.flex-1 {
          flex: 1;
        }
        .form-group.flex-2 {
          flex: 2;
        }
        .form-group label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.6rem 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 0.9rem;
          font-family: inherit;
          background: #fff;
          transition: border-color 0.2s;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(62, 39, 35, 0.08);
        }
        .form-group textarea {
          resize: vertical;
          line-height: 1.5;
        }
        .form-hint {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        .form-hint-sale {
          color: #c62828;
          font-weight: 600;
        }
        .char-count {
          font-size: 0.7rem;
          color: #aaa;
          text-align: right;
          margin-top: 2px;
        }
        .checkbox-group {
          justify-content: flex-end;
          min-width: auto;
        }
        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 0.85rem !important;
          text-transform: none !important;
          padding: 0.5rem 0;
          white-space: nowrap;
        }
        .checkbox-label input[type='checkbox'] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .btn-ai {
          font-size: 0.8rem;
          padding: 0.3rem 0.7rem;
          color: var(--accent-gold);
          border-color: var(--accent-gold);
        }
        .image-preview-group {
          flex: 0 0 auto;
        }
        .image-preview {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          border: 2px solid var(--border-color);
        }
        .image-preview-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          border: 2px dashed var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          color: #ccc;
          text-align: center;
        }

        .gallery-manager {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .gallery-item {
          width: 72px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          overflow: hidden;
        }
        .gallery-item img {
          width: 100%;
          height: 60px;
          object-fit: cover;
          display: block;
        }
        .gallery-item-actions {
          display: flex;
          gap: 2px;
          padding: 2px;
          background: #faf8f5;
          justify-content: center;
        }
        .gallery-item-actions button {
          border: none;
          background: none;
          cursor: pointer;
          font-size: 0.65rem;
          padding: 2px 4px;
          color: #666;
          border-radius: 2px;
        }
        .gallery-item-actions button:disabled {
          opacity: 0.3;
          cursor: default;
        }
        .gallery-item-actions button:hover:not(:disabled) {
          background: #e8e0d8;
        }

        .nutrition-grid-form {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }
        .nutrition-grid-form label {
          font-size: 0.75rem;
        }
        .nutrition-grid-form input {
          width: 100%;
        }
        .blend-total {
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 6px;
          color: var(--text-secondary);
        }
        .blend-warning {
          color: #c62828;
          font-weight: 700;
        }

        .variants-manager {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .variant-card {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.25rem;
          background: #faf8f5;
        }
        .variant-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e8e0d8;
        }
        .variant-header h4 {
          margin: 0;
          font-size: 1rem;
          color: var(--primary-color);
        }
        .variant-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }
        .admin-btn-icon-danger {
          background: none;
          border: none;
          color: #c62828;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .admin-btn-icon-danger:hover {
          background: #ffebee;
        }

        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
          }
          .nutrition-grid-form {
            grid-template-columns: repeat(2, 1fr);
          }
          .variant-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
