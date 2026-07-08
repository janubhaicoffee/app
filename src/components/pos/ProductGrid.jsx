'use client';
import React from 'react';
import {
  Coffee,
  Soup,
  CupSoda,
  UtensilsCrossed,
  Pizza,
  Beef,
  IceCream,
  ChefHat,
} from 'lucide-react';

const categoryIcons = {
  coffee: Coffee,
  tea: CupSoda,
  food: UtensilsCrossed,
  snacks: Pizza,
  dessert: IceCream,
  special: ChefHat,
  soup: Soup,
  meal: Beef,
};

function getCategoryIcon(name) {
  const key = name?.toLowerCase() || '';
  for (const [k, Icon] of Object.entries(categoryIcons)) {
    if (key.includes(k)) return Icon;
  }
  return Coffee;
}

const bgColors = [
  '#B71C1C',
  '#1565C0',
  '#2E7D32',
  '#E65100',
  '#6A1B9A',
  '#00838F',
  '#4E342E',
  '#795548',
  '#283593',
  '#AD1457',
];

function getColor(id) {
  return bgColors[(id || 0) % bgColors.length];
}

export default function ProductGrid({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  onAddProduct,
  loading,
}) {
  const filtered =
    selectedCategory === 'all'
      ? products || []
      : (products || []).filter((p) => p.category_id === selectedCategory);

  return (
    <div className="pos-product-area">
      <div className="pos-order-type-bar">
        <button
          className={`pos-category-horiz-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => onSelectCategory('all')}
          style={{
            padding: '6px 14px',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            background: selectedCategory === 'all' ? 'var(--text-primary)' : 'transparent',
            color: selectedCategory === 'all' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          All
        </button>
        {(categories || []).map((cat) => (
          <button
            key={cat.id}
            className="pos-category-horiz-btn"
            onClick={() => onSelectCategory(cat.id)}
            style={{
              padding: '6px 14px',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              background: selectedCategory === cat.id ? 'var(--text-primary)' : 'transparent',
              color: selectedCategory === cat.id ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="pos-product-grid">
        {loading ? (
          <div className="pos-loading" style={{ gridColumn: '1/-1' }}>
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="pos-empty" style={{ gridColumn: '1/-1' }}>
            No products found
          </div>
        ) : (
          filtered.map((product) => (
            <button
              key={product.id}
              className={`pos-product-card ${!product.is_available ? 'out-of-stock' : ''}`}
              onClick={() => onAddProduct(product)}
              disabled={!product.is_available}
            >
              <div className="pos-product-img" style={{ background: getColor(product.id) }}>
                {React.createElement(getCategoryIcon(product.name), { size: 24 })}
              </div>
              <div className="pos-product-name">{product.name}</div>
              <div className="pos-product-price">₹{parseFloat(product.price || 0).toFixed(2)}</div>
              {product.is_available === false && (
                <span
                  className="pos-stock-badge"
                  style={{ background: '#ffebee', color: '#c62828' }}
                >
                  Out of stock
                </span>
              )}
              {product.is_available !== false &&
                product.current_stock !== undefined &&
                product.current_stock <= 5 && (
                  <span className="pos-stock-badge">Only {product.stock} left</span>
                )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
