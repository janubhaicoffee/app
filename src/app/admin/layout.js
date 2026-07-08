import AdminGuard from '@/components/AdminGuard';
import SidebarNav from './SidebarNav';
import AdminBrandHeader from '@/components/admin/AdminBrandHeader';
import './admin.css';

export const metadata = {
  title: 'Admin Dashboard | Janu Bhai Coffee',
  robots: {
    index: false,
    follow: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'JBC Admin',
  },
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <AdminBrandHeader />
        <SidebarNav />
      </aside>
      <main className="admin-main">
        <AdminGuard>{children}</AdminGuard>
      </main>
    </div>
  );
}
