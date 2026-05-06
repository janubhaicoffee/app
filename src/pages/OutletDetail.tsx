import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { RevenueBar } from '../components/ui/RevenueBar';
import type { RevenueBySource } from '../lib/types';
import { ArrowLeft, Plug, BarChart3, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';

const DEMO_REVENUE: RevenueBySource[] = [
  { source: 'pos', label: 'POS', amount: 24500, color: '#4A3022', orders: 142 },
  { source: 'zomato', label: 'Zomato', amount: 18200, color: '#E23744', orders: 87 },
  { source: 'swiggy', label: 'Swiggy', amount: 14800, color: '#FC8019', orders: 65 },
  { source: 'uengage', label: 'Uengage', amount: 8900, color: '#6C5CE7', orders: 34 },
];

const ALERTS = [
  { type: 'warning', message: 'Swiggy sync delayed — retrying' },
  { type: 'info', message: 'Borzo delivery not configured' },
];

export const OutletDetail = () => {
  const navigate = useNavigate();
  const totalRevenue = DEMO_REVENUE.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button className="topbar-action" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl">Connaught Place</h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Inner Circle, CP, New Delhi</p>
        </div>
      </div>

      {/* Revenue Card */}
      <Card className="stat-card-brown">
        <p className="stat-label">Total Revenue</p>
        <div className="stat-value">₹{(totalRevenue / 1000).toFixed(1)}k</div>
        <div className="stat-badge">
          <BarChart3 size={14} /> Today
        </div>
      </Card>

      {/* Revenue Breakdown */}
      <Card glass>
        <h3 className="text-lg font-semibold mb-4">Revenue by Source</h3>
        <RevenueBar data={DEMO_REVENUE} />
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          fullWidth
          variant="primary"
          size="md"
          onClick={() => navigate('/app/integrations')}
        >
          <Plug size={18} style={{ marginRight: 8 }} /> Integrations
        </Button>
        <Button
          fullWidth
          variant="outline"
          size="md"
          onClick={() => navigate('/app/orders')}
        >
          View Orders
        </Button>
      </div>

      {/* Alerts */}
      {ALERTS.length > 0 && (
        <Card glass>
          <h3 className="text-lg font-semibold mb-4">Alerts</h3>
          <div className="space-y-3">
            {ALERTS.map((alert, i) => (
              <div key={i} className="flex items-center gap-3">
                <AlertTriangle
                  size={16}
                  style={{ color: alert.type === 'warning' ? '#F0AD4E' : 'var(--text-secondary)', flexShrink: 0 }}
                />
                <span className="text-sm">{alert.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Integration Status Summary */}
      <Card glass>
        <h3 className="text-lg font-semibold mb-4">Integrations Status</h3>
        <div className="space-y-3">
          {[
            { name: 'Google Business', status: 'connected' },
            { name: 'Zomato', status: 'connected' },
            { name: 'Swiggy', status: 'syncing' },
            { name: 'Uengage', status: 'connected' },
            { name: 'Borzo', status: 'disconnected' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className={`status-dot ${item.status}`} />
                <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
