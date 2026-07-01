"use client";

const variantStyles = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  danger: "bg-red-100 text-red-800 border-red-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
};

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-[0.65rem]",
  md: "px-2.5 py-1 text-[0.75rem]",
};

export default function Badge({ variant = "default", size = "md", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center font-semibold uppercase tracking-wide rounded-full border ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {children}
    </span>
  );
}
