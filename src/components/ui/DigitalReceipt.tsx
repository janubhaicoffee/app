"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

interface DigitalReceiptProps {
  orderId: string;
  timestamp: string;
  items: ReceiptItem[];
  total: number;
  source: 'POS' | 'ZOMATO' | 'SWIGGY' | 'APP';
  outletName: string;
  className?: string;
}

export function DigitalReceipt({
  orderId,
  timestamp,
  items,
  total,
  source,
  outletName,
  className,
}: DigitalReceiptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative max-w-xs mx-auto ${className}`}
    >
      {/* Jagged Top Edge */}
      <div
        className="w-full h-4"
        style={{
          background: 'white',
          clipPath: 'polygon(0% 100%, 2% 0%, 4% 100%, 6% 0%, 8% 100%, 10% 0%, 12% 100%, 14% 0%, 16% 100%, 18% 0%, 20% 100%, 22% 0%, 24% 100%, 26% 0%, 28% 100%, 30% 0%, 32% 100%, 34% 0%, 36% 100%, 38% 0%, 40% 100%, 42% 0%, 44% 100%, 46% 0%, 48% 100%, 50% 0%, 52% 100%, 54% 0%, 56% 100%, 58% 0%, 60% 100%, 62% 0%, 64% 100%, 66% 0%, 68% 100%, 70% 0%, 72% 100%, 74% 0%, 76% 100%, 78% 0%, 80% 100%, 82% 0%, 84% 100%, 86% 0%, 88% 100%, 90% 0%, 92% 100%, 94% 0%, 96% 100%, 98% 0%, 100% 100%)',
        }}
      />

      {/* Receipt Body */}
      <div className="bg-white px-6 py-6 font-mono text-[11px] text-gray-700 shadow-lg">
        {/* Header */}
        <div className="text-center space-y-1 pb-4">
          <pre className="text-[8px] text-gray-400 leading-tight whitespace-pre">
{`    ___________
   |           |
   |  J A N U  |
   |   B H A I |
   |___________|
    \\  o   o  /
     \\  ---  /
      \\_____/`}
          </pre>
          <p className="font-bold text-sm text-gray-900 uppercase tracking-widest pt-2">{outletName}</p>
          <p className="text-gray-400 text-[9px] uppercase tracking-widest">Poshtik hai. Jhakaas hai.</p>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-300 my-3" />

        {/* Order Info */}
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-gray-400">ORDER</span>
            <span className="font-bold text-gray-900">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">SOURCE</span>
            <span className="font-bold text-gray-900">{source}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">TIME</span>
            <span className="text-gray-600">{timestamp}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-300 my-3" />

        {/* Items */}
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-[11px]">
              <span className="text-gray-700">
                {item.qty}x {item.name}
              </span>
              <span className="font-bold text-gray-900">₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-300 my-3" />

        {/* Total */}
        <div className="flex justify-between text-lg font-black text-gray-900">
          <span>TOTAL</span>
          <span>₹{total}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-300 my-4" />

        {/* QR Code Placeholder (Barcode) */}
        <div className="flex flex-col items-center space-y-2 pb-2">
          {/* Simulated barcode using CSS stripes */}
          <div className="w-48 h-12 flex items-end gap-px">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 flex-1"
                style={{ height: `${30 + Math.random() * 70}%` }}
              />
            ))}
          </div>
          <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em]">{orderId}</p>
          <p className="text-[8px] text-gray-300 uppercase tracking-widest">Scan for pickup</p>
        </div>
      </div>

      {/* Jagged Bottom Edge */}
      <div
        className="w-full h-4"
        style={{
          background: 'white',
          clipPath: 'polygon(0% 0%, 2% 100%, 4% 0%, 6% 100%, 8% 0%, 10% 100%, 12% 0%, 14% 100%, 16% 0%, 18% 100%, 20% 0%, 22% 100%, 24% 0%, 26% 100%, 28% 0%, 30% 100%, 32% 0%, 34% 100%, 36% 0%, 38% 100%, 40% 0%, 42% 100%, 44% 0%, 46% 100%, 48% 0%, 50% 100%, 52% 0%, 54% 100%, 56% 0%, 58% 100%, 60% 0%, 62% 100%, 64% 0%, 66% 100%, 68% 0%, 70% 100%, 72% 0%, 74% 100%, 76% 0%, 78% 100%, 80% 0%, 82% 100%, 84% 0%, 86% 100%, 88% 0%, 90% 100%, 92% 0%, 94% 100%, 96% 0%, 98% 100%, 100% 0%)',
        }}
      />
    </motion.div>
  );
}
