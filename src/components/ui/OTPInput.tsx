"use client";

import React, { useRef, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface OTPInputProps {
  length?: number;
  onComplete?: (code: string) => void;
  className?: string;
  accentColor?: 'gold' | 'red';
}

export function OTPInput({ length = 6, onComplete, className, accentColor = 'gold' }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only accept digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    // Auto-advance
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check completion
    const code = newValues.join('');
    if (code.length === length && !newValues.includes('')) {
      onComplete?.(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newValues = [...values];
    pasted.split('').forEach((char, i) => {
      newValues[i] = char;
    });
    setValues(newValues);
    
    const nextEmpty = newValues.findIndex(v => !v);
    inputRefs.current[nextEmpty === -1 ? length - 1 : nextEmpty]?.focus();

    if (pasted.length === length) {
      onComplete?.(pasted);
    }
  };

  const focusColor = accentColor === 'red' ? 'focus:border-accent-red focus:ring-accent-red/20' : 'focus:border-accent-gold focus:ring-accent-gold/20';
  const filledBorder = accentColor === 'red' ? 'border-accent-red/30' : 'border-accent-gold/30';

  return (
    <div className={twMerge("flex gap-3 justify-center", className)} onPaste={handlePaste}>
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={twMerge(
            "w-12 h-16 md:w-14 md:h-20 text-center text-2xl md:text-3xl font-black font-number rounded-xl border-2 bg-white/80 outline-none transition-all focus:ring-4",
            val ? filledBorder : 'border-espresso-900/10',
            focusColor
          )}
        />
      ))}
    </div>
  );
}
