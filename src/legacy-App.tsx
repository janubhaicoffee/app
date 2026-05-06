
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AppLayout } from './layouts/AppLayout';
import { AppHome } from './pages/AppHome';
import { UnifiedOrders } from './pages/UnifiedOrders';
import { Integrations } from './pages/Integrations';
import { AddExpense } from './pages/AddExpense';
import { ExpenseLog } from './pages/ExpenseLog';
import { Inventory } from './pages/Inventory';
import { ProfitBreakdown } from './pages/ProfitBreakdown';
import { GlobalFinance } from './pages/GlobalFinance';
import { UserManagement } from './pages/UserManagement';
import { OutletManagement } from './pages/OutletManagement';
import { Settings } from './pages/Settings';
import { OutletMenu } from './pages/OutletMenu';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';
import { CustomerProfile } from './pages/CustomerProfile';
import { About } from './pages/About';
import { Franchise } from './pages/Franchise';
import { Contact } from './pages/Contact';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Refund } from './pages/Refund';
import { Shipping } from './pages/Shipping';
import { RoleGuard } from './components/ui/RoleGuard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/franchise" element={<Franchise />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/refund" element={<Refund />} />
      <Route path="/shipping" element={<Shipping />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<AppHome />} />
        <Route path="orders" element={<UnifiedOrders />} />
        
        {/* Manager + Superadmin Only */}
        <Route path="add-expense" element={
          <RoleGuard allowedRoles={['manager', 'superadmin']}><AddExpense /></RoleGuard>
        } />
        <Route path="expenses" element={
          <RoleGuard allowedRoles={['manager', 'superadmin']}><ExpenseLog /></RoleGuard>
        } />
        <Route path="inventory" element={
          <RoleGuard allowedRoles={['manager', 'superadmin']}><Inventory /></RoleGuard>
        } />
        <Route path="profit" element={
          <RoleGuard allowedRoles={['manager', 'superadmin']}><ProfitBreakdown /></RoleGuard>
        } />

        {/* Superadmin Only */}
        <Route path="finances" element={
          <RoleGuard allowedRoles={['superadmin']}><GlobalFinance /></RoleGuard>
        } />
        <Route path="integrations" element={
          <RoleGuard allowedRoles={['superadmin']}><Integrations /></RoleGuard>
        } />
        <Route path="outlets" element={
          <RoleGuard allowedRoles={['superadmin']}><OutletManagement /></RoleGuard>
        } />
        
        {/* User Management (Superadmin or Manager) */}
        <Route path="users" element={
          <RoleGuard allowedRoles={['manager', 'superadmin']}><UserManagement /></RoleGuard>
        } />

        {/* Customer Only Routes */}
        <Route path="outlet/:outletId" element={<OutletMenu />} />
        <Route path="cart" element={<Checkout />} />
        <Route path="track/:orderId" element={<OrderTracking />} />
        <Route path="profile" element={<CustomerProfile />} />

        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
