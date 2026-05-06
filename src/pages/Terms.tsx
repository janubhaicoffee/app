import { LegalPage } from '../components/ui/LegalPage';

export const Terms = () => (
  <LegalPage 
    title="Terms of Service"
    lastUpdated="May 2026"
    content={
      <>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">1. Use of Platform</h2>
          <p>By accessing or using Janu Bhai Coffee, you agree to comply with these terms. Our platform is designed for ordering coffee, managing outlets, and viewing business intelligence.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">2. User Roles & Responsibilities</h2>
          <p>Users are responsible for maintaining the confidentiality of their accounts. Employees, Managers, and Superadmins must use the system only for authorized business purposes. Customers are responsible for providing accurate delivery information.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">3. No Misuse Clause</h2>
          <p>Unauthorized access, reverse engineering, or disruption of the platform is strictly prohibited. We reserve the right to terminate access for any user found violating these terms.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-heading">4. Limitation of Liability</h2>
          <p>Janu Bhai Coffee is not liable for indirect, incidental, or consequential damages arising from the use of our services or partner delivery services.</p>
        </section>
      </>
    }
  />
);
