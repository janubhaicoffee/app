import { LegalLayout } from '@/components/ui/LegalLayout';

export default function ShippingPolicy() {
  return (
    <LegalLayout title="Shipping & Delivery" lastUpdated="April 1, 2026">
      <p>
        Janu Bhai Coffee operates primarily through physical Addas (outlets) and localized app-based ordering.
      </p>

      <h2>1. In-Store Pickup</h2>
      <p>
        Orders placed via the Janu Bhai app for "Pickup" will be prepared at your selected Adda. Please ensure you arrive within a reasonable timeframe. Uncollected orders will not be refunded.
      </p>

      <h2>2. Local Delivery</h2>
      <p>
        We partner with third-party delivery platforms (e.g., Swiggy, Zomato) for local delivery. Delivery times and fees are governed by the respective platform's policies.
      </p>
      <p>
        If an issue occurs during delivery (e.g., spilled or delayed order), please report it directly through the delivery partner's app for the fastest resolution.
      </p>

      <h2>3. Merchandise Shipping</h2>
      <p>
        For Janu Bhai merchandise (e.g., hoodies, mugs) ordered through our app:
      </p>
      <ul>
        <li><strong>Processing Time:</strong> 1-2 business days.</li>
        <li><strong>Shipping Time:</strong> 3-5 business days across India.</li>
        <li><strong>Tracking:</strong> A tracking link will be provided via SMS/Email once dispatched.</li>
      </ul>

      <h2>4. Contact Us</h2>
      <p>
        For merchandise shipping inquiries, contact <a href="mailto:support@janubhai.com">support@janubhai.com</a>.
      </p>
    </LegalLayout>
  );
}
