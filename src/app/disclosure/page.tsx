"use client";

import { LegalPage } from '@/components/ui/LegalPage';

export default function DisclosurePage() {
  return (
    <LegalPage
      title="Disclosures"
      lastUpdated="May 07, 2026"
      content={
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold">1. Corporate Information</h3>
            <p>Janu Bhai Coffee is a registered entity operating under the legal framework of India. Our primary base of operations is Ghaffar Manzil, Jamia Nagar, Delhi - 110025.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">2. FSSAI Compliance</h3>
            <p>Our processing facility and outlets are compliant with the Food Safety and Standards Authority of India (FSSAI) guidelines. We maintain strict hygiene and safety standards.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">3. Payment Partners</h3>
            <p>We use Razorpay and other secure gateways for processing payments. Janu Bhai Coffee does not store any sensitive card or banking data on its own servers.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">4. Product Representation</h3>
            <p>We strive to represent our coffee beans and origins as accurately as possible. However, natural variations in flavor profile, color, and aroma are expected in single-origin agricultural products.</p>
          </section>
        </div>
      }
    />
  );
}
