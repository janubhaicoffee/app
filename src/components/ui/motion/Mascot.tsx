"use client";

import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import React from "react";

export type MascotState = 'idle' | 'loading' | 'success' | 'hover' | 'peek';

interface MascotProps {
  className?: string;
  size?: number;
  state?: MascotState;
}

export function Mascot({ className, size = 120, state = 'idle' }: MascotProps) {
  // Define animation variants for the container
  const containerVariants: any = {
    idle: {
      y: [0, -8, 0],
      rotate: [0, 1, -1, 0],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    },
    loading: {
      rotate: [-5, 5, -5],
      scale: [1, 1.05, 1],
      transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
    },
    success: {
      y: [0, -25, 0],
      scale: [1, 1.15, 1],
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: {
      scale: 1.08,
      rotate: 3,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    },
    peek: {
      y: [size, 0],
      opacity: [0, 1],
      transition: { type: "spring", stiffness: 200, damping: 25 }
    }
  };

  return (
    <motion.div
      className={twMerge("relative z-50 flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
      variants={containerVariants}
      initial={state === 'peek' ? "peek" : "idle"}
      animate={state}
      whileHover={state === 'idle' ? "hover" : undefined}
    >
      <img
        src="/logo.png"
        alt="Janu Bhai Official Logo"
        className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)]"
        draggable={false}
      />
      
      {/* Dynamic Aura for Success state */}
      {state === 'success' && (
        <motion.div 
          className="absolute inset-0 bg-accent-gold rounded-full -z-10 blur-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1.2 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  );
}
