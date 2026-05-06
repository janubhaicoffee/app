import { Card } from '../components/ui/Card';
import { RevenueBar } from '../components/ui/RevenueBar';
import type { OutletFinance, RevenueBySource } from '../lib/types';
import { TrendingUp } from 'lucide-react';

const NETWORK_REVENUE: RevenueBySource[] = [
  { source: 'pos', label: 'POS', amount: 34500, color: '#4A3022', orders: 245 },
  { source: 'zomato', label: 'Zomato', amount: 22800, color: '#E23744', orders: 134 },
  { source: 'swiggy', label: 'Swiggy', amount: 18200, color: '#FC8019', orders: 98 },
  { source: 'uengage', label: 'Uengage', amount: 9000, color: '#6C5CE7', orders: 42 },
];

const OUTLET_FINANCE: OutletFinance[] = [
  { outletId: 'a', outletName: 'Connaught Place', sales: 24500, expenses: 5200, profit: 19300, rank: 'best' },
  { outletId: 'b', outletName: 'Hauz Khas Village', sales: 18400, expenses: 4800, profit: 13600, rank: 'normal' },
  { outletId: 'c', outletName: 'Koramangala', sales: 12200, expenses: 8500, profit: 3700, rank: 'worst' },
  { outletId: 'd', outletName: 'Indiranagar', sales: 16800, expenses: 4100, profit: 12700, rank: 'normal' },
  { outletId: 'e', outletName: 'Sarojini Nagar', sales: 12600, expenses: 3900, profit: 8700, rank: 'normal' },
];

const ALERTS = [
  { type: 'danger' as const, icon: '🔴', title: 'Koramangala: Expenses too high', desc: '₹8.5k expenses on ₹12.2k sales (70% ratio)' },
  { type: 'warning' as const, icon: '⚠️', title: 'Zero orders at Sarojini (last 3 hrs)', desc: 'POS node may be offline' },
  { type: 'warning' as const, icon: '📦', title: 'Inventory mismatch at HKV', desc: 'Actual milk stock differs from system' },
];

export const GlobalFinance = () => {
  const totalSales = OUTLET_FINANCE.reduce((s, o) => s + o.sales, 0);
  const totalExpenses = OUTLET_FINANCE.reduce((s, o) => s + o.expenses, 0);
  const totalProfit = totalSales - totalExpenses;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl mb-1">Global Finance</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>All outlets · Today</p>
      </div>

      {/* Top 3 Big Cards */}
      <div className="snapshot-grid">
        <div className="snapshot-card snap-sales animate-fade-in-up stagger-1">
          <span className="snap-icon">💰</span>
          <p className="snap-label">Total Revenue</p>
          <div className="snap-value">₹{(totalSales / 1000).toFixed(1)}k</div>
          <div className="snap-change" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <TrendingUp size={12} /> +11% vs yesterday
          </div>
        </div>
        <div className="snapshot-card snap-expenses animate-fade-in-up stagger-2">
          <span className="snap-icon">💸</span>
          <p className="snap-label">Total Expenses</p>
          <div className="snap-value">₹{(totalExpenses / 1000).toFixed(1)}k</div>
        </div>
        <div className="snapshot-card snap-profit animate-fade-in-up stagger-3">
          <span className="snap-icon">📈</span>
          <p className="snap-label">Net Profit</p>
          <div className="snap-value">₹{(totalProfit / 1000).toFixed(1)}k</div>
          <div className="snap-change" style={{ background: 'rgba(27,94,32,0.1)' }}>
            <TrendingUp size={12} /> {((totalProfit / totalSales) * 100).toFixed(0)}% margin
          </div>
        </div>
      </div>

      {/* Revenue by Source */}
      <Card glass>
        <h3 className="text-lg font-semibold mb-4">Revenue by Source</h3>
        <RevenueBar data={NETWORK_REVENUE} />
      </Card>

      {/* Smart Alerts */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Smart Alerts</h3>
        {ALERTS.map((alert, i) => (
          <div key={i} className={`alert-card ${alert.type}`}>
            <div className="alert-icon">{alert.icon}</div>
            <div>
              <p className="text-sm font-semibold">{alert.title}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{alert.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Outlet Comparison */}
      <Card glass>
        <h3 className="text-lg font-semibold mb-4">Outlet Performance</h3>
        <div>
          {OUTLET_FINANCE.map((outlet, i) => (
            <div key={i} className="outlet-compare-row">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">{outlet.outletName}</span>
                {outlet.rank !== 'normal' && (
                  <span className={`rank-badge ${outlet.rank}`}>
                    {outlet.rank === 'best' ? '★ Top' : '↓ Low'}
                  </span>
                )}
              </div>
              <div className="outlet-metrics">
                <div className="metric" style={{ color: 'var(--text-secondary)' }}>
                  Sales <span>₹{(outlet.sales / 1000).toFixed(1)}k</span>
                </div>
                <div className="metric" style={{ color: 'var(--accent-red)' }}>
                  Exp <span>₹{(outlet.expenses / 1000).toFixed(1)}k</span>
                </div>
                <div className="metric" style={{ color: 'var(--accent-green)' }}>
                  Profit <span>₹{(outlet.profit / 1000).toFixed(1)}k</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
