## 2026-06-30T00:54:02Z
You are the Worker Agent for Milestone 2: Test Database Seeding & Helpers Setup of the Outlet Management E2E test suite project.
Your working directory is c:\Users\hudav\Documents\GitHub\app\.agents\worker_m2_1

Your tasks are:
1. Create the 8 database tables required for the outlet management dashboard, matching the exact columns and types specified below:
   - `outlet_transactions`: `id` UUID PRIMARY KEY DEFAULT gen_random_uuid(), `date` TIMESTAMPTZ DEFAULT now(), `type` TEXT NOT NULL CHECK (type IN ('revenue', 'expense')), `amount` NUMERIC NOT NULL, `category` TEXT NOT NULL, `description` TEXT, `created_at` TIMESTAMPTZ DEFAULT now()
   - `outlet_cameras`: `id` UUID PRIMARY KEY DEFAULT gen_random_uuid(), `name` TEXT NOT NULL, `url` TEXT NOT NULL, `active` BOOLEAN NOT NULL DEFAULT true, `created_at` TIMESTAMPTZ DEFAULT now()
   - `outlet_alerts`: `id` UUID PRIMARY KEY DEFAULT gen_random_uuid(), `time` TIMESTAMPTZ DEFAULT now(), `message` TEXT NOT NULL, `severity` TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')), `resolved` BOOLEAN NOT NULL DEFAULT false, `created_at` TIMESTAMPTZ DEFAULT now()
   - `outlet_inventory`: `id` UUID PRIMARY KEY DEFAULT gen_random_uuid(), `name` TEXT NOT NULL UNIQUE, `category` TEXT, `stock` INTEGER NOT NULL DEFAULT 0, `threshold` INTEGER NOT NULL DEFAULT 10, `auto_reorder` BOOLEAN NOT NULL DEFAULT false, `created_at` TIMESTAMPTZ DEFAULT now()
   - `outlet_staff_schedules`: `id` UUID PRIMARY KEY DEFAULT gen_random_uuid(), `name` TEXT NOT NULL, `role` TEXT NOT NULL, `shift` TEXT NOT NULL, `status` TEXT NOT NULL DEFAULT 'scheduled', `created_at` TIMESTAMPTZ DEFAULT now()
   - `outlet_delivery_keys`: `id` TEXT PRIMARY KEY CHECK (id IN ('swiggy', 'zomato')), `client_id` TEXT NOT NULL, `client_secret` TEXT NOT NULL, `api_key` TEXT NOT NULL, `active` BOOLEAN NOT NULL DEFAULT false, `updated_at` TIMESTAMPTZ DEFAULT now()
   - `outlet_delivery_orders`: `id` UUID PRIMARY KEY DEFAULT gen_random_uuid(), `partner` TEXT NOT NULL CHECK (partner IN ('swiggy', 'zomato')), `items` JSONB NOT NULL, `total` NUMERIC NOT NULL, `status` TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'declined')), `customer_name` TEXT, `customer_email` TEXT, `coupon_used` TEXT, `created_at` TIMESTAMPTZ DEFAULT now()
   - `outlet_customers`: `id` UUID PRIMARY KEY DEFAULT gen_random_uuid(), `name` TEXT NOT NULL, `email` TEXT UNIQUE NOT NULL, `phone` TEXT, `visits` INTEGER NOT NULL DEFAULT 0, `spend` NUMERIC NOT NULL DEFAULT 0, `tier` TEXT NOT NULL DEFAULT 'Bronze', `created_at` TIMESTAMPTZ DEFAULT now()

   To create these tables, check if you can use the `supabase` MCP server's `apply_migration` or `execute_sql` tools. The project_id is `fheddjuiedseynqxhsfb`. If these tools are not available or fail, check if there is an alternative way to run SQL statements (like via Supabase client, REST endpoint, or a migration script).
2. Set up the Supabase Service Role client configuration inside `tests/outlet_dashboard.spec.js` or in a helper file. The client should parse `.env.local` to retrieve the `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Create seeding and cleanup functions that the Playwright test suite can call in `beforeAll` and `afterAll` blocks.
   - The cleanup function must delete all rows from the 8 outlet tables.
   - The seeding function must insert default records to match initial test expectations (e.g. Ramesh Kumar with Gold tier, Suresh Patel with Silver, Priya Sharma with Platinum, Premium Espresso Beans with stock=3 and threshold=10, 2 active cameras, 1 active alert, Swiggy/Zomato keys, etc.).
4. Verify your database tables are successfully created by running check/test queries and write a handoff report in your directory detailing the schema creation and test helper implementation.

MANDATORY INTEGRITY WARNING:
> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A Forensic Auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.

When finished, send a message to the orchestrator (conversation ID: 4a2af0a5-d2a3-4aca-a456-31bac949c512) and exit.
