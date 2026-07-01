"use client";
import { useState, useRef, useEffect } from "react";

export default function Dropdown({ trigger, items, align = "left", className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 min-w-[180px] bg-white border border-[var(--border-color)] rounded-lg shadow-lg py-1 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={`divider-${i}`} className="my-1 border-t border-[var(--border-color)]" />;
            }
            const Icon = item.icon;
            const variantStyles = {
              danger: "text-red-600 hover:bg-red-50",
              default: "text-[var(--text-primary)] hover:bg-gray-50",
            };
            const variant = item.variant === "danger" ? "danger" : "default";

            return (
              <button
                key={item.label || i}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors ${variantStyles[variant]}`}
              >
                {Icon && <Icon size={16} />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
