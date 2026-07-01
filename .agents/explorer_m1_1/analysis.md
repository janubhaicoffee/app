# Analysis & Rewrite Strategy: Outlet Management E2E Test Suite

## Executive Summary
This report analyzes the existing code and database schema state for the Outlet Subdomain Management project (Milestone 1). The investigation revealed that all 8 database tables specified in `PROJECT.md` are completely missing from the Supabase database. The current E2E test suite in `tests/outlet_dashboard.spec.js` relies heavily on client-side and network-level mocks via Playwright's `page.route` and browser-side custom window events. 

To transition the test suite to use a real database and real API requests, we propose:
1. Running migrations to create the 8 required tables.
2. Implementing 6 real backend API routes connecting to the Supabase database.
3. Refactoring the frontend dashboard page to include Bearer tokens in its fetch calls and query the new modular endpoints.
4. Rewriting the Playwright test suite to perform automated database seeding/cleanup using the Supabase Service Role Key and trigger webhooks via HTTP rather than dispatching mocked window events.

---

## 1. Playwright Test Mocking Analysis (`tests/outlet_dashboard.spec.js`)
We examined the Playwright test suite and identified two main types of mocking:

### A. Auth Token Mocking
In the `test.beforeEach` block, the test suite injects a simulated Supabase Auth session token into the browser's `localStorage`:
```javascript
const mockSession = {
  access_token: 'dummy-token-jwt-superadmin',
  refresh_token: 'dummy-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: 'mock-admin-uuid',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'admin@janubhaicoffee.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
};
window.localStorage.setItem('sb-fheddjuiedseynqxhsfb-auth-token', JSON.stringify(mockSession));
```
*Note:* The key `sb-fheddjuiedseynqxhsfb-auth-token` contains the Supabase project ID `fheddjuiedseynqxhsfb` matching the URL in `.env.local`.

### B. Network Intercepts (`page.route`)
The test intercepts multiple API endpoints to simulate backend responses:
1. `**/auth/v1/user` -> returns a status `200` with the simulated admin user payload.
2. `**/api/admin/data*` -> handles the main data requests:
   - `type === 'check'` -> returns `{ isAdmin: true }` or `{ isAdmin: false }` based on mock email logic.
   - `type === 'dashboard' || !type` -> returns static dashboard metrics (products, customers, orders, revenue, chartData, lowStockAlerts).
   - `type === 'customers'` -> returns static customer profiles (Ramesh Kumar, Suresh Patel, Priya Sharma) for the customer registry.
   - `POST` methods -> returns `{ success: true, message: 'Operation successful' }` for all actions (adding transactions, saving settings, resolving alerts, etc.).

### C. Browser Event Dispatching
Because there is no backend routing or realtime updates implemented, the tests simulate events by dispatching custom window events to update the React state:
- `incoming-delivery-order` (to simulate orders arriving via Swiggy/Zomato webhooks).
- `security-alert` (to simulate motion detection alerts on surveillance cameras).
- `inventory-replenished` (to simulate restocked inventory).
- `storage` (to trigger auth session token verification).

---

## 2. Database Schema State Verification
A temporary Node script `check_outlet_schema.js` was executed to query the Supabase database using the credentials from `.env.local`. 

The Supabase REST API returned a `PGRST205` error for all 8 tables, indicating that **none of them are currently present in the schema cache**:
- `outlet_transactions` ❌ (Missing)
- `outlet_cameras` ❌ (Missing)
- `outlet_alerts` ❌ (Missing)
- `outlet_inventory` ❌ (Missing)
- `outlet_staff_schedules` ❌ (Missing)
- `outlet_delivery_keys` ❌ (Missing)
- `outlet_delivery_orders` ❌ (Missing)
- `outlet_customers` ❌ (Missing)

*Action required:* The SQL DDL commands specified in `PROJECT.md` must be run against the database to create these tables (Milestone 1 execution).

---

## 3. API Routes Analysis (`src/app/api`)
There are currently **no API routes** for the outlet dashboard (neither `/api/outlet/*` nor `/api/integrations/*` exist). 

Furthermore, our examination of `src/app/outlet/page.js` revealed:
1. The frontend still requests data from `/api/admin/data?type=dashboard` and `/api/admin/data?type=customers` instead of the specified `/api/outlet/...` endpoints.
2. The fetch calls in `src/app/outlet/page.js` **do not pass the Authorization header** (Bearer token), which would lead to immediate `401 Unauthorized` responses in a real environment.

### Required Refactoring
1. **Frontend (`src/app/outlet/page.js`)**: 
   - Add Authorization headers to all fetch calls: `headers: { "Authorization": `Bearer ${session.access_token}` }`.
   - Update fetch URLs to point to `/api/outlet/accounting`, `/api/outlet/surveillance`, `/api/outlet/operations`, `/api/outlet/delivery`, and `/api/outlet/customers`.
2. **Backend API Route Handlers**: Create the new endpoints matching the interface contracts in `PROJECT.md` and implement real query and insert logic using `@supabase/supabase-js`.

---

## 4. Environment Variables & Supabase Client Initialization in Playwright
The `.env.local` file contains:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

In Playwright tests, a Supabase client can be initialized programmatically by reading `.env.local` directly using `fs` and parsing it. This avoids external dependencies:
```javascript
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
    acc[key] = value;
  }
  return acc;
}, {});

const supabaseAdmin = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);
```
The Service Role client `supabaseAdmin` has superuser bypass privileges, which allows the tests to seed and clean up database tables directly without bypassing RLS or needing explicit user authentication.

---

## 5. Detailed Test Rewrite & Database Seeding Strategy

To transition `tests/outlet_dashboard.spec.js` from mock intercepts to real database and API calls:

### A. Database Seeding & Clean Up Protocol
Because `playwright.config.js` restricts workers to `workers: 1`, tests will run sequentially. This allows us to seed and clean the database safely:

1. **Before the Entire Suite (`test.beforeAll`)**:
   - Clean up existing records in all 8 tables to ensure a clean slate:
     ```javascript
     const tables = ['outlet_transactions', 'outlet_cameras', 'outlet_alerts', 'outlet_inventory', 'outlet_staff_schedules', 'outlet_delivery_keys', 'outlet_delivery_orders', 'outlet_customers'];
     for (const table of tables) {
       await supabaseAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Truncate table safely
     }
     ```
   - Seed base test data:
     - **`outlet_customers`**: Seed Ramesh, Suresh, and Priya with correct spending and loyalty tiers (matching the test assertions).
     - **`outlet_inventory`**: Seed `Premium Espresso Beans` with stock `3` and threshold `10`.
     - **`outlet_cameras`**: Seed 2 active camera streams.
     - **`outlet_alerts`**: Seed 1 active threat alert.
     - **`outlet_staff_schedules`**: Seed 3 staff schedules.
     - **`outlet_delivery_keys`**: Seed Swiggy and Zomato keys.

2. **After the Entire Suite (`test.afterAll`)**:
   - Run the same deletion block to leave the test database in a clean, empty state.

3. **Relative Assertions vs. Hard Resets**:
   - The test cases already use relative assertions (e.g. comparing count before and after adding a transaction). This means we don't need a slow database clear-and-reseeding step before *every* test case; the initial seed in `beforeAll` is sufficient.

### B. Replacing Intercepts with Real Workflows

1. **Auth Token Interception**:
   - Instead of injecting a fake token, the test setup can create a real test user in Supabase Auth (e.g. `admin@janubhaicoffee.com`) using `supabaseAdmin.auth.admin.createUser()` if not already present.
   - Use `supabase.auth.signInWithPassword()` in the browser context to obtain a real valid JWT, and set this real token in `localStorage`.
   - Ensure the server-side environment variables have `SUPERADMIN_EMAILS=admin@janubhaicoffee.com` to pass the admin check in route handlers.

2. **Replacing Custom Events with Webhooks**:
   - Instead of dispatching `incoming-delivery-order` as a mock window event, the tests should trigger the actual webhook handlers:
     - Perform a `request.post('/api/integrations/swiggy')` or `/api/integrations/zomato` with the order payload.
     - The webhook handler will process the transaction, update the stock, log the order, and update customer spend in the DB.
     - The client-side dashboard page will be updated via short-polling (e.g. refetching data from the API every 3 seconds) or via Supabase Realtime subscription.
     - The test will simply wait for the UI elements (like the stock badge or order table) to update naturally.

3. **Removing `page.route`**:
   - Remove the `page.route('**/api/admin/data*')` blocks entirely. All UI operations (saving settings, resolving alerts, etc.) will hit the real `/api/outlet/...` route handlers, which query the real Supabase database.
