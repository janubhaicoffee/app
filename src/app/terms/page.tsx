"use client";

import { LegalPage } from '@/components/ui/LegalPage';

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="May 07, 2026"
      content={
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold">1. Agreement to Terms</h3>
            <p>By accessing or using the Janu Bhai Coffee website and platform, you agree to be bound by these Terms of Service and all applicable laws and regulations in India.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">2. Use License</h3>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Janu Bhai Coffee's website for personal, non-commercial transitory viewing only.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">3. Account Responsibility</h3>
            <p>Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account.</p>
          </section>
          <section>
            <h3 className="text-lg font-bold">4. Governing Law</h3>
            <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in New Delhi.</p>
          </section>
        </div>
      }
    />
  );
}
