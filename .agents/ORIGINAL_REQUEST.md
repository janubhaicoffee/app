# Original User Request

## Initial Request — 2026-06-26T01:28:25Z

Refine the UI/UX of the Janu Bhai Coffee application with cinematic Framer Motion micro-interactions and high-end animations across the product customizer, checkout flow, process timeline, and progression screens.

Working directory: c:\Users\hudav\Documents\GitHub\app
Integrity mode: demo

## Requirements

### R1. Cinematic Product Customizer & Decrypter UI
Refine the Brew Blueprint selector and Mystery Drop decrypter on the product page. Sliders must react with elastic spring physics, and the mystery drop reveal must perform a cinematic 3D card flip or holographic glow card animation.
- *Verification*: An independent auditor agent must navigate to a product page, verify that the blueprint selector and mystery drop decrypter elements are present, and assert that Framer Motion components are utilized for these interactive sections.

### R2. Interceptor Warning & Checkout Flow Animations
Improve the high-intensity caffeine warning modal with an immersive backdrop blur, scale-up entrance animation, and glowing validation indicators on the statement checkbox.
- *Verification*: An independent auditor agent must trigger the warning modal, inspect the modal container, and assert that it utilizes Framer Motion transitions (AnimatePresence and entrance spring motion).

### R3. Spatial Timeline Transitions on Process Page
Enhance the timeline steps on the Process page with smooth scroll-linked translations, hover-zoom effects on video cards, and custom blending overlays.
- *Verification*: An independent auditor agent must verify that the process page timeline nodes animate scale/opacity on scroll and that hover-tilt or scale effects exist on the video wrappers.

### R4. Progression Lore Dashboard Visuals
Create a glowing lore progression completion bar in the user portal that animates from 0% to the target percentage with a dual-gradient sweep on load, and card hover-expand effects for points ledger items.
- *Verification*: An independent auditor agent must verify that the progress bar exists in the portal and that its width matches the calculated lore progression percentage with smooth transitions.

## Acceptance Criteria

### UI Animation Standards
- [ ] Product customizer sliders utilize Framer Motion spring physics with `stiffness` and `damping` parameters.
- [ ] The Mystery Drop reveal utilizes a 3D rotation (`rotateY`) card flip transition or a glowing holographic backdrop transition.
- [ ] The caffeine warning modal opens with a smooth scale-up spring entry, and backdrop blur filter transitions.
- [ ] Process timeline steps use `useScroll` and `useTransform` to bind scroll progress to `opacity`, `scale`, and `y` position.
- [ ] Progression progress bar uses Framer Motion `animate` to sweep from 0% to the computed percentage on component mount.

## Follow-up — 2026-06-30T00:35:50Z

An outlet management web application hosted at `outlet.janubhai.com` (and integrated within the main Next.js codebase), designed for cafe administrators. It encompasses modular tools for outlet operations, accounting/growth, customer profiling, Swiggy/Zomato integrations, and surveillance stream management.

Working directory: c:/Users/hudav/Documents/GitHub/app
Integrity mode: development

## Requirements

### R1. Subdomain Middleware Routing
- Implement Next.js middleware that detects requests to `outlet.janubhai.com` (and local simulation like `outlet.localhost:3000` or `outlet.janubhai.localhost:3000`) and rewrites/routes them internally to `/outlet` paths.
- Add a navigation link to the main public-facing `TopBar` component that points to the `outlet.janubhai.com` subdomain (or the relative `/outlet` path for easy local navigation).

### R2. Modular Outlet Dashboard Structure
- Create a unified, responsive dashboard UI under `/outlet` with an isolated, modular structure for the following sections:
  1. **Accounting & Growth**: Track sales revenue, operational expenses, profit/loss margins, and display interactive charts using `recharts`.
  2. **Surveillance & Security**: A simulated surveillance camera feed panel that allows adding RTMP/HLS camera feed URLs, listing cameras, displaying stream statuses, and triggering mock security alerts.
  3. **Operational Automation**: Manage cafe inventory (low-stock alerts, auto-reorder thresholds) and staff scheduling logs.
  4. **Swiggy & Zomato Integrations**: Connect and manage delivery partner integrations (configure API credentials, toggle activation, view simulated live orders).
  5. **Customer Profiling**: Detailed user registry showing name, order history, lifetime spend, preferences, and loyalty program status.

### R3. Authentication & Security
- Restrict access to the `/outlet` routes (and the `outlet.` subdomain) to authenticated users who have administrative access, leveraging Supabase Auth.

## Acceptance Criteria

### Routing & Navigation
- [ ] The `TopBar` navigation bar includes a link to the Outlet Management subdomain.
- [ ] Accessing `https://outlet.janubhai.com` (or local counterpart `/outlet`) displays the outlet dashboard rather than the public storefront.
- [ ] Accessing `/outlet` pages without authentication redirects to the login screen.

### Modules Functionality
- [ ] **Accounting**: Users can add new expense or revenue transactions. Graphs (built with Recharts) update dynamically when new transactions are submitted.
- [ ] **Surveillance**: Allows adding camera stream configurations, toggling camera active/inactive statuses, and triggers alert notifications in a mock feed.
- [ ] **Delivery Integrations**: Allows saving Mock/Production API keys for Swiggy and Zomato, toggles active/inactive state, and displays simulated incoming orders when active.
- [ ] **Customer Profiling**: Displays a table of customers with their total lifetime spend, orders count, and loyalty tier. Allows filtering or searching by name.
- [ ] **Operations**: Displays current stock levels, flags items that are below their minimum threshold, and allows configuring reorder levels.

### Code Integrity & Modularization
- [ ] Code for each module is placed in dedicated directories/components (e.g. `src/components/outlet/...` or separate subfolders) so that one module's changes do not break another.

## Verification Plan

### Automated Verification
- Create a Playwright test file at `tests/outlet_dashboard.spec.js` that:
  - Verifies presence of the outlet link in `TopBar`.
  - Asserts that `/outlet` pages require authentication (redirects to `/auth/login` if unauthenticated).
  - Asserts that once logged in as an admin, navigating to `/outlet` renders the main dashboard.
  - Interacts with the accounting module (submitting a transaction and verifying it updates list/charts).
  - Interacts with the Swiggy/Zomato toggles and checks for active status changes.
  - Interacts with the customer profiling table (filtering list).

## Follow-up — 2026-06-30T00:47:40Z

The user has explicitly updated the project requirements:
The implementation must NOT use any fake, mock, demo, or simulated systems. Everything must be built as a fully functional, production-ready system.

Please update the requirements and ensure the team builds the following:
1. **Routing**: Real subdomain routing in Next.js using middleware/rewrites, fully redirecting `outlet.janubhai.com` to the `/outlet` routes, with navigation links.
2. **Accounting & Growth**: Store all transaction logs (revenue, expenses) in a real Supabase database table (e.g. `outlet_transactions`). Create any necessary database schema/migrations. Graphs must load real data from the database.
3. **Surveillance**: Integrate a real video player (e.g., HTML5 video or HLS.js player) that loads and plays actual configured RTMP/HLS/WebRTC camera URLs, rather than a fake static dashboard.
4. **Swiggy/Zomato**: Implement real API endpoints/webhooks (e.g., `/api/integrations/swiggy`, `/api/integrations/zomato`) that can receive real order webhooks/JSON payloads, store them in the database, and display them. Save actual partner credentials (API keys, client IDs) securely.
5. **Customer Profiling & Operations**: Read and write customer profiles, inventory items, stock levels, and staff schedules directly to/from actual tables in the Supabase database.
6. **Code Integrity & Modularization**: Ensure all modules are clean, robust, and placed in separate folders so that they are maintainable and independent.

Adjust the test verification plan and execution milestones to verify these real integrations and database interactions (e.g., using test credentials/data in database).
