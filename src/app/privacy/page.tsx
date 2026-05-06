"use client";

import { LegalPage } from '@/components/ui/LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="May 07, 2026"
      content={
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold">1. Information Collection</h3>
            <p>We collect information from you when you register on our site, place an order, or subscribe to our newsletter. This includes your name, email address, and phone number.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">2. Data Usage</h3>
            <p>The information we collect may be used to personalize your experience, improve our website, and process transactions securely through our payment partners.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">3. Information Protection</h3>
            <p>We implement a variety of security measures to maintain the safety of your personal information. Your private information (credit cards, socials, etc.) will not be stored on our servers.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">4. Cookies</h3>
            <p>We use cookies to help us remember and process the items in your shopping cart and understand and save your preferences for future visits.</p>
          </section>
        </div>
      }
    />
  );
}
