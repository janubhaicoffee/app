## 2026-06-26T01:35:13Z
You are the E2E Test Implementer. Your working directory is c:\Users\hudav\Documents\GitHub\app\.agents\worker_e2e_impl.
Your task is to implement the E2E test suite for the Janu Bhai Coffee application following the E2E Test Specification in c:\Users\hudav\Documents\GitHub\app\.agents\sub_orch_e2e\TEST_INFRA.md.

Here are the concrete steps you must execute:
1. **Environment Check**: Run a check to see if the environment variable SUPABASE_SERVICE_ROLE_KEY is present. If it is present, log its presence (do not log the key itself). If it is not present in the process env, search for it, or check if we can query/insert data without it.
2. **Install Playwright**: Install @playwright/test using npm. Since we are in CODE_ONLY network mode, configure the Playwright configuration (playwright.config.js) to use Google Chrome as the browser channel (channel: 'chrome') so Playwright runs against the system-installed Chrome browser without needing to download external browser binaries.
3. **Database Seeding Endpoint**: Implement a Next.js API route at src/app/api/test/setup/route.js. This route must be protected so it is only active in development/test environment. It must support operations like:
   - POST /api/test/setup with JSON body:
     - action: "cleanup": Deletes the test user profile and ledger items for a test email (e.g. testuser@example.com).
     - action: "seed-mystery-drop": Seeds a mystery drop with token SECRET-ARABICA-50 and details: Name "Secret Arabica Gold", Origin "Chikmagalur Peak", Roast Level "Medium-Dark", Tasting Notes "Honey, Milk Chocolate, Jasmine".
     - action: "seed-user-progression": Sets a user's total points to a specific value (e.g., 15 for new, 600 for max lore level) in user_profiles and inserts corresponding entries in points_ledger.
     - action: "cleanup-orders": Deletes orders associated with test email.
4. **Implement E2E Test Suites**:
   Write the 60 test cases across 6 files inside the tests/ directory:
   - tests/customizer.spec.js (10 tests: Tier 1 #1-5, Tier 2 #26-30)
   - tests/decrypter.spec.js (10 tests: Tier 1 #6-10, Tier 2 #31-35)
   - tests/interceptor.spec.js (10 tests: Tier 1 #11-15, Tier 2 #36-40)
   - tests/timeline.spec.js (10 tests: Tier 1 #16-20, Tier 2 #41-45)
   - tests/lore.spec.js (10 tests: Tier 1 #21-25, Tier 2 #46-50)
   - tests/integration.spec.js (10 tests: Tier 3 #51-55, Tier 4 #56-60)
   
   Ensure the tests use Playwright locators to interact with elements, trigger animations (e.g., hover, scroll), and assert correct state changes:
   - For scroll-linked transitions on the Process Timeline page, execute window.scrollTo or page scroll evaluations to trigger the scroll-linked transitions.
   - For checkout pincode, verify validation rules (6 digits required, etc.).
   - Handle auth by using a setup block that logs in testuser@example.com or registers a new user dynamically, or inserts the session in localStorage.
5. **Run and Verify**: Expose the test command in package.json under "test:e2e": "playwright test". Run the tests against the running Next.js application (using Playwright's webServer option to start the Next.js app in the background via npm run dev or npm run build && npm run start). Verify all 60 test cases pass.
6. **Deliver handoff.md**: Write a detailed completion handoff report at c:\Users\hudav\Documents\GitHub\app\.agents\worker_e2e_impl\handoff.md with:
   - The test command and verification logs (passing tests output).
   - Summary of the 60 test cases.
   - List of modified files.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
