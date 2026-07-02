# URL and Security Guidelines

*   **Beautiful URL Patterns:** All public-facing URLs and internal routes must follow clean, readable, lowercase patterns without hyphens or special characters where possible (e.g., `/product/instantcoffee` and `/product/coffeebeans` instead of `/product/thodi-hard-coffee`). Ensure URLs are intuitive and SEO-friendly.
*   **Security First:** Ensure tight security across the app. Never expose secret keys in frontend code. Always validate API parameters on the server side. Keep authentication flows secure.
*   **Production-Ready & Live Code Only:** Do not include mock testing backdoors, dummy tokens, credential simulations, or testing bypass modes inside the codebase files. Testing must be conducted exclusively via external IDE tools or test-runners. Every feature, flow, page, and API endpoint must operate live and securely under real production conditions in the repository.

