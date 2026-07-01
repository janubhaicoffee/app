# Project: Outlet Subdomain Management (Production-Ready)

## Architecture
A production-ready, fully functional outlet management web application integrated within the main Next.js app.
- **Routing**: Next.js middleware at `src/middleware.js` rewrites requests to `outlet.janubhai.com` (and local simulated domains like `outlet.localhost:3000`) to `/outlet`.
- **Navigation**: `TopBar` navigation includes a direct link to the subdomain/outlet page.
- **Authentication**: Access to `/outlet` is secured using Supabase Auth admin check. The user's session must be authenticated and email must match admin status (checking against `SUPERADMIN_EMAILS` or a secure database check).
- **Database Schema**: Fully backed by Supabase database tables for all modules.
- **API Endpoints**: Real Next.js route handlers process database queries, rather than using client-side mocks or simulated states.
- **Video Surveillance**: Real HLS/WebRTC/HTML5 video players load active streams.
- **Swiggy/Zomato webhooks**: Real endpoints `/api/integrations/swiggy` and `/api/integrations/zomato` to receive JSON payloads and store orders.

## Database Tables
### 1. `outlet_transactions`
```sql
CREATE TABLE outlet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('revenue', 'expense')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. `outlet_cameras`
```sql
CREATE TABLE outlet_cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3. `outlet_alerts`
```sql
CREATE TABLE outlet_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. `outlet_inventory`
```sql
CREATE TABLE outlet_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  threshold INTEGER NOT NULL DEFAULT 10,
  auto_reorder BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5. `outlet_staff_schedules`
```sql
CREATE TABLE outlet_staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  shift TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 6. `outlet_delivery_keys`
```sql
CREATE TABLE outlet_delivery_keys (
  id TEXT PRIMARY KEY CHECK (id IN ('swiggy', 'zomato')),
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  api_key TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 7. `outlet_delivery_orders`
```sql
CREATE TABLE outlet_delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner TEXT NOT NULL CHECK (partner IN ('swiggy', 'zomato')),
  items TEXT NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'preparing', 'declined')),
  customer_name TEXT,
  customer_email TEXT,
  coupon_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 8. `outlet_customers`
```sql
CREATE TABLE outlet_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  visits INTEGER NOT NULL DEFAULT 0,
  spend NUMERIC NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'Bronze',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Database Migrations | Execute SQL migrations to create all outlet tables in Supabase. | None | PLANNED |
| 2 | E2E Testing Track (Real Integration) | Update E2E tests (`tests/outlet_dashboard.spec.js`) to check real database integration (removing API/endpoint mocks) and publish `TEST_READY.md`. | M1 | PLANNED |
| 3 | Subdomain Routing & Navigation | Implement Next.js middleware and update `TopBar` navigation. | None | PLANNED |
| 4 | Authentication Guard & API Routes | Secure `/outlet` and implement backend route handlers in Next.js connecting to Supabase. | M3 | PLANNED |
| 5 | Modular Dashboard Components | Implement frontend dashboard components `/outlet` connecting to real API endpoints. | M4 | PLANNED |
| 6 | E2E verification & adversarial hardening | Run test suite against real server/db, run forensic auditor checks, and perform adversarial coverage hardening. | M2, M5 | PLANNED |

## Interface Contracts
- **Middleware**: Matches host `outlet.*` and rewrites to `/outlet`.
- **API Endpoints**:
  - `GET /api/outlet/accounting` -> returns transactions from `outlet_transactions`.
  - `POST /api/outlet/accounting` -> inserts transaction.
  - `GET /api/outlet/surveillance` -> returns streams and alerts.
  - `POST /api/outlet/surveillance` -> adds camera stream / toggles status / resolves alerts.
  - `GET /api/outlet/operations` -> returns inventory stock levels, reorder settings, and schedules.
  - `POST /api/outlet/operations` -> updates inventory, triggers reorders, saves schedules.
  - `GET /api/outlet/delivery` -> returns credentials and order list.
  - `POST /api/outlet/delivery` -> saves partner credentials, toggles active state.
  - `POST /api/integrations/swiggy` & `POST /api/integrations/zomato` -> webhook entrypoints for delivery orders.
  - `GET /api/outlet/customers` -> returns table of outlet customers, supporting search filter.

## Code Layout
- `src/middleware.js`: Next.js middleware
- `src/components/TopBar.jsx`: Navigation link
- `src/app/outlet/page.js`: Dashboard UI
- `src/app/outlet/layout.js`: Dashboard auth wrapper
- `src/components/outlet/`: Modular dashboard components
- `src/app/api/outlet/`: Backend database handlers
- `src/app/api/integrations/`: Delivery webhook handlers
- `tests/outlet_dashboard.spec.js`: Playwright test file
