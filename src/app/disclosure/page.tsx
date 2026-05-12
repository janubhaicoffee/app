import { LegalLayout } from '@/components/ui/LegalLayout';

export default function Disclosure() {
  return (
    <LegalLayout title="Disclosures" lastUpdated="April 1, 2026">
      <p>
        This page outlines important disclosures and disclaimers regarding the operations of Janu Bhai Coffee.
      </p>

      <h2>1. Food Safety & Standards</h2>
      <p>
        Janu Bhai Coffee operates in strict compliance with the Food Safety and Standards Authority of India (FSSAI). All ingredients, including our AAA-grade Chikkamagaluru beans, are sourced from certified vendors.
      </p>
      <ul>
        <li><strong>Allergens:</strong> Our beverages contain dairy unless a plant-based alternative is explicitly requested. We cannot guarantee a completely allergen-free environment.</li>
        <li><strong>Caffeine Content:</strong> Our Poshtik coffee is highly caffeinated. Consumers with sensitivities or medical conditions should consult a physician before consumption.</li>
      </ul>

      <h2>2. Franchise Operations</h2>
      <p>
        Janu Bhai Coffee locations are a mix of company-owned and independently operated franchises. While we enforce strict quality standards globally, independent franchise owners are responsible for local compliance and day-to-day operations.
      </p>

      <h2>3. App Metrics & Data</h2>
      <p>
        Metrics displayed on our website (e.g., "Active Outlets", "Cups Served") are updated periodically and represent internal estimates for marketing purposes. They do not constitute financial reporting or legally binding figures.
      </p>

      <h2>4. Intellectual Property</h2>
      <p>
        "Janu Bhai", "Poshtik Coffee", and our mascot are registered trademarks. Unauthorized use is strictly prohibited.
      </p>

      <h2>5. Contact Us</h2>
      <p>
        For legal inquiries regarding these disclosures, contact <a href="mailto:legal@janubhai.com">legal@janubhai.com</a>.
      </p>
    </LegalLayout>
  );
}
