import Link from "next/link";
import { LogOut } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import SidebarNav from "./SidebarNav";
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
        
        <SidebarNav />

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
