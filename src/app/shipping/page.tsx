"use client";

import { LegalPage } from '@/components/ui/LegalPage';

export default function ShippingPage() {
  return (
    <LegalPage
      title="Shipping & Delivery"
      lastUpdated="May 07, 2026"
      content={
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold">1. Shipping Coverage</h3>
            <p>Janu Bhai Coffee currently delivers fresh roasted beans and merchandise across major cities in India. Delivery for prepared beverages is restricted to the local vicinity of our outlets.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">2. Delivery Timeline</h3>
            <p>Orders for roasted beans are typically processed within 24-48 hours. Estimated delivery time is 3-5 business days depending on the location.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">3. Shipping Charges</h3>
            <p>Shipping charges are calculated based on the weight of the order and the delivery destination. Standard shipping is free for orders above ₹999.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">4. Tracking</h3>
            <p>Once your order is shipped, you will receive a tracking link via email or SMS to monitor the status of your delivery.</p>
          </section>
        </div>
      }
    />
  );
}
