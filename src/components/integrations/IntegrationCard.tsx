import type { IntegrationStatus } from '../../lib/types';
import { Clock } from 'lucide-react';

interface IntegrationCardProps {
  name: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  status: IntegrationStatus;
  enabled: boolean;
  lastSync: string | null;
  description?: string;
  stats?: { label: string; value: string }[];
  onToggle: () => void;
  onAction: () => void;
  actionLabel?: string;
}

const STATUS_LABEL: Record<IntegrationStatus, string> = {
  connected: 'Connected',
  disconnected: 'Not Connected',
  syncing: 'Syncing...',
  error: 'Error',
};

export const IntegrationCard = ({
  name,
  icon,
  iconBg,
  iconColor,
  status,
  enabled,
  lastSync,
  description,
  stats,
  onToggle,
  onAction,
  actionLabel,
}: IntegrationCardProps) => {
  return (
    <div className="integration-card">
      {/* Header Row */}
      <div className="integration-header">
        <div className="flex items-center gap-3">
          <div className="integration-icon" style={{ background: iconBg, color: iconColor }}>
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold">{name}</h4>
            <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
              <span className={`status-dot ${status}`} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {STATUS_LABEL[status]}
              </span>
            </div>
          </div>
        </div>
        <div
          className={`toggle ${enabled ? 'active' : ''}`}
          onClick={onToggle}
          role="switch"
          aria-checked={enabled}
        />
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs" style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
          {description}
        </p>
      )}

      {/* Stats Row */}
      {stats && stats.length > 0 && (
        <div className="flex gap-4" style={{ marginBottom: 8 }}>
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
              <span className="text-sm font-bold">{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Last sync + Action */}
      <div className="flex justify-between items-center" style={{ marginTop: 12 }}>
        {lastSync ? (
          <div className="integration-meta">
            <Clock size={12} />
            <span>Last sync: {lastSync}</span>
          </div>
        ) : (
          <div />
        )}
        <button
          className={`btn btn-sm ${status === 'connected' ? 'btn-outline' : 'btn-primary'}`}
          onClick={onAction}
        >
          {actionLabel || (status === 'connected' ? 'Manage' : 'Connect')}
        </button>
      </div>
    </div>
  );
};
