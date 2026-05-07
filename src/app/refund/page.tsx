"use client";

import { LegalPage } from '@/components/ui/LegalPage';
import { Ban, CreditCard, AlertCircle } from 'lucide-react';

export default function RefundPage() {
  return (
    <LegalPage 
      title="Refund & Cancellation"
      lastUpdated="May 07, 2026"
      content={
        <div className="space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <Ban size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">1. Cancellation</h3>
            </div>
            <p>Orders can be cancelled within 2 minutes of placement. Once the kitchen starts preparing your coffee, cancellations are not possible.</p>
            <div className="bg-accent-brown/[0.03] rounded-2xl p-6 border border-accent-brown/5">
              <p className="text-sm font-medium"><span className="font-bold">Note:</span> For bulk or subscription orders, please contact support@janubhai.com for cancellation assistance.</p>
            </div>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <CreditCard size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">2. Refunds</h3>
            </div>
            <p>Refunds are processed if the order is cancelled within the allowed window or if the outlet is unable to fulfill the order. Refunds typically take 5-7 business days to reflect in your account.</p>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <AlertCircle size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">3. Quality Issues</h3>
            </div>
            <p>If you are unhappy with your order, please contact the specific outlet directly or reach out via our support channel at hello@janubhai.com.</p>
          </section>
        </div>
      }
    />
  );
}
