## 2026-06-30T00:40:07Z
You are the worker agent. Your working directory is c:\Users\hudav\Documents\GitHub\app\.agents\worker_outlet_e2e_1.
Your task is to implement the E2E Playwright test suite for the Outlet Management dashboard in `tests/outlet_dashboard.spec.js` containing exactly 82 test cases.

Please follow these instructions:
1. Write the test suite at `tests/outlet_dashboard.spec.js`.
2. Use the selectors and structure designed by the explorers in `c:\Users\hudav\Documents\GitHub\app\.agents\teamwork_preview_explorer_outlet_2\handoff.md`.
3. In `test.beforeEach`, mock the Supabase Auth session by writing a valid JWT session to window.localStorage under the key `sb-fheddjuiedseynqxhsfb-auth-token`.
4. Intercept network requests to `**/api/admin/data*` and `**/auth/v1/user` using Playwright's `page.route` to mock administrative authorization checks, ensuring tests run in isolation and do not hit live database/Supabase systems.
5. Implement all 82 test cases across 4 Tiers:
   - Tier 1: Feature Coverage (35 tests, 5 per feature)
   - Tier 2: Boundary & Corner Cases (35 tests, 5 per feature)
   - Tier 3: Cross-Feature Combinations (7 tests)
   - Tier 4: Real-World Application Scenarios (5 tests)
6. Ensure that all tests are fully written out with genuine Playwright actions and assertions (such as click, fill, expect, etc.) targeting the designated elements and data-testids.
7. Run `npx playwright test tests/outlet_dashboard.spec.js --list` to verify that Playwright compiles and lists all 82 test cases successfully without syntax errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Save your implementation and the output of the list command, then report back with a handoff report in your folder.
