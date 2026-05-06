import { useState } from 'react';
import { IntegrationCard } from '../components/integrations/IntegrationCard';
import type { IntegrationStatus } from '../lib/types';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IntegrationState {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  status: IntegrationStatus;
  enabled: boolean;
  lastSync: string | null;
  description: string;
  stats?: { label: string; value: string }[];
}

const INITIAL_INTEGRATIONS: IntegrationState[] = [
  {
    id: 'google',
    name: 'Google Business',
    icon: '📍',
    iconBg: '#E8F5E9',
    iconColor: '#2D8A4E',
    status: 'connected',
    enabled: true,
    lastSync: '2 hrs ago',
    description: 'Manage your Google listing, reviews, and local SEO',
    stats: [
      { label: 'Rating', value: '4.3 ★' },
      { label: 'Reviews', value: '128' },
    ],
  },
  {
    id: 'zomato',
    name: 'Zomato',
    icon: '🍔',
    iconBg: '#FDEAEC',
    iconColor: '#E23744',
    status: 'connected',
    enabled: true,
    lastSync: '5 min ago',
    description: 'Receive orders and sync menu with Zomato',
    stats: [
      { label: 'Commission', value: '22%' },
      { label: "Today's Orders", value: '34' },
    ],
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    icon: '🛵',
    iconBg: '#FFF3E6',
    iconColor: '#FC8019',
    status: 'syncing',
    enabled: true,
    lastSync: '1 min ago',
    description: 'Receive orders and sync menu with Swiggy',
    stats: [
      { label: 'Commission', value: '25%' },
      { label: "Today's Orders", value: '28' },
    ],
  },
  {
    id: 'uengage',
    name: 'Uengage (Own Orders)',
    icon: '🛒',
    iconBg: '#EEECFB',
    iconColor: '#6C5CE7',
    status: 'connected',
    enabled: true,
    lastSync: '12 min ago',
    description: 'Direct QR ordering — zero commission',
    stats: [
      { label: 'QR Scans Today', value: '89' },
      { label: 'Orders', value: '16' },
    ],
  },
  {
    id: 'borzo',
    name: 'Borzo (Delivery)',
    icon: '🚚',
    iconBg: '#E3F2FD',
    iconColor: '#1565C0',
    status: 'disconnected',
    enabled: false,
    lastSync: null,
    description: 'Auto-assign or manually dispatch riders for delivery orders',
  },
];

export const Integrations = () => {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);

  const handleToggle = (id: string) => {
    setIntegrations(prev =>
      prev.map(i => {
        if (i.id !== id) return i;
        const newEnabled = !i.enabled;
        return {
          ...i,
          enabled: newEnabled,
          status: newEnabled ? (i.status === 'disconnected' ? 'syncing' : i.status) : 'disconnected',
        };
      })
    );
  };

  const handleAction = (id: string) => {
    // In production: open connect flow or management modal
    console.log(`Action triggered for ${id}`);
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Back header */}
      <div className="flex items-center gap-3 mb-2">
        <button className="topbar-action" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl">Integrations</h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Connaught Place Outlet</p>
        </div>
      </div>

      {/* Integration Cards */}
      {integrations.map((integration, idx) => (
        <div key={integration.id} className={`animate-fade-in-up stagger-${idx + 1}`}>
          <IntegrationCard
            name={integration.name}
            icon={integration.icon}
            iconBg={integration.iconBg}
            iconColor={integration.iconColor}
            status={integration.status}
            enabled={integration.enabled}
            lastSync={integration.lastSync}
            description={integration.description}
            stats={integration.stats}
            onToggle={() => handleToggle(integration.id)}
            onAction={() => handleAction(integration.id)}
          />
        </div>
      ))}
    </div>
  );
};
