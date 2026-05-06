import { LegalPage } from '../components/ui/LegalPage';

export const Shipping = () => (
  <LegalPage 
    title="Shipping & Delivery"
    lastUpdated="May 2026"
    content={
      <>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">1. Delivery Partners</h2>
          <p>We use trusted third-party partners like Borzo and local delivery networks to ensure your coffee reaches you fresh and fast.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">2. Timelines</h2>
          <p>Our standard delivery window is 15-30 minutes depending on your distance from the nearest Janu Bhai outlet. Weather and traffic may affect these times.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">3. Responsibility</h2>
          <p>Once an order is handed over to the delivery partner, they are responsible for transit. However, we will mediate any issues to ensure customer satisfaction.</p>
        </section>
      </>
    }
  />
);
