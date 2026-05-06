import type { RevenueBySource } from '../../lib/types';

interface RevenueBarProps {
  data: RevenueBySource[];
}

export const RevenueBar = ({ data }: RevenueBarProps) => {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  if (total === 0) return null;

  return (
    <div>
      <div className="segmented-bar">
        {data.map((d, i) => (
          <div
            key={i}
            className="segmented-bar-segment"
            style={{
              width: `${(d.amount / total) * 100}%`,
              background: d.color,
            }}
          />
        ))}
      </div>
      <div className="revenue-legend">
        {data.map((d, i) => (
          <div key={i} className="legend-item">
            <span className="legend-dot" style={{ background: d.color }} />
            <span>
              <strong>₹{(d.amount / 1000).toFixed(1)}k</strong>
              <span style={{ color: 'var(--text-secondary)', marginLeft: 4 }}>
                {d.label} ({d.orders})
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
