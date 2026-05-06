import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { RevenueBar } from '../components/ui/RevenueBar';
import type { TimePeriod, RevenueBySource } from '../lib/types';
import { ArrowLeft, TrendingUp } from 'lucide-react';

const DAILY_REVENUE: RevenueBySource[] = [
  { source: 'pos', label: 'POS', amount: 5400, color: '#4A3022', orders: 62 },
  { source: 'zomato', label: 'Zomato', amount: 3200, color: '#E23744', orders: 34 },
  { source: 'swiggy', label: 'Swiggy', amount: 2640, color: '#FC8019', orders: 28 },
  { source: 'uengage', label: 'Uengage', amount: 1300, color: '#6C5CE7', orders: 16 },
];

const WEEKLY_DATA = [
  { day: 'Mon', sales: 10200, expenses: 2400 },
  { day: 'Tue', sales: 11800, expenses: 1800 },
  { day: 'Wed', sales: 9500, expenses: 3200 },
  { day: 'Thu', sales: 12540, expenses: 2850 },
  { day: 'Fri', sales: 0, expenses: 0 },
  { day: 'Sat', sales: 0, expenses: 0 },
  { day: 'Sun', sales: 0, expenses: 0 },
];

export const ProfitBreakdown = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<TimePeriod>('today');

  const totalSales = DAILY_REVENUE.reduce((s, d) => s + d.amount, 0);
  const totalExpenses = 2850;
  const netProfit = totalSales - totalExpenses;

  // Weekly calculations
  const weekSales = WEEKLY_DATA.reduce((s, d) => s + d.sales, 0);
  const weekExpenses = WEEKLY_DATA.reduce((s, d) => s + d.expenses, 0);
  const maxWeekValue = Math.max(...WEEKLY_DATA.map(d => Math.max(d.sales, d.expenses)));

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <button className="topbar-action" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl">Profit Breakdown</h2>
      </div>

      {/* Period Tabs */}
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

      {/* ===== TODAY VIEW ===== */}
      {period === 'today' && (
        <>
          {/* Summary Cards */}
          <div className="space-y-3">
            <div className="snapshot-card snap-sales">
              <span className="snap-icon">💰</span>
              <p className="snap-label">Total Sales</p>
              <div className="snap-value">₹{totalSales.toLocaleString()}</div>
            </div>
            <div className="snapshot-card snap-expenses">
              <span className="snap-icon">💸</span>
              <p className="snap-label">Total Expenses</p>
              <div className="snap-value">₹{totalExpenses.toLocaleString()}</div>
            </div>
            <div className="snapshot-card snap-profit">
              <span className="snap-icon">📈</span>
              <p className="snap-label">Net Profit</p>
              <div className="snap-value">₹{netProfit.toLocaleString()}</div>
              <div className="snap-change" style={{ background: 'rgba(27,94,32,0.1)' }}>
                <TrendingUp size={12} /> {((netProfit / totalSales) * 100).toFixed(0)}% margin
              </div>
            </div>
          </div>

          {/* Revenue by Source */}
          <Card glass>
            <h3 className="text-lg font-semibold mb-4">Sales by Source</h3>
            <RevenueBar data={DAILY_REVENUE} />
          </Card>
        </>
      )}

      {/* ===== WEEK VIEW ===== */}
      {period === 'week' && (
        <>
          {/* Week Summary */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="stat-card-brown">
              <p className="stat-label">Week Sales</p>
              <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                ₹{(weekSales / 1000).toFixed(1)}k
              </div>
            </Card>
            <Card glass>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Week Profit</p>
              <h2 className="text-2xl" style={{ color: 'var(--accent-green)' }}>
                ₹{((weekSales - weekExpenses) / 1000).toFixed(1)}k
              </h2>
            </Card>
          </div>

          {/* Weekly Bars */}
          <Card glass>
            <h3 className="text-lg font-semibold mb-4">Sales vs Expenses</h3>
            <div className="weekly-bars">
              {WEEKLY_DATA.map((d, i) => (
                <div key={i} className="bar-column">
                  {/* Sales bar */}
                  <div
                    className="bar-fill"
                    style={{
                      height: maxWeekValue ? `${(d.sales / maxWeekValue) * 100}%` : '4px',
                      background: 'var(--accent-brown)',
                    }}
                  />
                  {/* Expense bar (overlaid as thin) */}
                  <div
                    className="bar-fill"
                    style={{
                      height: maxWeekValue ? `${(d.expenses / maxWeekValue) * 100}%` : '4px',
                      background: 'var(--accent-red)',
                      opacity: 0.5,
                      marginTop: -4,
                    }}
                  />
                  <span className="bar-label">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4" style={{ marginTop: 12 }}>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--accent-brown)' }} />
                <span className="text-xs">Sales</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--accent-red)', opacity: 0.5 }} />
                <span className="text-xs">Expenses</span>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ===== MONTH VIEW ===== */}
      {period === 'month' && (
        <>
          <div className="space-y-3">
            <Card className="stat-card-brown">
              <p className="stat-label">Monthly Revenue</p>
              <div className="stat-value">₹1.24L</div>
              <div className="stat-badge">
                <TrendingUp size={12} /> +8% vs last month
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card glass>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Expenses</p>
                <h2 className="text-2xl" style={{ color: 'var(--accent-red)' }}>₹38.2k</h2>
              </Card>
              <Card glass>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Net Profit</p>
                <h2 className="text-2xl" style={{ color: 'var(--accent-green)' }}>₹85.8k</h2>
              </Card>
            </div>
          </div>

          {/* Monthly Performance Trend */}
          <Card glass>
            <h3 className="text-lg font-semibold mb-4">Monthly Trend</h3>
            <div className="space-y-3">
              {[
                { month: 'April', sales: 118000, profit: 78000 },
                { month: 'March', sales: 105000, profit: 68000 },
                { month: 'February', sales: 98000, profit: 62000 },
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{m.month}</span>
                  <div className="flex gap-4 text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Sales <strong>₹{(m.sales / 1000).toFixed(0)}k</strong>
                    </span>
                    <span style={{ color: 'var(--accent-green)' }}>
                      Profit <strong>₹{(m.profit / 1000).toFixed(0)}k</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
