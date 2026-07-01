# Handoff Report: Milestone 1 - Exploration & Analysis of Outlet Management E2E Test Suite

## 1. Observation
- **Playwright Test Mocking**: In `tests/outlet_dashboard.spec.js` (lines 4-100), all database operations and authentication checks are intercepted.
  - Auth token: Injected into browser's `localStorage` as `sb-fheddjuiedseynqxhsfb-auth-token` (lines 6-23).
  - Auth user route: Intercepted via `page.route('**/auth/v1/user')` (lines 26-37).
  - Admin data route: Intercepted via `page.route('**/api/admin/data*')` (lines 40-99).
  - Browser simulation: Custom events are dispatched directly to the page using `page.evaluate()` to trigger updates like `incoming-delivery-order` (lines 818-822, 835-839, 850-854, 913-920, 996-1000) and `security-alert` (lines 864-868, 957-961).
- **Database Schema**: 
  - Ran `node check_outlet_schema.js` and received PGRST205 errors for all 8 tables. Example output:
    `⚠️ Table 'outlet_transactions' returned error: Could not find the table 'public.outlet_transactions' in the schema cache PGRST205`
    `⚠️ Table 'outlet_cameras' returned error: Could not find the table 'public.outlet_cameras' in the schema cache PGRST205`
    ...
- **API routes**:
  - Investigated `src/app/api/` via `find_by_name`. No route handlers under `src/app/api/outlet` or `src/app/api/integrations` exist.
- **Frontend requests**:
  - In `src/app/outlet/page.js`, fetch requests are made to `/api/admin/data?type=dashboard` (line 58) and `/api/admin/data?type=customers` (line 94). None of these fetch calls pass the Bearer auth token in the `Authorization` header, which would fail if hitting a real server check.
- **Environment variables**:
  - Found `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

---

## 2. Logic Chain
1. Since the 8 outlet tables return PGRST205 (Observation 2), they do not exist in the database and must be created via SQL migrations before any E2E tests or real API handlers can query them.
2. Since the API routes under `/api/outlet` and `/api/integrations` are missing (Observation 3) and `src/app/outlet/page.js` makes requests without Authorization headers to `/api/admin/data` (Observation 4), we must:
   - Refactor `src/app/outlet/page.js` to send Bearer tokens and target the new modular API paths.
   - Implement the backend routes using Supabase JS client with authentication verification.
3. Since `.env.local` contains `SUPABASE_SERVICE_ROLE_KEY` (Observation 5), we can parse it in the Playwright test process to initialize a Supabase admin client.
4. Using this admin client, we can clean up and seed the database in `test.beforeAll` and `test.afterAll` to achieve sequential test isolation, while removing the fake intercepts from the Playwright spec.
5. In order to test the webhook handlers dynamically, we can replace simulated window events with real HTTP POST requests directly to `/api/integrations/swiggy` and `/api/integrations/zomato` inside the Playwright tests.

---

## 3. Caveats
- **Supabase Local Testing vs. Production URL**: The tests and scripts are targeting the production/staging Supabase URL in `.env.local`. If a local Supabase CLI is introduced in the future, the Playwright base URL and project configuration will need to adapt.
- **Admin Email Configuration**: The backend route handler relies on the `SUPERADMIN_EMAILS` environment variable to verify admin status. Ensure this variable is configured in `.env.local` or the deployment dashboard with the test admin email `admin@janubhaicoffee.com`.

---

## 4. Conclusion
The database tables and backend route handlers are currently missing, and the E2E tests are fully mocked. We must execute the database migrations first, refactor the page to point to modular API endpoints with correct auth headers, implement the API endpoints, and rewrite the Playwright test suite to use real DB seeding/cleanup and webhook triggers.

---

## 5. Verification Method
- **Verify Schema Presence**: Run the migration query and check database status. The schema can be checked by running a custom Node client check (like the one used in `check_outlet_schema.js`), which should return `✅ Table '<table_name>' exists`.
- **Verify API Implementation**: Check that files exist under `src/app/api/outlet/*` and `src/app/api/integrations/*`.
- **Verify Playwright Tests**: Run `npx playwright test tests/outlet_dashboard.spec.js` and verify all tests pass without mock interceptions.
