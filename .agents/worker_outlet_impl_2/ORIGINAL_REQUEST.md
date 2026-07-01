## 2026-06-30T05:40:40Z
Implement the Outlet Subdomain Management project with real Supabase database and API connections (no mocks).
Our working directory is: c:\Users\hudav\Documents\GitHub\app\.agents\worker_outlet_impl_2

1. Supabase Database Schema:
   Create these tables if they do not exist:
   - 'outlet_transactions': id (uuid, default gen_random_uuid(), primary key), date (date), type (text), amount (numeric), category (text), description (text), created_at (timestamp with time zone default now())
   - 'outlet_cameras': id (uuid, default gen_random_uuid(), primary key), name (text), url (text), active (boolean), created_at (timestamp with time zone default now())
   - 'outlet_alerts': id (uuid, default gen_random_uuid(), primary key), time (text), message (text), severity (text), resolved (boolean), created_at (timestamp with time zone default now())
   - 'outlet_inventory': id (uuid, default gen_random_uuid(), primary key), name (text), category (text), stock (integer), threshold (integer), auto_reorder (boolean), created_at (timestamp with time zone default now())
   - 'outlet_staff_schedules': id (uuid, default gen_random_uuid(), primary key), name (text), role (text), shift (text), status (text), created_at (timestamp with time zone default now())
   - 'outlet_delivery_keys': id (text, primary key - 'swiggy' or 'zomato'), client_id (text), client_secret (text), api_key (text), active (boolean), updated_at (timestamp with time zone default now())
   - 'outlet_delivery_orders': id (uuid, default gen_random_uuid(), primary key), partner (text), items (text), total (numeric), status (text - pending/preparing/declined), customer_name (text), customer_email (text), coupon_used (text), created_at (timestamp with time zone default now())
   - 'outlet_customers': id (uuid, default gen_random_uuid(), primary key), name (text), email (text), phone (text), visits (integer), spend (numeric), tier (text), created_at (timestamp with time zone default now())

2. Real API routes:
   Implement Next.js API endpoints under 'src/app/api/outlet/...' or 'src/app/api/integrations/...' interfacing directly with the database tables.
   - GET/POST on '/api/outlet/transactions': fetch/add transaction.
   - GET/POST/PATCH on '/api/outlet/inventory': fetch stock, update thresholds.
   - GET/POST/PATCH on '/api/outlet/cameras': fetch/add cameras, toggle status.
   - GET/POST/PATCH on '/api/outlet/alerts': fetch alerts, resolve alerts.
   - GET/POST on '/api/outlet/customers': fetch customers, add/update profiles.
   - GET on '/api/outlet/staff': fetch schedules.
   - GET/POST/PATCH on '/api/integrations/delivery': manage swiggy/zomato credentials and active status.
   - POST on '/api/integrations/orders': webhook to receive new orders. Should:
     - insert into 'outlet_delivery_orders'.
     - decrement stock in 'outlet_inventory' for matched item. If stock <= threshold and auto_reorder is true, trigger auto-reorder (record in audit logs or alerts table).
     - insert into 'outlet_transactions' if accepted.
     - insert/update profile in 'outlet_customers'.

3. Subdomain middleware rewrite & auth protection:
   - Middleware/Proxy: Update 'src/proxy.js' to rewrite 'outlet.janubhai.com' (and local equivalents) to '/outlet', preserving security headers and forwarding host.
   - Auth Guard: '/outlet/layout.js' protects the dashboard via 'AdminGuard' client check and token verification against 'SUPERADMIN_EMAILS' in '/api/admin/data?type=check'.

4. Real Modular Dashboard Components under '/outlet' and 'src/components/outlet/':
   - Update 'Accounting.jsx', 'Surveillance.jsx', 'Operations.jsx', 'DeliveryIntegrations.jsx', 'CustomerProfiling.jsx', and 'page.js' to make real fetch calls.
   - Recharts must display real profit trend from transactions.
   - Surveillance must render a real HTML5 video element or HLS player loading the camera stream URL.
   - Listen for custom events on window.

5. Verify E2E tests:
   Run: npx playwright test tests/outlet_dashboard.spec.js
   Ensure all 82 tests pass successfully.
