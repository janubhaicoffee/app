"use client";
import { Loader2 } from "lucide-react";

const variantStyles = {
  primary: "bg-[var(--primary-color)] text-white hover:brightness-110 shadow-sm",
  secondary: "bg-white text-[var(--primary-color)] border border-[var(--border-color)] hover:bg-gray-50 shadow-sm",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-gray-100",
  danger: "bg-[var(--accent-red)] text-white hover:brightness-110 shadow-sm",
  success: "bg-green-700 text-white hover:bg-green-800 shadow-sm",
  pos: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  children,
  onClick,
  ...props
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 14 : size === "lg" ? 20 : 16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
      ) : null}
      {children}
    </button>
  );
}
