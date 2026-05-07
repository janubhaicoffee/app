"use client";

import { LegalPage } from '@/components/ui/LegalPage';
import { Building2, ShieldCheck, CreditCard, Leaf } from 'lucide-react';

export default function DisclosurePage() {
  return (
    <LegalPage
      title="Disclosures"
      lastUpdated="May 07, 2026"
      content={
        <div className="space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <Building2 size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">1. Corporate Information</h3>
            </div>
            <p>Janu Bhai Coffee is a registered entity operating under the legal framework of India. Our primary base of operations is Ghaffar Manzil, Jamia Nagar, Delhi - 110025.</p>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">2. FSSAI Compliance</h3>
            </div>
            <p>Our processing facility and outlets are compliant with the Food Safety and Standards Authority of India (FSSAI) guidelines. We maintain strict hygiene and safety standards across all operations.</p>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <CreditCard size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">3. Payment Partners</h3>
            </div>
            <p>We use Razorpay and other secure gateways for processing payments. Janu Bhai Coffee does not store any sensitive card or banking data on its own servers.</p>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <Leaf size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">4. Product Representation</h3>
            </div>
            <p>We strive to represent our coffee beans and origins as accurately as possible. However, natural variations in flavor profile, color, and aroma are expected in single-origin agricultural products.</p>
          </section>
        </div>
      }
    />
  );
}
