"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function InterceptorModal() {
  const { interceptorItem, setInterceptorItem, confirmInterceptor } = useCart();
  const [checked, setChecked] = useState(false);

  if (!interceptorItem) return null;

  const handleConfirm = () => {
    if (checked) {
      confirmInterceptor();
      setChecked(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className="modal-box"
          initial={{ scale: 0.85, opacity: 0, y: 60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 60 }}
          transition={{ type: "spring", damping: 22, stiffness: 320 }}
        >
          <div className="modal-header">
            <h2>WARNING: HIGH CAFFEINE INTENSITY</h2>
          </div>
          <div className="modal-body">
            <p>
              You are adding <strong>{interceptorItem.name}</strong> to your cart.
            </p>
            <p className="warning-text">
              This is a custom-engineered variant with an intensity score of <strong>90/100</strong>. It contains an extremely concentrated dose of caffeine designed for critical focus.
            </p>
            <p>
              Before we can add this to your session, you must read and acknowledge the following safety statement:
            </p>

            <motion.label
              className="checkbox-container"
              animate={{
                boxShadow: checked
                  ? [
                      '0 0 0 0 rgba(183, 28, 28, 0)',
                      '0 0 12px 2px rgba(183, 28, 28, 0.5)',
                      '0 0 0 0 rgba(183, 28, 28, 0)'
                    ]
                  : '0 0 0 0 rgba(183, 28, 28, 0)'
              }}
              transition={{
                duration: 1.5,
                repeat: checked ? Infinity : 0,
                ease: "easeInOut"
              }}
              style={{
                borderRadius: '6px',
                padding: '10px',
                background: checked ? 'rgba(183, 28, 28, 0.06)' : 'transparent',
                transition: 'background 0.3s ease'
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <span className="checkbox-label">
                I confirm that I understand this variant contains highly concentrated caffeine, and I agree to consume it responsibly.
              </span>
            </motion.label>
          </div>
          <div className="modal-footer">
            <button
              className="btn-cancel"
              onClick={() => {
                setInterceptorItem(null);
                setChecked(false);
              }}
            >
              CANCEL
            </button>
            <motion.button
              className="btn-confirm"
              disabled={!checked}
              onClick={handleConfirm}
              whileHover={checked ? { scale: 1.03 } : {}}
              whileTap={checked ? { scale: 0.97 } : {}}
              animate={checked ? {
                boxShadow: [
                  '0 0 0 0 rgba(183, 28, 28, 0.4)',
                  '0 0 16px 4px rgba(183, 28, 28, 0.6)',
                  '0 0 0 0 rgba(183, 28, 28, 0.4)'
                ]
              } : {
                boxShadow: 'none'
              }}
              transition={{
                duration: 1.8,
                repeat: checked ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              ACKNOWLEDGE & ADD
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
