# Scope: E2E Testing Track (Production-Ready)

## Objective
Update the Playwright E2E test suite at `tests/outlet_dashboard.spec.js` to verify real database integrations and server-side routes, removing all client-side/network-level API mocks (except for Supabase login token stubbing if needed).

## Requirements
1. **Real Database Operations**:
   - The test suite must NOT mock the network responses for `/api/admin/data*` or `/api/outlet/*` endpoints.
   - It must let the frontend make real API calls to the local Next.js server, which in turn queries Supabase.
   - For tests that modify state (e.g. adding transactions, configuring delivery partners, editing inventory, creating alerts), the test suite should verify that the changes are persisted. The test suite can do this by either checking that the dashboard UI lists the new items, or by querying the database directly using a Supabase client in the test suite to verify the state, then cleaning up the test data.
2. **No Mocks for Modules**:
   - Swiggy/Zomato live order feed must be verified by calling the real webhook endpoint (e.g., triggering a POST request to `/api/integrations/swiggy` or `/api/integrations/zomato` with a test payload) and asserting that the order appears on the dashboard UI.
   - Accounting graphs and transaction lists must query real transactions from the database.
   - Surveillance panels must load real HLS/HTML5 video players that attempt to play actual URLs.
   - Operations module must load and modify actual tables in the database.
3. **Login Stubbing**:
   - You may still mock/inject a valid auth session in localStorage (`sb-fheddjuiedseynqxhsfb-auth-token`) and mock the initial `**/auth/v1/user` user verification endpoint so that Playwright can bypass real Supabase 3rd party authentication during test setup. However, the bearer token must be forwarded to the real Next.js API endpoints, which must recognize the user as admin (e.g., by matching the email `admin@janubhaicoffee.com` which should be added to the admin list).

## Output Deliverables
1. Updated Playwright test file at `tests/outlet_dashboard.spec.js`.
2. Updated `TEST_READY.md` reflecting the real-database integration and updated checklist.
