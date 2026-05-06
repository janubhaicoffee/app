import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverLift?: boolean;
  pressEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  glass = false, 
  hoverLift = false,
  pressEffect = false,
  ...props 
}) => {
  return (
    <div 
      className={clsx(
        'card', 
        glass && 'glass-card', 
        hoverLift && 'hover-lift',
        pressEffect && 'press-effect',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};
