'use client';

const variantStyles = {
  underline:
    'border-b-2 border-transparent -mb-px text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)]',
  pills:
    'rounded-lg text-[var(--text-secondary)] hover:bg-gray-100 hover:text-[var(--primary-color)]',
};

const activeVariantStyles = {
  underline: 'text-[var(--primary-color)] border-[var(--primary-color)]',
  pills:
    'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)] hover:text-white shadow-sm',
};

export default function Tabs({ tabs, activeTab, onChange, variant = 'underline', className = '' }) {
  return (
    <div
      className={`flex gap-0 ${variant === 'underline' ? 'border-b border-[var(--border-color)]' : 'gap-1'} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${variantStyles[variant]} ${isActive ? activeVariantStyles[variant] : ''}`}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
