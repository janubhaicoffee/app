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

-- ============================================================================
-- Janu Bhai Worker, Operations & Brand Strategy Tables
-- ============================================================================

-- Events & Activations Engine
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  featuring_name TEXT,
  event_type TEXT DEFAULT 'Workshop',
  description TEXT,
  outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
  location_name TEXT DEFAULT 'Janu Bhai Cafe, Gafoor Nagar, Delhi',
  event_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  capacity INTEGER DEFAULT 30,
  rsvp_count INTEGER DEFAULT 0,
  price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'completed', 'cancelled')),
  banner_url TEXT,
  host_name TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_by TEXT DEFAULT 'Arsalan (Brand & Growth)',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  guest_count INTEGER DEFAULT 1,
  notes TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'attended', 'cancelled')),
  checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Manager Observations & AI Checklists
CREATE TABLE IF NOT EXISTS manager_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  outlet_name TEXT,
  manager_name TEXT,
  observation_date DATE DEFAULT CURRENT_DATE,
  observation_time TEXT,
  visit_type TEXT DEFAULT 'daily' CHECK (visit_type IN ('daily', 'visit', 'other')),
  checklist_items JSONB NOT NULL DEFAULT '[]',
  issues_found JSONB NOT NULL DEFAULT '[]',
  overall_score NUMERIC DEFAULT 100,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  raw_ai_analysis JSONB,
  scanned_image_url TEXT,
  manager_signature TEXT,
  reviewed_by_oh BOOLEAN DEFAULT false,
  oh_review_notes TEXT,
  oh_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Observation Photos (Unmodified High-Res Proofs)
CREATE TABLE IF NOT EXISTS observation_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID REFERENCES manager_observations(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  severity TEXT DEFAULT 'medium',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Manager Issue & Action Records
CREATE TABLE IF NOT EXISTS manager_issue_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  outlet_name TEXT,
  manager_name TEXT,
  record_date DATE DEFAULT CURRENT_DATE,
  issue_description TEXT NOT NULL,
  action_taken TEXT,
  vendor_contacted TEXT,
  vendor_contact_phone TEXT,
  approved_vendor_used BOOLEAN DEFAULT true,
  vendor_name TEXT,
  resolution_status TEXT DEFAULT 'pending' CHECK (resolution_status IN ('resolved', 'partially_resolved', 'pending')),
  pending_work TEXT,
  expected_completion_date DATE,
  cost_required BOOLEAN DEFAULT false,
  estimated_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  whatsapp_sent_to_oh BOOLEAN DEFAULT false,
  oh_informed BOOLEAN DEFAULT false,
  oh_instructions TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  photo_urls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cash Withdrawals & Counter Expenses
CREATE TABLE IF NOT EXISTS cash_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  withdrawal_date DATE DEFAULT CURRENT_DATE,
  opening_cash NUMERIC DEFAULT 0,
  reason TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  paid_to TEXT NOT NULL,
  cash_given_by TEXT NOT NULL,
  receipt_url TEXT,
  employee_sign TEXT,
  manager_sign TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Staff Consumption Register
CREATE TABLE IF NOT EXISTS staff_consumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  consumption_date DATE DEFAULT CURRENT_DATE,
  item_name TEXT NOT NULL,
  amount_worth NUMERIC NOT NULL,
  consumed_by TEXT NOT NULL,
  designation TEXT,
  purpose TEXT,
  employee_sign TEXT,
  manager_sign TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Operations Head 14-Area Control Audits
CREATE TABLE IF NOT EXISTS operations_control_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  audit_date DATE DEFAULT CURRENT_DATE,
  reviewed_by TEXT DEFAULT 'Bilal Muhammad (Operations Head)',
  checklist_14_areas JSONB NOT NULL DEFAULT '[]',
  overall_rating NUMERIC DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Manager Coordination & 5-Pillar Performance Reviews
CREATE TABLE IF NOT EXISTS manager_coordination_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  review_date DATE DEFAULT CURRENT_DATE,
  reviewed_by TEXT DEFAULT 'Bilal Muhammad (Operations Head)',
  manager_name TEXT NOT NULL,
  daily_updates_received BOOLEAN DEFAULT true,
  prompt_whatsapp_response BOOLEAN DEFAULT true,
  problems_escalated_on_time BOOLEAN DEFAULT true,
  follows_instructions BOOLEAN DEFAULT true,
  comments_notes TEXT,
  rating_leadership INTEGER DEFAULT 5 CHECK (rating_leadership BETWEEN 1 AND 5),
  rating_operations INTEGER DEFAULT 5 CHECK (rating_operations BETWEEN 1 AND 5),
  rating_team_management INTEGER DEFAULT 5 CHECK (rating_team_management BETWEEN 1 AND 5),
  rating_sales_targets INTEGER DEFAULT 5 CHECK (rating_sales_targets BETWEEN 1 AND 5),
  rating_quality_service INTEGER DEFAULT 5 CHECK (rating_quality_service BETWEEN 1 AND 5),
  overall_performance_comments TEXT,
  action_items JSONB DEFAULT '[]',
  support_provided JSONB DEFAULT '[]',
  escalation JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Growth Strategic Priorities
CREATE TABLE IF NOT EXISTS growth_strategic_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  priority_number INTEGER NOT NULL,
  priority_title TEXT NOT NULL,
  objective TEXT NOT NULL,
  key_actions TEXT,
  success_measure TEXT,
  target_date DATE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'on_hold')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Growth Opportunity Pipeline
CREATE TABLE IF NOT EXISTS growth_opportunity_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Marketing', 'Partnership', 'Event', 'Product', 'Other')),
  potential_impact TEXT NOT NULL CHECK (potential_impact IN ('High', 'Medium', 'Low')),
  next_step TEXT NOT NULL,
  owner TEXT DEFAULT 'Arsalan',
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'On Hold', 'Done')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Monthly Operations Reviews
CREATE TABLE IF NOT EXISTS monthly_operations_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  reviewed_by TEXT DEFAULT 'Bilal Muhammad',
  total_sales NUMERIC DEFAULT 0,
  avg_daily_sales NUMERIC DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  top_selling_item TEXT,
  customer_feedback_rating NUMERIC DEFAULT 5,
  total_expenses NUMERIC DEFAULT 0,
  net_result NUMERIC DEFAULT 0,
  what_went_well TEXT,
  challenges TEXT,
  key_learnings TEXT,
  improvement_plans JSONB DEFAULT '[]',
  monthly_summary_answers JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
