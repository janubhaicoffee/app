import { LegalPage } from '@/components/ui/LegalPage';

export default function ShippingPage() {
  return (
    <LegalPage 
      title="Shipping & Delivery"
      lastUpdated="May 06, 2026"
      content={
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold mb-2">1. Delivery Area</h3>
            <p>Each outlet defines its own delivery radius. Delivery is only available within the specified zones shown in the app.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold mb-2">2. Delivery Time</h3>
            <p>We aim to deliver within 20-30 minutes. However, delivery times may vary based on traffic, weather, and order volume.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold mb-2">3. Tracking</h3>
            <p>You can track your order in real-time through the app once it is picked up by the delivery partner.</p>
          </section>
        </div>
      }
    />
  );
}
