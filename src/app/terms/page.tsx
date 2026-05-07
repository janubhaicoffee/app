"use client";

import { LegalPage } from '@/components/ui/LegalPage';
import { Shield, FileText, UserCheck, Landmark } from 'lucide-react';

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="May 07, 2026"
      content={
        <div className="space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <FileText size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">1. Agreement to Terms</h3>
            </div>
            <p>By accessing or using the Janu Bhai Coffee website and platform, you agree to be bound by these Terms of Service and all applicable laws and regulations in India.</p>
            <p>If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.</p>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <Shield size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">2. Use License</h3>
            </div>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Janu Bhai Coffee's website for personal, non-commercial transitory viewing only.</p>
            <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="space-y-2 pl-6 list-disc marker:text-accent-red">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to reverse-engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <UserCheck size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">3. Account Responsibility</h3>
            </div>
            <p>Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account.</p>
            <p>You must notify Janu Bhai Coffee immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <Landmark size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">4. Governing Law</h3>
            </div>
            <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in New Delhi.</p>
            <p>Any claim relating to Janu Bhai Coffee's website shall be governed by the laws of the Republic of India without regard to its conflict of law provisions.</p>
          </section>
        </div>
      }
    />
  );
}
