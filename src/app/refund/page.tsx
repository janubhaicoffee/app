import { LegalLayout } from '@/components/ui/LegalLayout';

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="April 1, 2026">
      <p>
        At Janu Bhai Coffee, we want you to be completely satisfied with your Poshtik experience.
      </p>

      <h2>1. In-Store Orders</h2>
      <p>
        If your coffee does not meet our quality standards, please inform our Adda staff immediately. We will replace your beverage on the spot. Refunds for completed, consumed in-store orders are generally not provided.
      </p>

      <h2>2. Wallet Top-Ups</h2>
      <p>
        Funds added to the Janu Bhai digital wallet are non-refundable and cannot be transferred back to a bank account. They can only be used for purchases within our app or physical outlets.
      </p>

      <h2>3. Disputed Transactions</h2>
      <p>
        If you notice an unauthorized or incorrect charge on your account, please contact support within 48 hours with your transaction ID. We will investigate and credit your wallet if a technical error occurred on our end.
      </p>

      <h2>4. Contact Us</h2>
      <p>
        For refund inquiries, reach out to <a href="mailto:support@janubhai.com">support@janubhai.com</a>.
      </p>
    </LegalLayout>
  );
}
