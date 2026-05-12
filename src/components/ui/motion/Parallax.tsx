"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ParallaxProps {
  children: ReactNode;
  speed?: number; // 1 means it moves at scroll speed, 0.5 is half speed, -0.5 is reverse
  className?: string;
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <div ref={ref} className={twMerge("overflow-hidden relative w-full h-full", className)}>
      <motion.div style={{ y }} className="w-full h-full absolute inset-0">
        {children}
      </motion.div>
    </div>
  );
}
