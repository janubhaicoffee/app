import { LegalPage } from '../components/ui/LegalPage';

export const Refund = () => (
  <LegalPage 
    title="Refund & Cancellation"
    lastUpdated="May 2026"
    content={
      <>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">1. Order Cancellation</h2>
          <p>Orders can be cancelled within 60 seconds of placement. Once the outlet starts "Brewing Magic", cancellation is not possible due to the perishable nature of our products.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">2. Refund Eligibility</h2>
          <p>Refunds are processed if the order is not delivered, delivered with wrong items, or if the quality is compromised due to transit issues. Photo evidence may be required.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">3. Delivery Issues</h2>
          <p>If a rider is unable to find your location after multiple attempts, the order will be marked as undelivered and no refund will be issued.</p>
        </section>
      </>
    }
  />
);
