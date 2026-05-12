"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import React, { useEffect } from "react";

export type ToastType = 'success' | 'alert';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  // Auto-dismiss logic inside the component using effects on individual items
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col justify-between p-6">
      
      {/* Top Container for Success */}
      <div className="flex flex-col gap-3 items-center">
        <AnimatePresence>
          {toasts.filter(t => t.type === 'success').map((toast) => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              onDismiss={onDismiss} 
              position="top"
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Right Container for Alerts */}
      <div className="flex flex-col gap-3 items-end">
        <AnimatePresence>
          {toasts.filter(t => t.type === 'alert').map((toast) => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              onDismiss={onDismiss} 
              position="bottom"
            />
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

function ToastItem({ toast, onDismiss, position }: { toast: ToastMessage; onDismiss: (id: string) => void; position: 'top' | 'bottom' }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';

  return (
    <motion.div
      initial={
        position === 'top' 
          ? { opacity: 0, y: -50, scale: 0.9 } 
          : { opacity: 0, y: 50, scale: 0.9, x: 20 }
      }
      animate={
        position === 'top'
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 1, y: 0, scale: 1, x: 0 }
      }
      exit={
        position === 'top'
          ? { opacity: 0, y: -20, scale: 0.9 }
          : { opacity: 0, y: 20, scale: 0.9, x: 20 }
      }
      transition={
        toast.type === 'alert' 
          ? { type: "spring", stiffness: 500, damping: 15, mass: 1 } // Vibrating snap
          : { type: "spring", stiffness: 400, damping: 25 } // Smooth snap
      }
      className={twMerge(
        "pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border",
        isSuccess 
          ? "bg-accent-gold text-espresso-900 border-espresso-900/10 shadow-[0_10px_40px_rgba(255,184,0,0.4)]" 
          : "bg-accent-red text-white border-white/20 shadow-[0_10px_40px_rgba(226,55,68,0.5)]"
      )}
    >
      {isSuccess ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} className="animate-pulse" />}
      <span className="font-bold tracking-widest uppercase text-sm">{toast.message}</span>
      <button 
        onClick={() => onDismiss(toast.id)}
        className={twMerge(
          "ml-4 p-1 rounded-full transition-colors",
          isSuccess ? "hover:bg-espresso-900/10" : "hover:bg-white/20"
        )}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
