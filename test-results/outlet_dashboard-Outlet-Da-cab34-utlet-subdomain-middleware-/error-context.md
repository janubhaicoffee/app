# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: outlet_dashboard.spec.js >> Outlet Dashboard E2E Test Suite >> 3. Verify that accessing outlet.janubhai.com rewrites to /outlet (subdomain middleware).
- Location: tests\outlet_dashboard.spec.js:70:3

# Error details

```
Error: page.goto: net::ERR_INVALID_ARGUMENT at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | const { seedDatabase, cleanupDatabase } = require('./db_helper');
  3   | 
  4   | // Setup page routing and local storage mock for Supabase auth
  5   | test.beforeEach(async ({ page }) => {
  6   |   // 1. Inject mock Supabase Auth session token in localStorage before navigation
  7   |   await page.addInitScript(() => {
  8   |     const mockSession = {
  9   |       access_token: 'dummy-token-jwt-superadmin',
  10  |       refresh_token: 'dummy-refresh-token',
  11  |       expires_in: 3600,
  12  |       expires_at: Math.floor(Date.now() / 1000) + 3600,
  13  |       token_type: 'bearer',
  14  |       user: {
  15  |         id: 'mock-admin-uuid',
  16  |         aud: 'authenticated',
  17  |         role: 'authenticated',
  18  |         email: 'admin@janubhaicoffee.com',
  19  |         created_at: new Date().toISOString(),
  20  |         updated_at: new Date().toISOString(),
  21  |       }
  22  |     };
  23  |     window.localStorage.setItem('sb-fheddjuiedseynqxhsfb-auth-token', JSON.stringify(mockSession));
  24  |   });
  25  | 
  26  |   // 2. Intercept Supabase Auth check API endpoint
  27  |   await page.route('**/auth/v1/user', async (route) => {
  28  |     await route.fulfill({
  29  |       status: 200,
  30  |       contentType: 'application/json',
  31  |       body: JSON.stringify({
  32  |         id: 'mock-admin-uuid',
  33  |         email: 'admin@janubhaicoffee.com',
  34  |         aud: 'authenticated',
  35  |         role: 'authenticated',
  36  |       })
  37  |     });
  38  |   });
  39  | });
  40  | 
  41  | 
  42  | test.describe('Outlet Dashboard E2E Test Suite', () => {
  43  | 
  44  |   test.beforeAll(async () => {
  45  |     await cleanupDatabase();
  46  |     await seedDatabase();
  47  |   });
  48  | 
  49  |   test.afterAll(async () => {
  50  |     await cleanupDatabase();
  51  |   });
  52  | 
  53  |   // ==========================================
  54  |   // TIER 1: FEATURE COVERAGE (35 Tests)
  55  |   // ==========================================
  56  | 
  57  |   // Feature 1: Subdomain Routing & Navigation Link
  58  |   test('1. Verify TopBar renders the "Outlet Management" navigation link.', async ({ page }) => {
  59  |     await page.goto('/');
  60  |     const outletLink = page.locator('a:has-text("Outlet Management")');
  61  |     await expect(outletLink).toBeVisible();
  62  |   });
  63  | 
  64  |   test('2. Verify clicking "Outlet Management" link navigates to /outlet.', async ({ page }) => {
  65  |     await page.goto('/');
  66  |     await page.click('a:has-text("Outlet Management")');
  67  |     await expect(page).toHaveURL(/\/outlet$/);
  68  |   });
  69  | 
  70  |   test('3. Verify that accessing outlet.janubhai.com rewrites to /outlet (subdomain middleware).', async ({ page }) => {
  71  |     await page.setExtraHTTPHeaders({ host: 'outlet.janubhai.com' });
> 72  |     await page.goto('/');
      |                ^ Error: page.goto: net::ERR_INVALID_ARGUMENT at http://localhost:3000/
  73  |     await expect(page.locator('[data-testid="accounting-panel"]')).toBeVisible();
  74  |   });
  75  | 
  76  |   test('4. Verify middleware forwards headers correctly (host, user-agent).', async ({ page }) => {
  77  |     await page.setExtraHTTPHeaders({
  78  |       host: 'outlet.janubhai.com',
  79  |       'user-agent': 'PlaywrightTestAgent'
  80  |     });
  81  |     await page.goto('/outlet');
  82  |     const panel = page.locator('[data-testid="accounting-panel"]');
  83  |     await expect(panel).toBeVisible();
  84  |   });
  85  | 
  86  |   test('5. Verify accessing /outlet directly renders the dashboard shell when authenticated as admin.', async ({ page }) => {
  87  |     await page.goto('/outlet');
  88  |     await expect(page.locator('[data-testid="accounting-panel"]')).toBeVisible();
  89  |     await expect(page.locator('[data-testid="surveillance-panel"]')).toBeVisible();
  90  |   });
  91  | 
  92  |   // Feature 2: Supabase Authentication Guard
  93  |   test('6. Verify unauthenticated user trying to access /outlet is redirected to /auth/login.', async ({ page }) => {
  94  |     // Override before each script to clear local storage
  95  |     await page.addInitScript(() => {
  96  |       window.localStorage.removeItem('sb-fheddjuiedseynqxhsfb-auth-token');
  97  |     });
  98  |     // Intercept auth user check to return 401
  99  |     await page.route('**/auth/v1/user', async (route) => {
  100 |       await route.fulfill({ status: 401, body: JSON.stringify({ error: 'unauthorized' }) });
  101 |     });
  102 |     await page.goto('/outlet');
  103 |     await expect(page).toHaveURL(/\/auth\/login/);
  104 |   });
  105 | 
  106 |   test('7. Verify authenticated user with non-admin email (e.g. test@user.com) is redirected to home /.', async ({ page }) => {
  107 |     await page.addInitScript(() => {
  108 |       const mockSession = {
  109 |         access_token: 'dummy-token',
  110 |         user: { email: 'test@user.com' }
  111 |       };
  112 |       window.localStorage.setItem('sb-fheddjuiedseynqxhsfb-auth-token', JSON.stringify(mockSession));
  113 |     });
  114 |     await page.route('**/api/admin/data*', async (route) => {
  115 |       await route.fulfill({
  116 |         status: 200,
  117 |         contentType: 'application/json',
  118 |         body: JSON.stringify({ isAdmin: false })
  119 |       });
  120 |     });
  121 |     await page.goto('/outlet');
  122 |     await expect(page).toHaveURL(/\/$/);
  123 |   });
  124 | 
  125 |   test('8. Verify authenticated user with superadmin email (e.g. admin@janubhaicoffee.com) is allowed access.', async ({ page }) => {
  126 |     await page.goto('/outlet');
  127 |     await expect(page.locator('[data-testid="accounting-panel"]')).toBeVisible();
  128 |   });
  129 | 
  130 |   test('9. Verify loading state is shown ("Checking Admin Credentials...") while authenticating.', async ({ page }) => {
  131 |     await page.route('**/api/admin/data*', async (route) => {
  132 |       // delay the auth verification to check loading state
  133 |       await new Promise(resolve => setTimeout(resolve, 500));
  134 |       await route.fulfill({
  135 |         status: 200,
  136 |         contentType: 'application/json',
  137 |         body: JSON.stringify({ isAdmin: true })
  138 |       });
  139 |     });
  140 |     await page.goto('/outlet');
  141 |     const loadingState = page.locator('text=Checking Admin Credentials...');
  142 |     await expect(loadingState).toBeVisible();
  143 |   });
  144 | 
  145 |   test('10. Verify that logging out immediately revokes access to the /outlet page (redirects to login).', async ({ page }) => {
  146 |     await page.goto('/outlet');
  147 |     const logoutBtn = page.locator('[data-testid="btn-logout"]');
  148 |     await expect(logoutBtn).toBeVisible();
  149 |     await logoutBtn.click();
  150 |     await expect(page).toHaveURL(/\/auth\/login/);
  151 |   });
  152 | 
  153 |   // Feature 3: Accounting & Growth Module
  154 |   test('11. Verify Accounting panel is rendered with revenue/growth stats.', async ({ page }) => {
  155 |     await page.goto('/outlet');
  156 |     const panel = page.locator('[data-testid="accounting-panel"]');
  157 |     await expect(panel).toBeVisible();
  158 |     await expect(page.locator('[data-testid="stat-revenue"]')).toContainText('24500.75');
  159 |     await expect(page.locator('[data-testid="stat-growth"]')).toBeVisible();
  160 |   });
  161 | 
  162 |   test('12. Verify transaction list is rendered with past transactions.', async ({ page }) => {
  163 |     await page.goto('/outlet');
  164 |     const rows = page.locator('[data-testid="transaction-row"]');
  165 |     await expect(rows.first()).toBeVisible();
  166 |   });
  167 | 
  168 |   test('13. Verify Recharts component is rendered inside the accounting panel.', async ({ page }) => {
  169 |     await page.goto('/outlet');
  170 |     const chart = page.locator('[data-testid="growth-chart"]');
  171 |     await expect(chart).toBeVisible();
  172 |   });
```