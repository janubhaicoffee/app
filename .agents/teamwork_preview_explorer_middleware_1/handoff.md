# Handoff Report: Next.js Subdomain Middleware Routing & TopBar Link Implementation

## 1. Observation

During read-only investigation, the following files and configuration details were observed:

### A. Next.js Version and Convention
- **File**: `package.json` (line 18)
  - Next.js version is configured as `"next": "16.2.9"`.
- **File**: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
  - Explains that the `middleware.js` convention is **deprecated** in Next.js 16 and has been renamed to `proxy.js` (line 11, 774).
  - An active file `src/proxy.js` already exists in the repository, containing security headers and API route protection.
  
### B. Current Proxy Structure
- **File**: `src/proxy.js` (complete content)
  - Exports a `proxy` function and a `config` matcher:
  ```javascript
  import { NextResponse } from "next/server";
  import { createClient } from "@supabase/supabase-js";

  export async function proxy(req) {
    const pathname = req.nextUrl.pathname;
    if (pathname.startsWith('/api/ai/generate-article')) {
      // ... Supabase session / admin verification ...
    }
    const response = NextResponse.next();
    // Security headers applied to standard requests
    return response;
  }
  ```

### C. TopBar Navigation Link Structure
- **File**: `src/components/TopBar.jsx` (lines 67-73)
  - Defines storefront links:
  ```jsx
  <Link href="/product/instantcoffee" className="nav-link">
    Instant Coffee
  </Link>
  <Link href="/process" className="nav-link">Our Process</Link>
  ```

### D. Playwright E2E Tests Requirements
- **File**: `tests/outlet_dashboard.spec.js` (lines 108-135, 443-461)
  - Defines constraints for the Outlet Management navigation link and subdomain routing:
  ```javascript
  test('1. Verify TopBar renders the "Outlet Management" navigation link.', async ({ page }) => {
    const outletLink = page.locator('a:has-text("Outlet Management")');
  });

  test('2. Verify clicking "Outlet Management" link navigates to /outlet.', async ({ page }) => {
    await page.click('a:has-text("Outlet Management")');
    await expect(page).toHaveURL(/\/outlet$/);
  });

  test('38. Verify TopBar link points to correct URL dynamically based on environment.', async ({ page }) => {
    const link = page.locator('a:has-text("Outlet Management")');
    const href = await link.getAttribute('href');
    expect(href).toContain('/outlet');
  });

  test('3. Verify that accessing outlet.janubhai.com rewrites to /outlet (subdomain middleware).', async ({ page }) => {
    await page.setExtraHTTPHeaders({ host: 'outlet.janubhai.com' });
    await page.goto('/');
    await expect(page.locator('[data-testid="accounting-panel"]')).toBeVisible();
  });

  test('40. Verify middleware handles request with port number in the host header.', async ({ page }) => {
    await page.setExtraHTTPHeaders({ host: 'outlet.janubhai.com:3000' });
    await page.goto('/');
  });
  ```

---

## 2. Logic Chain

1. **Deprecated middleware.js vs proxy.js**: Since Next.js 16 is in use, and `src/proxy.js` is already implemented and handling critical security rules, creating a separate `src/middleware.js` is both deprecated and unsafe (as it would bypass or conflict with the existing `proxy`). Therefore, the rewrite strategy must modify the existing `src/proxy.js`.
2. **Subdomain Detection**: To detect requests aimed at the outlet subdomain, we extract `req.nextUrl.hostname` (which automatically strips port numbers, satisfying the port number boundary test). If `hostname.startsWith('outlet.')` is true, the request targets the subdomain.
3. **Infinite Rewrite Prevention**: To prevent infinite loops or double rewrites, the proxy must only rewrite requests whose `pathname` does not already start with `/outlet`.
4. **Static Asset Safety**: To avoid breaking public assets or API routes, paths starting with `/api` or `/_next`, or containing a dot `.` (indicating a file extension), must not be rewritten.
5. **Security Headers Consistency**: The rewritten response should receive the same security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`) as standard requests.
6. **TopBar SSR / Client Hydration Mismatch**: In Next.js, determining `window.location.hostname` on initial render can cause a hydration mismatch between the server-rendered HTML and client. We initialize the link to `/outlet` (which is standard and satisfies the Playwright test expectation of containing `/outlet`) and dynamically update it to `https://outlet.janubhai.com` inside a client-side `useEffect` hook only in production (when the hostname includes `"janubhai.com"`).

---

## 3. Caveats

- **No Local Host File Setup**: Developers running tests locally might access the site on `localhost:3000`. In that case, the dynamic link will point to `/outlet` which is correct for E2E tests, but if they want to test subdomain resolution locally, they must configure local host file aliases (e.g. `outlet.localhost`) and access the port explicitly.
- **Supabase Session Sharing**: supabase auth token storage is typically scoped to a specific domain. Accessing the `outlet.janubhai.com` subdomain will require the client SDK to share sessions across subdomains, which is typically handled by setting cookies on the wild card domain (`.janubhai.com`) or re-authenticating.

---

## 4. Conclusion & Recommendations

### Recommendation 1: Update `src/proxy.js`
We recommend adding subdomain routing at the beginning of the `proxy` function in `src/proxy.js`.

**Proposed changes for `src/proxy.js`**:
```javascript
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function proxy(req) {
  const { pathname, hostname } = req.nextUrl;

  // 1. Subdomain Routing (e.g. outlet.janubhai.com -> /outlet)
  if (hostname.startsWith('outlet.')) {
    // Avoid double-rewrites, api paths, next assets, and static files
    if (
      !pathname.startsWith('/outlet') &&
      !pathname.startsWith('/api') &&
      !pathname.startsWith('/_next') &&
      !pathname.includes('.')
    ) {
      const url = req.nextUrl.clone();
      url.pathname = `/outlet${pathname}`;
      const response = NextResponse.rewrite(url);
      
      // Inject security headers for the rewritten response
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      return response;
    }
  }

  // 2. Secure API Route Protection (Existing code)
  if (pathname.startsWith('/api/ai/generate-article')) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const adminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    if (!adminEmails.includes(user.email?.toLowerCase())) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 3. Security Headers for Normal Requests (Existing code)
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

### Recommendation 2: Update `src/components/TopBar.jsx`
We recommend defining a dynamic state variable `outletUrl` and updating it in the existing `useEffect` mount hook.

**Proposed changes for `src/components/TopBar.jsx`**:
1. Add the state hook inside the component (e.g. line 17):
   ```javascript
   const [outletUrl, setOutletUrl] = useState("/outlet");
   ```
2. Modify the `useEffect` hook to resolve the URL on mount:
   ```javascript
   useEffect(() => {
     supabase.auth.getSession().then(({ data: { session } }) => {
       setUser(session?.user || null);
     });

     async function loadProducts() {
       const { data } = await supabase.from('products').select('id, name, category').order('created_at', { ascending: true });
       if (data) {
         setCoffeeProducts(data.filter(p => p.category !== 'merch'));
       }
     }
     loadProducts();

     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       setUser(session?.user || null);
     });

     // Resolve dynamic URL to satisfy both local testing and production subdomain routing
     if (typeof window !== "undefined") {
       const hostname = window.location.hostname;
       if (hostname.includes("janubhai.com")) {
         setOutletUrl("https://outlet.janubhai.com");
       } else {
         setOutletUrl("/outlet");
       }
     }

     return () => subscription.unsubscribe();
   }, []);
   ```
3. Add the Link to the navigation list (e.g. line 73):
   ```jsx
   <Link href={outletUrl} className="nav-link">
     Outlet Management
   </Link>
   ```

---

## 5. Verification Method

To verify the proposed implementation, run the following E2E test command in the project root:
```bash
npx playwright test tests/outlet_dashboard.spec.js
```
The test suite validates:
1. That the navigation link is present and says `"Outlet Management"`.
2. That clicking the link points to a URL containing `/outlet` locally and navigates to the correct page.
3. That setting host header to `outlet.janubhai.com` correctly rewrites root and relative paths internally to `/outlet` without rendering issues.
4. That port numbers in the host header are handled correctly.
5. That static assets and invalid subdomains are bypassed.
