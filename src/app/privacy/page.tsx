import { LegalLayout } from '@/components/ui/LegalLayout';

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="April 1, 2026">
      <p>
        Welcome to Janu Bhai Coffee. This Privacy Policy describes how we collect, use, and handle your information when you use our website, mobile application, and services.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        When you use the Janu Bhai Coffee platform or app, we may collect:
      </p>
      <ul>
        <li><strong>Personal Information:</strong> Name, phone number, email address, and delivery address.</li>
        <li><strong>Financial Information:</strong> Payment details (processed securely via our payment gateways, not stored by us).</li>
        <li><strong>Device Information:</strong> IP address, browser type, and operating system for security and analytics.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use your data to:</p>
      <ul>
        <li>Process your coffee orders and maintain your wallet balance.</li>
        <li>Communicate with you regarding orders, support, and promotional offers.</li>
        <li>Improve our Adda experiences and app performance.</li>
        <li>Prevent fraud and ensure compliance with our terms.</li>
      </ul>

      <h2>3. Data Sharing and Security</h2>
      <p>
        We do not sell your personal data to third parties. We may share information with trusted service providers (e.g., delivery partners, payment processors) solely to fulfill our services. We use industry-standard encryption to protect your data.
      </p>

      <h2>4. Your Rights</h2>
      <p>
        You have the right to access, update, or delete your personal information. To exercise these rights, please contact our support team.
      </p>

      <h2>5. Contact Us</h2>
      <p>
        For any privacy-related concerns, email us at <a href="mailto:privacy@janubhai.com">privacy@janubhai.com</a>.
      </p>
    </LegalLayout>
  );
}
