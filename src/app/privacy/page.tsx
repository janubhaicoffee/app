"use client";

import { LegalPage } from '@/components/ui/LegalPage';
import { Eye, Database, ShieldCheck, Cookie } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="May 07, 2026"
      content={
        <div className="space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <Eye size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">1. Information Collection</h3>
            </div>
            <p>We collect information from you when you register on our site, place an order, or subscribe to our newsletter. This includes your name, email address, and phone number.</p>
            <p>We may also collect device information, IP addresses, and browsing patterns to improve your experience on the Janu Bhai platform.</p>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <Database size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">2. Data Usage</h3>
            </div>
            <p>The information we collect may be used to:</p>
            <ul className="space-y-2 pl-6 list-disc marker:text-accent-red">
              <li>Personalize your experience and respond to your individual needs</li>
              <li>Improve our website based on your feedback</li>
              <li>Process transactions securely through our payment partners</li>
              <li>Send periodic emails regarding your order or other products and services</li>
            </ul>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">3. Information Protection</h3>
            </div>
            <p>We implement a variety of security measures to maintain the safety of your personal information. Your private information (credit cards, socials, etc.) will not be stored on our servers.</p>
            <p>All sensitive data is encrypted in transit using industry-standard TLS encryption. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.</p>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <Cookie size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">4. Cookies</h3>
            </div>
            <p>We use cookies to help us remember and process the items in your shopping cart and understand and save your preferences for future visits.</p>
            <p>You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies via your browser settings.</p>
          </section>
        </div>
      }
    />
  );
}
