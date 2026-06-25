# Scope: E2E Testing Track

## Objective
Design, build, and implement a robust E2E test suite that verifies the Framer Motion interactions and animations across the app. Derive all tests from user requirements (opaque-box, no dependency on implementation internals).

## Features to Test
1. **Product Customizer Sliders**: Spring physics parameters, sliders present and interactive.
2. **Mystery Drop Decrypter UI**: 3D card flip (`rotateY`) transition or glowing holographic backdrop transition.
3. **Interceptor Warning Modal**: Backdrop blur, scale-up entrance spring animation, checkbox glow validation.
4. **Process Timeline Steps**: `useScroll` and `useTransform` scroll-linked transitions (opacity, scale, y translation), video cards hover zoom/tilt.
5. **Progression Lore Dashboard**: loading sweep progress bar (0% to target), points ledger card hover expand effects.

## Test Case Tier Requirements (N = 5 features)
- **Tier 1 - Feature Coverage**: >=25 test cases (5 per feature, happy-path).
- **Tier 2 - Boundary & Corner Cases**: >=25 test cases (5 per feature).
- **Tier 3 - Cross-Feature Combinations**: >=5 test cases (feature pairs).
- **Tier 4 - Real-World Application Scenarios**: >=5 scenarios.
- **Total Minimum**: 60 test cases.

## Output Deliverable
- Create all test files and dependencies.
- Build and expose test runner command (e.g., `npm run test:e2e` or similar).
- Publish `TEST_READY.md` at the project root with the test suite checklist and summary when all tests are ready.
