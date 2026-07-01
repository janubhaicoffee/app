## 2026-06-30T00:43:14Z
You are the Worker agent responsible for implementing the Outlet Subdomain Management project.
Your working directory is: c:\Users\hudav\Documents\GitHub\app\.agents\worker_outlet_impl_1

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please implement the following files exactly according to the requirements and data-testids in 'tests/outlet_dashboard.spec.js' and 'TEST_READY.md':

1. Update 'src/proxy.js' to:
   - Perform Next.js subdomain rewrite: if the request hostname starts with 'outlet.' (e.g. 'outlet.janubhai.com', 'outlet.localhost:3000'), rewrite to '/outlet' internally.
   - Bypasses API paths '/api', Next assets '/_next', auth pages '/auth', and files with dots '.' to prevent infinite loops and broken assets.
   - Retain and apply the security headers ('X-Frame-Options', 'X-Content-Type-Options', 'Strict-Transport-Security', 'Referrer-Policy') for both rewritten and regular requests.

2. Update 'src/components/AdminGuard.js' to:
   - Implement single-flighting/debouncing on '/api/admin/data?type=check' fetch calls to satisfy the concurrent check test (Test 44).
   - Display a visual banner '<div data-testid="auth-error-banner">...</div>' on 500 error API responses (Test 43) before or instead of redirecting.
   - Maintain the 'Checking Admin Credentials...' text loading screen (Test 9) during validation.

3. Update 'src/components/TopBar.jsx' to:
   - Hide the TopBar component on paths starting with '/outlet' (just like '/admin') to prevent overlapping layout (Test 40/41).
   - Include a navigation link pointing to the outlet dashboard. The link must contain the text 'Outlet Management' and dynamically resolve its href to '/outlet' locally or 'https://outlet.janubhai.com' in production. It must satisfy Test 1, 2, and 38.

4. Create 'src/app/outlet/layout.js' to:
   - Import 'AdminGuard' and wrap children.

5. Create 'src/app/outlet/page.js' and 'src/components/outlet/':
   - 'Accounting.jsx', 'Surveillance.jsx', 'Operations.jsx', 'DeliveryIntegrations.jsx', 'CustomerProfiling.jsx', and 'outlet.css' (imported in page.js).
   - Implement the tabs and forms.
   - Ensure all data-testids are implemented. Key tests check for forms resetting, validation warnings (like 'Invalid amount', 'Required', 'Invalid URL', 'Duplicate name', 'Must be non-negative', 'Must be greater than zero', 'API Key is required'), table sorting, search, filtering, and empty lists showing placeholders ('No transactions found', 'No active threats', 'No customers matched your search', 'No customers found in this tier').
   - You MUST implement custom event listeners on the window object to allow the Playwright test suite to simulate interactions dynamically:
     * 'incoming-delivery-order': Decr stock in Operations (e.g. 'Premium Espresso Beans' stock count), triggers reorder warning if below threshold, adds transaction in Accounting, updates total spend of corresponding customer in Customer Profiling (loyalty level up upgrade to 'Platinum' triggers a notification banner '<div data-testid="system-notification">...</div>'). If coupon (e.g., 'PRIYAPLATINUM15') is used, record it in the description/notes.
     * 'security-alert': Adds alert in Surveillance. If alert severity is 'High', disables manual reorder button in Operations.
     * 'inventory-replenished': Updates stock count in Operations and resolves stock alerts.
     * 'storage': Triggers session token refresh check.
   - Ensure Recharts is imported inside 'Accounting.jsx' and renders inside '<div data-testid="growth-chart">'.
   - Add timezone selector '[data-testid="timezone-select"]' with option 'GMT' that modifies timestamps displayed under '.transaction-date'.
   - Add logout button '[data-testid="btn-logout"]' which signs out using supabase auth and pushes to '/auth/login'.
   - Add manual reorder button '[data-testid="btn-manual-reorder"]' that is disabled during simulated save/transit.
   - Ensure audit logs table/registry exists with '[data-testid="audit-log-item"]' (can show actions like settings saved, credentials saved, float added, etc.).

Verify your implementation by running:
npx playwright test tests/outlet_dashboard.spec.js

Write a detailed handoff report in handoff.md in your working directory. Ensure it lists the files modified/created, the build/test results, and confirms layout compliance. Once finished, send a message to your parent conversation id 97c88ca5-6f25-489d-8c8b-90bfbee941d6.

## 2026-06-30T00:49:32Z
**Context**: Crucial updated requirements for the Outlet Subdomain Management project.
**Content**: The user has updated the project specifications to FORBID fake, mock, demo, or simulated systems. Everything must be fully functional and production-ready.
Please perform the following updates immediately:
1. Stop implementing mock/simulated states. All dashboard modules must interface with real Supabase database tables and real API/webhook routes.
2. Write and execute SQL queries to create the following tables in the Supabase database using the Supabase `execute_sql` tool (or standard SQL query methods):
   - `outlet_transactions`
   - `outlet_cameras`
   - `outlet_alerts`
   - `outlet_inventory`
   - `outlet_staff_schedules`
   - `outlet_delivery_keys`
   - `outlet_delivery_orders`
   - `outlet_customers`
3. Implement real API endpoints under `/api/outlet/...` and `/api/integrations/...` that perform CRUD operations on these tables and handle the delivery order integration logic.
4. Update the surveillance module to use a real HTML5 or HLS.js player loading the stream URL instead of a mock static/offline screens.
5. Coordinate with the updated E2E tests at `tests/outlet_dashboard.spec.js` (which is being rewritten by E2E track to test real database and API calls).
6. Verify your implementation by running the E2E tests until all 82 tests pass.
**Action**: Implement these changes, run the tests, and write the details of files created, migrations executed, and test outputs in your final handoff.md.
