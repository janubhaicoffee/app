"use client";

import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

interface MascotProps {
  className?: string;
  size?: number;
  floating?: boolean;
}

export function Mascot({ className, size = 120, floating = true }: MascotProps) {
  return (
    <motion.div
      className={twMerge("relative z-50 pointer-events-none", className)}
      animate={
        floating
          ? {
              y: [0, -10, 0],
              rotate: [0, 2, -2, 0],
            }
          : {}
      }
      transition={
        floating
          ? {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : {}
      }
    >
      <div className="relative glow-effect" style={{ width: size, height: size }}>
        <Image
          src="/logo.png"
          alt="Janu Bhai Mascot"
          fill
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>
    </motion.div>
  );
}
