import { LegalPage } from '@/components/ui/LegalPage';

export default function RefundPage() {
  return (
    <LegalPage 
      title="Refund & Cancellation"
      lastUpdated="May 06, 2026"
      content={
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold mb-2">1. Cancellation</h3>
            <p>Orders can be cancelled within 2 minutes of placement. Once the kitchen starts preparing your coffee, cancellations are not possible.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold mb-2">2. Refunds</h3>
            <p>Refunds are processed if the order is cancelled within the allowed window or if the outlet is unable to fulfill the order. Refunds typically take 5-7 business days.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold mb-2">3. Quality Issues</h3>
            <p>If you are unhappy with your order, please contact the specific outlet directly or reach out via our support channel.</p>
          </section>
        </div>
      }
    />
  );
}
