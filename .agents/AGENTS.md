# URL and Security Guidelines

*   **Beautiful URL Patterns:** All public-facing URLs and internal routes must follow clean, readable, lowercase patterns without hyphens or special characters where possible (e.g., `/product/instantcoffee` and `/product/coffeebeans` instead of `/product/thodi-hard-coffee`). Ensure URLs are intuitive and SEO-friendly.
*   **Security First:** Ensure tight security across the app. Never expose secret keys in frontend code. Always validate API parameters on the server side. Keep authentication flows secure and mock external services correctly when in development without leaking logic.
