import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { EXPENSE_CATEGORIES, type TimePeriod, type Expense } from '../lib/types';
import { ArrowLeft } from 'lucide-react';

const DEMO_EXPENSES: Expense[] = [
  { id: '1', category: 'raw_material', amount: 1200, note: 'Milk & cream', createdAt: 'Today, 10:30 AM', outletId: 'a' },
  { id: '2', category: 'electricity', amount: 850, note: 'Bill payment', createdAt: 'Today, 7:00 AM', outletId: 'a' },
  { id: '3', category: 'misc', amount: 400, note: 'Cleaning supplies', createdAt: 'Yesterday, 6:00 PM', outletId: 'a' },
  { id: '4', category: 'raw_material', amount: 2800, note: 'Coffee beans (5kg)', createdAt: 'Yesterday, 9:00 AM', outletId: 'a' },
  { id: '5', category: 'rent', amount: 15000, note: 'Monthly rent', createdAt: '3 days ago', outletId: 'a' },
  { id: '6', category: 'raw_material', amount: 900, note: 'Sugar (25kg)', createdAt: '4 days ago', outletId: 'a' },
  { id: '7', category: 'electricity', amount: 1200, note: 'AC repair', createdAt: '5 days ago', outletId: 'a' },
];

export const ExpenseLog = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<TimePeriod>('today');

  const filtered = DEMO_EXPENSES.filter(e => {
    if (period === 'today') return e.createdAt.startsWith('Today');
    if (period === 'week') return !e.createdAt.includes('days ago') || parseInt(e.createdAt) <= 7;
    return true;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <button className="topbar-action" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl">Expenses</h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Total: ₹{total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Period Filter */}
      <div className="filter-tabs">
        {(['today', 'week', 'month'] as TimePeriod[]).map(p => (
          <button
            key={p}
            className={`filter-tab ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* Expense List */}
      <Card glass>
        {filtered.length === 0 ? (
          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)', padding: 20 }}>
            No expenses recorded
          </p>
        ) : (
          filtered.map(exp => {
            const cat = EXPENSE_CATEGORIES[exp.category];
            return (
              <div key={exp.id} className="expense-row">
                <div className="flex items-center gap-3">
                  <div className="expense-icon" style={{ background: `${cat.color}15` }}>
                    {cat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{cat.label}</p>
                    {exp.note && (
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{exp.note}</p>
                    )}
                    <p className="text-xs" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
                      {exp.createdAt}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm" style={{ color: 'var(--accent-red)' }}>
                  -₹{exp.amount.toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
};
