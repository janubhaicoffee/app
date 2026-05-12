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
      y: [0, -10, 0],
      rotate: [0, 2, -2, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    loading: {
      rotate: [-10, 10, -10],
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
    },
    success: {
      y: [0, -30, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 0.6, ease: "easeOut" }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { type: "spring", stiffness: 300 }
    },
    peek: {
      y: [100, 0],
      opacity: [0, 1],
      transition: { type: "spring", stiffness: 200, damping: 20 }
    }
  };

  // Define variants for the steam (only visible during loading)
  const steamVariants: any = {
    idle: { opacity: 0, y: 0 },
    loading: {
      opacity: [0, 0.8, 0],
      y: [0, -20],
      transition: { duration: 1, repeat: Infinity, ease: "easeOut" }
    },
    success: { opacity: 0 },
    hover: { opacity: 0 },
    peek: { opacity: 0 }
  };

  // Define variants for the eyes
  const eyeVariants: any = {
    idle: { scaleY: [1, 1, 0.1, 1, 1], transition: { duration: 3, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] } },
    loading: { scale: [1, 1.2, 1], transition: { duration: 0.5, repeat: Infinity } },
    success: { scaleY: 0.2 }, // Happy squint
    hover: { scale: 1.2 },
    peek: { scaleY: 1 }
  };

  return (
    <motion.div
      className={twMerge("relative z-50 flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      variants={containerVariants}
      initial={state === 'peek' ? "peek" : "idle"}
      animate={state}
      whileHover={state === 'idle' ? "hover" : undefined}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl overflow-visible"
      >
        {/* Steam */}
        <motion.g variants={steamVariants}>
          <path d="M 40 20 Q 45 10 40 0" stroke="#FDFBF7" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <path d="M 50 15 Q 55 5 50 -5" stroke="#FDFBF7" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <path d="M 60 20 Q 65 10 60 0" stroke="#FDFBF7" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        </motion.g>

        {/* Coffee Cup Body */}
        <path
          d="M 25 35 L 30 80 Q 30 90 40 90 L 60 90 Q 70 90 70 80 L 75 35 Z"
          fill="#4A3022" // Espresso Brown
          stroke="#FDFBF7"
          strokeWidth="2"
        />

        {/* Cup Sleeve (Brand Ribbon) */}
        <path
          d="M 28 55 L 72 55 L 70 70 L 30 70 Z"
          fill="#FFB800" // Saffron Yellow
        />
        
        {/* Sleeve Text / Logo Mark */}
        <text x="50" y="65" fill="#4A3022" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">
          JANU
        </text>

        {/* The Red Cap (Lid) */}
        <path
          d="M 20 35 Q 50 25 80 35 L 78 28 Q 50 20 22 28 Z"
          fill="#E23744" // Vibrant Red
        />
        <path
          d="M 45 23 L 55 23 Q 58 23 58 20 L 42 20 Q 42 23 45 23 Z"
          fill="#E23744"
        />

        {/* Face */}
        <motion.g variants={eyeVariants}>
          {/* Left Eye */}
          <circle cx="40" cy="45" r="3" fill="#FDFBF7" />
          {/* Right Eye */}
          <circle cx="60" cy="45" r="3" fill="#FDFBF7" />
        </motion.g>

        {/* Mouth */}
        {state === 'success' || state === 'hover' ? (
          <path d="M 45 50 Q 50 55 55 50" stroke="#FDFBF7" strokeWidth="2" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M 47 50 L 53 50" stroke="#FDFBF7" strokeWidth="2" strokeLinecap="round" fill="none" />
        )}
      </svg>
    </motion.div>
  );
}
