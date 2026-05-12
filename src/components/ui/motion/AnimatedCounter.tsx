"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  value,
  className,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const valueString = currentValue.toLocaleString();
  const digits = valueString.split("");

  return (
    <span className={twMerge("inline-flex items-center text-number font-bold overflow-hidden", className)}>
      {prefix && <span>{prefix}</span>}
      <span className="flex">
        <AnimatePresence mode="popLayout" initial={false}>
          {digits.map((char, index) => {
            // Give each char a unique key based on its position AND value so it forces an animation
            // Using a combination of index and the entire value ensures all digits roll when value changes
            const key = `${index}-${char}-${currentValue}`;
            
            // If it's a comma, don't animate it, just render it statically to avoid weird layout jumps
            if (char === "," || char === ".") {
              return (
                <span key={`static-${index}`} className="inline-block px-[1px]">
                  {char}
                </span>
              );
            }

            return (
              <motion.span
                key={key}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30,
                  // Stagger the digits slightly based on position
                  delay: index * 0.05 
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            );
          })}
        </AnimatePresence>
      </span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
