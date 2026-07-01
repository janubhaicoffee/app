# Handoff Report: Modular Dashboard Shell & Sub-Panels Plan

This report contains the layout, structure, and code design recommendations for the Outlet Subdomain Management Dashboard. It details where to place files, how to structure the state to support cross-panel interactions, and how to verify the implementation.

---

## 1. Observation

Based on a read-only investigation of the workspace, the following configurations, paths, and contents were directly observed:
1. **Recharts Dependency**:
   - `package.json` (lines 23-26):
     ```json
     "recharts": "^3.9.0",
     "resend": "^6.14.0"
     ```
   - Running `find_by_name` for `package.json` inside `node_modules/recharts` confirmed that the library is physically installed and ready for import.
2. **Access Control**:
   - `src/components/AdminGuard.js` (lines 6-49): Secures pages by ensuring the user is logged in with Supabase Auth, fetching `/api/admin/data?type=check`, and redirecting to `/auth/login` or `/` if unauthorized.
3. **Admin Layout Example**:
   - `src/app/admin/layout.js` (lines 13-30): Uses `<AdminGuard>` and imports `SidebarNav` and `admin.css` to build a two-column sidebar layout.
4. **Admin Dashboard Example**:
   - `src/app/admin/page.js` (lines 5-12): Shows standard imports from `recharts` (`LineChart`, `Line`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `AreaChart`, `Area`) and `lucide-react`.
5. **No Existing Outlet Files**:
   - Verification command run: `find_by_name` for `*outlet*` pattern returned no application files. No `src/components/outlet/` directory or `src/app/outlet/` directory exists yet.

---

## 2. Logic Chain

1. **Routing and Layout Protection**:
   - Since `/outlet` must only be accessible by authenticated admin users, wrapping `/outlet` sub-pages in `<AdminGuard>` in `src/app/outlet/layout.js` ensures access control is automatically applied.
2. **Modular Components Placement**:
   - Placing modular sub-panels in `src/components/outlet/` follows the structure defined in `PROJECT.md` and keeps the main page component (`src/app/outlet/page.js`) lightweight.
3. **Global State Lifting**:
   - Real-world flows require cross-feature interactions (e.g. accepting a Zomato order must decrement inventory stock levels, record an income transaction in Accounting, and update customer lifetime spend). Lifting state up to `src/app/outlet/page.js` and passing state/handlers down to the modular panels solves this elegantly.
4. **CSS Layout Alignment**:
   - Per styling rules, TailwindCSS is strictly forbidden. We must write standard vanilla CSS (e.g. `src/components/outlet/outlet.css` or inline styles) using the app's predefined CSS custom properties (variables) to maintain visual consistency.
5. **TDD Alignment via `data-testid`**:
   - By proposing exact HTML attributes (`data-testid`) that match the E2E test plan mapped out by other agents, we ensure the implementer can write the components such that tests pass immediately.

---

## 3. Caveats

- **Mocking vs. Real Database Persistence**:
  - The live order simulator, mock security alerts, and camera feeds should be simulated in client-side React state.
  - For customer data, stock levels, and transaction lists, they can initially run on mock state lifted up in the dashboard shell, but should ideally offer functions that synchronize with `/api/admin/data` or Supabase when in production. For testing purposes, full client-side state manipulation satisfies all E2E specs.
- **Vanilla CSS Constraint**:
  - Direct styling using standard React classes and pure CSS must be implemented carefully so that it does not leak into other parts of the application.

---

## 4. Conclusion & Plan

We recommend creating 7 files in total:
- `src/app/outlet/layout.js`: Layout structure that checks authentication.
- `src/app/outlet/page.js`: Main shell acting as the tab manager and global state coordinator.
- `src/components/outlet/outlet.css`: Styling for the dashboard, sidebar, grids, and tables.
- `src/components/outlet/Accounting.jsx`: Transaction list, statistics, and form to add new transactions.
- `src/components/outlet/Surveillance.jsx`: Simulated camera streams, feed status, and mock alert log.
- `src/components/outlet/Operations.jsx`: Inventory stock table, low stock warnings, reorder settings, and staff shifts.
- `src/components/outlet/DeliveryIntegrations.jsx`: Swiggy/Zomato settings, live order feed, and order simulator.
- `src/components/outlet/CustomerProfiling.jsx`: Searchable/filterable table of customer spend and loyalty tiers.

### Recommended File Structure & Components

#### File 1: `src/app/outlet/layout.js`
*   **Purpose**: Protect the route using `AdminGuard` and set basic page metadata.
*   **Code Sketch**:
    ```javascript
    import AdminGuard from "@/components/AdminGuard";

    export const metadata = {
      title: "Outlet Management | Janu Bhai Coffee",
      robots: { index: false, follow: false }
    };

    export default function OutletLayout({ children }) {
      return <AdminGuard>{children}</AdminGuard>;
    }
    ```

#### File 2: `src/app/outlet/page.js`
*   **Purpose**: Maintain global state (transactions, inventory, orders, alerts, customers), render the sidebar tab navigation, and display the active panel.
*   **Shared State Schema**:
    - `transactions`: Array of `{ id, date, type, amount, category, description }`
    - `inventory`: Array of `{ id, name, category, stock, threshold, autoReorder }`
    - `orders`: Array of `{ id, partner, items, total, status, customerName, email }`
    - `alerts`: Array of `{ id, time, message, severity, resolved }`
    - `customers`: Array of `{ id, name, email, phone, visits, spend, tier }`
*   **Mock Data Presets**:
    - *Inventory*: Espresso Beans (15kg, threshold: 5kg), Organic Whole Milk (8L, threshold: 10L [Low Stock]), Paper Cups (150 units, threshold: 100 units).
    - *Transactions*: Revenue and expense logs that update stats and charts.
    - *Customers*: Standard database entries mapping to tiers (Bronze: spend < 1k, Silver: 1k - 5k, Gold: > 5k).
*   **Code Sketch**:
    ```javascript
    "use client";
    import { useState, useEffect } from "react";
    import Link from "next/link";
    import { 
      BarChart3, ShieldAlert, PackageCheck, Truck, Users2, LogOut, RefreshCw, Clock 
    } from "lucide-react";
    import AccountingPanel from "@/components/outlet/Accounting";
    import SurveillancePanel from "@/components/outlet/Surveillance";
    import OperationsPanel from "@/components/outlet/Operations";
    import DeliveryPanel from "@/components/outlet/DeliveryIntegrations";
    import CustomerPanel from "@/components/outlet/CustomerProfiling";
    import "@/components/outlet/outlet.css";

    export default function OutletDashboard() {
      const [activeTab, setActiveTab] = useState("accounting");
      const [syncing, setSyncing] = useState(false);
      const [lastSync, setLastSync] = useState(new Date());

      // Lifted State
      const [transactions, setTransactions] = useState([
        { id: "tx-1", date: "2026-06-28", type: "Income", amount: 450, category: "Store Sale", description: "Walk-in order #1204" },
        { id: "tx-2", date: "2026-06-29", type: "Expense", amount: 600, category: "Supplies", description: "Purchased 10L organic milk" },
        { id: "tx-3", date: "2026-06-29", type: "Income", amount: 380, category: "Delivery", description: "Swiggy order #SW-983" }
      ]);

      const [inventory, setInventory] = useState([
        { id: "prod-1", name: "Premium Espresso Beans", category: "Coffee", stock: 15, threshold: 5, autoReorder: true },
        { id: "prod-2", name: "Organic Whole Milk", category: "Dairy", stock: 8, threshold: 10, autoReorder: true },
        { id: "prod-3", name: "Decaf Coffee Beans", category: "Coffee", stock: 12, threshold: 3, autoReorder: false },
        { id: "prod-4", name: "Paper Cups 250ml", category: "Packaging", stock: 150, threshold: 100, autoReorder: true }
      ]);

      const [orders, setOrders] = useState([]);

      const [alerts, setAlerts] = useState([
        { id: "alert-1", time: "10:15 AM", message: "Motion detected near Back Entrance after hours", severity: "Warning", resolved: true },
        { id: "alert-2", time: "08:30 AM", message: "Roaster temperature exceeded normal range", severity: "Critical", resolved: false },
        { id: "alert-3", time: "06:05 AM", message: "Front Door opened by Aarav Sharma", severity: "Info", resolved: false }
      ]);

      const [customers, setCustomers] = useState([
        { id: "cust-1", name: "Rajesh Patel", email: "rajesh@patel.com", phone: "9876543210", visits: 14, spend: 4200, tier: "Silver" },
        { id: "cust-2", name: "Sneha Reddy", email: "sneha.reddy@gmail.com", phone: "9812345678", visits: 28, spend: 9800, tier: "Gold" },
        { id: "cust-3", name: "Amit Verma", email: "amit.verma@yahoo.com", phone: "9988776655", visits: 3, spend: 850, tier: "Bronze" }
      ]);

      // Cross-Feature Handlers
      const handleAcceptOrder = (orderId, items, amount, customerName, email) => {
        // 1. Update Order Status
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Preparing" } : o));

        // 2. Decrement Inventory Stock based on items
        setInventory(prev => prev.map(item => {
          // Decrement simple stock matches (e.g., if order contains "Espresso" decrease espresso beans)
          if (items.toLowerCase().includes("espresso") && item.id === "prod-1") {
            const nextStock = Math.max(0, item.stock - 1);
            // Trigger auto-reorder log if threshold crossed
            if (nextStock <= item.threshold && item.autoReorder) {
              setAlerts(a => [
                { id: `alert-auto-${Date.now()}`, time: new Date().toLocaleTimeString(), message: `Auto-reorder triggered for ${item.name}`, severity: "Info", resolved: false },
                ...a
              ]);
            }
            return { ...item, stock: nextStock };
          }
          if (items.toLowerCase().includes("milk") && item.id === "prod-2") {
            const nextStock = Math.max(0, item.stock - 2);
            if (nextStock <= item.threshold && item.autoReorder) {
              setAlerts(a => [
                { id: `alert-auto-${Date.now()}`, time: new Date().toLocaleTimeString(), message: `Auto-reorder triggered for ${item.name}`, severity: "Info", resolved: false },
                ...a
              ]);
            }
            return { ...item, stock: nextStock };
          }
          return item;
        }));

        // 3. Add Income Transaction
        const newTx = {
          id: `tx-sim-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          type: "Income",
          amount: amount,
          category: "Delivery",
          description: `Simulated Order #${orderId.slice(-4).toUpperCase()}`
        };
        setTransactions(prev => [newTx, ...prev]);

        // 4. Update Customer Spend Profile
        setCustomers(prev => {
          const exists = prev.find(c => c.email.toLowerCase() === email.toLowerCase());
          if (exists) {
            return prev.map(c => {
              if (c.email.toLowerCase() === email.toLowerCase()) {
                const nextSpend = c.spend + amount;
                const nextTier = nextSpend > 5000 ? "Gold" : nextSpend > 1000 ? "Silver" : "Bronze";
                return { ...c, spend: nextSpend, visits: c.visits + 1, tier: nextTier };
              }
              return c;
            });
          } else {
            return [...prev, {
              id: `cust-${Date.now()}`,
              name: customerName,
              email: email,
              phone: "9999999999",
              visits: 1,
              spend: amount,
              tier: amount > 5000 ? "Gold" : amount > 1000 ? "Silver" : "Bronze"
            }];
          }
        });
      };

      const handleAddTransaction = (newTx) => {
        setTransactions(prev => [newTx, ...prev]);
      };

      const handleResolveAlert = (alertId) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
      };

      const handleUpdateReorder = (prodId, updates) => {
        setInventory(prev => prev.map(item => item.id === prodId ? { ...item, ...updates } : item));
      };

      return (
        <div className="outlet-layout">
          <aside className="outlet-sidebar">
            <div className="outlet-brand">
              <h2>Janu Bhai</h2>
              <p>Outlet Management</p>
            </div>
            <nav className="outlet-nav">
              <button 
                onClick={() => setActiveTab("accounting")} 
                className={`outlet-nav-link ${activeTab === "accounting" ? "active" : ""}`}
                data-testid="tab-accounting"
              >
                <BarChart3 size={20} /> Accounting & Growth
              </button>
              <button 
                onClick={() => setActiveTab("surveillance")} 
                className={`outlet-nav-link ${activeTab === "surveillance" ? "active" : ""}`}
                data-testid="tab-surveillance"
              >
                <ShieldAlert size={20} /> Surveillance & Security
              </button>
              <button 
                onClick={() => setActiveTab("operations")} 
                className={`outlet-nav-link ${activeTab === "operations" ? "active" : ""}`}
                data-testid="tab-operations"
              >
                <PackageCheck size={20} /> Operations & Stock
              </button>
              <button 
                onClick={() => setActiveTab("delivery")} 
                className={`outlet-nav-link ${activeTab === "delivery" ? "active" : ""}`}
                data-testid="tab-delivery"
              >
                <Truck size={20} /> Partner Integrations
              </button>
              <button 
                onClick={() => setActiveTab("customers")} 
                className={`outlet-nav-link ${activeTab === "customers" ? "active" : ""}`}
                data-testid="tab-customers"
              >
                <Users2 size={20} /> Customer Profiling
              </button>
            </nav>
            <div className="outlet-sidebar-footer">
              <Link href="/" className="outlet-nav-link text-danger" data-testid="exit-outlet-btn">
                <LogOut size={20} /> Exit Dashboard
              </Link>
            </div>
          </aside>

          <main className="outlet-main">
            <header className="outlet-header">
              <div>
                <h1>Outlet Subdomain Dashboard</h1>
                <p>Real-time terminal operations</p>
              </div>
              <div className="sync-indicator">
                <Clock size={14} />
                <span>Last sync: {lastSync.toLocaleTimeString()}</span>
                <span className="live-badge">
                  <RefreshCw size={12} className={syncing ? "spin" : ""} />
                  Live
                </span>
              </div>
            </header>

            <div className="panel-container">
              {activeTab === "accounting" && (
                <AccountingPanel 
                  transactions={transactions} 
                  onAddTransaction={handleAddTransaction} 
                />
              )}
              {activeTab === "surveillance" && (
                <SurveillancePanel 
                  alerts={alerts} 
                  onResolve={handleResolveAlert}
                  onAddAlert={(newAlert) => setAlerts(prev => [newAlert, ...prev])}
                />
              )}
              {activeTab === "operations" && (
                <OperationsPanel 
                  inventory={inventory} 
                  onUpdateReorder={handleUpdateReorder}
                />
              )}
              {activeTab === "delivery" && (
                <DeliveryPanel 
                  orders={orders}
                  setOrders={setOrders}
                  onAccept={handleAcceptOrder}
                />
              )}
              {activeTab === "customers" && (
                <CustomerPanel 
                  customers={customers}
                />
              )}
            </div>
          </main>
        </div>
      );
    }
    ```

#### File 3: `src/components/outlet/Accounting.jsx`
*   **Purpose**: Renders visual statistics, a Recharts chart, and transaction logs. Contains the Add Transaction form.
*   **Selectors**:
    - Metrics: `[data-testid="stat-revenue"]`, `[data-testid="stat-growth"]`, `[data-testid="stat-profit"]`
    - Chart: `[data-testid="growth-chart"]`
    - Form: `[data-testid="transaction-form"]`
    - Inputs: `[data-testid="field-amount"]`, `[data-testid="field-category"]`, `[data-testid="field-type"]`, `[data-testid="field-description"]`
    - Actions: `[data-testid="btn-add-transaction"]`
*   **Code Sketch**:
    ```javascript
    import { useState } from "react";
    import { 
      ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
    } from "recharts";
    import { TrendingUp, ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react";

    export default function AccountingPanel({ transactions, onAddTransaction }) {
      const [amount, setAmount] = useState("");
      const [category, setCategory] = useState("Store Sale");
      const [type, setType] = useState("Income");
      const [description, setDescription] = useState("");

      const totalRevenue = transactions
        .filter(t => t.type === "Income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = transactions
        .filter(t => t.type === "Expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const netProfit = totalRevenue - totalExpenses;

      const handleAdd = (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return;
        const newTx = {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          type,
          amount: parseFloat(amount),
          category,
          description: description || "General Transaction"
        };
        onAddTransaction(newTx);
        setAmount("");
        setDescription("");
      };

      // Format Recharts data dynamically from transactions list
      const chartData = [...transactions]
        .reverse()
        .reduce((acc, t) => {
          const date = t.date;
          const existing = acc.find(item => item.date === date);
          const val = t.type === "Income" ? t.amount : -t.amount;
          if (existing) {
            existing.profit += val;
          } else {
            acc.push({ date, profit: val });
          }
          return acc;
        }, []);

      return (
        <div data-testid="accounting-panel">
          <div className="stats-grid">
            <div className="stat-card green">
              <h3>Total Revenue</h3>
              <p className="stat-value" data-testid="stat-revenue">₹{totalRevenue.toLocaleString()}</p>
              <span className="stat-sub"><ArrowUpRight size={12} /> Live stream sales</span>
            </div>
            <div className="stat-card red">
              <h3>Total Expenses</h3>
              <p className="stat-value">₹{totalExpenses.toLocaleString()}</p>
              <span className="stat-sub"><ArrowDownRight size={12} /> Supplies & operations</span>
            </div>
            <div className="stat-card gold">
              <h3>Net Profit</h3>
              <p className="stat-value" data-testid="stat-profit">₹{netProfit.toLocaleString()}</p>
              <span className="stat-sub" data-testid="stat-growth">Growth Margin</span>
            </div>
          </div>

          <div className="charts-grid">
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>Net Profit Trend</h2>
                <TrendingUp size={18} />
              </div>
              <div style={{ width: '100%', height: 260 }} data-testid="growth-chart">
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, "Net profit"]} />
                    <Area type="monotone" dataKey="profit" stroke="#2e7d32" fill="#d4edda" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2>Record Transaction</h2>
              </div>
              <form onSubmit={handleAdd} data-testid="transaction-form" className="outlet-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value)}
                      data-testid="field-type"
                    >
                      <option value="Income">Income</option>
                      <option value="Expense">Expense</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input 
                      type="number" 
                      required 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 500"
                      data-testid="field-amount"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    data-testid="field-category"
                  >
                    <option value="Store Sale">Store Sale</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input 
                    type="text" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter details..."
                    data-testid="field-description"
                  />
                </div>
                <button type="submit" className="admin-btn" data-testid="btn-add-transaction">
                  Add Entry
                </button>
              </form>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h2>Transaction Ledger</h2>
            </div>
            {transactions.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} data-testid="transaction-row">
                      <td>{t.date}</td>
                      <td>{t.description}</td>
                      <td>{t.category}</td>
                      <td>
                        <span className={`status-badge ${t.type.toLowerCase()}`}>
                          {t.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {t.type === "Income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state" data-testid="empty-transactions">
                <h3>No transactions recorded</h3>
              </div>
            )}
          </div>
        </div>
      );
    }
    ```

#### File 4: `src/components/outlet/Surveillance.jsx`
*   **Purpose**: Renders the 4 simulated camera feeds, allows toggling stream states, adding camera configurations, and managing live alert notifications.
*   **Selectors**:
    - Container: `[data-testid="surveillance-panel"]`
    - Feed: `[data-testid="stream-player"]`
    - Status: `[data-testid="stream-status"]`
    - Form: `[data-testid="camera-form"]`
    - Alerts: `[data-testid="alert-feed"]`, `[data-testid="alert-item"]`
    - Actions: `[data-testid="btn-resolve-alert"]`, `[data-testid="btn-add-camera"]`
*   **Code Sketch**:
    ```javascript
    import { useState } from "react";
    import { Camera, VideoOff, Plus, AlertCircle, CheckCircle } from "lucide-react";

    export default function SurveillancePanel({ alerts, onResolve, onAddAlert }) {
      const [cameras, setCameras] = useState([
        { id: "cam-1", name: "Front Counter", url: "rtmp://outlet.live/front_counter", active: true },
        { id: "cam-2", name: "Brewing Station", url: "rtmp://outlet.live/brewing_station", active: true },
        { id: "cam-3", name: "Inventory Room", url: "rtmp://outlet.live/inventory", active: true },
        { id: "cam-4", name: "Back Entrance", url: "rtmp://outlet.live/back_entrance", active: true }
      ]);
      const [newCamName, setNewCamName] = useState("");
      const [newCamUrl, setNewCamUrl] = useState("");
      const [muted, setMuted] = useState(false);

      const handleAddCamera = (e) => {
        e.preventDefault();
        if (!newCamName || !newCamUrl) return;
        setCameras(prev => [
          ...prev, 
          { id: `cam-${Date.now()}`, name: newCamName, url: newCamUrl, active: true }
        ]);
        setNewCamName("");
        setNewCamUrl("");
      };

      const toggleCamera = (camId) => {
        setCameras(prev => prev.map(c => c.id === camId ? { ...c, active: !c.active } : c));
      };

      return (
        <div data-testid="surveillance-panel">
          <div className="surveillance-grid">
            <div className="camera-grid">
              {cameras.map(c => (
                <div key={c.id} className="camera-card" data-testid="stream-player">
                  <div className={`camera-viewscreen ${c.active ? "active-feed" : "static-feed"}`}>
                    {c.active ? (
                      <div className="stream-canvas">
                        <div className="scanline" />
                        <span className="live-dot" />
                        <span className="camera-label">{c.name} (LIVE)</span>
                      </div>
                    ) : (
                      <div className="stream-offline">
                        <VideoOff size={32} />
                        <span>Connection Lost</span>
                      </div>
                    )}
                  </div>
                  <div className="camera-controls">
                    <div>
                      <h4>{c.name}</h4>
                      <p className="sub-text">{c.url}</p>
                    </div>
                    <button 
                      onClick={() => toggleCamera(c.id)} 
                      className={`status-badge-btn ${c.active ? "active" : "offline"}`}
                      data-testid={`toggle-stream-${c.id}`}
                    >
                      <span data-testid="stream-status">{c.active ? "Active" : "Paused"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="surveillance-sidebar">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h2>Security Alerts</h2>
                  <button 
                    onClick={() => setMuted(!muted)} 
                    className="admin-btn admin-btn-sm"
                    data-testid="mute-alerts-btn"
                  >
                    {muted ? "Unmute" : "Mute Alerts"}
                  </button>
                </div>
                <div className="alert-feed-container" data-testid="alert-feed">
                  {alerts.length > 0 ? (
                    alerts.map(a => (
                      <div 
                        key={a.id} 
                        className={`alert-item ${a.severity.toLowerCase()} ${a.resolved ? "resolved" : ""}`}
                        data-testid="alert-item"
                      >
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <AlertCircle size={16} />
                          <div>
                            <p className="alert-text">{a.message}</p>
                            <span className="alert-time">{a.time} • {a.severity}</span>
                          </div>
                        </div>
                        {!a.resolved && (
                          <button 
                            onClick={() => onResolve(a.id)} 
                            className="resolve-btn"
                            data-testid="btn-resolve-alert"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-state" data-testid="empty-alerts">
                      <p>All systems secure. No active threats.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <h2>Add Camera Feed</h2>
                </div>
                <form onSubmit={handleAddCamera} data-testid="camera-form" className="outlet-form">
                  <div className="form-group">
                    <label>Camera Name</label>
                    <input 
                      type="text" 
                      required 
                      value={newCamName} 
                      onChange={(e) => setNewCamName(e.target.value)}
                      placeholder="e.g. Brewing Station 2"
                      data-testid="camera-name-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stream RTMP URL</label>
                    <input 
                      type="text" 
                      required 
                      value={newCamUrl} 
                      onChange={(e) => setNewCamUrl(e.target.value)}
                      placeholder="rtmp://..."
                      data-testid="camera-url-input"
                    />
                  </div>
                  <button type="submit" className="admin-btn" data-testid="btn-add-camera">
                    Add Camera
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }
    ```

#### File 5: `src/components/outlet/Operations.jsx`
*   **Purpose**: Renders the stock levels table, highlights products below reorder thresholds, allows inline modifications to threshold levels, and logs daily staff schedules.
*   **Selectors**:
    - Container: `[data-testid="operations-panel"]`
    - Table: `[data-testid="stock-table"]`, Row: `[data-testid="stock-row"]`
    - Alert Badge: `[data-testid="stock-alert-badge"]`
    - Edit Trigger: `[data-testid="btn-save-reorder"]`
*   **Code Sketch**:
    ```javascript
    import { useState } from "react";
    import { AlertTriangle, ShieldCheck, UserCheck, Calendar } from "lucide-react";

    export default function OperationsPanel({ inventory, onUpdateReorder }) {
      const [staff] = useState([
        { id: "st-1", name: "Aarav Sharma", shift: "06:00 - 14:00", role: "Head Barista", status: "Present" },
        { id: "st-2", name: "Ishaan Patel", shift: "08:00 - 16:00", role: "Cashier", status: "Present" },
        { id: "st-3", name: "Ananya Iyer", shift: "14:00 - 22:00", role: "Junior Barista", status: "Scheduled" }
      ]);

      const handleThresholdChange = (prodId, val) => {
        onUpdateReorder(prodId, { threshold: parseInt(val) || 0 });
      };

      const handleToggleAuto = (prodId, val) => {
        onUpdateReorder(prodId, { autoReorder: val });
      };

      return (
        <div data-testid="operations-panel">
          <div className="operations-grid">
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>Real-Time Inventory Stock Levels</h2>
              </div>
              <table className="admin-table" data-testid="stock-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Reorder Threshold</th>
                    <th>Auto-Reorder</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => {
                    const isLow = item.stock <= item.threshold;
                    return (
                      <tr key={item.id} data-testid="stock-row" className={isLow ? "row-warning" : ""}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>{item.category}</td>
                        <td style={{ fontWeight: 700 }} className={isLow ? "text-danger" : ""}>
                          {item.stock}
                        </td>
                        <td>
                          <input 
                            type="number" 
                            value={item.threshold} 
                            onChange={(e) => handleThresholdChange(item.id, e.target.value)}
                            className="threshold-input"
                            data-testid={`reorder-input-${item.id}`}
                          />
                        </td>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={item.autoReorder}
                            onChange={(e) => handleToggleAuto(item.id, e.target.checked)}
                            data-testid={`auto-reorder-toggle-${item.id}`}
                          />
                        </td>
                        <td>
                          {isLow ? (
                            <span className="status-badge expense" data-testid="stock-alert-badge">
                              <AlertTriangle size={10} style={{ marginRight: 4 }} /> Low Stock
                            </span>
                          ) : (
                            <span className="status-badge income">
                              <ShieldCheck size={10} style={{ marginRight: 4 }} /> Healthy
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2>Staff Schedule & Roster</h2>
                <Calendar size={18} />
              </div>
              <table className="admin-table" data-testid="staff-schedule-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th>Shift</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.role}</td>
                      <td>{s.shift}</td>
                      <td>
                        <span className={`status-badge ${s.status === "Present" ? "income" : "pending"}`}>
                          <UserCheck size={10} style={{ marginRight: 4 }} /> {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    ```

#### File 6: `src/components/outlet/DeliveryIntegrations.jsx`
*   **Purpose**: Simulates Swiggy and Zomato active toggles, contains inputs for partner credential updates, and includes a simulator that feeds order cards into a live stream.
*   **Selectors**:
    - Switches: `[data-testid="swiggy-toggle"]`, `[data-testid="zomato-toggle"]`
    - Keys: `[data-testid="swiggy-api-id"]`, `[data-testid="swiggy-api-secret"]`, `[data-testid="zomato-api-key"]`
    - Action Accept: `[data-testid^="accept-order-"]`, Reject: `[data-testid^="reject-order-"]`
    - Feed Container: `[data-testid="incoming-orders-panel"]`
*   **Code Sketch**:
    ```javascript
    import { useState } from "react";
    import { Play, ToggleLeft, ToggleRight, Key } from "lucide-react";

    export default function DeliveryPanel({ orders, setOrders, onAccept }) {
      const [swiggyActive, setSwiggyActive] = useState(false);
      const [zomatoActive, setZomatoActive] = useState(false);
      
      const [swiggyCreds, setSwiggyCreds] = useState({ id: "", secret: "" });
      const [zomatoKey, setZomatoKey] = useState("");

      const handleSimulateOrder = () => {
        if (!swiggyActive && !zomatoActive) {
          alert("Please activate at least one integration to receive orders.");
          return;
        }

        const partners = [];
        if (swiggyActive) partners.push("Swiggy");
        if (zomatoActive) partners.push("Zomato");

        const randPartner = partners[Math.floor(Math.random() * partners.length)];
        const orderId = `ord-${Date.now().toString().slice(-6)}`;
        
        // Random items
        const menuItems = [
          { name: "2x Premium Espresso Beans", cost: 1200 },
          { name: "1x Organic Whole Milk, 1x Espresso Blend", cost: 950 },
          { name: "1x Instant Coffee Jar", cost: 350 }
        ];
        const selected = menuItems[Math.floor(Math.random() * menuItems.length)];

        const customersSim = [
          { name: "Rajesh Patel", email: "rajesh@patel.com" },
          { name: "Sneha Reddy", email: "sneha.reddy@gmail.com" },
          { name: "Kunal Sen", email: "kunal.sen@gmail.com" }
        ];
        const selectedCust = customersSim[Math.floor(Math.random() * customersSim.length)];

        const newOrder = {
          id: orderId,
          partner: randPartner,
          items: selected.name,
          total: selected.cost,
          status: "Pending",
          customerName: selectedCust.name,
          email: selectedCust.email
        };

        setOrders(prev => [newOrder, ...prev]);
      };

      const handleReject = (orderId) => {
        const reason = prompt("Enter reason for rejection:");
        if (reason === null) return; // cancelled prompt
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Declined", rejectReason: reason } : o));
      };

      return (
        <div data-testid="delivery-panel">
          <div className="operations-grid">
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>Platform Integration Settings</h2>
              </div>
              <div className="integration-cards">
                <div className="partner-card">
                  <div className="partner-card-header">
                    <h3>Swiggy</h3>
                    <button 
                      onClick={() => setSwiggyActive(!swiggyActive)}
                      className={`toggle-btn ${swiggyActive ? "active" : ""}`}
                      data-testid="swiggy-toggle"
                    >
                      {swiggyActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                  </div>
                  <div className="partner-form">
                    <div className="form-group">
                      <label>Client ID</label>
                      <input 
                        type="text" 
                        value={swiggyCreds.id} 
                        onChange={(e) => setSwiggyCreds(prev => ({ ...prev, id: e.target.value }))}
                        placeholder="SW-ID-xxxx" 
                        data-testid="swiggy-api-id"
                      />
                    </div>
                    <div className="form-group">
                      <label>Client Secret</label>
                      <input 
                        type="password" 
                        value={swiggyCreds.secret} 
                        onChange={(e) => setSwiggyCreds(prev => ({ ...prev, secret: e.target.value }))}
                        placeholder="••••••••••••••" 
                        data-testid="swiggy-api-secret"
                      />
                    </div>
                  </div>
                </div>

                <div className="partner-card">
                  <div className="partner-card-header">
                    <h3>Zomato</h3>
                    <button 
                      onClick={() => setZomatoActive(!zomatoActive)}
                      className={`toggle-btn ${zomatoActive ? "active" : ""}`}
                      data-testid="zomato-toggle"
                    >
                      {zomatoActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                  </div>
                  <div className="partner-form">
                    <div className="form-group">
                      <label>API Key</label>
                      <input 
                        type="password" 
                        value={zomatoKey} 
                        onChange={(e) => setZomatoKey(e.target.value)}
                        placeholder="ZO-KEY-xxxx" 
                        data-testid="zomato-api-key"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2>Incoming Delivery Orders Feed</h2>
                <button 
                  onClick={handleSimulateOrder} 
                  className="admin-btn admin-btn-success"
                  data-testid="simulate-order-btn"
                >
                  <Play size={14} /> Simulate Order
                </button>
              </div>
              <div className="orders-feed-container" data-testid="incoming-orders-panel">
                {orders.length > 0 ? (
                  orders.map(o => (
                    <div key={o.id} className={`order-feed-card ${o.status.toLowerCase()}`}>
                      <div className="order-feed-header">
                        <span className={`partner-label ${o.partner.toLowerCase()}`}>{o.partner}</span>
                        <span className="order-id">#{o.id.toUpperCase()}</span>
                      </div>
                      <div className="order-feed-body">
                        <p className="order-items">{o.items}</p>
                        <p className="order-total">Total: ₹{o.total}</p>
                        <p className="order-cust">Cust: {o.customerName}</p>
                        <p className="order-status-lbl">Status: {o.status}</p>
                      </div>
                      {o.status === "Pending" && (
                        <div className="order-actions">
                          <button 
                            onClick={() => onAccept(o.id, o.items, o.total, o.customerName, o.email)} 
                            className="order-btn-accept"
                            data-testid={`accept-order-${o.id}`}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleReject(o.id)} 
                            className="order-btn-reject"
                            data-testid={`reject-order-${o.id}`}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No active delivery orders. Activate channels and trigger simulator.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    ```

#### File 7: `src/components/outlet/CustomerProfiling.jsx`
*   **Purpose**: Renders the table of customer profiles, provides text filters for searches, and tier filters to separate Gold, Silver, and Bronze members.
*   **Selectors**:
    - Container: `[data-testid="customer-profile-panel"]`
    - Search: `[data-testid="customer-search-input"]`
    - Table: `[data-testid="customer-registry-table"]`
*   **Code Sketch**:
    ```javascript
    import { useState } from "react";
    import { Search, UserPlus } from "lucide-react";

    export default function CustomerPanel({ customers }) {
      const [searchTerm, setSearchTerm] = useState("");
      const [tierFilter, setTierFilter] = useState("All");

      // Filter and Search logic
      const filteredCustomers = customers.filter(c => {
        const matchesSearch = 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.phone.includes(searchTerm);
        
        const matchesTier = tierFilter === "All" || c.tier === tierFilter;
        return matchesSearch && matchesTier;
      });

      return (
        <div data-testid="customer-profile-panel">
          <div className="admin-toolbar">
            <div className="admin-search">
              <Search size={16} />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                data-testid="customer-search-input"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <select 
                value={tierFilter} 
                onChange={(e) => setTierFilter(e.target.value)}
                style={{ padding: '0.45rem 1rem', borderRadius: '6px' }}
              >
                <option value="All">All Loyalty Tiers</option>
                <option value="Gold">Gold Tier</option>
                <option value="Silver">Silver Tier</option>
                <option value="Bronze">Bronze Tier</option>
              </select>
            </div>
          </div>

          <div className="admin-card">
            <table className="admin-table" data-testid="customer-registry-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Contact Info</th>
                  <th>Visits</th>
                  <th>Lifetime Spend</th>
                  <th>Loyalty Tier</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(c => (
                    <tr key={c.id} data-testid="customer-row">
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>
                        <div>{c.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.phone}</div>
                      </td>
                      <td>{c.visits}</td>
                      <td style={{ fontWeight: 600 }}>₹{c.spend.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${c.tier.toLowerCase()}`}>
                          {c.tier}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No customer profiles matched the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    ```

#### File 8: `src/components/outlet/outlet.css`
*   **Purpose**: Contain all custom styles using vanilla CSS. Avoid style leakage by scoping rules under `.outlet-layout`.
*   **Style Definitions**:
    ```css
    /* Scope styles within .outlet-layout container */
    .outlet-layout {
      display: flex;
      min-height: 100vh;
      background-color: #fcfbfa;
    }

    .outlet-sidebar {
      width: 260px;
      background-color: var(--primary-color, #3e2723);
      color: #fff;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(0,0,0,0.1);
    }

    .outlet-brand {
      padding: 2rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .outlet-brand h2 {
      font-family: var(--font-playfair);
      color: var(--accent-gold, #d4af37);
      margin: 0;
      font-size: 1.5rem;
    }

    .outlet-brand p {
      color: rgba(255,255,255,0.5);
      font-size: 0.75rem;
      margin: 0.25rem 0 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .outlet-nav {
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex-grow: 1;
    }

    .outlet-nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: rgba(255,255,255,0.7);
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .outlet-nav-link:hover, .outlet-nav-link.active {
      background-color: rgba(255,255,255,0.08);
      color: var(--accent-gold, #d4af37);
    }

    .outlet-sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.05);
    }

    .outlet-main {
      flex-grow: 1;
      padding: 2rem 3rem;
      height: 100vh;
      overflow-y: auto;
    }

    .outlet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 1rem;
    }

    .outlet-header h1 {
      font-family: var(--font-playfair);
      color: var(--primary-color, #3e2723);
      margin: 0;
      font-size: 1.8rem;
    }

    .sync-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background-color: #d4edda;
      color: #155724;
      padding: 0.25rem 0.5rem;
      border-radius: 20px;
      font-weight: 600;
    }

    .surveillance-grid, .operations-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 1.5rem;
    }

    .camera-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .camera-card {
      background: #fff;
      border-radius: 8px;
      border: 1px solid #ddd;
      overflow: hidden;
    }

    .camera-viewscreen {
      height: 160px;
      background: #000;
      position: relative;
    }

    .camera-viewscreen.active-feed {
      background: radial-gradient(circle, #222 0%, #000 100%);
    }

    .stream-canvas {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .scanline {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
      background-size: 100% 4px, 6px 100%;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      background: #ff0000;
      border-radius: 50%;
      position: absolute;
      top: 10px;
      right: 10px;
      animation: pulse 1s infinite alternate;
    }

    .camera-label {
      position: absolute;
      bottom: 10px;
      left: 10px;
      color: #00ff00;
      font-family: monospace;
      font-size: 0.75rem;
    }

    .stream-offline {
      color: #ff6b6b;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 0.5rem;
    }

    .camera-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-top: 1px solid #ddd;
    }

    .camera-controls h4 {
      margin: 0;
      font-size: 0.85rem;
    }

    .sub-text {
      font-size: 0.7rem;
      color: #888;
      margin: 0.15rem 0 0;
    }

    .alert-feed-container {
      max-height: 250px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .alert-item {
      padding: 0.65rem 0.75rem;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .alert-item.info { background-color: #e2f0d9; color: #385723; }
    .alert-item.warning { background-color: #fff2cc; color: #7f6000; }
    .alert-item.critical { background-color: #fce4d6; color: #c65911; }
    .alert-item.resolved { opacity: 0.5; }

    .resolve-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
    }

    .integration-cards {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .partner-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
    }

    .partner-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .partner-card-header h3 { margin: 0; font-size: 1rem; }

    .partner-form {
      display: flex;
      gap: 1rem;
    }

    .orders-feed-container {
      max-height: 400px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .order-feed-card {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 1rem;
      background: #fbfbfb;
    }

    .order-feed-card.preparing { border-left: 4px solid #0056b3; }
    .order-feed-card.declined { border-left: 4px solid #c62828; opacity: 0.6; }

    .order-feed-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .partner-label.swiggy { color: #fc8019; }
    .partner-label.zomato { color: #cb202d; }

    .order-items { font-weight: 600; margin: 0; }
    .order-total { font-size: 0.8rem; margin: 0.2rem 0; }

    .order-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .order-btn-accept {
      background-color: #2e7d32;
      color: white;
      border: none;
      padding: 0.35rem 0.75rem;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
    }

    .order-btn-reject {
      background-color: #c62828;
      color: white;
      border: none;
      padding: 0.35rem 0.75rem;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
    }

    .threshold-input {
      width: 60px;
      padding: 0.2rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      text-align: center;
    }

    .status-badge.income { background-color: #d4edda; color: #155724; }
    .status-badge.expense { background-color: #f8d7da; color: #721c24; }
    .status-badge.pending { background-color: #fff3cd; color: #856404; }

    .status-badge.gold { background-color: #fff3cd; color: #b58900; }
    .status-badge.silver { background-color: #e6e6e6; color: #555; }
    .status-badge.bronze { background-color: #fbe5d6; color: #a54f15; }

    .row-warning {
      background-color: #fff3cd !important;
    }

    @keyframes pulse {
      from { opacity: 0.4; }
      to { opacity: 1; }
    }
    ```

---

## 5. Verification Method

To verify the implementation meets the specifications:
1. **Component Placement**:
   - Ensure the files exist at their relative paths:
     - `src/app/outlet/layout.js`
     - `src/app/outlet/page.js`
     - `src/components/outlet/Accounting.jsx`
     - `src/components/outlet/Surveillance.jsx`
     - `src/components/outlet/Operations.jsx`
     - `src/components/outlet/DeliveryIntegrations.jsx`
     - `src/components/outlet/CustomerProfiling.jsx`
     - `src/components/outlet/outlet.css`
2. **Recharts Check**:
   - Ensure Recharts is imported inside `Accounting.jsx` and draws graphs on the page load without throwing React hydration or runtime exceptions.
3. **Selector Coverage check**:
   - Spot-check key HTML elements in each component to confirm they contain the corresponding `data-testid` attributes.
4. **E2E Test Execution**:
   - Run the Playwright test suite command:
     ```bash
     npx playwright test tests/outlet_dashboard.spec.js
     ```
   - All tests associated with subdomain routing, AdminGuard authorization, and modular sub-panel features must pass.
