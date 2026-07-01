# Original User Request

## Initial Request — 2026-06-30T06:06:09Z

You are the Project Orchestrator for the Outlet Subdomain Management project.
Your working directory is c:\Users\hudav\Documents\GitHub\app\.agents\orchestrator_outlet
The verbatim requirements and details of the request are stored in c:\Users\hudav\Documents\GitHub\app\.agents\ORIGINAL_REQUEST.md under the '## Follow-up — 2026-06-30T00:35:50Z' header.

Please perform the following steps:
1. Decompose the project into milestones and create a detailed plan in your workspace.
2. Coordinate with subagents (explorers, workers, reviewers, etc.) to implement all requirements, including the subdomain routing middleware, the modular outlet dashboard components under `/outlet`, Supabase authentication check, and the Playwright test file.
3. Keep progress updated in `progress.md` in your workspace.
4. When all acceptance criteria are met and verified, report completion back to the Sentinel (the parent agent).

## Follow-up — 2026-06-30T00:47:50Z

The user has explicitly updated the project requirements to forbid fake, mock, demo, or simulated systems. Everything must be built as a fully functional, production-ready system.

Please update the requirements, re-plan, and ensure the team builds the following:
1. **Routing**: Real subdomain routing in Next.js using middleware/rewrites, fully redirecting `outlet.janubhai.com` to the `/outlet` routes, with navigation links.
2. **Accounting & Growth**: Store all transaction logs (revenue, expenses) in a real Supabase database table (e.g. `outlet_transactions`). Create any necessary database schema/migrations. Graphs must load real data from the database.
3. **Surveillance**: Integrate a real video player (e.g., HTML5 video or HLS.js player) that loads and plays actual configured RTMP/HLS/WebRTC camera URLs, rather than a fake static dashboard.
4. **Swiggy/Zomato**: Implement real API endpoints/webhooks (e.g., `/api/integrations/swiggy`, `/api/integrations/zomato`) that can receive real order webhooks/JSON payloads, store them in the database, and display them. Save actual partner credentials (API keys, client IDs) securely.
5. **Customer Profiling & Operations**: Read and write customer profiles, inventory items, stock levels, and staff schedules directly to/from actual tables in the Supabase database.
6. **Code Integrity & Modularization**: Ensure all modules are clean, robust, and placed in separate folders so that they are maintainable and independent.

Please adjust the test verification plan and execution milestones in `PROJECT.md` to verify these real integrations and database interactions (e.g., using test credentials/data in the database). Update your `progress.md` and briefing files accordingly.
