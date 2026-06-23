import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Settings, LogOut } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import "./admin.css";

export const metadata = {
  title: "Admin Dashboard | Janu Bhai Coffee",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Janu Bhai</h2>
          <p>Admin Portal</p>
        </div>
        
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-link">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/admin/products" className="admin-nav-link">
            <Package size={20} /> Products
          </Link>
          <Link href="/admin/orders" className="admin-nav-link">
            <ShoppingCart size={20} /> Orders
          </Link>
          <Link href="/admin/customers" className="admin-nav-link">
            <Users size={20} /> Customers
          </Link>
          <Link href="/admin/articles" className="admin-nav-link">
            <FileText size={20} /> Articles (AI)
          </Link>
        </nav>

        <div className="admin-footer-nav">
          <Link href="/" className="admin-nav-link text-danger">
            <LogOut size={20} /> Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <AdminGuard>
          {children}
        </AdminGuard>
      </main>
    </div>
  );
}
