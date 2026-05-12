import { LegalLayout } from '@/components/ui/LegalLayout';

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="April 1, 2026">
      <p>
        Welcome to Janu Bhai Coffee. By accessing our website, mobile app, or visiting our Addas, you agree to comply with and be bound by the following terms and conditions.
      </p>

      <h2>1. Use of Service</h2>
      <p>
        You must be at least 18 years old to use our digital wallet services. You agree to provide accurate information when creating an account and to keep your login credentials secure.
      </p>

      <h2>2. Orders and Pricing</h2>
      <ul>
        <li>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</li>
        <li>We reserve the right to modify prices, though our core menu aims to remain accessible.</li>
        <li>Orders placed via the app are final once prepared by the outlet.</li>
      </ul>

      <h2>3. Digital Wallet & Payments</h2>
      <p>
        The Janu Bhai digital wallet is a closed-loop system intended solely for purchases within our ecosystem. Wallet balances cannot be redeemed for cash, transferred to bank accounts, or used outside of our platform.
      </p>

      <h2>4. Franchise Partners</h2>
      <p>
        Franchise owners operating under the Janu Bhai Coffee brand are subject to separate, binding franchise agreements. These Terms of Service apply primarily to end consumers.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
        Janu Bhai Coffee Co. shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or products.
      </p>

      <h2>6. Contact</h2>
      <p>
        Questions about the Terms of Service should be sent to us at <a href="mailto:legal@janubhai.com">legal@janubhai.com</a>.
      </p>
    </LegalLayout>
  );
}
