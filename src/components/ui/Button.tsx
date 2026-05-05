import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none';
  
  const variants = {
    primary: 'bg-[var(--accent-brown)] text-white hover:bg-[var(--accent-brown-light)] shadow-md',
    secondary: 'bg-[var(--accent-red)] text-white hover:opacity-90 shadow-sm',
    outline: 'border-2 border-[var(--accent-brown)] text-[var(--accent-brown)] hover:bg-[var(--accent-brown)] hover:text-white',
    ghost: 'bg-transparent text-[var(--accent-brown)] hover:bg-[rgba(74,48,34,0.05)]'
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm rounded-[var(--radius-full)]',
    md: 'h-12 px-6 text-base rounded-[var(--radius-full)]',
    lg: 'h-16 px-8 text-lg rounded-[var(--radius-full)]',
    icon: 'h-12 w-12 rounded-full'
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
