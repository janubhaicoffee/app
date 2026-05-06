"use client";

import { LegalPage } from '@/components/ui/LegalPage';

export default function ReturnsPage() {
  return (
    <LegalPage
      title="Returns & Refunds"
      lastUpdated="May 07, 2026"
      content={
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold">1. Return Policy</h3>
            <p>Due to the perishable nature of our products (coffee beans), we do not accept returns. However, if you receive a damaged or incorrect product, please contact us within 48 hours of delivery.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">2. Refund Process</h3>
            <p>In cases of damaged goods or missing items, we will initiate a refund or replacement after verifying the claim. Refunds will be processed back to the original payment method within 5-7 business days.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">3. Cancellation</h3>
            <p>Orders can only be cancelled before they have been processed for shipping. Once an order is "In Transit", it cannot be cancelled.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">4. Quality Guarantee</h3>
            <p>We take pride in our AAA grade beans. If you are not satisfied with the quality, please share your feedback at hello@janubhai.com, and we will do our best to make it right.</p>
          </section>
        </div>
      }
    />
  );
}
