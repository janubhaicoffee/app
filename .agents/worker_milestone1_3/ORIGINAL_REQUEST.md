## 2026-06-30T05:43:26Z
You are worker_milestone1_3, the Database & Routing Worker.
Your working directory is c:\Users\hudav\Documents\GitHub\app\.agents\worker_milestone1_3.
Your task is to:
1. Verify database tables on Supabase. Use the `supabase` MCP server tools:
   - Call `list_projects` to discover the project ID.
   - Call `list_tables` for the project ID to check if the outlet tables exist.
   - If they do not exist, run the SQL queries to create them using the `apply_migration` or `execute_sql` tool from the `supabase` MCP server.
   - The tables and schemas to create are defined in c:\Users\hudav\Documents\GitHub\app\PROJECT.md:
     1. `outlet_transactions`
     2. `outlet_cameras`
     3. `outlet_alerts`
     4. `outlet_inventory`
     5. `outlet_staff_schedules`
     6. `outlet_delivery_keys`
     7. `outlet_delivery_orders`
     8. `outlet_customers`
2. Implement Milestone 1: Subdomain Middleware Routing & TopBar link.
   - Create Next.js middleware in `src/middleware.js` to rewrite requests to `outlet.janubhai.com` (and local simulated domains like `outlet.localhost:3000`, `outlet.localhost`, etc.) to `/outlet`. Make sure it parses the host correctly, supports port numbers, and rewrites the request internally (keeping the browser URL as the subdomain).
   - Check if `src/components/TopBar.jsx` already has the correct navigation link logic and update it if necessary so it dynamically points to the subdomain or path.
3. Verify your work by running build/test commands. (E.g. check if the project compiles).
4. Write a handoff report in c:\Users\hudav\Documents\GitHub\app\.agents\worker_milestone1_3\handoff.md detailing what you did and showing build/test output.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
