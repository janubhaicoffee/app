import { useState } from 'react';
import { STOCK_COLORS, type InventoryItem, type StockLevel } from '../lib/types';
import { Minus, Plus } from 'lucide-react';

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Milk', unit: 'litres', currentStock: 2, minStock: 5, level: 'critical', lastUpdated: '2 hrs ago' },
  { id: '2', name: 'Coffee Beans', unit: 'kg', currentStock: 0.5, minStock: 2, level: 'critical', lastUpdated: '1 hr ago' },
  { id: '3', name: 'Sugar', unit: 'kg', currentStock: 8, minStock: 5, level: 'safe', lastUpdated: '3 hrs ago' },
  { id: '4', name: 'Chai Masala', unit: 'kg', currentStock: 1.5, minStock: 1, level: 'safe', lastUpdated: 'Yesterday' },
  { id: '5', name: 'Ginger (Adrak)', unit: 'kg', currentStock: 0.8, minStock: 1, level: 'low', lastUpdated: '4 hrs ago' },
  { id: '6', name: 'Bun/Pav', unit: 'pcs', currentStock: 24, minStock: 20, level: 'safe', lastUpdated: 'Today' },
  { id: '7', name: 'Butter', unit: 'kg', currentStock: 0.3, minStock: 0.5, level: 'low', lastUpdated: '6 hrs ago' },
  { id: '8', name: 'Cups (Disposable)', unit: 'pcs', currentStock: 180, minStock: 100, level: 'safe', lastUpdated: 'Today' },
];

const getLevel = (current: number, min: number): StockLevel => {
  if (current <= min * 0.3) return 'critical';
  if (current <= min) return 'low';
  return 'safe';
};

export const Inventory = () => {
  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdjust = (id: string, delta: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const newStock = Math.max(0, item.currentStock + delta);
        return {
          ...item,
          currentStock: newStock,
          level: getLevel(newStock, item.minStock),
          lastUpdated: 'Just now',
        };
      })
    );
  };

  // Count alerts
  const criticalCount = items.filter(i => i.level === 'critical').length;
  const lowCount = items.filter(i => i.level === 'low').length;

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h2 className="text-2xl mb-1">Inventory</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {criticalCount > 0 && <span style={{ color: '#C62828', fontWeight: 600 }}>{criticalCount} critical</span>}
          {criticalCount > 0 && lowCount > 0 && ' · '}
          {lowCount > 0 && <span style={{ color: '#F57F17', fontWeight: 600 }}>{lowCount} low</span>}
          {criticalCount === 0 && lowCount === 0 && 'All stocked up ✓'}
        </p>
      </div>

      {/* Inventory Items */}
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={`inventory-item animate-fade-in-up stagger-${Math.min(idx + 1, 5)}`}
        >
          <div style={{ flex: 1 }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold">{item.name}</span>
              <span className={`stock-badge ${item.level}`}>{item.level}</span>
            </div>

            {/* Stock bar */}
            <div className="stock-bar">
              <div
                className="stock-bar-fill"
                style={{
                  width: `${Math.min(100, (item.currentStock / (item.minStock * 2)) * 100)}%`,
                  background: STOCK_COLORS[item.level],
                }}
              />
            </div>

            <div className="flex justify-between items-center" style={{ marginTop: 8 }}>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {item.currentStock} {item.unit} · Updated {item.lastUpdated}
              </span>

              {/* Inline stepper or Update button */}
              {editingId === item.id ? (
                <div className="stepper">
                  <button className="stepper-btn" onClick={() => handleAdjust(item.id, -1)}>
                    <Minus size={16} />
                  </button>
                  <span className="stepper-value">{item.currentStock}</span>
                  <button className="stepper-btn" onClick={() => handleAdjust(item.id, 1)}>
                    <Plus size={16} />
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ marginLeft: 4, padding: '0 12px' }}
                    onClick={() => setEditingId(null)}
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setEditingId(item.id)}
                >
                  Update
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
