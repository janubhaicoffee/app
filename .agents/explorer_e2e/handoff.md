# Handoff Report: E2E Test Suite Design & Codebase Exploration

This report compiles the findings from exploring the codebase and designs the end-to-end (E2E) testing framework, test cases, and test infrastructure for the five UI/UX micro-interaction features.

---

## 1. Observation

During our read-only codebase exploration, we checked the existing configurations and files:

### Existing Configurations
- **`package.json`**: Checked all dependencies and scripts. No E2E testing framework, Jest, Cypress, Playwright, or Testing Library are listed. The scripts contain only `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"`, and `"lint": "eslint"`.
- **Dry-run install**: Proposing and running `npm install --dry-run playwright` succeeded and simulated adding 76 packages (including `playwright` and `playwright-core`) in 9 seconds. This confirms npm installs work in this local environment.
- **Database state**: Queried Supabase tables using a temporary node script (`check_schema.js`). We found 3 products, 3 coffee variants, and 0 mystery drops. The 3 coffee variants of the product `instantcoffee-100g` are:
  - `thodi-hard-mild` (intensity: 25, price: ₹280)
  - `thodi-hard-medium` (intensity: 50, price: ₹300)
  - `thodi-hard-extreme` (intensity: 90, price: ₹350)

### Feature 1: Product Customizer Sliders
- **Component**: `src/app/product/[id]/ProductClient.jsx`
- **Observations**:
  - Main container: `.brew-blueprint-section`
  - Sleep Deprivation scale slider: `<input type="range" min="1" max="100" value={sleepDebt} onChange={(e) => setSleepDebt(Number(e.target.value))} />` (first slider in container)
  - Workload Intensity scale slider: `<input type="range" min="1" max="100" value={workload} onChange={(e) => setWorkload(Number(e.target.value))} />` (second slider in container)
  - Displays: Value output displays `sleepDebt` and `workload` (e.g. `50 / 100`).
  - Caffeine Intensity output: Shows calculated intensity `(sleepDebt * 0.6) + (workload * 0.4)` in red: `<span style={{ color: 'var(--accent-red)' }}>{calculatedIntensity}%</span>`.
  - Matched Variant Card: Displays the matched variant name, description, and price (e.g., `Matched: Thodi Hard - Medium Roast`).
  - URL synchronization: Updates URL search parameters silently via `window.history.replaceState` to include `?sleep_debt=${sleepDebt}&workload=${workload}`.
  - Share button: `<button className="btn-secondary">SHARE CONFIG LINK 🔗</button>`.

### Feature 2: Mystery Drop Decrypter UI
- **Component**: `src/app/product/[id]/ProductClient.jsx`
- **Observations**:
  - Container class: `.mystery-drop-section`
  - Text input: `<input type="text" placeholder="e.g. SECRET-ARABICA-XX" value={mysteryToken} onChange={(e) => setMysteryToken(e.target.value)} />`
  - Decrypt Button: `<button type="submit" disabled={verifyingMystery} className="btn-primary">`
  - Error rendering: `<p style={{ color: 'var(--accent-red)' }}>⚠️ {mysteryError}</p>`
  - Success Holographic Reveal: `<motion.div key="revealed-drop" initial={{ scale: 0.8, rotateY: 90, opacity: 0 }} animate={{ scale: 1, rotateY: 0, opacity: 1 }} transition={{ type: "spring", damping: 15 }} className="holographic-reveal" ...>`
  - Success text: Displays `✨ SECURED BEANS DECRYPTED ✨`, and fields: `Decrypted Origin`, `Roast Characteristics`, `Tasting Notes`.
  - Reset decrypter button: `<button className="btn-secondary">RESET DECRYPTER</button>`.

### Feature 3: Interceptor Warning & Checkout Flow Modal
- **Component**: `src/components/InterceptorModal.jsx` (loaded globally in `src/app/layout.js`)
- **Observations**:
  - Overlay class: `.modal-overlay`
  - Modal container: `.modal-box` (animate: `initial={{ scale: 0.9, opacity: 0, y: 50 }}`)
  - Warning title: `WARNING: HIGH CAFFEINE INTENSITY ⚠️`
  - Checkbox container: `.checkbox-container`
  - Checkbox input: `input[type="checkbox"]`
  - Action buttons:
    - Cancel: `.btn-cancel` (resets cart item state)
    - Confirm: `.btn-confirm` (disabled when checkbox is unchecked, enables when checked, adds variant to cart)
  - Interceptor trigger condition (`src/context/CartContext.js` line 53):
    `if (product.variantSlug === 'thodi-hard-extreme' && !product.confirmed) { ... }`

### Feature 4: Spatial Timeline Transitions on Process Page
- **Page**: `src/app/process/page.js` and `process.css`
- **Observations**:
  - Main container: `.process-timeline-section`
  - Steps list: `.spatial-timeline-container`
  - Row items: `.timeline-step-row` (alternates class between `odd-row` and `even-row`).
  - Media wrapper: `.step-media-wrapper` containing video loop `.step-loop-video` (loaded from external Vimeo MP4 links).
  - Scroll-linked spring animations: Inside `TimelineNode` (line 66), `useScroll` tracks the row position and translates it using `useTransform`:
    ```javascript
    const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.1, 1, 1]);
    const scale = useTransform(scrollYProgress, [0, 0.6, 1], [0.85, 1, 1]);
    const y = useTransform(scrollYProgress, [0, 0.6, 1], [80, 0, 0]);
    ```
  - Card content: `.step-card-content` containing step title, phase number, and descriptions.

### Feature 5: Progression Lore Dashboard Visuals
- **Page**: `src/app/account/page.js` and `account.css`
- **Observations**:
  - Tab selector: `.nav-item` containing `Lore & Progression` (activates `activeTab === 'progression'`).
  - Main dashboard layout: `.progression-container`
  - Current tier display: `.lore-card` containing `.tier-title-container h3` (tier name) and a `.tier-badge`.
  - Progress bar container: `.progress-bar-outer`
  - Progress bar sweep element: `.progress-bar-inner` with `style={{ width: `${tierInfo.progressPercent}%` }}` and transition: `width 0.8s cubic-bezier(0.4, 0, 0.2, 1)`.
  - Ledger Table Container: `.ledger-table-container` rendering a table of points ledger entries.
  - Hover effect on ledger row (line 330 of `account.css`): `.ledger-table-container tr:hover` changes background to `#fafafa`.

---

## 2. Logic Chain

Based on our observations, we reason the following:

1. **Framework Choice**: Since `package.json` contains no existing testing configurations and our dry-run package install test indicates that standard npm installations work in this environment, we can install any framework.
2. **Playwright Recommendation**: Playwright is recommended over Jest/JSDOM because JSDOM does not render layout trees, process actual CSS transformations, or evaluate mouse coordinates for hover zoom/tilt actions. Playwright is also recommended over Cypress because it has a lower footprint, runs cleanly headless on command line in CODE_ONLY environments, supports native chromium engines, and has built-in support for inspecting multi-tab contexts, clipboard events (necessary for customizer configuration copy links), and local storage data injection (critical for bypassing supabase authentication checks).
3. **Database Mocking Strategy**: The `mystery_drops` table is currently empty, meaning we cannot test the successful decryption path without database seeding. E2E tests must be accompanied by a programmatic seed endpoint or script to insert mock mystery drops (e.g. `SECRET-ARABICA-50`) and mock user profiles/ledger points to verify the progression bars and ledger items.

---

## 3. Caveats

- **SUPABASE_SERVICE_ROLE_KEY missing in `.env.local`**: The local `.env.local` contains only public keys. A programmatic test endpoint (e.g., `/api/test/setup`) might need to use RLS-bypassing client keys or direct PG connections to write seed profiles and test orders since standard anon keys may restrict inserts based on RLS rules.
- **External Vimeo Video URLs**: The process page timeline videos (`src/app/process/page.js`) use external Vimeo URLs. In CODE_ONLY network mode, these external videos may fail to load. The E2E tests should not block on video load completions and should handle network failures gracefully, focusing on DOM elements and class state assertions instead of video frame checks.

---

## 4. Conclusion

### E2E Testing Framework Recommendation
We recommend **Playwright** with the following configuration:
- Test runner: `@playwright/test`
- Dev Dependency addition: `"playwright": "^1.40.0"`
- Browser focus: Chromium (headless for CI, headed for local debugging)
- Key features utilized:
  - `page.locator()` for CSS targeting.
  - `page.evaluate()` to trigger scroll offsets for `useScroll` animations.
  - `browserContext.grantPermissions(["clipboard-read", "clipboard-write"])` to verify share link copy features.
  - `page.addInitScript()` or local storage injection to mock Supabase Auth sessions offline.

### Design of 60 Test Cases across 4 Tiers

#### Tier 1 - Feature Coverage (25 Cases, Happy Path)
- **Product Customizer Sliders**
  1. Verify `.brew-blueprint-section` container is present on `/product/instantcoffee-100g`.
  2. Verify Sleep Deprivation slider updates sleep scale output.
  3. Verify Workload Intensity slider updates workload scale output.
  4. Verify changing sliders updates calculated caffeine intensity.
  5. Verify matched variant card updates to display selected roast variant name.
- **Mystery Drop Decrypter UI**
  6. Verify `.mystery-drop-section` is rendered.
  7. Verify entering a valid token and clicking Decrypt displays the `.holographic-reveal` card.
  8. Verify decrypted card renders Name, Roast Characteristics, and Tasting Notes.
  9. Verify clicking "RESET DECRYPTER" clears token input and hides decrypted card.
  10. Verify `.holographic-reveal` is rendered in DOM and has standard transform classes.
- **Interceptor Warning Modal**
  11. Verify adding `thodi-hard-extreme` variant to cart triggers `.modal-overlay`.
  12. Verify Interceptor Modal title text is `WARNING: HIGH CAFFEINE INTENSITY ⚠️`.
  13. Verify safety statement checkbox and label text are present inside the modal.
  14. Verify "ACKNOWLEDGE & ADD" button remains disabled until the checkbox is checked.
  15. Verify checking checkbox enables "ACKNOWLEDGE & ADD", and clicking it closes modal and adds item.
- **Process Timeline Steps**
  16. Verify page `/process` renders title "From Farm to Cup" and Chikmagalur description.
  17. Verify Chikmagalur Hindi and Urdu translations are visible in the hero.
  18. Verify 6 timeline steps exist inside `.spatial-timeline-container`.
  19. Verify timeline step video elements exist, play, are muted, and loop.
  20. Verify timeline rows alternate layout orientation (odd vs even rows).
- **Progression Lore Dashboard**
  21. Verify authenticating and loading `/account` (Lore tab) renders `.progression-container`.
  22. Verify current rank tier name (e.g. "Seed Sorter") is visible in `.lore-card`.
  23. Verify progress bar outer and inner sweep elements are rendered.
  24. Verify Points Ledger table headers and history list are displayed.
  25. Verify points text summary shows points count and remaining score to next tier.

#### Tier 2 - Boundary & Corner Cases (25 Cases)
- **Product Customizer Sliders**
  26. Verify slider values default to 50 when no URL parameters are present.
  27. Verify sliders hydrate values from URL search params on direct navigation.
  28. Verify setting both sliders to minimum (1) yields 1% caffeine intensity and matches Mild blend.
  29. Verify setting both sliders to maximum (100) yields 100% caffeine intensity and matches Extra Intense blend.
  30. Verify sliders can be rapidly dragged back and forth without locking state or throwing react errors.
- **Mystery Drop Decrypter UI**
  31. Verify clicking Decrypt with empty input does not show errors or decrypt.
  32. Verify submitting invalid token displays error: `⚠️ Cryptographic check failed: Invalid physical packaging token.`.
  33. Verify token inputs are auto-capitalized (ignoring casing differences).
  34. Verify Decrypt button displays "DECRYPTING..." and is disabled while verification API resolves.
  35. Verify unauthenticated users verifying tokens receive notice that points are not saved.
- **Interceptor Warning Modal & Checkout**
  36. Verify modal overlay implements backdrop blur CSS styling.
  37. Verify clicking CANCEL on interceptor modal closes modal and leaves cart empty.
  38. Verify checkout rejects invalid phone number format.
  39. Verify checkout disables purchase button if pincode is not exactly 6 digits.
  40. Verify typewriter fact animations run periodically on the checkout page.
- **Process Timeline Steps**
  41. Verify timeline steps out of viewport start with opacity `0.1` and y-translation `80`.
  42. Verify timeline steps transition opacity and scale towards `1` on scroll.
  43. Verify hovering a timeline video wrapper executes a scale zoom animation.
  44. Verify video card hover styles execute subtle border glow/tilt modifications.
  45. Verify grade badge section is visible at the bottom of the process page.
- **Progression Lore Dashboard**
  46. Verify ledger table rows show background highlight `#fafafa` on hover.
  47. Verify new accounts initialize with 15 welcome points and "Welcome Bonus" ledger entry.
  48. Verify accounts with high points (>=600) show "Grand Brewmaster" tier and "Max Lore Level Achieved 🏆".
  49. Verify accounts with 0 points render placeholder ledger statement.
  50. Verify progress bar inner width caps at 100% and does not overflow boundaries.

#### Tier 3 - Cross-Feature Combinations (5 Cases)
- 51. **Customizer & Interceptor Modal**: Select 90% intensity variant on customizer slider, click Buy Now, verify interceptor modal triggers, check statement, confirm, and assert that the user lands on the checkout page with the matched variant.
- 52. **Decrypter & Progression Points**: Authenticate, verify a valid packaging token in the Decrypter, navigate to `/account`'s Lore tab, and verify that the ledger increments by `+50` and the progress bar sweeps to the new value.
- 53. **Checkout Order & Progression Ledger**: Complete checkout purchase of coffee bags, navigate to Lore dashboard, and verify that points are awarded and logged in the ledger.
- 54. **Shared Blueprint URL & Interceptor**: Navigate to a shared URL `?sleep_debt=90&workload=90`, verify that sliders load at maximum, click Add to Cart, and assert that the interceptor modal warning is triggered for `thodi-hard-extreme`.
- 55. **Delivery Optimizer & Lore Tier UI**: Run delivery optimizer computations in account portal and verify that the user's Lore tier status remains reactive and unchanged.

#### Tier 4 - Real-World Application Scenarios (5 Scenarios)
- 56. **Guest Checkout E2E**: Configure custom blend -> add high-intensity variant -> acknowledge interceptor safety modal -> proceed to checkout -> fill shipping info -> complete purchase -> view account order records.
- 57. **User Lore Progression Path**: Register new user (welcome points) -> purchase coffee -> view ledger updates -> verify secret roastery token (decrypter) -> check tier promotion to "Sprout Caretaker".
- 58. **Shared Blueprint Multi-item Cart**: Load shared blueprint link -> add matched variant to cart -> adjust sliders to different values -> add second variant -> verify cart has both variants.
- 59. **Decrypter Recovery**: Submit invalid token (errors out) -> submit valid token -> verify holographic card resolves and replaces the error state.
- 60. **Framer Motion Micro-interactions Stress Test**: Rapidly trigger customizer sliders, trigger/cancel interceptor modal, trigger stock tickers, scroll timeline page rapidly, and verify animations resolve smoothly without freezing the thread.

---

### Proposed `TEST_INFRA.md` Structure

To guide the implementation phase, we propose the following structure for `TEST_INFRA.md` at the project root:

```markdown
# E2E Test Infrastructure & Specification

## 1. Testing Architecture
- **Framework**: Playwright (Node.js runner)
- **Targets**: Headless Chromium
- **Testing Approach**: Opaque-box visual and functional verification.

## 2. Directory Structure
- `tests/` — Test files
  - `e2e/` — Feature test suites
    - `customizer.spec.js`
    - `decrypter.spec.js`
    - `interceptor.spec.js`
    - `timeline.spec.js`
    - `lore.spec.js`
    - `integration.spec.js`
  - `fixtures/` — Static data and mock assets
  - `utils/` — Auth helpers and DB seed utilities
- `playwright.config.js` — Playwright project configurations

## 3. Database Seeding & Mocking Strategy
- **Auth Mocking**: Utility to inject cookies/local storage sessions for Supabase auth bypass.
- **Seeding Endpoints**: How test setup scripts insert mock records (e.g. `mystery_drops` codes, user profiles) during runner initialization.
- **RLS Bypassing**: Injecting temporary test keys or configuring local test database access.

## 4. Test execution & Running commands
- `npm run test:e2e` — run all headless tests
- `npm run test:e2e:headed` — run tests in headed mode
- `npm run test:e2e:ui` — open Playwright interactive UI
- `npm run test:e2e:trace` — inspect failed traces

## 5. Visual and Animation Assertions
- Guidelines for testing Framer Motion transition states (verifying CSS transforms, scroll positioning, and pointer hover simulations).
```

---

## 5. Verification Method

To verify these findings:
1. **File Locations**: View the files `src/app/product/[id]/ProductClient.jsx`, `src/components/InterceptorModal.jsx`, `src/app/process/page.js`, and `src/app/account/page.js` to verify their existence and confirm the selector names.
2. **Database Schema**: Run the schema check script:
   `node .agents/explorer_e2e/check_schema.js`
   This will output the table sizes, showing that the structures exist but progression/mystery tables are currently unpopulated.
3. **Environment Feasibility**: Verify that the package manager works by confirming that the Playwright dry run command executed successfully.
