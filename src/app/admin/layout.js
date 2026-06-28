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
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Janu Bhai</h2>
          <p>Admin Portal</p>
        </div>
        <SidebarNav />
      </aside>
      <main className="admin-main">
        <AdminGuard>
          {children}
        </AdminGuard>
      </main>
    </div>
  );
}
