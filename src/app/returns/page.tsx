"use client";

import { LegalPage } from '@/components/ui/LegalPage';
import { RotateCcw, CreditCard, AlertTriangle, Award } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <LegalPage
      title="Returns & Refunds"
      lastUpdated="May 07, 2026"
      content={
        <div className="space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <RotateCcw size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">1. Return Policy</h3>
            </div>
            <p>Due to the perishable nature of our products (coffee beans), we do not accept returns. However, if you receive a damaged or incorrect product, please contact us within 48 hours of delivery.</p>
            <div className="bg-accent-red/5 rounded-2xl p-6 border border-accent-red/10">
              <p className="text-sm font-bold text-accent-red">Important: All return requests must include photographic evidence of the damage or incorrect product.</p>
            </div>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <CreditCard size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">2. Refund Process</h3>
            </div>
            <p>In cases of damaged goods or missing items, we will initiate a refund or replacement after verifying the claim. Refunds will be processed back to the original payment method within 5-7 business days.</p>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <AlertTriangle size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">3. Cancellation</h3>
            </div>
            <p>Orders can only be cancelled before they have been processed for shipping. Once an order is "In Transit", it cannot be cancelled.</p>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <Award size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">4. Quality Guarantee</h3>
            </div>
            <p>We take pride in our AAA grade beans. If you are not satisfied with the quality, please share your feedback at hello@janubhai.com, and we will do our best to make it right.</p>
          </section>
        </div>
      }
    />
  );
}
