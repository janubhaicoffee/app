import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../lib/types';
import { ArrowLeft, Check } from 'lucide-react';

export const AddExpense = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!category || !amount) return;
    // In production: save to Supabase
    console.log('Saving expense:', { category, amount: Number(amount), note });
    setSaved(true);
    setTimeout(() => navigate(-1), 1200);
  };

  if (saved) {
    return (
      <div className="success-screen animate-fade-in">
        <div className="success-icon">
          <Check size={48} />
        </div>
        <h2 className="text-2xl mb-2">Expense Saved!</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          ₹{Number(amount).toLocaleString()} added to {EXPENSE_CATEGORIES[category!].label}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="topbar-action" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl">Add Expense</h2>
      </div>

      {/* Category Picker */}
      <div>
        <label className="input-label">Category</label>
        <div className="category-grid">
          {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map(key => {
            const cat = EXPENSE_CATEGORIES[key];
            return (
              <div
                key={key}
                className={`category-option ${category === key ? 'selected' : ''}`}
                onClick={() => setCategory(key)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <label className="input-label">Amount (₹)</label>
        <input
          className="input-field"
          type="number"
          placeholder="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          inputMode="numeric"
        />
      </div>

      {/* Note */}
      <div>
        <label className="input-label">Note (optional)</label>
        <textarea
          className="textarea-field"
          placeholder="E.g. Monthly milk supply..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      {/* Save Button */}
      <button
        className={`btn btn-lg btn-full ${category && amount ? 'btn-primary' : 'btn-outline'}`}
        onClick={handleSave}
        disabled={!category || !amount}
        style={{ opacity: category && amount ? 1 : 0.5 }}
      >
        Save Expense
      </button>
    </div>
  );
};
