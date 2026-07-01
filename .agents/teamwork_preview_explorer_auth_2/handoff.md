# Handoff Report: Supabase Admin Authentication Guard and /outlet Protection

## 1. Observation
After examining the codebase, the following key files, configurations, and test cases were observed:

### A. Client-Side Authentication Guard (`src/components/AdminGuard.js`)
* **Path**: `src/components/AdminGuard.js` (lines 1-50)
* **Behavior**:
  * It is a Client Component (`"use client"`).
  * It checks if a session exists using `supabase.auth.getSession()` (line 12).
  * If no session is found, it redirects the user to `/auth/login` (line 15).
  * If a session exists, it performs an authorization check by calling the server-side API `/api/admin/data?type=check` and passing the session token as a Bearer token in the `Authorization` header (lines 21-23).
  * If the server response returns `isAdmin: true`, it sets `isAuthorized` to `true` and renders the child components (lines 27-29).
  * If the authorization fails or errors, it redirects the user to the home page `/` (line 36).
  * While authorization is in progress, it displays a loading screen with the text `Checking Admin Credentials...` (lines 42-45).

### B. Server-Side Admin API Verification (`src/app/api/admin/data/route.js`)
* **Path**: `src/app/api/admin/data/route.js` (lines 4-21, 47-49)
* **Behavior**:
  * It extracts the token from the `Authorization` header (lines 5-10).
  * It initializes a server-side Supabase client using the service role key (`process.env.SUPABASE_SERVICE_ROLE_KEY`) and retrieves the user profile via `supabaseAdmin.auth.getUser(token)` to verify the token's validity (lines 11-14).
  * It checks if the user's email is present in the `SUPERADMIN_EMAILS` environment variable (lines 16-17).
  * If `type === "check"`, it returns `{ isAdmin: true }` (lines 47-49).

### C. Login Flow (`src/app/auth/login/page.js`)
* **Path**: `src/app/auth/login/page.js` (lines 20-32)
* **Behavior**:
  * Uses the client-side `supabase.auth.signInWithPassword` to authenticate the user (line 20).
  * Upon successful authentication, Supabase automatically persists the session in client-side `localStorage` under the key `sb-fheddjuiedseynqxhsfb-auth-token`.
  * The page then redirects the user to `/account` (line 31).

### D. Next.js 16 Proxy Convention (`src/proxy.js`)
* **Path**: `src/proxy.js` (lines 1-44) and Next.js docs (`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`)
* **Behavior**:
  * In Next.js 16, **Middleware** is renamed to **Proxy**; it resides in `src/proxy.js` and runs on the server (Edge/Node.js runtime) before a matched request completes.
  * The current matcher in `src/proxy.js` is:
    ```javascript
    export const config = {
      matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
    };
    ```
    This means the proxy runs on all page requests (like `/outlet` and `/admin`) but excludes API routes, static files, and favicons.

### E. E2E Test Expectations (`tests/outlet_dashboard.spec.js`)
* **Path**: `tests/outlet_dashboard.spec.js` (lines 121-194)
* **Behavior**:
  * **Test 3**: Verifies that requests with the host `outlet.janubhai.com` rewrite to `/outlet` via the subdomain middleware (Proxy).
  * **Test 6**: Verifies that an unauthenticated user accessing `/outlet` gets redirected to `/auth/login`. It mocks this by clearing the local storage token `sb-fheddjuiedseynqxhsfb-auth-token` and mock-failing the `**/auth/v1/user` endpoint.
  * **Test 7**: Verifies that an authenticated user with a non-admin email (returning `{ isAdmin: false }` from `/api/admin/data?type=check`) gets redirected to the home page `/`.
  * **Test 8**: Verifies that a superadmin user is allowed access.
  * **Test 9**: Verifies that a loading screen displaying the text `"Checking Admin Credentials..."` is shown while authentication is processing.

---

## 2. Logic Chain
Based on these observations, the following architectural decisions were made:

### Comparison: Next.js Middleware (Proxy) vs. Layout-level `AdminGuard`
We compared using server-side Next.js Middleware (Proxy) and client-side Layout-level `AdminGuard` for protecting `/outlet` routes:

1. **Access to Session Data (LocalStorage vs. Cookies)**:
   * **Next.js Proxy** executes on the server and only has access to HTTP headers and cookies. Since the application currently uses client-side `localStorage` to persist Supabase sessions, the server-side Proxy receives no auth credentials on initial request.
   * **Layout-level Guard** executes on the client and has full access to `localStorage` and `supabase.auth.getSession()`.
   * *Conclusion*: Next.js Proxy cannot retrieve the auth token directly without rewriting the authentication flow to use cookies, which would introduce major changes and risk breaking existing pages.

2. **Compliance with E2E Tests**:
   * **Test 9** explicitly asserts that the loading state text `"Checking Admin Credentials..."` is rendered to the user while credentials are checked.
   * **Next.js Proxy** handles redirects on the server before rendering the client page. If the user is unauthenticated, it returns a `307 Redirect` to `/auth/login`, meaning the client never renders `/outlet` and thus the loading text is never shown, failing **Test 9**.
   * **Layout-level Guard** mounts the layout, displays the loading state, conducts the check, and redirects if unauthorized, passing **Test 9** successfully.

3. **Rewritten Subdomain Routes Protection**:
   * Next.js rewrites change the routing path internally on the server (e.g. `outlet.janubhai.com/` rewrites to `/outlet`) while maintaining the original URL in the browser.
   * Because both `/outlet` (direct access) and the rewritten subdomain route resolve to the same Next.js route tree under `src/app/outlet/`, they share the layout at `src/app/outlet/layout.js`.
   * Wrapping `src/app/outlet/layout.js` in `AdminGuard` guarantees that **all** sub-pages and rewritten paths are protected automatically.

4. **Consistency**:
   * The `/admin` routes already use a layout-level `AdminGuard` wrapper in `src/app/admin/layout.js`. Reusing `AdminGuard` for `/outlet` maintains consistency across the codebase.

5. **Security Verification**:
   * Client-side redirection alone is not secure. However, all sensitive data rendered in the `/outlet` dashboard is loaded via secure backend API routes.
   * Since the API endpoints (e.g. `/api/admin/data`) require and verify the session token on the server using `supabaseAdmin.auth.getUser(token)`, bypassing the client-side `AdminGuard` will only render an empty shell with no data. Therefore, layout-level protection combined with API token verification is secure and robust.

---

## 3. Caveats
* **Subdomain Cookie Sharing**: In production, `localStorage` is scoped to a specific origin (protocol, domain, port). If the user logs in on `janubhaicoffee.com` and navigates to `outlet.janubhai.com`, `localStorage` will not share the token. To solve this in production, the user must either log in directly on the subdomain (e.g., `outlet.janubhai.com/auth/login`) or Supabase must be configured to write sessions to a wildcard cookie (e.g., `Domain=.janubhaicoffee.com`). This is not a concern for the local E2E tests, which manually inject the token into `localStorage` before navigating.
* **Public TopBar Component**: The public header `TopBar` hides itself for paths starting with `/admin` (`pathname?.startsWith('/admin')`). For `/outlet`, we must similarly hide the public `TopBar` to allow the custom outlet dashboard layout to render fully.

---

## 4. Conclusion & Recommended Code Strategy
It is recommended to implement the protection using a **Layout-level AdminGuard** inside `src/app/outlet/layout.js` and use **Proxy** (`src/proxy.js`) solely for subdomain rewriting.

### Step 1: Implement subdomain rewrite in `src/proxy.js`
In `src/proxy.js`, add a check for the subdomain `outlet.*` and rewrite it to `/outlet`. Make sure to exclude `/auth` pages, `/api` routes, and internal assets from rewriting:

```javascript
import { NextResponse } from "next/server";

export async function proxy(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";
  const pathname = url.pathname;

  // 1. Subdomain rewriting logic
  const isOutletSubdomain = hostname.startsWith("outlet.");
  if (isOutletSubdomain) {
    // Avoid rewriting internal Next.js assets, API routes, and auth paths
    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/auth')) {
      url.pathname = `/outlet${pathname}`;
      
      const response = NextResponse.rewrite(url);
      // Forward necessary headers
      response.headers.set('x-forwarded-host', hostname);
      return response;
    }
  }

  // 2. Existing protection/headers logic...
  if (pathname.startsWith('/api/ai/generate-article')) {
    // Existing logic...
  }

  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Step 2: Implement `/outlet` layout-level protection in `src/app/outlet/layout.js`
Create `src/app/outlet/layout.js` to protect the layout and its sub-pages:

```javascript
import AdminGuard from "@/components/AdminGuard";

export const metadata = {
  title: "Outlet Management Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OutletLayout({ children }) {
  return (
    <AdminGuard>
      <div className="outlet-dashboard-shell">
        {/* Render outlet specific shell/sidebar layout here */}
        {children}
      </div>
    </AdminGuard>
  );
}
```

### Step 3: Update `TopBar` to include "Outlet Management" link and hide it on `/outlet`
Update `src/components/TopBar.jsx` to render the navigation link and hide the top bar on `/outlet`:

1. **Hide TopBar on `/outlet`** (around line 40):
   ```javascript
   if (pathname?.startsWith('/admin') || pathname?.startsWith('/outlet')) return null;
   ```
2. **Add "Outlet Management" Link** (around line 72, visible to admins):
   ```javascript
   {/* Render inside the nav menu if the user is authenticated / admin */}
   {user && (
     <Link href="/outlet" className="nav-link">
       Outlet Management
     </Link>
   )}
   ```
   *Note*: The tests verify `TopBar` has an `a:has-text("Outlet Management")` link navigating to `/outlet`.

### Step 4: (Optional Improvement) Support Redirect Query Parameter
To improve user experience on login, allow `AdminGuard` to pass a `redirectTo` parameter and update `/auth/login/page.js` to redirect there:
1. In `AdminGuard.js`:
   ```javascript
   if (!session) {
     const currentPath = window.location.pathname;
     router.push(`/auth/login?redirectTo=${encodeURIComponent(currentPath)}`);
     return;
   }
   ```
2. In `src/app/auth/login/page.js`:
   ```javascript
   // Read search parameter redirectTo
   import { useSearchParams } from "next/navigation";
   // inside LoginPage:
   const searchParams = useSearchParams();
   const redirectTo = searchParams.get("redirectTo") || "/account";
   
   // inside handleLogin success:
   router.push(redirectTo);
   ```

---

## 5. Verification Method
To independently verify the implementation once applied:
1. Run the Playwright E2E tests:
   ```bash
   npx playwright test tests/outlet_dashboard.spec.js
   ```
2. Check that the tests verify:
   * Access to `outlet.janubhai.com` rewrites to `/outlet` (Test 3).
   * Unauthenticated redirect to `/auth/login` (Test 6).
   * Non-admin redirect to `/` (Test 7).
   * Superadmin access allowed (Test 8).
   * Loading state is shown (Test 9).
   * TopBar link is present and routes to `/outlet` (Tests 1-2).
