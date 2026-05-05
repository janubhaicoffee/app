import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, glass = false, ...props }) => {
  return (
    <div
      className={clsx(
        'rounded-[24px] p-6 shadow-sm transition-all',
        glass ? 'glass' : 'bg-white',
        className
      )}
      style={{ borderRadius: 'var(--radius-lg)' }}
      {...props}
    >
      {children}
    </div>
  );
};
