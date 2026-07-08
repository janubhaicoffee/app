'use client';
import '../legal.css';

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="container legal-container">
        <h1>Terms & Conditions</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to Janu Bhai Coffee. These terms and conditions outline the rules and regulations
          for the use of our website and the purchase of our products.
        </p>

        <h2>2. Intellectual Property Rights</h2>
        <p>
          Other than the content you own, under these terms, Janu Bhai Coffee and/or its licensors
          own all the intellectual property rights and materials contained in this website.
        </p>

        <h2>3. Restrictions</h2>
        <p>
          You are specifically restricted from publishing any website material in any other media
          without credit, selling, sublicensing, or otherwise commercializing any website material,
          or using this website in any way that is or may be damaging to this website.
        </p>

        <h2>4. Pricing and Payments</h2>
        <p>
          All prices are subject to change without notice. We reserve the right to refuse or cancel
          any order placed for a product listed at an incorrect price. We process payments securely
          via Razorpay.
        </p>

        <h2>5. Governing Law & Jurisdiction</h2>
        <p>
          These terms will be governed by and interpreted in accordance with the laws of India, and
          you submit to the non-exclusive jurisdiction of the state and federal courts located in
          Karnataka for the resolution of any disputes.
        </p>
      </div>
    </main>
  );
}
