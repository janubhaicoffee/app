import { LegalPage } from '@/components/ui/LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage 
      title="Privacy Policy"
      lastUpdated="May 06, 2026"
      content={
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold mb-2">1. Data Collection</h3>
            <p>We collect minimal data required to process your orders and improve your experience. This includes your name, phone number, and location for delivery purposes.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold mb-2">2. Data Usage</h3>
            <p>Your data is used solely for order fulfillment and platform improvement. We do not sell your personal information to third parties.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold mb-2">3. Security</h3>
            <p>We use industry-standard encryption and security measures to protect your data. Your payment information is handled by secure third-party processors.</p>
          </section>
        </div>
      }
    />
  );
}
