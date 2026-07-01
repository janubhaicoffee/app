# Exploration Report: Outlet Management Dashboard E2E Test Suite Setup

## 1. Observation

Based on a direct inspection of the codebase, the following file paths, structures, and specifications were identified:

### A. Subdomain Routing & Middleware
* **Middleware Absence**: There is currently no `src/middleware.js` or `middleware.js` file at the root or `src/` directories.
* **Routing Architecture**: According to `PROJECT.md` lines 3-7:
  ```markdown
  An outlet management web application hosted at `outlet.janubhai.com` (and simulated locally), integrated within the main Next.js app.
  - **Routing**: Next.js middleware at `src/middleware.js` checks if the hostname is `outlet.janubhai.com` (or local variations) and rewrites to `/outlet`.
  ```
* **Security & Utility Headers**: A utility file `src/proxy.js` exists, which contains logic for API route protection and setting security headers:
  ```javascript
  // src/proxy.js lines 32-39
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  ```
  This indicates that subdomain routing and `proxy.js` security integrations will need to be unified inside `src/middleware.js`.

### B. Navigation
* **TopBar Navigation**: `src/components/TopBar.jsx` renders standard public navigation links (lines 67-73):
  ```javascript
  <Link href="/product/instantcoffee" className="nav-link">
    Instant Coffee
  </Link>
  <Link href="/process" className="nav-link">Our Process</Link>
  ```
  It does not currently render the "Outlet Management" link. According to `PROJECT.md` line 34, a navigation link pointing to the subdomain must be added to this component.

### C. Authentication Isolation
* **Client-Side Guard**: `src/components/AdminGuard.js` secures administrative pages (lines 11-37). It retrieves the session token and performs a GET request to `/api/admin/data?type=check`:
  ```javascript
  const { data: { session } } = await supabase.auth.getSession();
  ...
  const res = await fetch("/api/admin/data?type=check", {
    headers: { "Authorization": `Bearer ${session.access_token}` }
  });
  if (res.ok) {
    const data = await res.json();
    if (data.isAdmin) {
      setIsAuthorized(true);
      return;
    }
  }
  ```
* **Server-Side API Verification**: `src/app/api/admin/data/route.js` (lines 4-21) decodes the Bearer token and verifies the email against the `SUPERADMIN_EMAILS` environment variable:
  ```javascript
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return { error: "Invalid token", status: 401 };

  const adminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase())) return { error: "Forbidden", status: 403 };
  ```

### D. Playwright Test Environment Configuration
* **Playwright Setup**: `playwright.config.js` is configured with:
  ```javascript
  // playwright.config.js lines 10-23
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    channel: 'chrome',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 120 * 1000,
  },
  ```
  Tests run sequentially (`workers: 1`) to avoid database state race conditions.

---

## 2. Logic Chain

1. **Subdomain Routing Testability**: Since Next.js uses the incoming request host header to determine subdomain logic, we can simulate subdomain routing in Playwright tests without configuring local `/etc/hosts` or system DNS. By injecting the `Host` header (e.g., `outlet.localhost:3000`) via `page.setExtraHTTPHeaders()`, the Next.js server will process the request as if it originated from the subdomain.
2. **Auth Guard Mocking**: Since `AdminGuard.js` depends on the presence of a Supabase session and a response of `{ isAdmin: true }` from `/api/admin/data?type=check`, E2E test scripts can bypass auth by:
   - Injecting a mock Supabase session token directly into the browser's `localStorage` via `page.addInitScript()`.
   - Intercepting the server API call to `/api/admin/data*` using Playwright's `page.route()` to return mock admin status and mock module data.
3. **Module Element Identifiers**: To ensure robust, decoupled, and maintainable E2E testing of the 5 dashboard modules, we should propose semantic and explicit `data-testid` selectors. Using `data-testid` isolates selectors from UI redesigns and CSS class changes.
4. **Coverage Scope (82+ Cases)**: To fulfill the `sub_orch_outlet_e2e/SCOPE.md` requirements (N = 7 features, Tier 1 Feature Coverage >=35, Tier 2 Boundary Cases >=35, Tier 3 Combinations >=7, Tier 4 Real-World Scenarios >=5), we have mapped out exactly 82 specific test cases across all categories.

---

## 3. Caveats

* **Subdomain Redirection Local Host Ports**: Some local environment configurations might strip the port or trigger strict hostname validations. Test runners should verify that `Host` headers preserve the local port (e.g., `outlet.localhost:3000`).
* **Environment Variables**: For tests checking actual integration without mocks (Adversarial testing / Tier 5), `SUPERADMIN_EMAILS` must contain a mock admin email matching the mock session.
* **Component Placement**: The dashboard shell and modular panels will be placed under `/outlet` and `src/components/outlet/` once implemented. The E2E selectors proposed must be integrated by the implementer.

---

## 4. Conclusion

We propose a robust E2E test suite framework for `tests/outlet_dashboard.spec.js` that mock-intercepts Supabase auth and API routes, uses custom Host header injection to test subdomain routing, and structures 82+ test cases across 4 Tiers.

### Proposed Selector Reference
* **Subdomain/Auth**:
  - TopBar link to outlet: `[data-testid="outlet-link"]` or `a[href*="/outlet"]`
  - Auth Loader: `text="Checking Admin Credentials..."`
* **Accounting & Growth Module**:
  - Summary metrics: `[data-testid="total-revenue-value"]`, `[data-testid="total-expense-value"]`, `[data-testid="net-profit-value"]`
  - Recharts chart container: `[data-testid="accounting-chart"]`
  - Add Transaction form: `[data-testid="add-transaction-form"]`
  - Form Inputs: `[data-testid="tx-type-select"]`, `[data-testid="tx-amount-input"]`, `[data-testid="tx-category-input"]`, `[data-testid="tx-date-input"]`, `[data-testid="tx-description-input"]`
  - Submit: `[data-testid="tx-submit-btn"]`
* **Surveillance & Security Module**:
  - Feeds Grid: `[data-testid="camera-grid"]`
  - Video stream indicator: `[data-testid^="camera-stream-"]`
  - Add Camera Form: `[data-testid="add-camera-form"]`
  - Add Inputs: `[data-testid="camera-name-input"]`, `[data-testid="camera-url-input"]`, `[data-testid="camera-submit-btn"]`
  - Toggle Switch: `[data-testid^="toggle-stream-"]`
  - Alerts feed: `[data-testid="security-alerts-feed"]`
  - Alert Item: `[data-testid^="alert-item-"]`
  - Mute Button: `[data-testid="mute-alerts-btn"]`
* **Operational Automation Module**:
  - Table: `[data-testid="inventory-table"]`
  - Row: `[data-testid^="inventory-item-"]`
  - Alert Badge: `[data-testid^="low-stock-warning-"]`
  - Threshold Input: `[data-testid^="reorder-input-"]`
  - Auto-Reorder Toggle: `[data-testid^="auto-reorder-toggle-"]`
  - Schedule Table: `[data-testid="staff-schedule-table"]`
* **Swiggy & Zomato Integrations Module**:
  - Toggle Switches: `[data-testid="swiggy-toggle"]`, `[data-testid="zomato-toggle"]`
  - Inputs: `[data-testid="swiggy-api-id"]`, `[data-testid="swiggy-api-secret"]`, `[data-testid="zomato-api-key"]`
  - Save buttons: `[data-testid="save-swiggy-btn"]`, `[data-testid="save-zomato-btn"]`
  - Order panel: `[data-testid="incoming-orders-panel"]`
  - Accept/Reject buttons: `[data-testid^="accept-order-"]`, `[data-testid^="reject-order-"]`
* **Customer Profiling Module**:
  - Table: `[data-testid="customer-table"]`
  - Row: `[data-testid^="customer-row-"]`
  - Loyalty Badge: `[data-testid^="customer-loyalty-"]`
  - Search Input: `[data-testid="customer-search-input"]`

### Proposed Playwright Mocking Strategy
```javascript
// Mock auth session injection in beforeEach
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const mockSession = {
      access_token: "mock-admin-token-123",
      token_type: "bearer",
      expires_in: 3600,
      user: {
        id: "mock-admin-id",
        email: "admin@janubhai.com",
        role: "authenticated",
        user_metadata: { name: "Outlet Manager" }
      },
      expires_at: Math.floor(Date.now() / 1000) + 3600
    };
    localStorage.setItem("sb-janubhaicoffee-auth-token", JSON.stringify(mockSession));
    localStorage.setItem("supabase.auth.token", JSON.stringify(mockSession));
  });

  // Inject host header to test subdomain routing
  await page.setExtraHTTPHeaders({
    'Host': 'outlet.localhost:3000'
  });
});
```

---

## 5. Draft Test Specifications (82 Test Cases)

### Tier 1 - Feature Coverage (35 Cases, Happy Path)
1. **Verify subdomain rewrite resolves to Outlet Dashboard**: Navigating to `http://outlet.localhost:3000/` rewrites internally and displays the Outlet Dashboard shell.
2. **Verify TopBar renders the "Outlet Management" link for admin users**: Logo/TopBar navigation contains the link to `/outlet` (or `outlet.janubhai.com`).
3. **Verify clicking "Outlet Management" in TopBar navigates to dashboard**: Click the TopBar link and verify URL rewritten or redirected correctly.
4. **Verify navigation from Outlet Dashboard back to main store**: Click the "Janu Bhai Coffee" logo in the TopBar and verify navigation back to `/`.
5. **Verify active link styling on Outlet Dashboard**: The "Outlet Management" link in the TopBar has an active styling/indicator when on the outlet route.
6. **Verify redirect to login for unauthenticated users**: Navigating to `/outlet` without a Supabase session redirects to `/auth/login`.
7. **Verify redirect to home page for authenticated non-admin users**: Log in as a regular customer (email not in `SUPERADMIN_EMAILS`) and navigate to `/outlet`; verify redirection to `/` (unauthorized).
8. **Verify successful access for authenticated admin users**: Log in as a user with an email in `SUPERADMIN_EMAILS`; verify access to `/outlet` is granted (no redirect).
9. **Verify "Checking Admin Credentials..." loading screen is displayed**: Verify the loading skeleton or text is shown while the authentication verification is in progress.
10. **Verify session token is sent in the Authorization header**: Intercept `/api/admin/data?type=check` and verify the `Authorization` header contains `Bearer mock-admin-token-xyz`.
11. **Verify Accounting panel renders with summary metrics**: Check that Total Revenue, Total Expenses, and Net Profit cards are visible with correct formats.
12. **Verify interactive Recharts chart is rendered**: Ensure the chart container is present and svg elements representing line/bar nodes are visible.
13. **Verify transaction list displays existing transactions**: Check that the transaction table displays default mock transactions.
14. **Verify adding a new Income transaction**: Submit the add transaction form with type "Income", verify it appears in the transaction list.
15. **Verify adding a new Expense transaction**: Submit the add transaction form with type "Expense", verify it appears in the list and updates the net profit metric.
16. **Verify camera grid displays default simulated camera streams**: Check that active camera streams render with placeholder videos or canvases.
17. **Verify adding a new camera feed URL**: Submit the "Add Camera" form with a valid RTMP/HLS URL and name; check that it is added to the grid.
18. **Verify toggling a camera stream status (Active/Offline)**: Click the toggle switch on a camera feed and verify the status indicator changes from "Active" to "Offline".
19. **Verify security alert feed renders mock live notifications**: Ensure recent alerts (e.g. "Motion detected in kitchen") are displayed in chronological order.
20. **Verify muting alarm/alerts**: Click the "Mute Alerts" button; verify notifications are muted or the badge status changes to "Muted".
21. **Verify inventory stock levels table is rendered**: Check that columns for product name, current stock, and reorder levels are displayed.
22. **Verify low stock alert badge is shown for items below threshold**: Check that items with stock less than their threshold display a "Low Stock" warning.
23. **Verify configuring a new reorder threshold**: Modify the reorder threshold input for a product and save; verify the value updates in the UI.
24. **Verify toggling auto-reorder configuration**: Toggle the "Auto-Reorder" switch for a product; verify the setting updates (e.g., status label changes).
25. **Verify staff schedule logs are visible**: Check that the current shift log shows names, times, and designated roles.
26. **Verify Swiggy and Zomato panels are rendered**: Check that settings tabs/panels for both integration partners are visible.
27. **Verify toggling Swiggy integration active status**: Toggle Swiggy on/off; check that status indicator changes from "Inactive" to "Active".
28. **Verify configuring Swiggy API credentials**: Fill in Client ID and Client Secret, click save, and verify success feedback is shown.
29. **Verify mock incoming order alert is displayed**: Simulate an incoming order from Zomato; verify the live order card appears in the panel.
30. **Verify accepting an incoming delivery order**: Click "Accept" on an incoming order card; verify order status changes to "Preparing" or "Accepted".
31. **Verify customer profile table displays database entries**: Ensure columns for name, orders, total spend, and loyalty tier are visible.
32. **Verify loyalty tier badges render correct colors**: Ensure "Gold", "Silver", etc. badges display appropriate classes.
33. **Verify searching customers by name**: Input a customer's name in the search bar; verify the table filters to show only matching rows.
34. **Verify sorting customer registry by Total Spend**: Click the column header for total spend; verify rows sort in ascending/descending order.
35. **Verify sorting customer registry by Orders Count**: Click the column header for orders count; verify sorting is applied correctly.

### Tier 2 - Boundary & Corner Cases (35 Cases, Validations/Empty States/Errors)
36. **Verify malformed subdomains are not rewritten to /outlet**: Navigating to `bad-subdomain.localhost:3000` does not route to `/outlet` (returns 404 or routes to normal shop).
37. **Verify direct access to `/outlet` on main domain**: Navigating to `http://localhost:3000/outlet` with admin credentials behaves identically to the rewritten subdomain.
38. **Verify query parameters are preserved during rewrite**: Navigating to `http://outlet.localhost:3000/?ref=promo` rewrites to `/outlet?ref=promo` preserving all query search params.
39. **Verify subdomain matching is case-insensitive**: Navigating to `http://OUTLET.localhost:3000/` correctly rewrites to `/outlet`.
40. **Verify deep link rewrites inside subdomain**: Navigating to `http://outlet.localhost:3000/surveillance` (if deep routing exists) or sub-paths does not result in a 404.
41. **Verify invalid JWT token handles 401 gracefully**: Mock `/api/admin/data` to return 401 (Invalid token); verify user is redirected back to login page.
42. **Verify database connection error during auth check handles 500 gracefully**: Mock `/api/admin/data` to return 500; verify error banner is displayed.
43. **Verify email matching is case-insensitive**: Ensure an admin user with email `ADMIN@JanuBhai.com` is successfully authorized when `SUPERADMIN_EMAILS` has `admin@janubhai.com`.
44. **Verify empty `SUPERADMIN_EMAILS` env variable rejects all users**: Mock `SUPERADMIN_EMAILS` as empty or null; verify that even logged-in users are redirected to `/`.
45. **Verify expired session cookie triggers immediate logout**: Simulate a session expiration in the background; verify the dashboard immediately redirects to `/auth/login`.
46. **Verify transaction amount input rejects negative values**: Verify form validation blocks submitting a negative amount (e.g. `-150.00`).
47. **Verify transaction amount input rejects non-numeric inputs**: Form validation blocks string input (e.g. `abc`) in amount field.
48. **Verify empty description uses default placeholder**: Submit a transaction with an empty description; verify it gets saved with "General Transaction".
49. **Verify adding transaction when database API fails**: Submit transaction but mock POST response to fail (500); check that error message is shown and form does not clear.
50. **Verify transaction table behaves with zero items (empty state)**: Mock API to return an empty array for transactions; verify table displays "No transactions found".
51. **Verify invalid URL format validation in Add Camera**: Input `not-a-url` in camera feed input; verify validation error message "Please enter a valid URL".
52. **Verify adding duplicate camera stream URL**: Submit an RTMP URL that already exists; verify error message "Camera stream URL already configured".
53. **Verify behavior when camera stream source is offline**: Mock video feed load to fail; verify the stream card displays an "Offline" overlay and error message.
54. **Verify alerts list behaves with zero active alerts (empty state)**: Mock alerts API to return empty array; verify alerts feed displays "All systems secure. No active alerts."
55. **Verify adding a camera with extremely long name**: Input a name of 150+ characters; verify truncation or validation error.
56. **Verify negative stock threshold is rejected**: Try to set a reorder threshold to `-5`; verify input is blocked or validation error is shown.
57. **Verify stock levels table shows empty state**: Mock database to have no products tracked for inventory; verify table shows "No tracked inventory items".
58. **Verify updating reorder setting when API is offline**: Mock update API to return 503; verify setting reverts and warning toast is displayed.
59. **Verify extreme stock level rendering**: Mock stock value as `1,000,000`; verify text does not overflow the table layout.
60. **Verify empty staff schedule log**: Mock staff schedule data as empty; verify schedule log displays "No scheduled shifts for today".
61. **Verify saving blank credentials fails validation**: Clear Swiggy inputs and click save; verify validation error "Credentials cannot be empty".
62. **Verify toggling integration when API request fails**: Toggle integration, mock server response to fail; verify the toggle switch rolls back to its original state.
63. **Verify incoming order panel handles high volume (overflow layout)**: Simulate 10 simultaneous orders; verify container displays scrollbars without breaking layout.
64. **Verify rejecting an order requires confirmation or reason**: Click "Reject" on order; verify a modal appears requesting rejection reason.
65. **Verify saving credentials with special characters**: Enter API key with special symbols (e.g. `@#$!%^&*()`); verify values save successfully.
66. **Verify search input handles special characters safely**: Enter regex characters like `.*` or `?` in search; verify no crash and table displays "No customers found" (or filters correctly).
67. **Verify table displays empty state for zero matching search results**: Search for a non-existent name; verify table displays "No customers matching search criteria".
68. **Verify sorting column with identical values**: Sort by Loyalty Tier when all customers are "Gold"; verify table maintains original alphabetical order.
69. **Verify customer profile rendering when name is extremely long**: Verify UI handles long customer names (e.g. 100 characters) without breaking table layout (text-overflow ellipsis).
70. **Verify customer profile registry with database connection failure**: Mock `/api/admin/data` to return error; verify customer table is replaced with a reload button and error message.

### Tier 3 - Cross-Feature Combinations (7 Cases, Multi-Module Interactions)
71. **Verify adding transaction updates both Accounting metrics and Recharts graphs**: Add a transaction; verify total revenue and chart coordinates update concurrently without reloading.
72. **Verify delivery order acceptance updates Accounting & Growth revenue**: Accept a mock order from Swiggy/Zomato; verify the order amount is added to the Accounting Revenue widget.
73. **Verify low stock alert triggers automated reorder state in Operations**: When stock drops below threshold, verify that "Auto-Reorder" state triggers and updates status badge to "Reorder Triggered".
74. **Verify active security alerts display warnings on the main dashboard header**: Trigger a critical surveillance alert; check that a global alert badge appears on the dashboard header/TopBar.
75. **Verify accepting an order decreases item stock levels in Operations**: Accept order containing a "Instant Coffee" item; verify inventory stock level decreases by the ordered quantity.
76. **Verify order completion updates Customer Profiling spend data**: Complete a delivery partner order; verify the customer's total spend and order count in Customer Profiling increases.
77. **Verify customer search filters update visible customer stats in dashboard**: Filter customers in the Profiling tab; verify that the aggregated metrics (e.g. "Active Customers") update in real-time.

### Tier 4 - Real-World Application Scenarios (5 Cases, Complex Journeys)
78. **Scenario 1: End-to-End Admin Daily Setup**: Log in -> Navigate to subdomain -> Check surveillance and clear mock alerts -> Navigate to Operations and configure low stock auto-reorders -> Activate Swiggy delivery.
79. **Scenario 2: Order Fulfilment and Financial Reporting Flow**: Receive Zomato order -> Accept order (verifying stock decrement) -> Complete order -> Verify revenue increment in Accounting module -> Check customer registry for loyalty tier updates.
80. **Scenario 3: Security Breach Escalation Workflow**: Trigger critical backdoor security alert -> Observe global header flashing warning -> Switch to surveillance tab -> Select Camera 3 stream -> Add security incident log and mute/acknowledge alarm.
81. **Scenario 4: Inventory Depletion & Automated Restocking**: Configure reorder threshold -> Deplete product below threshold -> Verify low stock badge and auto-reorder generated log entry -> Log restocking cost as expense transaction in Accounting module.
82. **Scenario 5: Customer Loyalty Campaign Analysis**: Search customer by name in registry -> Verify spend/tier (Silver) -> Simulate order creation -> Verify promotion to Gold tier -> Verify revenue spike in Accounting module.

---

## 6. Verification Method

To verify the test suite once it is implemented:
1. Ensure the Playwright config in `playwright.config.js` is correct.
2. Run the test suite using:
   ```bash
   npx playwright test tests/outlet_dashboard.spec.js
   ```
3. If mock configurations are active, they will resolve all network dependencies, allowing tests to run entirely in isolation without database changes.
