import type { OrderSource } from '../../lib/types';

interface SourceBadgeProps {
  source: OrderSource;
}

const META: Record<OrderSource, { label: string; color: string; bgColor: string }> = {
  pos: { label: 'POS', color: '#4A3022', bgColor: '#F0E8E0' },
  zomato: { label: 'Zomato', color: '#E23744', bgColor: '#FDEAEC' },
  swiggy: { label: 'Swiggy', color: '#FC8019', bgColor: '#FFF3E6' },
  uengage: { label: 'Uengage', color: '#6C5CE7', bgColor: '#EEECFB' },
};

export const SourceBadge = ({ source }: SourceBadgeProps) => {
  const m = META[source];
  return (
    <span
      className="source-badge"
      style={{ background: m.bgColor, color: m.color }}
    >
      {m.label}
    </span>
  );
};
