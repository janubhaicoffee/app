
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AppLayout } from './layouts/AppLayout';
import { AppHome } from './pages/AppHome';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<AppHome />} />
        <Route path="orders" element={<div className="p-4 text-center">Orders History (WIP)</div>} />
        <Route path="finances" element={<div className="p-4 text-center">Detailed Finances (WIP)</div>} />
        <Route path="inventory" element={<div className="p-4 text-center">Inventory Management (WIP)</div>} />
        <Route path="outlets" element={<div className="p-4 text-center">Global Outlets (WIP)</div>} />
        <Route path="settings" element={<div className="p-4 text-center">Settings (WIP)</div>} />
      </Route>
    </Routes>
  );
}

export default App;
