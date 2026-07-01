# Scope: E2E Testing Track (Outlet Dashboard)

## Objective
Design, build, and implement a comprehensive opaque-box E2E test suite at `tests/outlet_dashboard.spec.js` derived from user requirements.

## Features to Test
1. **Subdomain middleware routing and navigation link** (TopBar link verification, routing simulation).
2. **Supabase authentication check** (Redirect unauthenticated users to `/auth/login`, allow admin users).
3. **Accounting & Growth module** (Add transaction, dynamic updating of charts and transaction list).
4. **Surveillance & Security module** (Add stream URL, toggle stream status, display mock alerts).
5. **Operational Automation module** (Inventory levels, low stock alerting, auto-reorder configuration).
6. **Delivery Partner Integrations** (Swiggy & Zomato credential configuration, activation toggling, live simulated order flow).
7. **Customer Profiling registry** (Table rendering of users, total spend, orders count, loyalty tier, and filtering by name).

## Test Case Tier Requirements (N = 7 features)
- **Tier 1 - Feature Coverage**: >=35 test cases (5 per feature, happy-path).
- **Tier 2 - Boundary & Corner Cases**: >=35 test cases (5 per feature, boundary conditions/empty states/invalid inputs).
- **Tier 3 - Cross-Feature Combinations**: >=7 test cases (pairwise interactions).
- **Tier 4 - Real-World Application Scenarios**: >=5 application-level scenarios (e.g., admin logs in, reviews stock, updates reorder settings, configures delivery partners, and checks customer database).

## Output Deliverables
1. Playwright test file at `tests/outlet_dashboard.spec.js`.
2. Public file `TEST_READY.md` at the project root with the test runner command and coverage checklist.
