# Exploration Report: Outlet Dashboard E2E Testing Design

This report provides the results of the codebase exploration and presents the detailed test specifications for writing the Playwright test suite `tests/outlet_dashboard.spec.js` for the Outlet Management dashboard.

---

## 1. Observation

### Codebase Search for `/outlet` and Subdomains
A case-insensitive search for files or content containing the word `outlet` outside `.next` and `node_modules` yielded zero application-level matches.
- Verification command run: `Get-ChildItem -Path src -Recurse -File | Select-String -Pattern "outlet"`
- Output: Only `src\proxy.js` matches (due to the security header `includeSubDomains`):
  ```javascript
  src\proxy.js:36:  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  ```
- Result: No `/outlet` pages, layout files, or components (`src/app/outlet` or `src/components/outlet/`) exist in the project at this time. Similarly, no Next.js middleware file (`src/middleware.js`) is present.

### Header Navigation (`src/components/TopBar.jsx`)
- Observation: Checked the contents of `src/components/TopBar.jsx`. Lines 67-73 show current public navigation links:
  ```javascript
  67:           <Link href="/product/instantcoffee" className="nav-link">
  68:             Instant Coffee
  69:           </Link>
  70:           
  71: 
  72:           <Link href="/process" className="nav-link">Our Process</Link>
  ```
- Result: No links to the outlet subdomain or the `/outlet` path are currently present.

### Authentication Setup (`src/components/AdminGuard.js` & `src/app/api/admin/data/route.js`)
- Observation: Access control for admin pages is implemented via `AdminGuard` component.
  In `src/components/AdminGuard.js`, the component fetches `/api/admin/data?type=check`:
  ```javascript
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
  ```
  In `src/app/api/admin/data/route.js`, the admin check verifies the session token and email:
  ```javascript
  13:   const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  14:   if (authError || !user) return { error: "Invalid token", status: 401 };
  15: 
  16:   const adminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  17:   if (!adminEmails.includes(user.email?.toLowerCase())) return { error: "Forbidden", status: 403 };
  ```
- Result: Admin authorization requires (1) a valid Supabase token and (2) a user email listed in the server-side environment variable `SUPERADMIN_EMAILS`.

---

## 2. Logic Chain

1. **Routing and Middleware Status**: Because no middleware (`src/middleware.js`) exists, subdomain routing from `outlet.janubhai.com` to `/outlet` is not yet active. Consequently, the `/outlet` page and modular components are not implemented. Tests will need to cover these configurations as they are built out in Milestones 2-4.
2. **Auth Mocking Strategy**:
   - **Client-Side Persisted Session**: Supabase client (`src/lib/supabase.js`) reads connection credentials from environment variables (`NEXT_PUBLIC_SUPABASE_URL` has project reference `fheddjuiedseynqxhsfb`). The client library automatically looks for session tokens in `window.localStorage` under the key `sb-fheddjuiedseynqxhsfb-auth-token`.
   - **Local Storage Mocking**: We can mock a logged-in user in Playwright by injecting a valid JSON session object into `window.localStorage` before page load.
   - **API Route Interception**: Since `AdminGuard` verifies admin status by requesting `/api/admin/data?type=check`, we can use Playwright's `page.route` to intercept this call and return `{ isAdmin: true }` or `{ isAdmin: false }` deterministically. This avoids dependency on a live Supabase server or manual database setup during tests.

---

## 3. Caveats

- **Assumptions on Subdomain Simulation**: We assume the test environment supports subdomain requests (e.g., configuring Playwright's `baseURL` or navigating directly to `http://outlet.localhost:3000`). If local subdomain routing isn't configured in the local hosts file, tests must utilize `page.goto('http://outlet.localhost:3000')` or mock the `Host` header via custom routing rules.
- **Components are Drafts**: All proposed modular panels (`Accounting`, `Surveillance`, `Operations`, `DeliveryIntegrations`, `CustomerProfiling`) are based on the specifications in `PROJECT.md` and are not yet present in the codebase. The tests are designed to match these specifications.

---

## 4. Conclusion

- **Dashboard and Subdomain Routing**: Not yet implemented. No middleware, outlet pages, or modular dashboard panels exist.
- **Authentication**: Admin validation depends on a Supabase session and a server-side list of `SUPERADMIN_EMAILS` check.
- **Mocking Proposal**: Persist mock session in `localStorage` under `sb-fheddjuiedseynqxhsfb-auth-token` and mock the API responses of `/api/admin/data` using Playwright `page.route` to test all dashboard features in isolation.

---

## 5. Verification Method

- Check existence of `/outlet` files: Run `find_by_name` or command search for `outlet` in `src`.
- Verify auth setup: Inspect `src/components/AdminGuard.js` and `src/app/api/admin/data/route.js`.
- Execute playwright configuration: Run `npx playwright test` to verify test suite configuration (currently it should run only `process_timeline.spec.js` since the outlet tests file does not exist yet).

---

## 6. Proposed E2E Test Suite Specifications

Below is the list and design of the **82 test cases** across 4 tiers.

### Tier 1: Feature Coverage (35 tests)

#### Feature 1: Subdomain Routing & Middleware
1. **Verify subdomain landing**: Navigate to `http://outlet.localhost:3000` and assert that the outlet dashboard is displayed.
2. **Verify address bar URL**: Confirm that the URL in the address bar remains `http://outlet.localhost:3000` after middleware rewrite.
3. **Verify sub-page routing**: Navigate to `http://outlet.localhost:3000/settings` and assert that it rewrites to the outlet settings route correctly.
4. **Verify static assets exclusion**: Assert that requests to `/logo.png` or `/_next/static` are not intercepted or rewritten by the subdomain middleware.
5. **Verify main domain bypass**: Navigate to `http://localhost:3000` (main domain) and assert that it displays the main store landing page, not the outlet dashboard.

#### Feature 2: Admin Authentication & Access Guard
6. **Redirect unauthenticated users**: Navigate to `http://outlet.localhost:3000` without a session and verify redirection to `/auth/login`.
7. **Bypass login for authenticated admin**: Log in as a superadmin, navigate to the outlet dashboard, and verify that the page displays without redirection.
8. **Block authenticated non-admin**: Log in with an email not in `SUPERADMIN_EMAILS`, navigate to `http://outlet.localhost:3000`, and verify redirection to `/` with an error message.
9. **Show loading state**: Verify that the "Checking Admin Credentials..." loading screen is visible while `/api/admin/data?type=check` is in flight.
10. **Perform logout redirection**: Click the logout button on the outlet dashboard and verify that the session is cleared and the page redirects to `/auth/login`.

#### Feature 3: Accounting & Growth Panel (`Accounting.jsx`)
11. **Render transaction table**: Assert that the transactions table renders columns for Date, Description, Type, Category, and Amount.
12. **Display Recharts line chart**: Assert that the growth trend chart container is visible and renders SVGs for data lines.
13. **Submit new transaction**: Fill out the transaction form with valid data, click submit, and verify that the new transaction is appended to the table.
14. **Verify growth KPI metrics**: Assert that total revenue, net profit, and percentage growth KPI summary cards display matching numerical figures.
15. **Filter by transaction type**: Select "Expense" from the type filter dropdown and verify that only expense transactions are displayed in the list.

#### Feature 4: Surveillance & Security Panel (`Surveillance.jsx`)
16. **Render camera grid**: Assert that 4 camera feed panels are visible within the surveillance tab.
17. **Toggle live stream status**: Click the "Pause" button on the "Roast Area" camera and verify that the status badge changes from "Live" to "Paused".
18. **Render alerts feed log**: Assert that the security alerts log is populated with recent timestamped entries.
19. **Filter alert severity**: Select "High" severity from the alerts dropdown and verify that only warning/critical events are visible.
20. **Add new camera stream**: Click "Add Camera", input a name and stream path, and verify that a 5th camera panel is added to the grid.

#### Feature 5: Operational Automation Panel (`Operations.jsx`)
21. **Render stock levels table**: Assert that the stock level table lists products with stock values and low-stock thresholds.
22. **Highlight low stock items**: Verify that products with stock below threshold are highlighted with a red badge or text.
23. **Adjust stock manually**: Click "Adjust Stock" on an item, enter a new value, and verify that the updated stock count is saved and displayed.
24. **Show low stock alert banner**: Verify that a banner at the top of the page displays a warning if any item's stock is critically low.
25. **Display inventory log history**: Click the "Logs" tab and assert that manual adjustment details (quantity change, reason, timestamp) are displayed in the history log.

#### Feature 6: Delivery Integrations Panel (`DeliveryIntegrations.jsx`)
26. **Render platform cards**: Assert that Swiggy and Zomato integration status cards are visible.
27. **Toggle platform connection**: Click the connection toggle switch for Zomato and verify that the status changes to "Connected".
28. **Update API credentials**: Click "Edit Keys", input api keys, click save, and verify that the updated configuration is saved successfully.
29. **Render live delivery orders**: Assert that the live delivery orders feed shows incoming orders with platform logos.
30. **Accept incoming order**: Click "Accept Order" on a pending order and verify that the status changes to "Preparing".

#### Feature 7: Customer Profiling Panel (`CustomerProfiling.jsx`)
31. **Render customer table**: Assert that the customer table renders name, email, phone number, and total spend.
32. **Search customer list**: Enter a query in the search bar and verify that the customer list is filtered to match the search string.
33. **Open customer details modal**: Click a customer row and verify that a detail modal opens.
34. **Verify customer loyalty tier**: Assert that the customer's loyalty tier (e.g. Bronze, Gold) is displayed correctly on their profile.
35. **Display customer order history**: Open the detail modal and verify that the list of past orders is rendered with accurate totals.

---

### Tier 2: Boundary & Corner Cases (35 tests)

#### Feature 1: Subdomain Routing & Middleware
36. **Malformed subdomain**: Navigate to `http://out-let.janubhai.com` and verify that the system returns a 404 or routes to the main landing page.
37. **Double subdomain chaining**: Navigate to `http://test.outlet.localhost:3000` and verify that wildcard subdomain logic handles it safely.
38. **Direct IP routing**: Navigate to `http://127.0.0.1:3000/outlet` and verify that it does not crash or throw routing mismatch errors.
39. **Port mismatch handling**: Access the subdomain on an alternative port (e.g., `outlet.localhost:8080`) and verify that routing rewrites still apply.
40. **Trailing slash consistency**: Navigate to `http://outlet.localhost:3000/` and verify that it resolves identically to the path without the slash.

#### Feature 2: Admin Authentication & Access Guard
41. **Expired session refresh**: Access the dashboard with an expired token and assert that it automatically redirects to login after a refresh attempt fails.
42. **Empty token rejection**: Send an API request to `/api/admin/data?type=check` without a Bearer token and assert that it returns `401 Unauthorized`.
43. **Invalid token signature**: Access with a modified JWT payload and verify that `AdminGuard` rejects access and redirects to `/auth/login`.
44. **Whitespace and case casing in env**: Verify that emails listed in `SUPERADMIN_EMAILS` are checked case-insensitively with trimmed whitespace.
45. **Database connection down**: Mock a 500 error from Supabase during the auth token verification and verify that the UI shows a friendly error message.

#### Feature 3: Accounting & Growth Panel
46. **Zero amount transaction**: Attempt to record a transaction with an amount of `0` and verify that the form displays a validation error.
47. **Negative transaction value**: Verify that the transaction amount field does not accept negative values (unless selected as an "Expense" type).
48. **Numerical value overflow**: Record a transaction with a value of `99,999,999` and assert that the layout does not break and values are formatted correctly.
49. **Empty database state**: Mock an empty transaction database response and verify that the panel displays a "No transactions recorded yet" message.
50. **XSS script escaping**: Input a transaction description containing html/javascript tags and verify that it is rendered safely as plain text.

#### Feature 4: Surveillance & Security Panel
51. **Camera connection loss**: Mock a camera stream timeout and verify that the feed panel displays a "Connection Lost" retry overlay.
52. **Rapid stream status toggling**: Rapidly toggle a camera's status multiple times and verify that the UI updates correctly without race conditions.
53. **Excessive alert logs**: Mock 500+ security alerts and verify that the list handles virtualization or truncates old alerts to prevent memory slowdowns.
54. **Special character camera names**: Save a camera named `"Counter_#1 - ($Main)"` and verify that the UI handles the special characters without issues.
55. **No cameras configured**: Remove all cameras and verify that the tab displays an empty state banner with an option to create a camera.

#### Feature 5: Operational Automation Panel
56. **Negative inventory stock**: Adjust stock to a negative number and assert that the form displays a validation error.
57. **Decimal stock adjustments**: Adjust stock to `45.5` for weight-based items and verify that the decimal amount is accepted and rendered.
58. **Simultaneous stock updates**: Simulate a scenario where another admin updates stock while the form is open, and verify that saving does not overwrite with stale data.
59. **Extremely long adjustment notes**: Input a 1000-character stock adjustment note and verify that the text wraps correctly in the inventory log table.
60. **Missing reason validation**: Try to submit a stock adjustment without selecting a reason and verify that a validation error is displayed.

#### Feature 6: Delivery Integrations Panel
61. **Invalid API credentials format**: Input an improperly formatted API key (e.g. missing prefix, too short) and verify that the form shows a validation error.
62. **Delivery partner API timeout**: Mock a network timeout from Zomato's sync endpoint and verify that the card status updates to "Offline (Sync Timeout)".
63. **Simultaneous orders flood**: Simulate 10 delivery orders arriving within 1 second and verify that all orders are appended to the list without duplicates.
64. **Decline order reason validation**: Click "Decline Order" and verify that the action is blocked until a reason is chosen in the popup modal.
65. **Extreme item name length**: Receive an order with an item name of 150 characters and verify that the card layout does not break or clip the text.

#### Feature 7: Customer Profiling Panel
66. **No search results placeholder**: Enter a search query with no matches and verify that the table shows a "No customers match your query" banner.
67. **Customer with zero purchases**: Verify that a customer with `0` total orders is displayed with the lowest loyalty tier and `$0.00` total spent.
68. **Extremely long email formatting**: Verify that a customer with a very long email wraps correctly in the table row without overlapping columns.
69. **Search query SQL injection**: Enter `' OR '1'='1` in the search bar and verify that the query is escaped and results match the string literally.
70. **Deleted account handling**: Mock a customer with a deleted account status and verify that the profile is listed as "Deleted User / Anonymous" in the registry.

---

### Tier 3: Cross-Feature Combinations (7 tests)

71. **Stockout disables delivery item**: Adjust product stock to `0` in the Operations panel, and verify that the product's availability status is toggled to "Off" in the Swiggy/Zomato integrations panel.
72. **Delivery order decrements inventory**: Mock an incoming Zomato order for `2x Instant Coffee` being accepted, and verify that the stock count in the Operations panel decrements by 2.
73. **New transaction updates KPIs and Chart**: Submit a new Income transaction in the Accounting panel, and verify that the Recharts line graph redraws and the Total Revenue KPI increases.
74. **High-severity alert triggers operation warning**: Generate a high-severity alert (e.g., "Roaster Temperature Critical") in the Surveillance tab, and verify that a red warning banner appears in the Operations tab.
75. **High-value order updates customer tier**: Accept a Swiggy order of `$200` for a Silver tier customer, and verify that the customer's total spent updates in the Customer Profiling panel, promoting them to the Gold tier.
76. **Refund updates accounting ledger**: Process a refund for an order in the Operations panel, and verify that a corresponding "Expense" transaction is added to the Accounting ledger automatically.
77. **API configuration change resets connection**: Edit the Swiggy API credentials in the settings modal, save them, and verify that the connection status is temporarily set to "Reconnecting" before showing "Connected".

---

### Tier 4: Real-World Application Scenarios (5 tests)

78. **Morning Opening Flow**:
    - Log in to the outlet dashboard.
    - Check the Surveillance tab to confirm all 4 camera streams are running.
    - Go to the Operations tab, check low stock alerts, and manually increase the coffee beans stock level to `50.0 kg` (marking reason: "Opening stock").
    - Go to the Delivery Integrations tab and toggle both Swiggy and Zomato to "Connected".
79. **Lunch Rush Flow**:
    - Monitor the live orders feed in Delivery Integrations.
    - Accept an incoming Zomato order for a customer.
    - Verify that the item stock level decreases in Operations.
    - Check the Surveillance feed to verify high activity alerts.
    - Verify that the transaction revenue is logged under the Accounting tab.
80. **Inventory Stockout & Delivery Recovery Flow**:
    - Adjust milk stock to `0` in Operations (reason: "Spillage").
    - Verify that the milk-based items are marked "Unavailable" in Delivery Integrations.
    - Record a new shipment of milk in Operations (setting stock to `20`).
    - Verify that the items are automatically re-enabled in Delivery Integrations.
81. **Security Incident & Audit Trail Recording Flow**:
    - Simulate an alert "Unauthorized Access - Roast Area" in Surveillance.
    - Pause the camera feed to capture the incident.
    - Verify that the paused camera action and the security alert trigger are logged in the Admin Audit Log with the admin's email.
82. **End-of-Month Financial Audit Flow**:
    - Filter Accounting ledger by "Expense" to check overheads.
    - Log a new Q2 Tax transaction of `$500` and verify the Net Profit KPI.
    - Navigate to Customer Profiling, search for "Gold" tier members, and verify they are eligible for the monthly promo discount codes.
