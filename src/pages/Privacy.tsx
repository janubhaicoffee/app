import { LegalPage } from '../components/ui/LegalPage';

export const Privacy = () => (
  <LegalPage 
    title="Privacy Policy"
    lastUpdated="May 2026"
    content={
      <>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">1. Data Collection</h2>
          <p>We collect minimal data required to serve you: Phone number, order history, and delivery location. For outlet partners, we also collect business performance metrics.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">2. Usage of Data</h2>
          <p>Your data is used solely to process orders, improve our decentralized operations, and provide personalized offers. We do not sell your personal data to third parties.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">3. Security Practices</h2>
          <p>We use industry-standard encryption and secure Supabase-powered infrastructure to protect your data. Access is strictly role-based and audit-logged.</p>
        </section>
      </>
    }
  />
);
