## 2026-06-30T11:14:08Z

You are a teamwork_preview_worker for Milestone 2: Test Database Seeding & Helpers Setup of the Outlet Management E2E test suite.
Working directory: C:\Users\hudav\Documents\GitHub\app\.agents\worker_outlet_e2e_m2

Objective:
1. Check if the 8 database tables required for the Outlet Management project exist in the Supabase database. These tables are:
  - outlet_transactions
  - outlet_cameras
  - outlet_alerts
  - outlet_inventory
  - outlet_staff_schedules
  - outlet_delivery_keys
  - outlet_delivery_orders
  - outlet_customers
  If any table is missing, create it using appropriate DDL. Check if there are database tables already created, or if there is a script or RPC to create them. You may check the environment variables in .env.local to access the database.
2. Set up database seeding and cleanup helpers for our Playwright tests in a helper file (e.g., `tests/db_helper.js`) or directly inside `tests/outlet_dashboard.spec.js`.
3. The helpers should:
  - Connect to Supabase using NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
  - Provide seed data for these tables corresponding to what the E2E tests expect (e.g., initial transactions, stock levels, surveillance feeds).
  - Provide cleanup functions to delete the test data after test execution to keep the database clean and ensure test isolation.
4. Prepare tests for being run without client-side API mocks. In `tests/outlet_dashboard.spec.js` (or a copy we will iterate on), we need to ensure that the setup (beforeEach) does NOT intercept `**/api/admin/data*` or `/api/outlet/*` with mock JSON, but lets them go through to the real backend server. Keep the localStorage token injection and `**/auth/v1/user` mock intercept so that Playwright bypasses the real auth login page.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Deliverables:
- A script or report verifying that the 8 tables exist in the database.
- Database helper file (e.g. tests/db_helper.js) or refactored setup in tests/outlet_dashboard.spec.js.
- Handoff report in your folder (handoff.md) summarizing the status of the database and helper setup.
