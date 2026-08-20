-- ============================================================================
-- Janu Bhai Coffee - Database Schema Definitions
-- ============================================================================

-- Core Outlet Entity
CREATE TABLE IF NOT EXISTS outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  partner_name TEXT,
  commission_percentage NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  operational_status TEXT DEFAULT 'open' CHECK (operational_status IN ('open', 'busy', 'paused', 'closed')),
  accepting_orders BOOLEAN DEFAULT true,
  dine_in_active BOOLEAN DEFAULT true,
  takeaway_active BOOLEAN DEFAULT true,
  delivery_active BOOLEAN DEFAULT true,
  delivery_radius_km NUMERIC DEFAULT 5,
  opening_time TEXT DEFAULT '08:00',
  closing_time TEXT DEFAULT '22:00',
  latitude NUMERIC,
  longitude NUMERIC,
  fssai_number TEXT,
  fssai_certificate_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inter-Outlet Stock Transfers
CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
  destination_outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'kg',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  requested_by TEXT,
  approved_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_transfers_source ON stock_transfers(source_outlet_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_dest ON stock_transfers(destination_outlet_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_status ON stock_transfers(status);

-- Daily Standard Operating Procedure (SOP) Checklists & Audits
CREATE TABLE IF NOT EXISTS outlet_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  shift_type TEXT DEFAULT 'morning' CHECK (shift_type IN ('morning', 'midday', 'night')),
  checklist_type TEXT DEFAULT 'opening' CHECK (checklist_type IN ('opening', 'midday', 'closing')),
  items JSONB NOT NULL DEFAULT '[]',
  score NUMERIC DEFAULT 100,
  completed_by TEXT,
  verified_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outlet_checklists_outlet ON outlet_checklists(outlet_id);
CREATE INDEX IF NOT EXISTS idx_outlet_checklists_date ON outlet_checklists(date);

-- Incident & Maintenance Ticketing Logs
CREATE TABLE IF NOT EXISTS outlet_incident_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  reported_by TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  dispatched BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incident_logs_outlet ON outlet_incident_logs(outlet_id);
CREATE INDEX IF NOT EXISTS idx_incident_logs_status ON outlet_incident_logs(status);

-- Outlet Surveillance CCTV Streams
CREATE TABLE IF NOT EXISTS outlet_cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outlet_cameras_outlet ON outlet_cameras(outlet_id);

-- Outlet Live Raw Materials & Supplies Inventory
CREATE TABLE IF NOT EXISTS outlet_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  stock NUMERIC NOT NULL DEFAULT 0,
  threshold NUMERIC NOT NULL DEFAULT 10,
  auto_reorder BOOLEAN NOT NULL DEFAULT false,
  unit TEXT DEFAULT 'units',
  unit_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outlet_inventory_outlet ON outlet_inventory(outlet_id);

-- Spoilage & Waste Accounting Log
CREATE TABLE IF NOT EXISTS waste_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES outlet_inventory(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT 'Expired',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waste_log_outlet ON waste_log(outlet_id);

-- Supplier Vendors & Purchase Orders
CREATE TABLE IF NOT EXISTS outlet_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  gstin TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outlet_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES outlet_vendors(id) ON DELETE SET NULL,
  po_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'received', 'cancelled')),
  order_date DATE DEFAULT CURRENT_DATE,
  expected_date DATE,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outlet_po_outlet ON outlet_purchase_orders(outlet_id);
CREATE INDEX IF NOT EXISTS idx_outlet_po_status ON outlet_purchase_orders(status);

-- Outlet Transactions & Expenses
CREATE TABLE IF NOT EXISTS outlet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT now(),
  type TEXT NOT NULL CHECK (type IN ('revenue', 'expense')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Staff Rostering & Schedules
CREATE TABLE IF NOT EXISTS outlet_staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  shift TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Food Delivery Aggregator Keys & Order Dispatch
CREATE TABLE IF NOT EXISTS outlet_delivery_keys (
  id TEXT PRIMARY KEY CHECK (id IN ('swiggy', 'zomato')),
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  api_key TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outlet_delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  partner TEXT NOT NULL CHECK (partner IN ('swiggy', 'zomato')),
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'declined')),
  customer_name TEXT,
  customer_email TEXT,
  coupon_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
