# Scope: Implementation Track (Outlet Dashboard)

## Objective
Implement subdomain middleware routing, TopBar link, Supabase admin check, and modular dashboard components under `/outlet` with REAL database tables and API/webhook endpoints (no mock/simulated systems).

## Database Architecture
Create and migrate the following Supabase tables using the Supabase execute_sql tool:
1. `outlet_transactions`: `id` (uuid, primary key), `date` (date), `type` (text - revenue/expense), `amount` (numeric), `category` (text), `description` (text), `created_at` (timestamp)
2. `outlet_cameras`: `id` (uuid, primary key), `name` (text), `url` (text), `active` (boolean), `created_at` (timestamp)
3. `outlet_alerts`: `id` (uuid, primary key), `time` (text), `message` (text), `severity` (text), `resolved` (boolean), `created_at` (timestamp)
4. `outlet_inventory`: `id` (uuid, primary key), `name` (text), `category` (text), `stock` (integer), `threshold` (integer), `auto_reorder` (boolean), `created_at` (timestamp)
5. `outlet_staff_schedules`: `id` (uuid, primary key), `name` (text), `role` (text), `shift` (text), `status` (text), `created_at` (timestamp)
6. `outlet_delivery_keys`: `id` (text, primary key - e.g. swiggy/zomato), `client_id` (text), `client_secret` (text), `api_key` (text), `active` (boolean), `updated_at` (timestamp)
7. `outlet_delivery_orders`: `id` (uuid, primary key), `partner` (text), `items` (text), `total` (numeric), `status` (text - pending/preparing/declined), `customer_name` (text), `customer_email` (text), `coupon_used` (text), `created_at` (timestamp)
8. `outlet_customers`: `id` (uuid, primary key), `name` (text), `email` (text), `phone` (text), `visits` (integer), `spend` (numeric), `tier` (text), `created_at` (timestamp)

## Implementation Tasks
1. **Subdomain Middleware & Navigation**:
   - Create Next.js middleware / proxy rewrite rules in `src/proxy.js` to rewrite `outlet.janubhai.com` to `/outlet`.
   - Add dynamic Outlet Management link in TopBar pointing to `/outlet` or subdomain depending on environment.
2. **Admin Authentication Isolation**:
   - Secure the `/outlet` routes using Layout-level `AdminGuard` component checking Supabase auth session and verifying role.
3. **Database Setup & Migrations**:
   - Create SQL migrations script and execute queries on Supabase using `execute_sql`.
4. **Real API Endpoints**:
   - Create API endpoints under `/api/outlet/` (e.g. `/api/outlet/transactions`, `/api/outlet/inventory`, `/api/outlet/cameras`, `/api/outlet/alerts`, `/api/outlet/customers`, `/api/outlet/staff`) to support CRUD operations on the database tables.
   - Create integration endpoints under `/api/integrations/` to handle simulated and real partner orders, triggering stock adjustments, customer updates, and accounting records in the real tables.
5. **Modular Dashboard Components under `/outlet`**:
   - **Accounting**: Real-time sales and expense statistics. Graph using Recharts loading real data from `outlet_transactions`. Form to save transactions to database.
   - **Surveillance**: Displays real cameras list from database. Add Camera form. Toggle stream status. Integrated HTML5/HLS player (e.g. HLS.js or native HTML5 video player) to play HLS streams. Alert log connected to `outlet_alerts` database table.
   - **Operations**: Stock levels table from database. Highlights products below thresholds. Inline input fields to update reorder settings, saving to `outlet_inventory`. Staff schedule roster from `outlet_staff_schedules`.
   - **Delivery Integrations**: Real settings inputs for client credentials/api keys, saved to `outlet_delivery_keys`. Active toggle switch. Orders list loaded from `outlet_delivery_orders`. Simulated or real incoming order handler.
   - **Customer Profiling**: Table displaying customer spend, orders, loyalty tier. Real search and filtering logic querying database.
6. **Phase 1: Pass 100% E2E tests**:
   - Run Playwright test suite `tests/outlet_dashboard.spec.js` and fix issues until 100% pass rate.
7. **Phase 2: Adversarial Coverage Hardening (Tier 5)**:
   - Perform white-box analysis, identify untested code paths, generate adversarial test cases, and execute test runs.
