import { LegalPage } from '@/components/ui/LegalPage';

export default function TermsPage() {
  return (
    <LegalPage 
      title="Terms of Service"
      lastUpdated="May 06, 2026"
      content={
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold mb-2">1. Acceptance of Terms</h3>
            <p>By accessing Janu Bhai Coffee, you agree to be bound by these terms. We provide a decentralized coffee chain platform connecting independent outlets with customers.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold mb-2">2. Role of the Platform</h3>
            <p>Janu Bhai Coffee HQ provides the technology and brand infrastructure. Each outlet is independently operated and responsible for its own service quality and compliance.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold mb-2">3. User Accounts</h3>
            <p>Users are responsible for maintaining the confidentiality of their accounts. Any activity under your account is your responsibility.</p>
          </section>
        </div>
      }
    />
  );
}
