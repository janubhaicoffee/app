# Exploration Report & Test Suite Design: Outlet Dashboard E2E Tests

## 1. Observation
The following file paths, line ranges, and contents were observed in the project:

### A. Non-Existence of `/outlet` UI & Middleware Routing
Listing the files in `src/components/` and `src/app/` showed that no files or folders exist for the outlet subdomain dashboard UI or its middleware routing.
- `src/components` contains: `AIChatbot.jsx`, `AdminGuard.js`, `Footer.jsx`, `ImageGallery.jsx`, `InterceptorModal.jsx`, `TopBar.jsx`, and a `home/` folder.
- `src/app` contains: `account/`, `admin/`, `api/`, `articles/`, `auth/`, `cart/`, `checkout/`, `claim/`, `contact/`, `privacy/`, `process/`, `product/`, `refunds/`, `shipping/`, `stash/`, `terms/`, `track/`.
- No folder `src/app/outlet` or `src/components/outlet` is present.
- No `src/middleware.js` is present in the workspace.

### B. Authentication Guard Mechanism
`src/components/AdminGuard.js` checks administrative access (lines 10–40):
```javascript
10:   useEffect(() => {
11:     const checkAuth = async () => {
12:       const { data: { session } } = await supabase.auth.getSession();
13:       
14:       if (!session) {
15:         router.push("/auth/login");
16:         return;
17:       }
18: 
19:       // Use the secure server API to check if the user is an admin
20:       try {
21:         const res = await fetch("/api/admin/data?type=check", {
22:           headers: { "Authorization": `Bearer ${session.access_token}` }
23:         });
24:         
25:         if (res.ok) {
26:           const data = await res.json();
27:           if (data.isAdmin) {
28:             setIsAuthorized(true);
29:             return;
30:           }
31:         }
32:       } catch (err) {
33:         console.error("Auth check failed", err);
34:       }
35: 
36:       router.push("/");
37:     };
```

### C. Server-Side Administrative Verification
`src/app/api/admin/data/route.js` checks the auth header and verifies if the user email is present in `SUPERADMIN_EMAILS` (lines 4–21):
```javascript
4: async function verifyAdmin(request) {
5:   const authHeader = request.headers.get("Authorization");
6:   if (!authHeader || !authHeader.startsWith("Bearer ")) {
7:     return { error: "Unauthorized", status: 401 };
8:   }
9: 
10:   const token = authHeader.split(" ")[1];
11:   const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
12: 
13:   const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
14:   if (authError || !user) return { error: "Invalid token", status: 401 };
15: 
16:   const adminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
17:   if (!adminEmails.includes(user.email?.toLowerCase())) return { error: "Forbidden", status: 403 };
18: 
19:   const supabase = supabaseAdmin;
20:   return { supabase, user, adminEmail: user.email };
21: }
```

### D. Supabase Project Configuration
`.env.local` contains the Supabase public URL (line 1):
```
1: NEXT_PUBLIC_SUPABASE_URL=https://fheddjuiedseynqxhsfb.supabase.co
```
This means the client-side Supabase SDK stores session details under the local storage key:
`sb-fheddjuiedseynqxhsfb-auth-token`

### E. Playwright Configuration
`playwright.config.js` sets the baseURL and test configuration (lines 3–24):
```javascript
3: module.exports = defineConfig({
4:   testDir: './tests',
5:   fullyParallel: false,
6:   forbidOnly: !!process.env.CI,
7:   retries: process.env.CI ? 2 : 0,
8:   workers: 1, // run tests sequentially to avoid database race conditions
9:   reporter: 'list',
10:   use: {
11:     baseURL: 'http://localhost:3000',
12:     trace: 'on-first-retry',
13:     channel: 'chrome', // use system Chrome to bypass downloading binaries
14:     headless: true,
15:   },
16:   webServer: {
17:     command: 'npm run dev',
18:     url: 'http://localhost:3000',
19:     reuseExistingServer: true,
20:     stdout: 'ignore',
21:     stderr: 'pipe',
22:     timeout: 120 * 1000,
23:   },
24: });
```

---

## 2. Logic Chain
Based on these observations, the test suite configuration and design must address the following:
1. **Mocking Supabase Client Auth State**: Since `AdminGuard.js` calls `supabase.auth.getSession()`, Playwright tests can mock the session on page load by writing a valid JWT session object directly into the browser's localStorage under the key `sb-fheddjuiedseynqxhsfb-auth-token`.
2. **Intercepting Auth API Calls**: If the client library attempts to verify/refresh the session token via Supabase Auth services, Playwright can intercept and mock the response for `**/auth/v1/user` or `**/auth/v1/token` to return a successful admin user profile (e.g. `admin@janubhaicoffee.com`).
3. **Intercepting Next.js API Calls**: Since the local Next.js server verification (`verifyAdmin`) relies on contacting the real Supabase server via the service role client (which will fail offline or with dummy tokens), the most robust strategy for E2E testing of the UI is to intercept `/api/admin/data` requests directly within Playwright. This satisfies both unauthenticated, unauthorized, and authorized admin flows.
4. **Middleware Simulation**: To test subdomain rewrites (from `outlet.janubhai.com` to `/outlet`), we can inject `Host: outlet.janubhai.com` header into Playwright page navigations.
5. **Selector Standardization**: Since the modular dashboard UI components are not yet built, defining test selectors in this report enables Test-Driven Development (TDD) for the implementer agent.

---

## 3. Caveats
- **Next.js Server-Side Execution**: Real Next.js server-side requests to Supabase cannot be intercepted directly by Playwright's `page.route` (which only intercepts browser-level network requests). Therefore, the backend API `/api/admin/data` itself should be mocked inside Playwright to prevent requests from reaching the Next.js server, OR we must run a local Supabase CLI emulator for database queries, or mock the database queries at the server level. The cleanest E2E approach is browser-level interception of `/api/admin/data*`.
- **Vanity CSS Restriction**: Per the `AGENTS.md` and project standard rules, TailwindCSS is strictly forbidden. The UI components must be styled using vanilla CSS, which should be verified during tests by asserting custom style properties or checking class names instead of Tailwind classes.

---

## 4. Conclusion
We have designed a robust test plan containing exactly 82 test cases spanning Tiers 1-4, mapped to all 7 required features.

### Suggested Selectors
The following standard selectors (`data-testid`) are proposed to keep the test suite and implementation decoupled:
1. **Accounting**:
   - `[data-testid="accounting-panel"]` (container)
   - `[data-testid="growth-chart"]` (Recharts component wrapper)
   - `[data-testid="stat-revenue"]`, `[data-testid="stat-growth"]`, `[data-testid="stat-profit"]`
   - `[data-testid="transaction-form"]` (form element)
   - `[data-testid="field-amount"]`, `[data-testid="field-category"]`, `[data-testid="field-type"]` (select), `[data-testid="field-description"]`
   - `[data-testid="btn-add-transaction"]`
   - `[data-testid="transaction-row"]`
   - `[data-testid="empty-transactions"]`
2. **Surveillance**:
   - `[data-testid="surveillance-panel"]` (container)
   - `[data-testid="stream-player"]` (simulated camera stream wrapper)
   - `[data-testid="stream-status"]` (active/inactive badge)
   - `[data-testid="camera-form"]`
   - `[data-testid="field-camera-name"]`, `[data-testid="field-camera-url"]`
   - `[data-testid="btn-add-camera"]`, `[data-testid="btn-toggle-stream"]`
   - `[data-testid="alert-feed"]`, `[data-testid="alert-item"]`, `[data-testid="empty-alerts"]`
   - `[data-testid="btn-resolve-alert"]`
3. **Operations**:
   - `[data-testid="operations-panel"]` (container)
   - `[data-testid="stock-table"]`, `[data-testid="stock-row"]`
   - `[data-testid="stock-alert-badge"]` (low-stock warning indicator)
   - `[data-testid="reorder-form"]`
   - `[data-testid="field-reorder-threshold"]`, `[data-testid="field-reorder-quantity"]`, `[data-testid="field-reorder-email"]`
   - `[data-testid="btn-save-reorder"]`, `[data-testid="btn-manual-reorder"]`
   - `[data-testid="reorder-status"]`
4. **Delivery Integrations**:
   - `[data-testid="delivery-panel"]` (container)
   - `[data-testid="tab-swiggy"]`, `[data-testid="tab-zomato"]`
   - `[data-testid="toggle-delivery-status"]` (toggle switch input)
   - `[data-testid="delivery-credentials-form"]`
   - `[data-testid="field-delivery-api-key"]`, `[data-testid="field-delivery-client-id"]`
   - `[data-testid="btn-save-delivery"]`
   - `[data-testid="delivery-order-feed"]`, `[data-testid="delivery-order-item"]`, `[data-testid="delivery-order-partner"]`
5. **Customer Profiling**:
   - `[data-testid="customer-profile-panel"]` (container)
   - `[data-testid="customer-registry-table"]`, `[data-testid="customer-row"]`
   - `[data-testid="customer-search-input"]`
   - `[data-testid="customer-loyalty-filter"]`
   - `[data-testid="sort-total-spend"]`
   - `[data-testid="empty-customers"]`

---

### Mocks and Setup Code Snippet
To bypass authentication guards and mock data responses locally:
```javascript
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // 1. Inject mock Supabase Auth session token in localStorage before navigation
  await page.addInitScript(() => {
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
  });

  // 2. Intercept Supabase Auth check API endpoint
  await page.route('**/auth/v1/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-admin-uuid',
        email: 'admin@janubhaicoffee.com',
        aud: 'authenticated',
        role: 'authenticated',
      })
    });
  });

  // 3. Intercept Next.js api routes to bypass server-side Supabase network calls
  await page.route('**/api/admin/data*', async (route) => {
    const url = new URL(route.request().url());
    const type = url.searchParams.get('type');

    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
      return;
    }

    if (type === 'check') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ isAdmin: true })
      });
    } else if (type === 'dashboard') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            products: 15,
            customers: 24,
            orders: 120,
            articles: 8,
            pendingReviews: 3,
            revenue: 24500.75,
            chartData: [
              { date: '2026-06-25', revenue: 500, orders: 3 },
              { date: '2026-06-26', revenue: 750, orders: 4 },
              { date: '2026-06-27', revenue: 600, orders: 2 },
            ],
            recentOrders: [],
            lowStockAlerts: [
              { id: 'prod-1', name: 'Premium Espresso Beans', stock: 3, low_stock_threshold: 10 }
            ],
            topProducts: []
          }
        })
      });
    } else if (type === 'customers') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 'cust-1', name: 'Ramesh Kumar', email: 'ramesh@gmail.com', total_spend: 3200, orders_count: 8, loyalty_tier: 'Gold' },
            { id: 'cust-2', name: 'Suresh Patel', email: 'suresh@yahoo.com', total_spend: 1500, orders_count: 4, loyalty_tier: 'Silver' },
            { id: 'cust-3', name: 'Priya Sharma', email: 'priya@gmail.com', total_spend: 6000, orders_count: 12, loyalty_tier: 'Platinum' }
          ]
        })
      });
    } else {
      await route.fulfill({ status: 404 });
    }
  });
});
```

---

### Detailed List of 82 Test Cases (Tiers 1-4)

#### Tier 1: Feature Coverage (35 Tests, 5 per feature)
##### Feature 1: Subdomain Routing & Navigation Link
1. `Verify TopBar renders the "Outlet Management" navigation link.`
2. `Verify clicking "Outlet Management" link navigates to /outlet.`
3. `Verify that accessing outlet.janubhai.com rewrites to /outlet (subdomain middleware).`
4. `Verify middleware forwards headers correctly (host, user-agent).`
5. `Verify accessing /outlet directly renders the dashboard shell when authenticated as admin.`

##### Feature 2: Supabase Authentication Guard
6. `Verify unauthenticated user trying to access /outlet is redirected to /auth/login.`
7. `Verify authenticated user with non-admin email (e.g. test@user.com) is redirected to home /.`
8. `Verify authenticated user with superadmin email (e.g. admin@janubhaicoffee.com) is allowed access.`
9. `Verify loading state is shown ("Checking Admin Credentials...") while authenticating.`
10. `Verify that logging out immediately revokes access to the /outlet page (redirects to login).`

##### Feature 3: Accounting & Growth Module
11. `Verify Accounting panel is rendered with revenue/growth stats.`
12. `Verify transaction list is rendered with past transactions.`
13. `Verify Recharts component is rendered inside the accounting panel.`
14. `Verify adding a new transaction successfully submits the form.`
15. `Verify adding a new transaction updates the stats and list.`

##### Feature 4: Surveillance & Security Module
16. `Verify Surveillance panel renders simulated stream players.`
17. `Verify security alert feed displays recent alerts.`
18. `Verify toggling camera active status changes stream visual indicator.`
19. `Verify adding a new camera stream URL updates the stream list.`
20. `Verify that clearing/resolving an alert removes it or updates its status.`

##### Feature 5: Operational Automation Module
21. `Verify Operational panel displays current stock levels and threshold alerts.`
22. `Verify low-stock items are highlighted (vintage or red warning styling).`
23. `Verify auto-reorder configuration fields (threshold, quantity) display saved values.`
24. `Verify updating auto-reorder settings saves successfully.`
25. `Verify manual reorder trigger button initiates stock replenishment request.`

##### Feature 6: Delivery Partner Integrations
26. `Verify Swiggy and Zomato integration settings panels are rendered.`
27. `Verify toggling the Swiggy integration status updates the visual indicator.`
28. `Verify configuring API credentials for Zomato saves successfully.`
29. `Verify live order feed is rendered and displays incoming delivery orders.`
30. `Verify that incoming orders are labeled with the correct partner (Swiggy vs Zomato).`

##### Feature 7: Customer Profiling Registry
31. `Verify Customer registry table is rendered with customer profiles.`
32. `Verify table displays name, email, total spend, orders count, and loyalty tier.`
33. `Verify searching by name filters the registry table.`
34. `Verify filtering by loyalty tier (e.g., Gold) updates the list.`
35. `Verify customer profiles can be sorted by total spend (ascending/descending).`

---

#### Tier 2: Boundary & Corner Cases (35 Tests, 5 per feature)
##### Feature 1: Subdomain Routing & Navigation Link
36. `Verify routing handles malformed subdomains (e.g. out-let.janubhai.com doesn't rewrite).`
37. `Verify accessing /outlet with trailing slash /outlet/ is handled correctly.`
38. `Verify TopBar link points to correct URL dynamically based on environment.`
39. `Verify middleware doesn't rewrite asset requests (e.g. _next/static, favicon.ico).`
40. `Verify middleware handles request with port number in the host header.`

##### Feature 2: Supabase Authentication Guard
41. `Verify expired session redirects user to login page.`
42. `Verify invalid/malformed JWT token results in redirection to login or error display.`
43. `Verify auth API failure (500 Internal Server Error on /api/admin/data) redirects to home / or shows a clear error message.`
44. `Verify concurrent login checks are debounced or single-flighted.`
45. `Verify session token refresh is handled correctly without interrupting the dashboard view.`

##### Feature 3: Accounting & Growth Module
46. `Verify adding a transaction with invalid numeric value (e.g. negative amount) shows validation error.`
47. `Verify empty mandatory fields in transaction form show inline warnings.`
48. `Verify empty transaction list shows a placeholder message ("No transactions found").`
49. `Verify extremely large transaction amount (integer overflow boundary) is formatted correctly.`
50. `Verify Recharts handles zero transactions gracefully without throwing rendering exceptions.`

##### Feature 4: Surveillance & Security Module
51. `Verify adding a camera with malformed stream URL shows error.`
52. `Verify attempting to view camera streams with offline status displays error/offline state.`
53. `Verify alert feed handles zero active alerts by displaying a "No active threats" placeholder.`
54. `Verify alert feed scroll pagination or max capacity boundary (e.g. capping at 100 alerts).`
55. `Verify adding a camera with duplicate name/ID shows a validation warning.`

##### Feature 5: Operational Automation Module
56. `Verify setting auto-reorder threshold to negative value shows validation error.`
57. `Verify setting auto-reorder quantity to zero shows validation error.`
58. `Verify inventory table handles products with undefined/null stock counts (null-safety).`
59. `Verify low-stock warning triggers precisely when stock matches threshold value (boundary).`
60. `Verify manual reorder button is disabled while a reorder request is in flight.`

##### Feature 6: Delivery Partner Integrations
61. `Verify Swiggy/Zomato settings validate empty API keys on save.`
62. `Verify incoming order with missing/corrupted structure (e.g., no items) is handled gracefully in the feed.`
63. `Verify order feed limit (e.g., maximum 50 orders shown, older ones discarded or paginated).`
64. `Verify connection timeout/failure for delivery API shows offline banner in the partner section.`
65. `Verify toggling active state is disabled during API network connection attempt.`

##### Feature 7: Customer Profiling Registry
66. `Verify customer search is case-insensitive.`
67. `Verify search returns "No customers matched your search" when no records match.`
68. `Verify filtering by a loyalty tier with no members (e.g., custom tier) displays empty state gracefully.`
69. `Verify sorting works for columns with zero/empty values.`
70. `Verify search query with special/regex characters (e.g. .*, ?, \) is escaped and doesn't break search.`

---

#### Tier 3: Cross-Feature Combinations (7 Tests)
71. `Verify adding a transaction (Accounting) updates the corresponding customer's total spend and loyalty tier (Customer Profiling).`
72. `Verify that receiving a new Swiggy/Zomato order (Delivery Integrations) automatically updates inventory stock levels (Operations).`
73. `Verify that a delivery-driven stock decrease below the threshold (Delivery & Operations) triggers auto-reorder (Operations) and logs an audit log or UI warning.`
74. `Verify transaction from incoming delivery order (Delivery) is automatically recorded in transaction list (Accounting) and Recharts.`
75. `Verify security alert trigger (Surveillance) locks/restricts certain admin operations or flags logs (Operations).`
76. `Verify changing store settings/timezone (Operations/Admin Settings) updates the timestamps across all feeds (Surveillance alerts, Delivery orders, Accounting transactions).`
77. `Verify customer loyalty tier upgrade (Customer Profiling) triggers a system notification or promo code creation (Delivery Partner / Accounting).`

---

#### Tier 4: Real-World Application Scenarios (5 Tests)
78. `Scenario: Full business day simulation. Admin logs in, views empty state dashboard, opens Swiggy/Zomato integration, receives multiple orders, verifies stock decrease, verifies automatic transaction records, and verifies updated growth chart.`
79. `Scenario: Inventory crisis management. Admin receives low-stock alert, reviews current stock levels, adjusts reorder threshold, triggers manual reorder, verifies reorder status changes to "Ordered", receives delivery, updates stock manually, and verifies alert disappears.`
80. `Scenario: Security response drill. Alarm triggers in camera feed 2, admin switches tab to Surveillance, marks camera 2 stream active, views live alert description, clicks "Dispatch Security Team", adds incident log entry, and clears alert.`
81. `Scenario: High-value customer analysis. Admin filters Customer Profiling registry by "Platinum" loyalty, selects top customer, views their transaction history, issues a custom discount coupon/code, verifies coupon is saved in coupon database, and registers a mock order using that coupon.`
82. `Scenario: Integration & Settings Setup. Admin completes onboarding: sets custom Host rewrite headers, accesses /outlet, sets up credentials for Swiggy and Zomato, changes operational alert settings, adds a startup float transaction to Accounting, and checks that audit logs record all administrative actions.`

---

## 5. Verification Method
1. Check that this report is written to:
   `c:\Users\hudav\Documents\GitHub\app\.agents\teamwork_preview_explorer_outlet_2\handoff.md`
2. Once the test suite is generated at `tests/outlet_dashboard.spec.js` and the dashboard components are implemented under `src/components/outlet/` and `src/app/outlet/`, the test suite can be run using the following command:
   ```bash
   npx playwright test tests/outlet_dashboard.spec.js
   ```
3. Verify that the output of running this command yields 82 passing tests, and no browser connections are made to the live Supabase project.
