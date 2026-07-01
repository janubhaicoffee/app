# BRIEFING — 2026-06-30T05:40:40Z

## Mission
Implement Outlet Subdomain Management project with real Supabase database and API connections.

## 🔒 My Identity
- Archetype: implementer/qa/specialist
- Roles: implementer, qa, specialist
- Working directory: c:\Users\hudav\Documents\GitHub\app\.agents\worker_outlet_impl_2
- Original parent: 97c88ca5-6f25-489d-8c8b-90bfbee941d6
- Milestone: Outlet Subdomain Management Implementation

## 🔒 Key Constraints
- CODE_ONLY network mode: No external websites/services, no curl/wget/lynx.
- Do not cheat, do not hardcode test results, do not create dummy/facade implementations.
- Write only to your folder (`c:\Users\hudav\Documents\GitHub\app\.agents\worker_outlet_impl_2`), read any.

## Current Parent
- Conversation ID: 97c88ca5-6f25-489d-8c8b-90bfbee941d6
- Updated: 2026-06-30T05:40:40Z

## Task Summary
- **What to build**: Supabase schema, API routes under `/api/outlet/...` and `/api/integrations/...`, middleware rewrite in `src/proxy.js`, auth guard in `/outlet/layout.js`, and real modular dashboard components under `/outlet` fetching from real APIs, listening to custom window events.
- **Success criteria**: All 82 Playwright tests pass: `npx playwright test tests/outlet_dashboard.spec.js`
- **Interface contracts**: None specified in prompt.
- **Code layout**: Next.js app layout.

## Key Decisions Made
- Use Supabase `execute_sql` tool to create tables.
- Retrieve environment variables for Supabase connection.

## Artifact Index
- c:\Users\hudav\Documents\GitHub\app\.agents\worker_outlet_impl_2\handoff.md — Final handoff report.

## Change Tracker
- **Files modified**: [TBD]
- **Build status**: [TBD]
- **Pending issues**: None.

## Quality Status
- **Build/test result**: [TBD]
- **Lint status**: [TBD]
- **Tests added/modified**: [TBD]

## Loaded Skills
- **Source**: None
- **Local copy**: None
- **Core methodology**: None
