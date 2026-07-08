'use client';

function Spinner({ message, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 gap-3 text-[var(--text-secondary)] ${className}`}
    >
      <div className="w-8 h-8 border-3 border-[var(--border-color)] border-t-[var(--primary-color)] rounded-full animate-spin" />
      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  );
}

function Skeleton({ rows = 3, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div
            className="h-3 bg-gray-200 rounded animate-pulse"
            style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
          />
          <div
            className="h-3 bg-gray-100 rounded animate-pulse"
            style={{ width: `${Math.max(30, 80 - i * 10)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export default function Loader({ variant = 'spinner', rows, message, className = '' }) {
  if (variant === 'skeleton') {
    return <Skeleton rows={rows} className={className} />;
  }
  return <Spinner message={message} className={className} />;
}

export { Spinner, Skeleton };
