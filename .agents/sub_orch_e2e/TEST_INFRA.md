# E2E Test Infrastructure & Specification

## 1. Testing Philosophy & Architecture
- **Framework**: Playwright (using `@playwright/test`)
- **Execution**: Headless Chromium (cross-browser configuration optional, Chromium is primary target).
- **Style**: Opaque-box, requirement-driven. The test cases verify functional correctness, existence of elements, correct page-flow, URL synchronization, and the execution of Framer Motion animations (verified via CSS styles, presence/absence of container elements, and state transitions).
- **Network Mode**: CODE_ONLY offline compatibility (mock external Vimeo video wrappers if necessary, verify only fallback DOM and animations).
- **Environment**: Next.js development or production server started automatically via Playwright's `webServer` configuration.

## 2. Directory Layout
- `tests/` — Test files
  - `customizer.spec.js` — Feature 1: Product Customizer Sliders (10 tests: Tier 1 #1-5, Tier 2 #26-30)
  - `decrypter.spec.js` — Feature 2: Mystery Drop Decrypter UI (10 tests: Tier 1 #6-10, Tier 2 #31-35)
  - `interceptor.spec.js` — Feature 3: Interceptor Warning & Checkout Modal (10 tests: Tier 1 #11-15, Tier 2 #36-40)
  - `timeline.spec.js` — Feature 4: Process Timeline Steps (10 tests: Tier 1 #16-20, Tier 2 #41-45)
  - `lore.spec.js` — Feature 5: Progression Lore Dashboard (10 tests: Tier 1 #21-25, Tier 2 #46-50)
  - `integration.spec.js` — Tier 3 & Tier 4 (10 tests: Tier 3 #51-55, Tier 4 #56-60)
- `playwright.config.js` — Playwright test configuration at root
- `tests/helpers/` — Auth mocks and DB seed scripts

## 3. Test Cases (60 Total)

### Tier 1 - Feature Coverage (25 Cases, 5 per feature)
#### Feature 1: Product Customizer Sliders
1. Verify customizer container is rendered on `/product/instantcoffee-100g`.
2. Verify Sleep Deprivation slider adjusts the scale value in the UI.
3. Verify Workload Intensity slider adjusts the scale value in the UI.
4. Verify caffeine intensity output updates dynamically based on both slider positions.
5. Verify matched variant card updates to display selected roast variant name.
#### Feature 2: Mystery Drop Decrypter UI
6. Verify mystery drop decrypter container is present on `/product/instantcoffee-100g`.
7. Verify entering a valid token shows the cryptographic holographic reveal card.
8. Verify holographic card displays the fields (Name, Roast Characteristics, Tasting Notes).
9. Verify clicking "RESET DECRYPTER" clears token input and resets the card display.
10. Verify `.holographic-reveal` has correct initial opacity/transform CSS classes.
#### Feature 3: Interceptor Warning Modal & Checkout
11. Verify adding extra intensity variant triggers warning modal overlay.
12. Verify interceptor modal title is "WARNING: HIGH CAFFEINE INTENSITY ⚠️".
13. Verify safety statement checkbox and label text are present inside the modal.
14. Verify "ACKNOWLEDGE & ADD" button remains disabled until checkbox is checked.
15. Verify checking checkbox enables confirm button, clicking it adds item and closes modal.
#### Feature 4: Process Timeline Steps
16. Verify process page `/process` renders title "From Farm to Cup" and description.
17. Verify translation tabs (Hindi/Urdu) are present and clickable in hero.
18. Verify 6 spatial timeline steps are present in the timeline container.
19. Verify timeline step video elements are configured with autoPlay, loop, and muted.
20. Verify timeline rows alternate layout orientation classes (odd vs even).
#### Feature 5: Progression Lore Dashboard
21. Verify account dashboard `/account` (when authenticated) renders progression view.
22. Verify current rank tier name (e.g. "Seed Sorter") is visible.
23. Verify progress bar outer and inner sweep elements are rendered.
24. Verify Points Ledger table headers and history list are displayed.
25. Verify points summary shows points count and remaining score to next tier.

### Tier 2 - Boundary & Corner Cases (25 Cases, 5 per feature)
#### Feature 1: Product Customizer Sliders
26. Verify slider values default to 50 when no URL parameters are present.
27. Verify sliders hydrate values from URL search parameters on direct navigation.
28. Verify setting both sliders to minimum (1) yields 1% caffeine intensity and matches Mild blend.
29. Verify setting both sliders to maximum (100) yields 100% caffeine intensity and matches Extra Intense blend.
30. Verify sliders can be rapidly dragged back and forth without locking state.
#### Feature 2: Mystery Drop Decrypter UI
31. Verify clicking Decrypt with empty input does not show errors or decrypt.
32. Verify submitting invalid token displays error: "⚠️ Cryptographic check failed: Invalid physical packaging token."
33. Verify token inputs are case-insensitive (automatically capitalized).
34. Verify Decrypt button displays "DECRYPTING..." and is disabled while verification API resolves.
35. Verify unauthenticated users verifying tokens receive notice that points are not saved.
#### Feature 3: Interceptor Warning Modal & Checkout
36. Verify modal overlay implements backdrop blur CSS styling.
37. Verify clicking CANCEL on interceptor modal closes modal and leaves cart empty.
38. Verify checkout rejects invalid phone number format.
39. Verify checkout disables purchase button if pincode is not exactly 6 digits.
40. Verify typewriter fact animations run periodically on the checkout page.
#### Feature 4: Process Timeline Steps
41. Verify timeline steps out of viewport start with opacity `0.1` and y-translation `80`.
42. Verify timeline steps transition opacity and scale towards `1` on scroll.
43. Verify hovering a timeline video wrapper executes a scale zoom animation.
44. Verify video card hover styles execute subtle border glow/tilt modifications.
45. Verify grade badge section is visible at the bottom of the process page.
#### Feature 5: Progression Lore Dashboard
46. Verify ledger table rows show background highlight `#fafafa` on hover.
47. Verify new accounts initialize with 15 welcome points and "Welcome Bonus" ledger entry.
48. Verify accounts with high points (>=600) show "Grand Brewmaster" tier and "Max Lore Level Achieved 🏆".
49. Verify accounts with 0 points render placeholder ledger statement.
50. Verify progress bar inner width caps at 100% and does not overflow boundaries.

### Tier 3 - Cross-Feature Combinations (5 Cases)
51. **Customizer & Interceptor Modal**: Select 90% intensity variant on customizer slider, click Buy Now, verify interceptor modal triggers, check statement, confirm, and assert that the user lands on the checkout page with the matched variant.
52. **Decrypter & Progression Points**: Authenticate, verify a valid packaging token in the Decrypter, navigate to `/account`'s Lore tab, and verify that the ledger increments by `+50` and the progress bar sweeps to the new value.
53. **Checkout Order & Progression Ledger**: Complete checkout purchase of coffee bags, navigate to Lore dashboard, and verify that points are awarded and logged in the ledger.
54. **Shared Blueprint URL & Interceptor**: Navigate to a shared URL `?sleep_debt=90&workload=90`, verify that sliders load at maximum, click Add to Cart, and assert that the interceptor modal warning is triggered for `thodi-hard-extreme`.
55. **Delivery Optimizer & Lore Tier UI**: Run delivery optimizer computations in account portal and verify that the user's Lore tier status remains reactive and unchanged.

### Tier 4 - Real-World Application Scenarios (5 Scenarios)
56. **Guest Checkout E2E**: Configure custom blend -> add high-intensity variant -> acknowledge interceptor safety modal -> proceed to checkout -> fill shipping info -> complete purchase -> view account order records.
57. **User Lore Progression Path**: Register new user (welcome points) -> purchase coffee -> view ledger updates -> verify secret roastery token (decrypter) -> check tier promotion to "Sprout Caretaker".
58. **Shared Blueprint Multi-item Cart**: Load shared blueprint link -> add matched variant to cart -> adjust sliders to different values -> add second variant -> verify cart has both variants.
59. **Decrypter Recovery**: Submit invalid token (errors out) -> submit valid token -> verify holographic card resolves and replaces the error state.
60. **Framer Motion Micro-interactions Stress Test**: Rapidly trigger customizer sliders, trigger/cancel interceptor modal, trigger stock tickers, scroll timeline page rapidly, and verify animations resolve smoothly without freezing the thread.

## 4. DB Mocking and Authentication Bypass
- Since Supabase auth relies on cookies/local storage sessions, our tests will seed and inject auth credentials into the browser state before navigating to `/account`.
- A programmatic route `/api/test/seed` can be used during testing (only enabled in test env) to reset the database and seed the `mystery_drops` table, `profiles`, and `points_ledger` tables so that verification remains deterministic.

## 5. Test Runner & Execution
- Dev dependencies: `npm install -D @playwright/test`
- Expose scripts in `package.json`:
  - `"test:e2e": "playwright test"`
  - `"test:e2e:ui": "playwright test --ui"`
