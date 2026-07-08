'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className = '',
}) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function handleChange(e) {
    const newVal = e.target.value;
    setLocalValue(newVal);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange?.(newVal);
    }, debounceMs);
  }

  function handleClear() {
    setLocalValue('');
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange?.('');
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none transition-all duration-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[rgba(62,39,35,0.1)] placeholder:text-gray-400"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
